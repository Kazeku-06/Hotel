# single_app.py - FIXED CORS COMPLETE SOLUTION
import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
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

# ✅ FIXED CORS Configuration - SOLUSI UTAMA
# Configure CORS explicitly for API routes and allow credentials
ALLOWED_ORIGINS = ["http://localhost:3000"]

# Use flask-cors with explicit resources for /api/* and enable credentials
CORS(app,
     resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


# Ensure preflight and all responses include the required CORS headers
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin and origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
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

# NEW MODELS FOR ENHANCED FEATURES

class Promotion(db.Model):
    __tablename__ = 'promotions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    discount_type = db.Column(db.Enum('percentage', 'fixed'), default='percentage')
    discount_value = db.Column(db.Float, nullable=False)
    min_nights = db.Column(db.Integer, default=1)
    valid_from = db.Column(db.Date, nullable=False)
    valid_until = db.Column(db.Date, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    room_type_id = db.Column(db.String(36), db.ForeignKey('room_types.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    room_type = db.relationship('RoomType', backref='promotions')

class GuestService(db.Model):
    __tablename__ = 'guest_services'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.Enum('spa', 'restaurant', 'transport', 'laundry', 'other'), default='other')
    is_available = db.Column(db.Boolean, default=True)
    icon = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BookingService(db.Model):
    __tablename__ = 'booking_services'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=False)
    service_id = db.Column(db.String(36), db.ForeignKey('guest_services.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)
    service_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    booking = db.relationship('Booking', backref='booking_services')
    service = db.relationship('GuestService', backref='booking_services')

class RoomMaintenance(db.Model):
    __tablename__ = 'room_maintenance'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    room_id = db.Column(db.String(36), db.ForeignKey('rooms.id'), nullable=False)
    maintenance_type = db.Column(db.Enum('cleaning', 'repair', 'inspection', 'upgrade'), default='cleaning')
    description = db.Column(db.Text, nullable=False)
    scheduled_date = db.Column(db.Date, nullable=False)
    completed_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.Enum('scheduled', 'in_progress', 'completed', 'cancelled'), default='scheduled')
    assigned_to = db.Column(db.String(100))
    cost = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    room = db.relationship('Room', backref='maintenance_records')

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.Enum('booking', 'payment', 'promotion', 'maintenance', 'general'), default='general')
    is_read = db.Column(db.Boolean, default=False)
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications')
    booking = db.relationship('Booking', backref='notifications')

# ROUTES
@app.route('/')
def home():
    return jsonify({'message': 'Hotel API is running!', 'database': 'MySQL with Laragon'})

# ==== AUTH ROUTES ====
@app.route('/api/auth/login', methods=['POST'])

def login():
    try:
            
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
                    'phone': user.phone,
                    'role': user.role
                }
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    
# ==== AUTH REGISTER ROUTE ====
@app.route('/api/auth/register', methods=['POST'])

def register():
    try:
            
        data = request.get_json()
        
        required_fields = ['name', 'email', 'password', 'phone']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'User already exists with this email'}), 400
        
        # Validate password length
        if len(data['password']) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            role='member'  # Default role
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in register: {str(e)}")
        return jsonify({'message': str(e)}), 400    

# ==== AUTH ME ROUTE ====
@app.route('/api/auth/me', methods=['GET'])
@jwt_required()

def get_current_user():
    try:
            
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
@app.route('/api/facilities', methods=['GET'])

def get_facilities():
    try:
            
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

@app.route('/api/admin/facilities', methods=['GET', 'POST'])
@jwt_required()

def admin_facilities():
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
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
@app.route('/api/room-types', methods=['GET'])

def room_types():
    try:
            
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
@app.route('/api/admin/room-types', methods=['GET', 'POST'])
@jwt_required()

