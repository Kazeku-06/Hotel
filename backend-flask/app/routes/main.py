from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

main_bp = Blueprint('main', __name__)

@main_bp.route('/rooms', methods=['GET'])
def get_rooms():
    from app.models import Room, RoomType, RoomPhoto, Facility  # IMPORT DI DALAM FUNGSI
    
    # Filter parameters
    room_type = request.args.get('room_type')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    capacity = request.args.get('capacity')
    
    query = Room.query.filter_by(status='available')
    
    if room_type:
        query = query.join(RoomType).filter(RoomType.name == room_type)
    
    if min_price:
        query = query.filter(Room.price_no_breakfast >= float(min_price))
    
    if max_price:
        query = query.filter(Room.price_no_breakfast <= float(max_price))
    
    if capacity:
        query = query.filter(Room.capacity >= int(capacity))
    
    rooms = query.all()
    
    result = []
    for room in rooms:
        # Get primary photo
        primary_photo = None
        for photo in room.photos:
            if photo.is_primary:
                primary_photo = f"/uploads/rooms/{room.id}/{photo.photo_path}"
                break
        
        # If no primary photo, get first photo
        if not primary_photo and room.photos:
            primary_photo = f"/uploads/rooms/{room.id}/{room.photos[0].photo_path}"
        
        # Get facilities
        facilities = [facility.name for facility in room.facilities]
        
        result.append({
            'id': room.id,
            'room_type_id': room.room_type_id,
            'room_number': room.room_number,
            'name': f"{room.room_type.name} - Room {room.room_number}" if room.room_type else f"Room {room.room_number}",
            'capacity': room.capacity,
            'price': room.price_no_breakfast,  # For compatibility
            'price_no_breakfast': room.price_no_breakfast,
            'price_with_breakfast': room.price_with_breakfast,
            'status': room.status,
            'description': room.description,
            'image_url': primary_photo,
            'primary_photo': primary_photo,
            'facilities': facilities,
            'room_type': {
                'id': room.room_type.id,
                'name': room.room_type.name,
                'description': room.room_type.description
            } if room.room_type else None
        })
    
    return jsonify(result), 200

@main_bp.route('/rooms/<room_id>', methods=['GET'])
def get_room(room_id):
    from app.models import Room, RoomType, RoomPhoto, Facility  # IMPORT DI DALAM FUNGSI
    
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'message': 'Room not found'}), 404
    
    # Get all photos
    photos = []
    primary_photo = None
    for photo in room.photos:
        photo_url = f"/uploads/rooms/{room.id}/{photo.photo_path}"
        photos.append({
            'id': photo.id,
            'url': photo_url,
            'is_primary': photo.is_primary
        })
        if photo.is_primary:
            primary_photo = photo_url
    
    # If no primary photo, use first photo
    if not primary_photo and photos:
        primary_photo = photos[0]['url']
    
    # Get facilities
    facilities = [facility.name for facility in room.facilities]
    
    result = {
        'id': room.id,
        'room_type_id': room.room_type_id,
        'room_number': room.room_number,
        'name': f"{room.room_type.name} - Room {room.room_number}" if room.room_type else f"Room {room.room_number}",
        'capacity': room.capacity,
        'price': room.price_no_breakfast,  # For compatibility
        'price_no_breakfast': room.price_no_breakfast,
        'price_with_breakfast': room.price_with_breakfast,
        'status': room.status,
        'description': room.description,
        'image_url': primary_photo,
        'primary_photo': primary_photo,
        'photos': photos,
        'facilities': facilities,
        'room_type': {
            'id': room.room_type.id,
            'name': room.room_type.name,
            'description': room.room_type.description
        } if room.room_type else None
    }
    
    return jsonify(result), 200

