from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

main_bp = Blueprint('main', __name__)

@main_bp.route('/rooms', methods=['GET'])
def get_rooms():
    from app.models import Room, RoomType  # IMPORT DI DALAM FUNGSI
    
    # Filter parameters
    room_type = request.args.get('room_type')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    capacity = request.args.get('capacity')
    
    query = Room.query.filter_by(status='available')
    
    if room_type:
        query = query.join(RoomType).filter(RoomType.id == room_type)
    
    if min_price:
        query = query.filter(Room.price_no_breakfast >= float(min_price))
    
    if max_price:
        query = query.filter(Room.price_no_breakfast <= float(max_price))
    
    if capacity:
        query = query.filter(Room.capacity >= int(capacity))
    
    rooms = query.all()
    
    result = []
    for room in rooms:
        result.append({
            'id': room.id,
            'room_type_id': room.room_type_id,
            'room_number': room.room_number,
            'capacity': room.capacity,
            'price_no_breakfast': room.price_no_breakfast,
            'price_with_breakfast': room.price_with_breakfast,
            'status': room.status,
            'description': room.description,
            'room_type': {
                'id': room.room_type.id,
                'name': room.room_type.name,
                'description': room.room_type.description
            } if room.room_type else None
        })
    
    return jsonify(result), 200

@main_bp.route('/rooms/<room_id>', methods=['GET'])
def get_room(room_id):
    from app.models import Room, RoomType  # IMPORT DI DALAM FUNGSI
    
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'message': 'Room not found'}), 404
    
    result = {
        'id': room.id,
        'room_type_id': room.room_type_id,
        'room_number': room.room_number,
        'capacity': room.capacity,
        'price_no_breakfast': room.price_no_breakfast,
        'price_with_breakfast': room.price_with_breakfast,
        'status': room.status,
        'description': room.description,
        'room_type': {
            'id': room.room_type.id,
            'name': room.room_type.name,
            'description': room.room_type.description
        } if room.room_type else None
    }
    
    return jsonify(result), 200