def admin_room_types():
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            room_types = RoomType.query.all()
            result = []
            for room_type in room_types:
                result.append({
                    'id': room_type.id,
                    'name': room_type.name,
                    'description': room_type.description,
                    'created_at': room_type.created_at.isoformat() if room_type.created_at else None,
                    'room_count': len(room_type.rooms)
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

# ==== ROOM FACILITIES ROUTES ====
@app.route('/api/admin/rooms/<room_id>/facilities', methods=['GET', 'POST', 'DELETE'])
@jwt_required()

def room_facilities(room_id):
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404

        if request.method == 'GET':
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

            facility = Facility.query.get(facility_id)
            if not facility:
                return jsonify({'message': 'Facility not found'}), 404

            existing_facility = FacilityRoom.query.filter_by(
                room_id=room_id, 
                facility_id=facility_id
            ).first()
            
            if existing_facility:
                return jsonify({'message': 'Facility already added to room'}), 400

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
@app.route('/api/rooms', methods=['GET'])

def get_rooms():
    try:
            
        # Get filter parameters from request
        room_type_filter = request.args.get('room_type', '').strip()
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        capacity_filter = request.args.get('capacity', type=int)
        
        facilities_filter = request.args.getlist('facilities[]')
        if not facilities_filter:
            facilities_filter = request.args.getlist('facilities')
        
        print(f"🔍 DEBUG FILTER - room_type: '{room_type_filter}', min_price: {min_price}, max_price: {max_price}, capacity: {capacity_filter}")
        print(f"🔍 DEBUG FACILITIES FILTER: {facilities_filter}")
        
        # Start with base query
        query = Room.query.filter(Room.status == 'available')
        
        # Filter by room type
        if room_type_filter:
            query = query.join(RoomType).filter(RoomType.name.ilike(f'%{room_type_filter}%'))
        
        # Filter by price range
        if min_price is not None:
            query = query.filter(Room.price_no_breakfast >= min_price)
        
        if max_price is not None:
            query = query.filter(Room.price_no_breakfast <= max_price)
        
        # Filter by capacity
        if capacity_filter:
            query = query.filter(Room.capacity >= capacity_filter)
        
        # Filter by facilities
        if facilities_filter:
            subquery = db.session.query(FacilityRoom.room_id).filter(
                FacilityRoom.facility_id.in_(facilities_filter)
            ).group_by(FacilityRoom.room_id).having(
                db.func.count(FacilityRoom.facility_id) == len(facilities_filter)
            ).subquery()
            
            query = query.join(subquery, Room.id == subquery.c.room_id)
        
        # Execute query
        rooms = query.all()
        
        print(f"🔍 DEBUG - Found {len(rooms)} rooms after filtering")
        
        result = []
        for room in rooms:
            primary_photo = None
            for photo in room.photos:
                if photo.is_primary:
                    primary_photo = f"/{photo.photo_path}"
                    break
            if not primary_photo and room.photos:
                primary_photo = f"/{room.photos[0].photo_path}"
                
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
@app.route('/api/rooms/<room_id>', methods=['GET'])

def get_room(room_id):
    try:
            
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404
        
        photos = []
        for photo in room.photos:
            photos.append({
                'id': photo.id,
                'photo_path': f"/{photo.photo_path}",
                'is_primary': getattr(photo, 'is_primary', False)
            })
        
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
@app.route('/api/ratings', methods=['GET', 'POST'])
@jwt_required()

def ratings():
    try:
            
        current_user_id = get_jwt_identity()
        
        if request.method == 'GET':
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
            
            required_fields = ['booking_id', 'star']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'Missing required field: {field}'}), 400
            
            existing_rating = Rating.query.filter_by(
                booking_id=data['booking_id']
            ).first()
            
            if existing_rating:
                return jsonify({'message': 'Rating already submitted for this booking'}), 400
            
            booking = Booking.query.filter_by(
                id=data['booking_id'],
                user_id=current_user_id
            ).first()
            
            if not booking:
                return jsonify({'message': 'Booking not found or access denied'}), 404
            
            star = int(data['star'])
            if star < 1 or star > 5:
                return jsonify({'message': 'Star rating must be between 1 and 5'}), 400
            
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
@app.route('/api/admin/ratings', methods=['GET'])
@jwt_required()