@main_bp.route('/room-types', methods=['GET'])
def get_room_types():
    from app.models import RoomType
    
    try:
        room_types = RoomType.query.all()
        result = []
        for rt in room_types:
            result.append({
                'id': rt.id,
                'name': rt.name,
                'description': rt.description
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@main_bp.route('/facilities', methods=['GET'])
def get_facilities():
    from app.models import Facility
    
    try:
        facilities = Facility.query.all()
        result = []
        for facility in facilities:
            result.append({
                'id': facility.id,
                'name': facility.name,
                'icon': facility.icon
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@main_bp.route('/bookings/member', methods=['GET'])
@jwt_required()
def get_member_bookings():
    from app.models import Booking, Room, RoomType
    
    try:
        current_user_id = get_jwt_identity()
        bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc()).all()
        
        result = []
        for booking in bookings:
            # Get room info from booking_rooms
            room_info = None
            if booking.booking_rooms:
                booking_room = booking.booking_rooms[0]  # Get first room
                room = Room.query.get(booking_room.room_id)
                if room:
                    # Get primary photo
                    primary_photo = None
                    for photo in room.photos:
                        if photo.is_primary:
                            primary_photo = f"/uploads/rooms/{room.id}/{photo.photo_path}"
                            break
                    if not primary_photo and room.photos:
                        primary_photo = f"/uploads/rooms/{room.id}/{room.photos[0].photo_path}"
                    
                    room_info = {
                        'id': room.id,
                        'room_number': room.room_number,
                        'name': f"{room.room_type.name} - Room {room.room_number}" if room.room_type else f"Room {room.room_number}",
                        'room_type': {
                            'id': room.room_type.id,
                            'name': room.room_type.name
                        } if room.room_type else None,
                        'image_url': primary_photo,
                        'primary_photo': primary_photo
                    }
            
            # Check if user has rated this booking
            rating = None
            if booking.ratings:
                user_rating = next((r for r in booking.ratings if r.user_id == current_user_id), None)
                if user_rating:
                    rating = user_rating.star
            
            result.append({
                'id': booking.id,
                'room': room_info,
                'check_in_date': booking.check_in.isoformat() if booking.check_in else None,
                'check_out_date': booking.check_out.isoformat() if booking.check_out else None,
                'number_of_guests': booking.total_guests,
                'total_amount': booking.total_price,
                'status': booking.status,
                'special_requests': None,  # Add this field to model if needed
                'rating': rating,
                'created_at': booking.created_at.isoformat() if booking.created_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Error getting member bookings: {e}")
        return jsonify({'message': str(e)}), 500

@main_bp.route('/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    from app.models import Booking, BookingRoom, Room
    
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['room_id', 'check_in', 'check_out', 'guests', 'guest_name', 'phone', 'nik', 'payment_method']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Get room info
        room = Room.query.get(data['room_id'])
        if not room:
            return jsonify({'message': 'Room not found'}), 404
        
        # Calculate total price
        from datetime import datetime
        check_in = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(data['check_out'], '%Y-%m-%d').date()
        nights = (check_out - check_in).days
        
        # Use breakfast price by default
        total_price = room.price_with_breakfast * nights
        
        # Create booking
        booking = Booking(
            user_id=current_user_id,
            nik=data['nik'],
            guest_name=data['guest_name'],
            phone=data['phone'],
            check_in=check_in,
            check_out=check_out,
            total_guests=int(data['guests']),
            payment_method=data['payment_method'],
            total_price=total_price,
            status='pending'
        )
        
        db.session.add(booking)
        db.session.commit()  # Commit to get booking ID
        
        # Create booking room
        booking_room = BookingRoom(
            booking_id=booking.id,
            room_id=room.id,
            room_type=room.room_type.name if room.room_type else 'Standard',
            quantity=1,
            breakfast_option='with',
            price_per_night=room.price_with_breakfast,
            subtotal=total_price
        )
        
        db.session.add(booking_room)
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking_id': booking.id,
            'total_amount': total_price
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating booking: {e}")
        return jsonify({'message': str(e)}), 400

@main_bp.route('/bookings/<booking_id>/rate', methods=['POST'])
@jwt_required()
def rate_booking(booking_id):
    from app.models import Booking, Rating
    
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('rating') or not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
            return jsonify({'message': 'Rating must be between 1 and 5'}), 400
        
        # Check if booking exists and belongs to user
        booking = Booking.query.filter_by(id=booking_id, user_id=current_user_id).first()
        if not booking:
            return jsonify({'message': 'Booking not found'}), 404
        
        # Check if booking is completed
        if booking.status not in ['confirmed', 'checked_out']:
            return jsonify({'message': 'Can only rate completed bookings'}), 400
        
        # Check if already rated
        existing_rating = Rating.query.filter_by(booking_id=booking_id, user_id=current_user_id).first()
        if existing_rating:
            return jsonify({'message': 'Booking already rated'}), 400
        
        # Create rating
        rating = Rating(
            user_id=current_user_id,
            booking_id=booking_id,
            star=data['rating'],
            comment=data.get('comment', '')
        )
        
        db.session.add(rating)
        db.session.commit()
        
        return jsonify({'message': 'Rating submitted successfully'}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error rating booking: {e}")
        return jsonify({'message': str(e)}), 400