from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
import os
from werkzeug.utils import secure_filename
import uuid
from app import db
from app.utils import admin_required

admin_bp = Blueprint('admin', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ===== ROOM TYPES =====
@admin_bp.route('/room-types', methods=['GET'])
@jwt_required()
@admin_required
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
        print(f"✅ Found {len(result)} room types")
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Error getting room types: {e}")
        return jsonify({'message': str(e)}), 500

# ===== ROOMS MANAGEMENT =====
@admin_bp.route('/rooms', methods=['GET'])
@jwt_required()
@admin_required
def get_rooms():
    from app.models import Room, RoomType
    
    try:
        rooms = Room.query.all()
        result = []
        for room in rooms:
            # Get photos if any
            photos = []
            for photo in room.photos:
                photos.append({
                    'id': photo.id,
                    'photo_path': f"/uploads/rooms/{room.id}/{photo.photo_path}",
                    'is_primary': getattr(photo, 'is_primary', False)
                })
            
            result.append({
                'id': room.id,
                'room_type_id': room.room_type_id,
                'room_number': room.room_number,
                'capacity': room.capacity,
                'price_no_breakfast': room.price_no_breakfast,
                'price_with_breakfast': room.price_with_breakfast,
                'status': room.status,
                'description': room.description,
                'photos': photos,
                'room_type': {
                    'id': room.room_type.id,
                    'name': room.room_type.name,
                    'description': room.room_type.description
                } if room.room_type else None
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/rooms', methods=['POST'])
@jwt_required()
@admin_required
def create_room():
    from app.models import Room
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['room_number', 'room_type_id', 'capacity', 'price_no_breakfast', 'price_with_breakfast']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if room number already exists
        existing_room = Room.query.filter_by(room_number=data['room_number']).first()
        if existing_room:
            return jsonify({'message': 'Room number already exists'}), 400
        
        # Create new room
        room = Room(
            room_number=data['room_number'],
            room_type_id=data['room_type_id'],
            capacity=int(data['capacity']),
            price_no_breakfast=float(data['price_no_breakfast']),
            price_with_breakfast=float(data['price_with_breakfast']),
            description=data.get('description', ''),
            status=data.get('status', 'available')
        )
        
        db.session.add(room)
        db.session.commit()
        
        return jsonify({
            'message': 'Room created successfully',
            'room': {
                'id': room.id,
                'room_number': room.room_number,
                'room_type_id': room.room_type_id,
                'capacity': room.capacity,
                'price_no_breakfast': room.price_no_breakfast,
                'price_with_breakfast': room.price_with_breakfast,
                'status': room.status,
                'description': room.description
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@admin_bp.route('/rooms/<room_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_room(room_id):
    from app.models import Room
    
    try:
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404
        
        data = request.get_json()
        
        # Check if room number already exists (excluding current room)
        if data.get('room_number') and data['room_number'] != room.room_number:
            existing_room = Room.query.filter_by(room_number=data['room_number']).first()
            if existing_room:
                return jsonify({'message': 'Room number already exists'}), 400
        
        # Update room fields
        if 'room_number' in data:
            room.room_number = data['room_number']
        if 'room_type_id' in data:
            room.room_type_id = data['room_type_id']
        if 'capacity' in data:
            room.capacity = int(data['capacity'])
        if 'price_no_breakfast' in data:
            room.price_no_breakfast = float(data['price_no_breakfast'])
        if 'price_with_breakfast' in data:
            room.price_with_breakfast = float(data['price_with_breakfast'])
        if 'description' in data:
            room.description = data['description']
        if 'status' in data:
            room.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Room updated successfully',
            'room': {
                'id': room.id,
                'room_number': room.room_number,
                'room_type_id': room.room_type_id,
                'capacity': room.capacity,
                'price_no_breakfast': room.price_no_breakfast,
                'price_with_breakfast': room.price_with_breakfast,
                'status': room.status,
                'description': room.description
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@admin_bp.route('/rooms/<room_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_room(room_id):
    from app.models import Room, RoomPhoto
    
    try:
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404
        
        # Delete associated photos
        for photo in room.photos:
            # Delete file from filesystem
            file_path = os.path.join(
                current_app.config['UPLOAD_FOLDER'],
                'rooms',
                room.id,
                photo.photo_path
            )
            if os.path.exists(file_path):
                os.remove(file_path)
            db.session.delete(photo)
        
        db.session.delete(room)
        db.session.commit()
        
        return jsonify({'message': 'Room deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ===== ROOM PHOTOS =====
@admin_bp.route('/rooms/<room_id>/photos', methods=['POST'])
@jwt_required()
@admin_required
def upload_room_photos(room_id):
    from app.models import Room, RoomPhoto
    
    try:
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404
        
        if 'photos' not in request.files:
            return jsonify({'message': 'No photos provided'}), 400
        
        files = request.files.getlist('photos')
        if not files or not files[0].filename:
            return jsonify({'message': 'No photos selected'}), 400
        
        uploaded_photos = []
        
        for i, file in enumerate(files):
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                
                upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'rooms', room_id)
                os.makedirs(upload_dir, exist_ok=True)
                
                file_path = os.path.join(upload_dir, unique_filename)
                file.save(file_path)
                
                # Create photo record
                photo = RoomPhoto(
                    room_id=room_id, 
                    photo_path=unique_filename,
                    is_primary=(i == 0)  # First photo as primary
                )
                db.session.add(photo)
                uploaded_photos.append(photo)
        
        db.session.commit()
        
        return jsonify([{
            'id': photo.id,
            'photo_url': f"/uploads/rooms/{room_id}/{photo.photo_path}",
            'is_primary': photo.is_primary
        } for photo in uploaded_photos]), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@admin_bp.route('/room-photos/<photo_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_room_photo(photo_id):
    from app.models import RoomPhoto
    
    try:
        photo = RoomPhoto.query.get(photo_id)
        if not photo:
            return jsonify({'message': 'Photo not found'}), 404
        
        # Delete file from filesystem
        file_path = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            'rooms',
            photo.room_id,
            photo.photo_path
        )
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
        db.session.delete(photo)
        db.session.commit()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ===== BOOKINGS MANAGEMENT =====
@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
@admin_required
def get_bookings():
    from app.models import Booking
    
    try:
        bookings = Booking.query.all()
        result = []
        for booking in bookings:
            result.append({
                'id': booking.id,
                'guest_name': booking.guest_name,
                'check_in': booking.check_in.isoformat() if booking.check_in else None,
                'check_out': booking.check_out.isoformat() if booking.check_out else None,
                'status': booking.status,
                'total_price': booking.total_price
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/bookings/<booking_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_booking_status(booking_id):
    from app.models import Booking
    
    try:
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'message': 'Booking not found'}), 404
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']:
            return jsonify({'message': 'Invalid status'}), 400
        
        booking.status = new_status
        db.session.commit()
        
        return jsonify({
            'message': 'Booking status updated successfully',
            'booking': {
                'id': booking.id,
                'status': booking.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ===== RATINGS MANAGEMENT =====
@admin_bp.route('/ratings', methods=['GET'])
@jwt_required()
@admin_required
def get_ratings():
    from app.models import Rating
    
    try:
        ratings = Rating.query.all()
        result = []
        for rating in ratings:
            result.append({
                'id': rating.id,
                'star': rating.star,
                'comment': rating.comment,
                'user_name': rating.user.name if rating.user else 'Unknown',
                'created_at': rating.created_at.isoformat() if rating.created_at else None
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500