def admin_ratings():
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
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
@app.route('/api/bookings', methods=['POST'])
@jwt_required()

def create_booking():
    try:
            
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        print("🔍 DEBUG - Received booking data:", data)
        
        required_fields = ['nik', 'guest_name', 'phone', 'check_in', 'check_out', 'total_guests', 'payment_method', 'rooms']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        check_in_date = datetime.strptime(data['check_in'], '%Y-%m-%d').date()
        check_out_date = datetime.strptime(data['check_out'], '%Y-%m-%d').date()
        nights = (check_out_date - check_in_date).days
        
        print(f"🔍 DEBUG - Nights calculation: {check_in_date} to {check_out_date} = {nights} nights")
        
        if nights <= 0:
            return jsonify({'message': 'Check-out date must be after check-in date'}), 400
        
        total_price = 0
        booking_rooms = []
        
        for room_data in data['rooms']:
            room = Room.query.get(room_data['room_id'])
            if not room:
                return jsonify({'message': f'Room not found: {room_data["room_id"]}'}), 404
            
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
        
        for br_data in booking_rooms:
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

@app.route('/api/bookings/me', methods=['GET'])
@jwt_required()

def get_my_bookings():
    try:
            
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
@app.route('/api/admin/bookings', methods=['GET'])
@jwt_required()

def get_all_bookings():
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
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

@app.route('/api/admin/bookings/<booking_id>/status', methods=['PUT'])
@jwt_required()

def update_booking_status(booking_id):
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
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
        
        if new_status == 'cancelled' and old_status != 'cancelled':
            for booking_room in booking.booking_rooms:
                room = Room.query.get(booking_room.room_id)
                if room:
                    room.status = 'available'
                    print(f"🔄 Room {room.room_number} status set to available (cancelled)")
        
        elif old_status == 'cancelled' and new_status != 'cancelled':
            for booking_room in booking.booking_rooms:
                room = Room.query.get(booking_room.room_id)
                if room:
                    room.status = 'booked'
                    print(f"🔄 Room {room.room_number} status set to booked (re-activated)")
        
        elif new_status == 'checked_out':
            for booking_room in booking.booking_rooms:
                room = Room.query.get(booking_room.room_id)
                if room:
                    print(f"🔄 Changing room {room.room_number} from {room.status} to available (check-out)")
                    room.status = 'available'
        
        booking.status = new_status
        db.session.commit()
        
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

# ==== DASHBOARD STATS ROUTES ====
@app.route('/api/admin/dashboard/stats', methods=['GET'])
@jwt_required()

def get_dashboard_stats():
    """Endpoint untuk dashboard statistics"""
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        total_bookings = Booking.query.count()
        total_rooms = Room.query.count()
        available_rooms = Room.query.filter_by(status='available').count()
        
        revenue_result = db.session.query(db.func.sum(Booking.total_price)).filter(
            Booking.status.in_(['checked_out', 'confirmed'])
        ).scalar()
        total_revenue = float(revenue_result) if revenue_result else 0.0
        
        pending_bookings = Booking.query.filter_by(status='pending').count()
        
        today = datetime.now().date()
        today_checkins = Booking.query.filter(
            Booking.check_in == today,
            Booking.status.in_(['confirmed', 'checked_in'])
        ).count()
        
        today_checkouts = Booking.query.filter(
            Booking.check_out == today,
            Booking.status.in_(['checked_in', 'checked_out'])
        ).count()

        total_reviews = Rating.query.count()
        
        avg_rating_result = db.session.query(db.func.avg(Rating.star)).scalar()
        average_rating = float(avg_rating_result) if avg_rating_result else 0.0

        stats_data = {
            'total_bookings': total_bookings,
            'total_rooms': total_rooms,
            'available_rooms': available_rooms,
            'total_revenue': total_revenue,
            'pending_bookings': pending_bookings,
            'today_checkins': today_checkins,
            'today_checkouts': today_checkouts,
            'total_reviews': total_reviews,
            'user_reviews': total_reviews,
            'average_rating': average_rating
        }

        return jsonify({
            'success': True,
            'data': stats_data
        }), 200
        
    except Exception as e:
        print(f"❌ ERROR in get_dashboard_stats: {str(e)}")
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

