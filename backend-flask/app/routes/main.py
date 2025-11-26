from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_
from datetime import datetime, date
from app import db
from app.models import Room, RoomType, Facility, Booking, Rating, User
from app.utils import member_required

main_bp = Blueprint('main', __name__)

# ... (kode main lainnya tetap sama)

# Public routes - Rooms
@main_bp.route('/rooms', methods=['GET'])
def get_rooms():
    # Filter parameters
    room_type = request.args.get('room_type')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    capacity = request.args.get('capacity')
    has_breakfast = request.args.get('has_breakfast')
    facility = request.args.get('facility')
    
    query = Room.query.filter_by(status='available')
    
    if room_type:
        query = query.join(RoomType).filter(RoomType.id == room_type)
    
    if min_price:
        query = query.filter(Room.price_no_breakfast >= float(min_price))
    
    if max_price:
        query = query.filter(Room.price_no_breakfast <= float(max_price))
    
    if capacity:
        query = query.filter(Room.capacity >= int(capacity))
    
    if facility:
        query = query.join(Room.facility_rooms).filter_by(facility_id=facility)
    
    rooms = query.all()
    return jsonify([room_schema.dump(room) for room in rooms]), 200

@main_bp.route('/rooms/<room_id>', methods=['GET'])
def get_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'message': 'Room not found'}), 404
    return jsonify(room_schema.dump(room)), 200

# Member routes - Bookings
@main_bp.route('/bookings', methods=['POST'])
@jwt_required()
@member_required
def create_booking():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate booking data
        booking_data = {
            'user_id': current_user_id,
            'nik': data.get('nik'),
            'guest_name': data.get('guest_name'),
            'phone': data.get('phone'),
            'check_in': datetime.strptime(data.get('check_in'), '%Y-%m-%d').date(),
            'check_out': datetime.strptime(data.get('check_out'), '%Y-%m-%d').date(),
            'total_guests': data.get('total_guests'),
            'payment_method': data.get('payment_method'),
            'booking_rooms': data.get('booking_rooms', [])
        }
        
        # Calculate total price and validate room availability
        total_price = 0
        for room_booking in booking_data['booking_rooms']:
            room = Room.query.get(room_booking['room_id'])
            if not room or room.status != 'available':
                return jsonify({'message': f'Room {room.room_number} is not available'}), 400
            
            # Check capacity
            if room_booking['quantity'] * room.capacity < booking_data['total_guests']:
                return jsonify({'message': 'Room capacity exceeded'}), 400
            
            # Calculate price
            price = room.price_with_breakfast if room_booking['breakfast_option'] == 'with' else room.price_no_breakfast
            nights = (booking_data['check_out'] - booking_data['check_in']).days
            subtotal = price * room_booking['quantity'] * nights
            
            room_booking['price_per_night'] = price
            room_booking['subtotal'] = subtotal
            room_booking['room_type'] = room.room_type.name
            total_price += subtotal
        
        booking_data['total_price'] = total_price
        
        # Create booking
        booking = Booking(**{k: v for k, v in booking_data.items() if k != 'booking_rooms'})
        db.session.add(booking)
        db.session.flush()  # Get booking ID
        
        # Create booking rooms
        for room_booking in booking_data['booking_rooms']:
            from app.models import BookingRoom
            booking_room = BookingRoom(
                booking_id=booking.id,
                room_id=room_booking['room_id'],
                room_type=room_booking['room_type'],
                quantity=room_booking['quantity'],
                breakfast_option=room_booking['breakfast_option'],
                price_per_night=room_booking['price_per_night'],
                subtotal=room_booking['subtotal']
            )
            db.session.add(booking_room)
        
        db.session.commit()
        return jsonify(booking_schema.dump(booking)), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@main_bp.route('/bookings/me', methods=['GET'])
@jwt_required()
@member_required
def get_my_bookings():
    current_user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc()).all()
    return jsonify([booking_schema.dump(booking) for booking in bookings]), 200

# Ratings
@main_bp.route('/ratings', methods=['POST'])
@jwt_required()
@member_required
def create_rating():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Check if booking exists and belongs to user
        booking = Booking.query.filter_by(id=data.get('booking_id'), user_id=current_user_id).first()
        if not booking:
            return jsonify({'message': 'Booking not found'}), 404
        
        # Check if booking is checked out
        if booking.status != 'checked_out':
            return jsonify({'message': 'Can only rate checked-out bookings'}), 400
        
        # Check if already rated
        existing_rating = Rating.query.filter_by(booking_id=data.get('booking_id')).first()
        if existing_rating:
            return jsonify({'message': 'Booking already rated'}), 400
        
        rating_data = rating_schema.load(data)
        rating = Rating(user_id=current_user_id, **rating_data)
        
        db.session.add(rating)
        db.session.commit()
        
        return jsonify(rating_schema.dump(rating)), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@main_bp.route('/ratings', methods=['GET'])
def get_ratings():
    room_id = request.args.get('room_id')
    ratings = Rating.query.all()
    return jsonify([rating_schema.dump(rating) for rating in ratings]), 200