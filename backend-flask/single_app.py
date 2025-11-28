# single_app.py - FOR LARAGON
import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS, cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key'

# LARAGON MYSQL CONFIG
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/hotel_db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# 🔥 KONFIGURASI CORS YANG LEBIH ROBUST
CORS(app, 
     resources={
         r"/api/*": {
             "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
             "supports_credentials": True,
             "expose_headers": ["Content-Range", "X-Content-Range"],
             "max_age": 600
         }
     })

# 🔥 GLOBAL CORS HANDLING
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'preflight'})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.add('Pragma', 'no-cache')
    response.headers.add('Expires', '0')
    return response

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'rooms'), exist_ok=True)

# MODELS
def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum('admin', 'member'), default='member')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

class RoomType(db.Model):
    __tablename__ = 'room_types'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Room(db.Model):
    __tablename__ = 'rooms'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    room_type_id = db.Column(db.String(36), db.ForeignKey('room_types.id'), nullable=False)
    room_number = db.Column(db.String(10), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    price_no_breakfast = db.Column(db.Float, nullable=False)
    price_with_breakfast = db.Column(db.Float, nullable=False)
    # UPDATE: Tambah status 'booked'
    status = db.Column(db.Enum('available', 'unavailable', 'booked'), default='available')
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    room_type = db.relationship('RoomType', backref='rooms')

class RoomPhoto(db.Model):
    __tablename__ = 'room_photos'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    room_id = db.Column(db.String(36), db.ForeignKey('rooms.id'), nullable=False)
    photo_path = db.Column(db.String(255), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    room = db.relationship('Room', backref='photos')
    
    def delete_photo_file(self):
        """Hapus file foto dari filesystem"""
        try:
            if os.path.exists(self.photo_path):
                os.remove(self.photo_path)
        except Exception as e:
            print(f"Error deleting photo file: {e}")

class Facility(db.Model):
    __tablename__ = 'facilities'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FacilityRoom(db.Model):
    __tablename__ = 'facility_room'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    room_id = db.Column(db.String(36), db.ForeignKey('rooms.id'), nullable=False)
    facility_id = db.Column(db.String(36), db.ForeignKey('facilities.id'), nullable=False)
    
    room = db.relationship('Room', backref='facility_rooms')
    facility = db.relationship('Facility', backref='facility_rooms')

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    nik = db.Column(db.String(20), nullable=False)
    guest_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    total_guests = db.Column(db.Integer, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.Enum('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='bookings')

class BookingRoom(db.Model):
    __tablename__ = 'booking_rooms'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=False)
    room_id = db.Column(db.String(36), db.ForeignKey('rooms.id'), nullable=False)
    room_type = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    breakfast_option = db.Column(db.Enum('with', 'without'), nullable=False)
    price_per_night = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    
    booking = db.relationship('Booking', backref='booking_rooms')
    room = db.relationship('Room', backref='booking_rooms')

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=False)
    star = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='ratings')
    booking = db.relationship('Booking', backref='rating')

# ROUTES
@app.route('/')
def home():
    return jsonify({'message': 'Hotel API is running!', 'database': 'MySQL with Laragon'})

# 🔥 CORS TEST ENDPOINT
@app.route('/api/debug/cors-test', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def cors_test():
    """Endpoint untuk test CORS"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight successful'})
        return response, 200
    
    return jsonify({
        'message': 'CORS test successful',
        'method': request.method,
        'headers': dict(request.headers)
    })

# ==== AUTH ROUTES ====
@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone', '')
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,  # ✅ TAMBAHKAN PHONE
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'phone': user.phone,  # ✅ TAMBAHKAN PHONE DI LOGIN RESPONSE
                    'role': user.role
                }
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'message': str(e)}), 400

# ==== AUTH ME ROUTE ====
@app.route('/api/auth/me', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_current_user():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'phone': user.phone,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==== FACILITY ROUTES ====
@app.route('/api/facilities', methods=['GET', 'OPTIONS'])
def get_facilities():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        facilities = Facility.query.all()
        result = []
        for facility in facilities:
            result.append({
                'id': facility.id,
                'name': facility.name,
                'icon': facility.icon,
                'created_at': facility.created_at.isoformat() if facility.created_at else None
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/facilities', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def admin_facilities():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            facilities = Facility.query.all()
            result = []
            for facility in facilities:
                result.append({
                    'id': facility.id,
                    'name': facility.name,
                    'icon': facility.icon,
                    'created_at': facility.created_at.isoformat() if facility.created_at else None
                })
            return jsonify(result), 200

        elif request.method == 'POST':
            data = request.get_json()
            
            if not data.get('name'):
                return jsonify({'message': 'Facility name is required'}), 400

            # Check if facility already exists
            if Facility.query.filter_by(name=data.get('name')).first():
                return jsonify({'message': 'Facility already exists'}), 400

            facility = Facility(
                name=data.get('name'),
                icon=data.get('icon', '')
            )
            
            db.session.add(facility)
            db.session.commit()
            
            return jsonify({
                'message': 'Facility created successfully',
                'facility': {
                    'id': facility.id,
                    'name': facility.name,
                    'icon': facility.icon
                }
            }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ==== ROOM TYPE ROUTES ==== 
@app.route('/api/room-types', methods=['GET', 'OPTIONS'])
def room_types():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        # GET tidak perlu auth untuk public access
        room_types = RoomType.query.all()
        result = []
        for room_type in room_types:
            result.append({
                'id': room_type.id,
                'name': room_type.name,
                'description': room_type.description,
                'created_at': room_type.created_at.isoformat() if room_type.created_at else None
            })
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result)
        }), 200

    except Exception as e:
        print(f"❌ ERROR in room_types: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

# ==== ADMIN ROOM TYPES ROUTES ====
@app.route('/api/admin/room-types', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def admin_room_types():
    """Admin endpoint untuk manage room types"""
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            # GET room types untuk admin (bisa dengan lebih banyak data)
            room_types = RoomType.query.all()
            result = []
            for room_type in room_types:
                result.append({
                    'id': room_type.id,
                    'name': room_type.name,
                    'description': room_type.description,
                    'created_at': room_type.created_at.isoformat() if room_type.created_at else None,
                    'room_count': len(room_type.rooms)  # Tambah info jumlah room
                })
            return jsonify({
                'success': True,
                'data': result,
                'count': len(result)
            }), 200

        elif request.method == 'POST':
            data = request.get_json()
            
            if not data or not data.get('name'):
                return jsonify({
                    'success': False,
                    'message': 'Room type name is required'
                }), 400

            # Check if room type already exists
            if RoomType.query.filter_by(name=data.get('name')).first():
                return jsonify({
                    'success': False,
                    'message': 'Room type already exists'
                }), 400

            room_type = RoomType(
                name=data.get('name'),
                description=data.get('description', '')
            )
            
            db.session.add(room_type)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Room type created successfully',
                'data': {
                    'id': room_type.id,
                    'name': room_type.name,
                    'description': room_type.description
                }
            }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in admin_room_types: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

# Update admin rooms untuk include facilities
@app.route('/api/admin/rooms/<room_id>/facilities', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
@jwt_required()
def room_facilities(room_id):
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404

        if request.method == 'GET':
            # Get all facilities for this room
            room_facilities = FacilityRoom.query.filter_by(room_id=room_id).all()
            result = []
            for rf in room_facilities:
                result.append({
                    'id': rf.facility.id,
                    'name': rf.facility.name,
                    'icon': rf.facility.icon
                })
            return jsonify(result), 200

        elif request.method == 'POST':
            data = request.get_json()
            facility_id = data.get('facility_id')
            
            if not facility_id:
                return jsonify({'message': 'Facility ID is required'}), 400

            # Check if facility exists
            facility = Facility.query.get(facility_id)
            if not facility:
                return jsonify({'message': 'Facility not found'}), 404

            # Check if facility already added to room
            existing_facility = FacilityRoom.query.filter_by(
                room_id=room_id, 
                facility_id=facility_id
            ).first()
            
            if existing_facility:
                return jsonify({'message': 'Facility already added to room'}), 400

            # Add facility to room
            room_facility = FacilityRoom(
                room_id=room_id,
                facility_id=facility_id
            )
            
            db.session.add(room_facility)
            db.session.commit()
            
            return jsonify({
                'message': 'Facility added to room successfully',
                'facility': {
                    'id': facility.id,
                    'name': facility.name,
                    'icon': facility.icon
                }
            }), 201

        elif request.method == 'DELETE':
            facility_id = request.args.get('facility_id')
            
            if not facility_id:
                return jsonify({'message': 'Facility ID is required'}), 400

            # Find and remove facility from room
            room_facility = FacilityRoom.query.filter_by(
                room_id=room_id, 
                facility_id=facility_id
            ).first()
            
            if not room_facility:
                return jsonify({'message': 'Facility not found in room'}), 404

            db.session.delete(room_facility)
            db.session.commit()
            
            return jsonify({'message': 'Facility removed from room successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ==== ROOM ROUTES ====
@app.route('/api/rooms', methods=['GET', 'OPTIONS'])
def get_rooms():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        # Get filter parameters from request
        room_type_filter = request.args.get('room_type', '').lower()
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        capacity_filter = request.args.get('capacity', type=int)
        
        # PERBAIKAN: Handle facilities array dengan benar
        facilities_filter = request.args.getlist('facilities[]')
        # Fallback untuk format lain
        if not facilities_filter:
            facilities_filter = request.args.getlist('facilities')
        
        print(f"🔍 DEBUG FILTER - room_type: {room_type_filter}, min_price: {min_price}, max_price: {max_price}, capacity: {capacity_filter}")
        print(f"🔍 DEBUG FACILITIES FILTER: {facilities_filter}")
        print(f"🔍 DEBUG ALL ARGS: {request.args}")
        
        # Start with base query
        query = Room.query.filter(Room.status == 'available')
        
        # Filter by room type - PERBAIKAN: case insensitive exact match
        if room_type_filter:
            query = query.join(RoomType).filter(db.func.lower(RoomType.name) == room_type_filter)
        
        # Filter by price range
        if min_price is not None:
            query = query.filter(Room.price_no_breakfast >= min_price)
        if max_price is not None:
            query = query.filter(Room.price_no_breakfast <= max_price)
        
        # Filter by capacity
        if capacity_filter:
            query = query.filter(Room.capacity >= capacity_filter)
        
        # Filter by facilities - PERBAIKAN: gunakan subquery untuk multiple facilities
        if facilities_filter:
            # Cari room yang memiliki SEMUA facilities yang dipilih
            subquery = db.session.query(FacilityRoom.room_id).filter(
                FacilityRoom.facility_id.in_(facilities_filter)
            ).group_by(FacilityRoom.room_id).having(
                db.func.count(FacilityRoom.facility_id) == len(facilities_filter)
            ).subquery()
            
            query = query.join(subquery, Room.id == subquery.c.room_id)
        
        rooms = query.all()
        
        print(f"🔍 DEBUG - Found {len(rooms)} rooms after filtering")
        
        result = []
        for room in rooms:
            # Get primary photo if exists
            primary_photo = None
            for photo in room.photos:
                if photo.is_primary:
                    primary_photo = f"/{photo.photo_path}"
                    break
            if not primary_photo and room.photos:
                primary_photo = f"/{room.photos[0].photo_path}"
                
            # Get room facilities
            facilities = []
            for fr in room.facility_rooms:
                facilities.append({
                    'id': fr.facility.id,
                    'name': fr.facility.name,
                    'icon': fr.facility.icon
                })
                
            result.append({
                'id': room.id,
                'room_number': room.room_number,
                'capacity': room.capacity,
                'price_no_breakfast': room.price_no_breakfast,
                'price_with_breakfast': room.price_with_breakfast,
                'status': room.status,
                'description': room.description,
                'primary_photo': primary_photo,
                'facility_rooms': facilities,
                'room_type': {
                    'id': room.room_type.id,
                    'name': room.room_type.name
                } if room.room_type else None
            })
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ ERROR in get_rooms: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500

# ==== Single Room Detail ====
@app.route('/api/rooms/<room_id>', methods=['GET', 'OPTIONS'])
def get_room(room_id):
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404
        
        # Get room photos
        photos = []
        for photo in room.photos:
            photos.append({
                'id': photo.id,
                'photo_path': f"/{photo.photo_path}",
                'is_primary': getattr(photo, 'is_primary', False)
            })
        
        # Get room facilities
        facilities = []
        for fr in room.facility_rooms:
            facilities.append({
                'id': fr.facility.id,
                'name': fr.facility.name,
                'icon': fr.facility.icon
            })
        
        result = {
            'id': room.id,
            'room_number': room.room_number,
            'room_type_id': room.room_type_id,
            'room_type': {
                'id': room.room_type.id,
                'name': room.room_type.name,
                'description': room.room_type.description
            } if room.room_type else None,
            'capacity': room.capacity,
            'price_no_breakfast': room.price_no_breakfast,
            'price_with_breakfast': room.price_with_breakfast,
            'status': room.status,
            'description': room.description,
            'photos': photos,
            'facilities': facilities,
            'created_at': room.created_at.isoformat() if room.created_at else None
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==== RATINGS ROUTES ====
@app.route('/api/ratings', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def ratings():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        
        if request.method == 'GET':
            # Get all ratings with user and booking info
            ratings = Rating.query.order_by(Rating.created_at.desc()).all()
            
            result = []
            for rating in ratings:
                result.append({
                    'id': rating.id,
                    'user': {
                        'id': rating.user.id,
                        'name': rating.user.name,
                        'email': rating.user.email
                    } if rating.user else None,
                    'booking_id': rating.booking_id,
                    'star': rating.star,
                    'comment': rating.comment,
                    'created_at': rating.created_at.isoformat() if rating.created_at else None
                })
            
            return jsonify({
                'success': True,
                'data': result,
                'count': len(result)
            }), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['booking_id', 'star']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'Missing required field: {field}'}), 400
            
            # Check if rating already exists for this booking
            existing_rating = Rating.query.filter_by(
                booking_id=data['booking_id']
            ).first()
            
            if existing_rating:
                return jsonify({'message': 'Rating already submitted for this booking'}), 400
            
            # Check if booking exists and belongs to user
            booking = Booking.query.filter_by(
                id=data['booking_id'],
                user_id=current_user_id
            ).first()
            
            if not booking:
                return jsonify({'message': 'Booking not found or access denied'}), 404
            
            # Validate star rating (1-5)
            star = int(data['star'])
            if star < 1 or star > 5:
                return jsonify({'message': 'Star rating must be between 1 and 5'}), 400
            
            # Create new rating
            rating = Rating(
                user_id=current_user_id,
                booking_id=data['booking_id'],
                star=star,
                comment=data.get('comment', '')
            )
            
            db.session.add(rating)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Rating submitted successfully',
                'data': {
                    'id': rating.id,
                    'star': rating.star,
                    'comment': rating.comment,
                    'created_at': rating.created_at.isoformat()
                }
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Admin ratings endpoint
@app.route('/api/admin/ratings', methods=['GET', 'OPTIONS'])
@jwt_required()
def admin_ratings():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        ratings = Rating.query.order_by(Rating.created_at.desc()).all()
        
        result = []
        for rating in ratings:
            result.append({
                'id': rating.id,
                'user': {
                    'id': rating.user.id,
                    'name': rating.user.name,
                    'email': rating.user.email
                } if rating.user else None,
                'booking_id': rating.booking_id,
                'star': rating.star,
                'comment': rating.comment,
                'created_at': rating.created_at.isoformat() if rating.created_at else None
            })
        
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# ==== BOOKINGS ROUTES ====
@app.route('/api/bookings', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_booking():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        print("🔍 DEBUG - Received booking data:", data)
        
        # Validate required fields
        required_fields = ['nik', 'guest_name', 'phone', 'check_in', 'check_out', 'total_guests', 'payment_method', 'rooms']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Calculate number of nights
        check_in_date = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
        check_out_date = datetime.strptime(data['check_out'], '%Y-%m-%d').date()
        nights = (check_out_date - check_in_date).days
        
        print(f"🔍 DEBUG - Nights calculation: {check_in_date} to {check_out_date} = {nights} nights")
        
        if nights <= 0:
            return jsonify({'message': 'Check-out date must be after check-in date'}), 400
        
        # Calculate total price based on nights
        total_price = 0
        booking_rooms = []
        
        for room_data in data['rooms']:
            room = Room.query.get(room_data['room_id'])
            if not room:
                return jsonify({'message': f'Room not found: {room_data["room_id"]}'}), 404
            
            # UPDATE: Check if room is available (bukan unavailable atau booked)
            if room.status != 'available':
                return jsonify({'message': f'Room {room.room_number} is not available. Current status: {room.status}'}), 400
            
            price_per_night = room.price_with_breakfast if room_data['breakfast_option'] == 'with' else room.price_no_breakfast
            subtotal = price_per_night * room_data['quantity'] * nights
            
            print(f"🔍 DEBUG - Room {room.room_number}: {price_per_night} x {room_data['quantity']} x {nights} nights = {subtotal}")
            
            total_price += subtotal
            
            booking_rooms.append({
                'room': room,
                'room_type': room.room_type.name,
                'quantity': room_data['quantity'],
                'breakfast_option': room_data['breakfast_option'],
                'price_per_night': price_per_night,
                'subtotal': subtotal
            })
        
        print(f"🔍 DEBUG - Final total price: {total_price}")
        
        # Create booking
        booking = Booking(
            user_id=current_user_id,
            nik=data['nik'],
            guest_name=data['guest_name'],
            phone=data['phone'],
            check_in=check_in_date,
            check_out=check_out_date,
            total_guests=data['total_guests'],
            payment_method=data['payment_method'],
            total_price=total_price
        )
        
        db.session.add(booking)
        db.session.flush()
        
        # UPDATE: Set room status to 'booked' dan create booking rooms
        for br_data in booking_rooms:
            # Update room status to booked
            br_data['room'].status = 'booked'
            print(f"🔄 Room {br_data['room'].room_number} status set to booked")
            
            booking_room = BookingRoom(
                booking_id=booking.id,
                room_id=br_data['room'].id,
                room_type=br_data['room_type'],
                quantity=br_data['quantity'],
                breakfast_option=br_data['breakfast_option'],
                price_per_night=br_data['price_per_night'],
                subtotal=br_data['subtotal']
            )
            db.session.add(booking_room)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking_id': booking.id,
            'total_price': total_price,
            'nights': nights
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Booking error: {str(e)}")
        return jsonify({'message': str(e)}), 400

@app.route('/api/bookings/me', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_my_bookings():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        
        print(f"🔍 DEBUG - Current user ID: {current_user_id}")
        
        bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc()).all()
        
        print(f"🔍 DEBUG - Found {len(bookings)} bookings in database")
        
        result = []
        for booking in bookings:
            booking_data = {
                'id': booking.id,
                'nik': booking.nik,
                'guest_name': booking.guest_name,
                'phone': booking.phone,
                'check_in': booking.check_in.isoformat(),
                'check_out': booking.check_out.isoformat(),
                'total_guests': booking.total_guests,
                'payment_method': booking.payment_method,
                'total_price': float(booking.total_price),
                'status': booking.status,
                'created_at': booking.created_at.isoformat(),
                'booking_rooms': []
            }
            
            print(f"🔍 DEBUG - Booking: {booking.id}, Status: {booking.status}")
            
            for br in booking.booking_rooms:
                booking_data['booking_rooms'].append({
                    'id': br.id,
                    'room_type': br.room_type,
                    'quantity': br.quantity,
                    'breakfast_option': br.breakfast_option,
                    'subtotal': float(br.subtotal)
                })
            
            result.append(booking_data)
        
        print("🔍 DEBUG - Final response structure:")
        print(f"Response: {{'data': {result}}}")
        print(f"Response type: {{'data': array with {len(result)} items}}")
        
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        print(f"❌ ERROR in get_my_bookings: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        }), 500

# ==== ADMIN BOOKINGS ROUTES ====
@app.route('/api/admin/bookings', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_all_bookings():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        bookings = Booking.query.order_by(Booking.created_at.desc()).all()
        
        result = []
        for booking in bookings:
            booking_data = {
                'id': booking.id,
                'nik': booking.nik,
                'guest_name': booking.guest_name,
                'phone': booking.phone,
                'check_in': booking.check_in.isoformat(),
                'check_out': booking.check_out.isoformat(),
                'total_guests': booking.total_guests,
                'payment_method': booking.payment_method,
                'total_price': float(booking.total_price),
                'status': booking.status,
                'created_at': booking.created_at.isoformat(),
                'booking_rooms': []
            }
            
            for br in booking.booking_rooms:
                booking_data['booking_rooms'].append({
                    'id': br.id,
                    'room_type': br.room_type,
                    'quantity': br.quantity,
                    'breakfast_option': br.breakfast_option,
                    'subtotal': float(br.subtotal)
                })
            
            result.append(booking_data)
        
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        print(f"❌ ERROR in get_all_bookings: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        }), 500

@app.route('/api/admin/bookings/<booking_id>/status', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_booking_status(booking_id):
    try:
        # 🔥 PERBAIKAN CORS YANG LEBIH ROBUST
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'preflight'})
            return response, 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'message': 'Booking not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        new_status = data.get('status')
        old_status = booking.status
        
        if not new_status:
            return jsonify({'message': 'Status is required'}), 400
        
        valid_statuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
        if new_status not in valid_statuses:
            return jsonify({'message': 'Invalid status'}), 400
        
        print(f"🔄 Updating booking {booking_id} status from {old_status} to {new_status}")
        
        # DEBUG: Log room status sebelum update
        for booking_room in booking.booking_rooms:
            room = Room.query.get(booking_room.room_id)
            if room:
                print(f"🔍 DEBUG Room {room.room_number} current status: {room.status}")
        
        # UPDATE: Handle room status changes based on booking status
        if new_status == 'cancelled' and old_status != 'cancelled':
            # Jika booking dibatalkan, kembalikan room status ke available
            for booking_room in booking.booking_rooms:
                room = Room.query.get(booking_room.room_id)
                if room:
                    room.status = 'available'
                    print(f"🔄 Room {room.room_number} status set to available (cancelled)")
        
        elif old_status == 'cancelled' and new_status != 'cancelled':
            # Jika booking diaktifkan kembali dari cancelled, set room ke booked
            for booking_room in booking.booking_rooms:
                room = Room.query.get(booking_room.room_id)
                if room:
                    room.status = 'booked'
                    print(f"🔄 Room {room.room_number} status set to booked (re-activated)")
        
        elif new_status == 'checked_out':
            # Setelah check-out, room menjadi available lagi
            for booking_room in booking.booking_rooms:
                room = Room.query.get(booking_room.room_id)
                if room:
                    print(f"🔄 Changing room {room.room_number} from {room.status} to available (check-out)")
                    room.status = 'available'
        
        # Update booking status
        booking.status = new_status
        db.session.commit()
        
        # DEBUG: Log room status setelah update
        for booking_room in booking.booking_rooms:
            room = Room.query.get(booking_room.room_id)
            if room:
                print(f"✅ Room {room.room_number} final status: {room.status}")
        
        return jsonify({
            'success': True,
            'message': f'Booking status updated to {new_status}',
            'booking': {
                'id': booking.id,
                'status': booking.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in update_booking_status: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# ==== ADMIN ROUTES ====
# Allowed extensions for images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/admin/rooms', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def admin_rooms():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            rooms = Room.query.all()
            result = []
            for room in rooms:
                # Get room photos dengan error handling
                photos = []
                try:
                    for photo in room.photos:
                        photos.append({
                            'id': photo.id,
                            'photo_path': f"/{photo.photo_path}",
                            'is_primary': getattr(photo, 'is_primary', False)
                        })
                except Exception as photo_error:
                    print(f"Error loading photos for room {room.id}: {photo_error}")
                    # Continue without photos if there's an error
                
                # Get room facilities
                facilities = []
                for fr in room.facility_rooms:
                    facilities.append({
                        'id': fr.facility.id,
                        'name': fr.facility.name,
                        'icon': fr.facility.icon
                    })
                
                result.append({
                    'id': room.id,
                    'room_number': room.room_number,
                    'room_type_id': room.room_type_id,
                    'room_type': {
                        'id': room.room_type.id,
                        'name': room.room_type.name,
                        'description': room.room_type.description
                    } if room.room_type else None,
                    'capacity': room.capacity,
                    'price_no_breakfast': room.price_no_breakfast,
                    'price_with_breakfast': room.price_with_breakfast,
                    'status': room.status,
                    'description': room.description,
                    'photos': photos,
                    'facility_rooms': facilities,
                    'created_at': room.created_at.isoformat() if room.created_at else None
                })
            return jsonify(result), 200

        elif request.method == 'POST':
            # Check content type
            if request.content_type.startswith('multipart/form-data'):
                # Handle form data dengan file upload
                room_number = request.form.get('room_number')
                room_type_id = request.form.get('room_type_id')
                capacity = request.form.get('capacity')
                price_no_breakfast = request.form.get('price_no_breakfast')
                price_with_breakfast = request.form.get('price_with_breakfast')
                status = request.form.get('status', 'available')
                description = request.form.get('description', '')
                
                # 🔥 PERBAIKAN: Get facilities dari form data
                facilities = request.form.getlist('facilities[]')
                print(f"🔧 DEBUG - Received facilities for CREATE: {facilities}")
                
            else:
                # Handle JSON data (fallback)
                data = request.get_json()
                room_number = data.get('room_number')
                room_type_id = data.get('room_type_id')
                capacity = data.get('capacity')
                price_no_breakfast = data.get('price_no_breakfast')
                price_with_breakfast = data.get('price_with_breakfast')
                status = data.get('status', 'available')
                description = data.get('description', '')
                facilities = data.get('facilities', [])
            
            # Validasi required fields
            if not all([room_number, room_type_id, capacity, price_no_breakfast, price_with_breakfast]):
                return jsonify({'message': 'All required fields must be filled'}), 400
            
            # Check if room number already exists
            if Room.query.filter_by(room_number=room_number).first():
                return jsonify({'message': 'Room number already exists'}), 400

            # Create new room
            room = Room(
                room_number=room_number,
                room_type_id=room_type_id,
                capacity=int(capacity),
                price_no_breakfast=float(price_no_breakfast),
                price_with_breakfast=float(price_with_breakfast),
                status=status,
                description=description
            )
            
            db.session.add(room)
            db.session.flush()  # Get room ID
            
            # 🔥 PERBAIKAN: Handle facilities association untuk CREATE
            if facilities:
                print(f"🔄 Adding {len(facilities)} facilities to room {room.room_number}")
                for facility_id in facilities:
                    # Check if facility exists
                    facility = Facility.query.get(facility_id)
                    if facility:
                        room_facility = FacilityRoom(
                            room_id=room.id,
                            facility_id=facility_id
                        )
                        db.session.add(room_facility)
                        print(f"✅ Added facility {facility.name} to room {room.room_number}")
                    else:
                        print(f"⚠️ Facility with ID {facility_id} not found")
            else:
                print("ℹ️ No facilities provided for this room")
            
            # Handle photo uploads (only for form-data)
            if request.content_type.startswith('multipart/form-data'):
                photos = request.files.getlist('photos')
                if photos and photos[0].filename:
                    for i, photo in enumerate(photos):
                        if photo and allowed_file(photo.filename):
                            filename = secure_filename(photo.filename)
                            unique_filename = f"{uuid.uuid4()}_{filename}"
                            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'rooms', unique_filename)
                            
                            os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                            photo.save(photo_path)
                            
                            room_photo = RoomPhoto(
                                room_id=room.id,
                                photo_path=photo_path,
                                is_primary=(i == 0)
                            )
                            db.session.add(room_photo)
            
            db.session.commit()
            
            return jsonify({
                'message': 'Room created successfully',
                'room': {
                    'id': room.id,
                    'room_number': room.room_number
                }
            }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in admin_rooms POST: {str(e)}")
        return jsonify({'message': str(e)}), 400

@app.route('/api/admin/rooms/<room_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
@jwt_required()
def admin_room_detail(room_id):
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404

        if request.method == 'PUT':
            # 🔥 DEBUG DETAIL: Log semua data yang diterima
            print(f"🔧 DEBUG - UPDATE ROOM {room_id}")
            print(f"📦 Content-Type: {request.content_type}")
            print(f"📦 Form data: {request.form}")
            print(f"📦 Files: {request.files}")
            
            # Check content type
            if request.content_type.startswith('multipart/form-data'):
                room_number = request.form.get('room_number')
                room_type_id = request.form.get('room_type_id')
                capacity = request.form.get('capacity')
                price_no_breakfast = request.form.get('price_no_breakfast')
                price_with_breakfast = request.form.get('price_with_breakfast')
                status = request.form.get('status')
                description = request.form.get('description')
                
                # 🔥 PERBAIKAN: Get facilities dari form data untuk UPDATE
                facilities = request.form.getlist('facilities[]')
                print(f"🔧 DEBUG - Received facilities for UPDATE: {facilities}")
                print(f"🔧 DEBUG - Type of facilities: {type(facilities)}")
                print(f"🔧 DEBUG - Facilities length: {len(facilities)}")
                
            else:
                data = request.get_json()
                room_number = data.get('room_number')
                room_type_id = data.get('room_type_id')
                capacity = data.get('capacity')
                price_no_breakfast = data.get('price_no_breakfast')
                price_with_breakfast = data.get('price_with_breakfast')
                status = data.get('status')
                description = data.get('description')
                facilities = data.get('facilities', [])
            
            # Validasi room number
            if room_number and room_number != room.room_number:
                if Room.query.filter_by(room_number=room_number).first():
                    return jsonify({'message': 'Room number already exists'}), 400

            # Update room data
            if room_number: 
                room.room_number = room_number
                print(f"🔄 Updated room_number: {room_number}")
            if room_type_id: 
                room.room_type_id = room_type_id
                print(f"🔄 Updated room_type_id: {room_type_id}")
            if capacity: 
                room.capacity = int(capacity)
                print(f"🔄 Updated capacity: {capacity}")
            if price_no_breakfast: 
                room.price_no_breakfast = float(price_no_breakfast)
                print(f"🔄 Updated price_no_breakfast: {price_no_breakfast}")
            if price_with_breakfast: 
                room.price_with_breakfast = float(price_with_breakfast)
                print(f"🔄 Updated price_with_breakfast: {price_with_breakfast}")
            if status: 
                room.status = status
                print(f"🔄 Updated status: {status}")
            if description is not None: 
                room.description = description
                print(f"🔄 Updated description: {description}")
            
            # 🔥 PERBAIKAN: Update facilities - hapus yang lama, tambah yang baru
            print(f"🔄 Processing facilities update for room {room.room_number}")
            print(f"📋 Facilities to set: {facilities}")
            
            # Cek facilities yang ada sekarang
            existing_facilities = FacilityRoom.query.filter_by(room_id=room_id).all()
            print(f"📊 Existing facilities before update: {[ef.facility_id for ef in existing_facilities]}")
            
            # Hapus semua facility associations yang lama
            print(f"🗑️ Removing {len(existing_facilities)} existing facilities")
            for existing_facility in existing_facilities:
                print(f"🗑️ Removing facility: {existing_facility.facility_id}")
                db.session.delete(existing_facility)
            
            # Commit penghapusan dulu
            db.session.commit()
            print("✅ Successfully removed old facilities")
            
            # Tambah facilities yang baru
            if facilities:
                print(f"➕ Adding {len(facilities)} new facilities")
                for i, facility_id in enumerate(facilities):
                    facility = Facility.query.get(facility_id)
                    if facility:
                        room_facility = FacilityRoom(
                            room_id=room.id,
                            facility_id=facility_id
                        )
                        db.session.add(room_facility)
                        print(f"✅ [{i+1}] Added facility {facility.name} ({facility_id}) to room {room.room_number}")
                    else:
                        print(f"⚠️ Facility with ID {facility_id} not found in database")
            else:
                print("ℹ️ No facilities provided, all facilities removed")
            
            # Handle photo uploads (only for form-data)
            if request.content_type.startswith('multipart/form-data'):
                photos = request.files.getlist('photos')
                if photos and photos[0].filename:
                    print(f"📸 Processing {len(photos)} new photos")
                    for i, photo in enumerate(photos):
                        if photo and allowed_file(photo.filename):
                            filename = secure_filename(photo.filename)
                            unique_filename = f"{uuid.uuid4()}_{filename}"
                            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'rooms', unique_filename)
                            
                            os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                            photo.save(photo_path)
                            
                            room_photo = RoomPhoto(
                                room_id=room.id,
                                photo_path=photo_path,
                                is_primary=(i == 0 and not room.photos)
                            )
                            db.session.add(room_photo)
                            print(f"✅ Added photo: {filename}")
            
            # Commit semua perubahan
            db.session.commit()
            print("🎉 Room updated successfully with all changes committed!")
            
            # Verifikasi facilities setelah update
            updated_facilities = FacilityRoom.query.filter_by(room_id=room_id).all()
            print(f"🔍 Final facilities after update: {[uf.facility_id for uf in updated_facilities]}")
            
            return jsonify({
                'message': 'Room updated successfully',
                'room': {
                    'id': room.id,
                    'room_number': room.room_number
                }
            }), 200

        elif request.method == 'DELETE':
            for photo in room.photos:
                photo.delete_photo_file()
                db.session.delete(photo)
            
            # Delete facility associations
            FacilityRoom.query.filter_by(room_id=room_id).delete()
            
            db.session.delete(room)
            db.session.commit()
            
            return jsonify({'message': 'Room deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in admin_room_detail PUT: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 400

@app.route('/api/admin/rooms/<room_id>/photos/<photo_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_room_photo(room_id, photo_id):
    try:
        if request.method == 'OPTIONS':
            return jsonify({'message': 'OK'}), 200
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        photo = RoomPhoto.query.filter_by(id=photo_id, room_id=room_id).first()
        if not photo:
            return jsonify({'message': 'Photo not found'}), 404

        photo.delete_photo_file()
        db.session.delete(photo)
        db.session.commit()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Seed sample data dengan facilities
def seed_data():
    try:
        if not User.query.filter_by(email='admin@hotel.com').first():
            admin = User(
                name='Admin User',
                email='admin@hotel.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("✅ Admin user created")

        # Seed facilities
        facilities_data = [
            {'name': 'WiFi', 'icon': '📶'},
            {'name': 'AC', 'icon': '❄️'},
            {'name': 'TV', 'icon': '📺'},
            {'name': 'Breakfast', 'icon': '🍳'},
            {'name': 'Swimming Pool', 'icon': '🏊'},
            {'name': 'Parking', 'icon': '🅿️'},
            {'name': 'Gym', 'icon': '💪'},
            {'name': 'Spa', 'icon': '💆'},
        ]
        
        facilities = []
        for facility_data in facilities_data:
            if not Facility.query.filter_by(name=facility_data['name']).first():
                facility = Facility(**facility_data)
                db.session.add(facility)
                facilities.append(facility)
                print(f"✅ Facility {facility_data['name']} created")

        room_types_data = [
            {'name': 'Standard', 'description': 'Comfortable standard room'},
            {'name': 'Deluxe', 'description': 'Spacious deluxe room'},
            {'name': 'Suite', 'description': 'Luxury suite with extra amenities'}
        ]
        
        room_types = []
        for rt_data in room_types_data:
            if not RoomType.query.filter_by(name=rt_data['name']).first():
                rt = RoomType(**rt_data)
                db.session.add(rt)
                room_types.append(rt)
                print(f"✅ Room type {rt_data['name']} created")
        
        db.session.commit()

        if not Room.query.first():
            rooms_data = [
                {
                    'room_type_id': room_types[0].id,
                    'room_number': '101',
                    'capacity': 2,
                    'price_no_breakfast': 500000,
                    'price_with_breakfast': 600000,
                    'description': 'Standard room with city view',
                    'facilities': [facilities[0], facilities[1], facilities[2]]  # WiFi, AC, TV
                },
                {
                    'room_type_id': room_types[1].id,
                    'room_number': '201',
                    'capacity': 3,
                    'price_no_breakfast': 800000,
                    'price_with_breakfast': 900000,
                    'description': 'Deluxe room with balcony',
                    'facilities': [facilities[0], facilities[1], facilities[2], facilities[3]]  # WiFi, AC, TV, Breakfast
                },
                {
                    'room_type_id': room_types[2].id,
                    'room_number': '301',
                    'capacity': 4,
                    'price_no_breakfast': 1200000,
                    'price_with_breakfast': 1400000,
                    'description': 'Luxury suite with jacuzzi',
                    'facilities': facilities  # All facilities
                }
            ]
            
            for room_data in rooms_data:
                room_facilities = room_data.pop('facilities', [])
                room = Room(**room_data)
                db.session.add(room)
                db.session.flush()  # Get room ID
                
                # Add facilities to room
                for facility in room_facilities:
                    room_facility = FacilityRoom(
                        room_id=room.id,
                        facility_id=facility.id
                    )
                    db.session.add(room_facility)
                
                print(f"✅ Room {room_data['room_number']} created with {len(room_facilities)} facilities")
            
            db.session.commit()
            
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.session.rollback()

if __name__ == '__main__':
    with app.app_context():
        try:
            print("🔧 Creating database tables...")
            db.create_all()
            print("✅ Database tables created!")
            
            # FIX: Simple migration approach untuk enum
            print("🔄 Running migration for room status...")
            try:
                # Cek dulu struktur kolom saat ini
                result = db.engine.execute("SHOW COLUMNS FROM rooms LIKE 'status'").fetchone()
                current_type = result[1] if result else None
                print(f"📋 Current room status type: {current_type}")
                
                if current_type and 'booked' not in current_type:
                    print("🔄 Updating room status enum to include 'booked'...")
                    # Method yang lebih robust
                    db.engine.execute("""
                        ALTER TABLE rooms 
                        CHANGE status status 
                        ENUM('available', 'unavailable', 'booked') 
                        CHARACTER SET utf8mb4 
                        COLLATE utf8mb4_unicode_ci 
                        NOT NULL DEFAULT 'available'
                    """)
                    print("✅ Room status enum updated successfully!")
                else:
                    print("✅ Room status enum already includes 'booked'")
                    
            except Exception as migration_error:
                print(f"❌ Migration failed: {migration_error}")
                print("💡 Manual SQL required. Run this in MySQL:")
                print("""
                ALTER TABLE rooms 
                MODIFY COLUMN status 
                ENUM('available', 'unavailable', 'booked') 
                NOT NULL DEFAULT 'available';
                """)
                # Fallback: Continue without migration
                print("⚠️ Continuing without migration...")
            
            print("🌱 Seeding sample data...")
            seed_data()
            print("✅ Sample data seeded!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("🚀 Server starting on http://localhost:5000")
    print("✅ CORS Enabled for: http://localhost:3000")
    print("🔧 CORS Configuration: Multi-layer protection")
    print("💡 Available Endpoints:")
    print("   🔐 AUTH: /api/auth/register, /api/auth/login, /api/auth/me")
    print("   🏨 ROOMS: /api/rooms, /api/rooms/<id>")
    print("   📖 BOOKINGS: /api/bookings, /api/bookings/me")
    print("   ⭐ RATINGS: /api/ratings, /api/admin/ratings")
    print("   🛠️ FACILITIES: /api/facilities, /api/admin/facilities")
    print("   👑 ADMIN: /api/admin/bookings, /api/admin/rooms")
    print("   🏨 ADMIN ROOM FACILITIES: /api/admin/rooms/<id>/facilities")
    print("   🏠 ROOM TYPES: /api/room-types (GET public)")
    print("   🏠 ADMIN ROOM TYPES: /api/admin/room-types (GET/POST admin only)")
    print("   🐛 DEBUG: /api/debug/cors-test")
    
    app.run(debug=True, port=5000, use_reloader=False)