@app.route('/api/admin/rooms', methods=['GET', 'POST'])
@jwt_required()

def admin_rooms():
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            rooms = Room.query.all()
            result = []
            for room in rooms:
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
            if request.content_type.startswith('multipart/form-data'):
                room_number = request.form.get('room_number')
                room_type_id = request.form.get('room_type_id')
                capacity = request.form.get('capacity')
                price_no_breakfast = request.form.get('price_no_breakfast')
                price_with_breakfast = request.form.get('price_with_breakfast')
                status = request.form.get('status', 'available')
                description = request.form.get('description', '')
                
                facilities = request.form.getlist('facilities[]')
                print(f"🔧 DEBUG - Received facilities for CREATE: {facilities}")
                
            else:
                data = request.get_json()
                room_number = data.get('room_number')
                room_type_id = data.get('room_type_id')
                capacity = data.get('capacity')
                price_no_breakfast = data.get('price_no_breakfast')
                price_with_breakfast = data.get('price_with_breakfast')
                status = data.get('status', 'available')
                description = data.get('description', '')
                facilities = data.get('facilities', [])
            
            if not all([room_number, room_type_id, capacity, price_no_breakfast, price_with_breakfast]):
                return jsonify({'message': 'All required fields must be filled'}), 400
            
            if Room.query.filter_by(room_number=room_number).first():
                return jsonify({'message': 'Room number already exists'}), 400

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
            db.session.flush()
            
            if facilities:
                print(f"🔄 Adding {len(facilities)} facilities to room {room.room_number}")
                for facility_id in facilities:
                    facility = Facility.query.get(facility_id)
                    if facility:
                        room_facility = FacilityRoom(
                            room_id=room.id,
                            facility_id=facility_id
                        )
                        db.session.add(room_facility)
                        print(f"✅ Added facility {facility.name} to room {room.room_number}")
            
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

@app.route('/api/admin/rooms/<room_id>', methods=['PUT', 'DELETE'])
@jwt_required()

def admin_room_detail(room_id):
    try:
            
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        room = Room.query.get(room_id)
        if not room:
            return jsonify({'message': 'Room not found'}), 404

        if request.method == 'PUT':
            if request.content_type.startswith('multipart/form-data'):
                room_number = request.form.get('room_number')
                room_type_id = request.form.get('room_type_id')
                capacity = request.form.get('capacity')
                price_no_breakfast = request.form.get('price_no_breakfast')
                price_with_breakfast = request.form.get('price_with_breakfast')
                status = request.form.get('status')
                description = request.form.get('description')
                
                facilities = request.form.getlist('facilities[]')
                print(f"🔧 DEBUG - Received facilities for UPDATE: {facilities}")
                
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
            
            if room_number and room_number != room.room_number:
                if Room.query.filter_by(room_number=room_number).first():
                    return jsonify({'message': 'Room number already exists'}), 400

            if room_number: 
                room.room_number = room_number
            if room_type_id: 
                room.room_type_id = room_type_id
            if capacity: 
                room.capacity = int(capacity)
            if price_no_breakfast: 
                room.price_no_breakfast = float(price_no_breakfast)
            if price_with_breakfast: 
                room.price_with_breakfast = float(price_with_breakfast)
            if status: 
                room.status = status
            if description is not None: 
                room.description = description
            
            existing_facilities = FacilityRoom.query.filter_by(room_id=room_id).all()
            for existing_facility in existing_facilities:
                db.session.delete(existing_facility)
            
            db.session.commit()
            
            if facilities:
                for facility_id in facilities:
                    facility = Facility.query.get(facility_id)
                    if facility:
                        room_facility = FacilityRoom(
                            room_id=room.id,
                            facility_id=facility_id
                        )
                        db.session.add(room_facility)
            
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
                                is_primary=(i == 0 and not room.photos)
                            )
                            db.session.add(room_photo)
            
            db.session.commit()
            
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

@app.route('/api/admin/rooms/<room_id>/photos/<photo_id>', methods=['DELETE'])
@jwt_required()

def delete_room_photo(room_id, photo_id):
    try:
            
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

# ==== NEW ENHANCED FEATURES ====

# ==== ROOM AVAILABILITY CALENDAR ====
@app.route('/api/rooms/availability', methods=['GET'])

def check_room_availability():
    """Check room availability for specific date range"""
    try:
        check_in = request.args.get('check_in')
        check_out = request.args.get('check_out')
        room_type_id = request.args.get('room_type_id')
        
        if not check_in or not check_out:
            return jsonify({'message': 'Check-in and check-out dates are required'}), 400
        
        from datetime import datetime
        check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
        check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
        
        if check_in_date >= check_out_date:
            return jsonify({'message': 'Check-out date must be after check-in date'}), 400
        
        # Get all rooms
        query = Room.query.filter_by(status='available')
        if room_type_id:
            query = query.filter_by(room_type_id=room_type_id)
        
        available_rooms = query.all()
        
        # Check for conflicting bookings
        conflicting_bookings = Booking.query.filter(
            Booking.status.in_(['confirmed', 'checked_in']),
            Booking.check_in < check_out_date,
            Booking.check_out > check_in_date
        ).all()
        
        # Get booked room IDs
        booked_room_ids = set()
        for booking in conflicting_bookings:
            for booking_room in booking.booking_rooms:
                booked_room_ids.add(booking_room.room_id)
        
        # Filter out booked rooms
        truly_available_rooms = [room for room in available_rooms if room.id not in booked_room_ids]
        
        result = []
        for room in truly_available_rooms:
            # Get primary photo
            primary_photo = None
            for photo in room.photos:
                if photo.is_primary:
                    primary_photo = f"/{photo.photo_path}"
                    break
            if not primary_photo and room.photos:
                primary_photo = f"/{room.photos[0].photo_path}"
            
            # Get facilities
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
                'room_type': {
                    'id': room.room_type.id,
                    'name': room.room_type.name,
                    'description': room.room_type.description
                } if room.room_type else None,
                'capacity': room.capacity,
                'price_no_breakfast': room.price_no_breakfast,
                'price_with_breakfast': room.price_with_breakfast,
                'description': room.description,
                'primary_photo': primary_photo,
                'facilities': facilities
            })
        
        return jsonify({
            'success': True,
            'available_rooms': result,
            'total_available': len(result),
            'check_in': check_in,
            'check_out': check_out
        }), 200
        
    except Exception as e:
        print(f"❌ ERROR in check_room_availability: {str(e)}")
        return jsonify({'message': str(e)}), 500

# ==== PROMOTIONS MANAGEMENT ====
@app.route('/api/promotions', methods=['GET'])

def get_active_promotions():
    """Get all active promotions"""
    try:
        from datetime import date
        today = date.today()
        
        promotions = Promotion.query.filter(
            Promotion.is_active == True,
            Promotion.valid_from <= today,
            Promotion.valid_until >= today
        ).all()
        
        result = []
        for promo in promotions:
            result.append({
                'id': promo.id,
                'title': promo.title,
                'description': promo.description,
                'discount_type': promo.discount_type,
                'discount_value': promo.discount_value,
                'min_nights': promo.min_nights,
                'valid_from': promo.valid_from.isoformat(),
                'valid_until': promo.valid_until.isoformat(),
                'room_type': {
                    'id': promo.room_type.id,
                    'name': promo.room_type.name
                } if promo.room_type else None
            })
        
        return jsonify({
            'success': True,
            'promotions': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/promotions', methods=['GET', 'POST'])
@jwt_required()

def admin_promotions():
    """Admin promotions management"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            promotions = Promotion.query.order_by(Promotion.created_at.desc()).all()
            result = []
            for promo in promotions:
                result.append({
                    'id': promo.id,
                    'title': promo.title,
                    'description': promo.description,
                    'discount_type': promo.discount_type,
                    'discount_value': promo.discount_value,
                    'min_nights': promo.min_nights,
                    'valid_from': promo.valid_from.isoformat(),
                    'valid_until': promo.valid_until.isoformat(),
                    'is_active': promo.is_active,
                    'room_type': {
                        'id': promo.room_type.id,
                        'name': promo.room_type.name
                    } if promo.room_type else None,
                    'created_at': promo.created_at.isoformat()
                })
            return jsonify(result), 200

        elif request.method == 'POST':
            data = request.get_json()
            
            required_fields = ['title', 'discount_type', 'discount_value', 'valid_from', 'valid_until']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'{field} is required'}), 400
            
            from datetime import datetime
            valid_from = datetime.strptime(data['valid_from'], '%Y-%m-%d').date()
            valid_until = datetime.strptime(data['valid_until'], '%Y-%m-%d').date()
            
            if valid_from >= valid_until:
                return jsonify({'message': 'Valid until date must be after valid from date'}), 400
            
            promotion = Promotion(
                title=data['title'],
                description=data.get('description', ''),
                discount_type=data['discount_type'],
                discount_value=float(data['discount_value']),
                min_nights=int(data.get('min_nights', 1)),
                valid_from=valid_from,
                valid_until=valid_until,
                is_active=data.get('is_active', True),
                room_type_id=data.get('room_type_id')
            )
            
            db.session.add(promotion)
            db.session.commit()
            
            return jsonify({
                'message': 'Promotion created successfully',
                'promotion': {
                    'id': promotion.id,
                    'title': promotion.title,
                    'discount_value': promotion.discount_value
                }
            }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@app.route('/api/admin/promotions/<promotion_id>', methods=['PUT', 'DELETE'])
@jwt_required()

def admin_promotion_detail(promotion_id):
    """Update or delete promotion"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        promotion = Promotion.query.get(promotion_id)
        if not promotion:
            return jsonify({'message': 'Promotion not found'}), 404

        if request.method == 'PUT':
            data = request.get_json()
            
            if 'title' in data:
                promotion.title = data['title']
            if 'description' in data:
                promotion.description = data['description']
            if 'discount_type' in data:
                promotion.discount_type = data['discount_type']
            if 'discount_value' in data:
                promotion.discount_value = float(data['discount_value'])
            if 'min_nights' in data:
                promotion.min_nights = int(data['min_nights'])
            if 'valid_from' in data:
                from datetime import datetime
                promotion.valid_from = datetime.strptime(data['valid_from'], '%Y-%m-%d').date()
            if 'valid_until' in data:
                from datetime import datetime
                promotion.valid_until = datetime.strptime(data['valid_until'], '%Y-%m-%d').date()
            if 'is_active' in data:
                promotion.is_active = data['is_active']
            if 'room_type_id' in data:
                promotion.room_type_id = data['room_type_id']
            
            db.session.commit()
            
            return jsonify({
                'message': 'Promotion updated successfully',
                'promotion': {
                    'id': promotion.id,
                    'title': promotion.title
                }
            }), 200

        elif request.method == 'DELETE':
            db.session.delete(promotion)
            db.session.commit()
            
            return jsonify({'message': 'Promotion deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ==== GUEST SERVICES ====
@app.route('/api/services', methods=['GET'])

def get_guest_services():
    """Get all available guest services"""
    try:
        services = GuestService.query.filter_by(is_available=True).all()
        
        result = []
        for service in services:
            result.append({
                'id': service.id,
                'name': service.name,
                'description': service.description,
                'price': service.price,
                'category': service.category,
                'icon': service.icon
            })
        
        return jsonify({
            'success': True,
            'services': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/services', methods=['GET', 'POST'])
@jwt_required()

def admin_guest_services():
    """Admin guest services management"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            services = GuestService.query.all()
            result = []
            for service in services:
                result.append({
                    'id': service.id,
                    'name': service.name,
                    'description': service.description,
                    'price': service.price,
                    'category': service.category,
                    'is_available': service.is_available,
                    'icon': service.icon,
                    'created_at': service.created_at.isoformat()
                })
            return jsonify(result), 200

        elif request.method == 'POST':
            data = request.get_json()
            
            required_fields = ['name', 'price', 'category']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'{field} is required'}), 400
            
            service = GuestService(
                name=data['name'],
                description=data.get('description', ''),
                price=float(data['price']),
                category=data['category'],
                is_available=data.get('is_available', True),
                icon=data.get('icon', '')
            )
            
            db.session.add(service)
            db.session.commit()
            
            return jsonify({
                'message': 'Service created successfully',
                'service': {
                    'id': service.id,
                    'name': service.name,
                    'price': service.price
                }
            }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ==== ROOM MAINTENANCE ====
@app.route('/api/admin/maintenance', methods=['GET', 'POST'])
@jwt_required()

def admin_room_maintenance():
    """Admin room maintenance management"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        if request.method == 'GET':
            maintenance_records = RoomMaintenance.query.order_by(RoomMaintenance.scheduled_date.desc()).all()
            result = []
            for record in maintenance_records:
                result.append({
                    'id': record.id,
                    'room': {
                        'id': record.room.id,
                        'room_number': record.room.room_number,
                        'room_type': record.room.room_type.name if record.room.room_type else None
                    },
                    'maintenance_type': record.maintenance_type,
                    'description': record.description,
                    'scheduled_date': record.scheduled_date.isoformat(),
                    'completed_date': record.completed_date.isoformat() if record.completed_date else None,
                    'status': record.status,
                    'assigned_to': record.assigned_to,
                    'cost': record.cost,
                    'notes': record.notes,
                    'created_at': record.created_at.isoformat()
                })
            return jsonify(result), 200

        elif request.method == 'POST':
            data = request.get_json()
            
            required_fields = ['room_id', 'maintenance_type', 'description', 'scheduled_date']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'{field} is required'}), 400
            
            room = Room.query.get(data['room_id'])
            if not room:
                return jsonify({'message': 'Room not found'}), 404
            
            from datetime import datetime
            scheduled_date = datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date()
            
            maintenance = RoomMaintenance(
                room_id=data['room_id'],
                maintenance_type=data['maintenance_type'],
                description=data['description'],
                scheduled_date=scheduled_date,
                assigned_to=data.get('assigned_to', ''),
                cost=float(data.get('cost', 0.0)),
                notes=data.get('notes', '')
            )
            
            db.session.add(maintenance)
            db.session.commit()
            
            return jsonify({
                'message': 'Maintenance scheduled successfully',
                'maintenance': {
                    'id': maintenance.id,
                    'room_number': room.room_number,
                    'scheduled_date': maintenance.scheduled_date.isoformat()
                }
            }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@app.route('/api/admin/maintenance/<maintenance_id>/status', methods=['PUT'])
@jwt_required()

def update_maintenance_status(maintenance_id):
    """Update maintenance status"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        maintenance = RoomMaintenance.query.get(maintenance_id)
        if not maintenance:
            return jsonify({'message': 'Maintenance record not found'}), 404

        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['scheduled', 'in_progress', 'completed', 'cancelled']:
            return jsonify({'message': 'Invalid status'}), 400
        
        maintenance.status = new_status
        
        if new_status == 'completed' and not maintenance.completed_date:
            from datetime import date
            maintenance.completed_date = date.today()
        
        # Update room status based on maintenance status
        if new_status == 'in_progress':
            maintenance.room.status = 'unavailable'
        elif new_status == 'completed':
            maintenance.room.status = 'available'
        elif new_status == 'cancelled':
            maintenance.room.status = 'available'
        
        db.session.commit()
        
        return jsonify({
            'message': f'Maintenance status updated to {new_status}',
            'maintenance': {
                'id': maintenance.id,
                'status': maintenance.status
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ==== NOTIFICATIONS ====
@app.route('/api/notifications', methods=['GET'])
@jwt_required()

def get_user_notifications():
    """Get user notifications"""
    try:
        current_user_id = get_jwt_identity()
        
        notifications = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).all()
        
        result = []
        for notification in notifications:
            result.append({
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'is_read': notification.is_read,
                'booking_id': notification.booking_id,
                'created_at': notification.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'notifications': result,
            'unread_count': len([n for n in notifications if not n.is_read])
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()

def mark_notification_read(notification_id):
    """Mark notification as read"""
    try:
        current_user_id = get_jwt_identity()
        
        notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
        if not notification:
            return jsonify({'message': 'Notification not found'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# ==== ENHANCED BOOKING WITH SERVICES ====
@app.route('/api/bookings/<booking_id>/services', methods=['GET', 'POST'])
@jwt_required()

def booking_services(booking_id):
    """Add services to booking"""
    try:
        current_user_id = get_jwt_identity()
        
        booking = Booking.query.filter_by(id=booking_id, user_id=current_user_id).first()
        if not booking:
            return jsonify({'message': 'Booking not found'}), 404

        if request.method == 'GET':
            booking_services = BookingService.query.filter_by(booking_id=booking_id).all()
            result = []
            for bs in booking_services:
                result.append({
                    'id': bs.id,
                    'service': {
                        'id': bs.service.id,
                        'name': bs.service.name,
                        'category': bs.service.category
                    },
                    'quantity': bs.quantity,
                    'price': bs.price,
                    'service_date': bs.service_date.isoformat() if bs.service_date else None,
                    'notes': bs.notes
                })
            return jsonify(result), 200

        elif request.method == 'POST':
            data = request.get_json()
            
            required_fields = ['service_id', 'quantity']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'{field} is required'}), 400
            
            service = GuestService.query.get(data['service_id'])
            if not service or not service.is_available:
                return jsonify({'message': 'Service not available'}), 404
            
            total_price = service.price * int(data['quantity'])
            
            booking_service = BookingService(
                booking_id=booking_id,
                service_id=data['service_id'],
                quantity=int(data['quantity']),
                price=total_price,
                service_date=datetime.strptime(data['service_date'], '%Y-%m-%d').date() if data.get('service_date') else None,
                notes=data.get('notes', '')
            )
            
            db.session.add(booking_service)
            
            # Update booking total price
            booking.total_price += total_price
            
            db.session.commit()
            
            return jsonify({
                'message': 'Service added to booking successfully',
                'total_price': booking.total_price
            }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

if __name__ == '__main__':
    with app.app_context():
        try:
            print("🔧 Creating database tables...")
            db.create_all()
            print("✅ Database tables created!")
            
            print("🔄 Running migration for room status...")
            try:
                result = db.engine.execute("SHOW COLUMNS FROM rooms LIKE 'status'").fetchone()
                current_type = result[1] if result else None
                print(f"📋 Current room status type: {current_type}")
                
                if current_type and 'booked' not in current_type:
                    print("🔄 Updating room status enum to include 'booked'...")
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
                print("⚠️ Continuing without migration...")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("🚀 Server starting on http://localhost:5000")
    print("✅ CORS Enabled for: http://localhost:3000")
    print("🔧 CORS Configuration: supports_credentials=True")
    
    app.run(debug=True, port=5000, use_reloader=False, host='0.0.0.0')