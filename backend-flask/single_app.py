# single_app.py - FOR LARAGON
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

# Enable CORS for specific frontend origin with credentials and headers
CORS(app,
     resources={r"/api/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

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
    status = db.Column(db.Enum('available', 'unavailable'), default='available')
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

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
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
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

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
                    'role': user.role
                }
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    try:
        rooms = Room.query.all()
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
                
            result.append({
                'id': room.id,
                'room_number': room.room_number,
                'capacity': room.capacity,
                'price_no_breakfast': room.price_no_breakfast,
                'price_with_breakfast': room.price_with_breakfast,
                'status': room.status,
                'description': room.description,
                'primary_photo': primary_photo,
                'room_type': {
                    'id': room.room_type.id,
                    'name': room.room_type.name
                } if room.room_type else None
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==== Single Room Detail ====
@app.route('/api/rooms/<room_id>', methods=['GET'])
def get_room(room_id):
    try:
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
            'created_at': room.created_at.isoformat() if room.created_at else None
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==== BOOKINGS ROUTES ====
# ==== BOOKINGS ROUTES ====
@app.route('/api/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    try:
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
            
            if room.status != 'available':
                return jsonify({'message': f'Room {room.room_number} is not available'}), 400
            
            price_per_night = room.price_with_breakfast if room_data['breakfast_option'] == 'with' else room.price_no_breakfast
            subtotal = price_per_night * room_data['quantity'] * nights  # PERBAIKAN: tambahkan * nights
            
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
        db.session.flush()  # Get booking ID
        
        # Create booking rooms
        for br_data in booking_rooms:
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
        
        # DEBUG: Print user ID
        print(f"🔍 DEBUG - Current user ID: {current_user_id}")
        
        bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc()).all()
        
        # DEBUG: Print database results
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
                'total_price': float(booking.total_price),  # Pastikan float
                'status': booking.status,
                'created_at': booking.created_at.isoformat(),
                'booking_rooms': []
            }
            
            # DEBUG: Print each booking
            print(f"🔍 DEBUG - Booking: {booking.id}, Status: {booking.status}")
            
            for br in booking.booking_rooms:
                booking_data['booking_rooms'].append({
                    'id': br.id,
                    'room_type': br.room_type,
                    'quantity': br.quantity,
                    'breakfast_option': br.breakfast_option,
                    'subtotal': float(br.subtotal)  # Pastikan float
                })
            
            result.append(booking_data)
        
        # DEBUG: Print final response structure
        print("🔍 DEBUG - Final response structure:")
        print(f"Response: {{'data': {result}}}")
        print(f"Response type: {{'data': array with {len(result)} items}}")
        
        # PASTIKAN: Kembalikan dengan struktur yang konsisten
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
                            'is_primary': getattr(photo, 'is_primary', False)  # Safe access
                        })
                except Exception as photo_error:
                    print(f"Error loading photos for room {room.id}: {photo_error}")
                    # Continue without photos if there's an error
                
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
            db.session.flush()  # Get room ID without committing
            
            # Handle photo uploads (only for form-data)
            if request.content_type.startswith('multipart/form-data'):
                photos = request.files.getlist('photos')
                if photos and photos[0].filename:  # Check if files were uploaded
                    for i, photo in enumerate(photos):
                        if photo and allowed_file(photo.filename):
                            # Create unique filename
                            filename = secure_filename(photo.filename)
                            unique_filename = f"{uuid.uuid4()}_{filename}"
                            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'rooms', unique_filename)
                            
                            # Create directory if not exists
                            os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                            
                            # Save file
                            photo.save(photo_path)
                            
                            # Create photo record
                            room_photo = RoomPhoto(
                                room_id=room.id,
                                photo_path=photo_path,
                                is_primary=(i == 0)  # First photo as primary
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
            # Check content type
            if request.content_type.startswith('multipart/form-data'):
                # Handle form data
                room_number = request.form.get('room_number')
                room_type_id = request.form.get('room_type_id')
                capacity = request.form.get('capacity')
                price_no_breakfast = request.form.get('price_no_breakfast')
                price_with_breakfast = request.form.get('price_with_breakfast')
                status = request.form.get('status')
                description = request.form.get('description')
            else:
                # Handle JSON data (fallback)
                data = request.get_json()
                room_number = data.get('room_number')
                room_type_id = data.get('room_type_id')
                capacity = data.get('capacity')
                price_no_breakfast = data.get('price_no_breakfast')
                price_with_breakfast = data.get('price_with_breakfast')
                status = data.get('status')
                description = data.get('description')
            
            # Check if room number already exists (excluding current room)
            if room_number and room_number != room.room_number:
                if Room.query.filter_by(room_number=room_number).first():
                    return jsonify({'message': 'Room number already exists'}), 400

            # Update room data
            if room_number: room.room_number = room_number
            if room_type_id: room.room_type_id = room_type_id
            if capacity: room.capacity = int(capacity)
            if price_no_breakfast: room.price_no_breakfast = float(price_no_breakfast)
            if price_with_breakfast: room.price_with_breakfast = float(price_with_breakfast)
            if status: room.status = status
            if description is not None: room.description = description
            
            # Handle new photo uploads (only for form-data)
            if request.content_type.startswith('multipart/form-data'):
                photos = request.files.getlist('photos')
                if photos and photos[0].filename:
                    for i, photo in enumerate(photos):
                        if photo and allowed_file(photo.filename):
                            # Create unique filename
                            filename = secure_filename(photo.filename)
                            unique_filename = f"{uuid.uuid4()}_{filename}"
                            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'rooms', unique_filename)
                            
                            # Create directory if not exists
                            os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                            
                            # Save file
                            photo.save(photo_path)
                            
                            # Create photo record
                            room_photo = RoomPhoto(
                                room_id=room.id,
                                photo_path=photo_path,
                                is_primary=(i == 0 and not room.photos)  # Primary if first photo and no existing photos
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
            # Delete associated photos and their files
            for photo in room.photos:
                photo.delete_photo_file()
                db.session.delete(photo)
            
            db.session.delete(room)
            db.session.commit()
            
            return jsonify({'message': 'Room deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
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

        # Delete file from filesystem
        photo.delete_photo_file()
        
        # Delete record from database
        db.session.delete(photo)
        db.session.commit()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# Route untuk serve static files (foto)
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Seed sample data
def seed_data():
    try:
        # Create admin user
        if not User.query.filter_by(email='admin@hotel.com').first():
            admin = User(
                name='Admin User',
                email='admin@hotel.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("✅ Admin user created")

        # Create room types
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

        # Create some rooms
        if not Room.query.first():
            rooms_data = [
                {
                    'room_type_id': room_types[0].id,
                    'room_number': '101',
                    'capacity': 2,
                    'price_no_breakfast': 500000,
                    'price_with_breakfast': 600000,
                    'description': 'Standard room with city view'
                },
                {
                    'room_type_id': room_types[1].id,
                    'room_number': '201',
                    'capacity': 3,
                    'price_no_breakfast': 800000,
                    'price_with_breakfast': 900000,
                    'description': 'Deluxe room with balcony'
                },
                {
                    'room_type_id': room_types[2].id,
                    'room_number': '301',
                    'capacity': 4,
                    'price_no_breakfast': 1200000,
                    'price_with_breakfast': 1400000,
                    'description': 'Luxury suite with jacuzzi'
                }
            ]
            
            for room_data in rooms_data:
                room = Room(**room_data)
                db.session.add(room)
                print(f"✅ Room {room_data['room_number']} created")
            
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
            
            print("🌱 Seeding sample data...")
            seed_data()
            print("✅ Sample data seeded!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("🚀 Server starting on http://localhost:5000")
    print("💡 Test endpoints:")
    print("   GET  http://localhost:5000/")
    print("   GET  http://localhost:5000/api/rooms")
    print("   GET  http://localhost:5000/api/rooms/ROOM_ID")
    print("   POST http://localhost:5000/api/auth/register")
    print("   POST http://localhost:5000/api/auth/login")
    print("   POST http://localhost:5000/api/bookings (JWT required)")
    print("   GET  http://localhost:5000/api/bookings/me (JWT required)")
    print("   GET  http://localhost:5000/api/admin/rooms (Admin only)")
    print("   POST http://localhost:5000/api/admin/rooms (Admin only)")
    
    app.run(debug=True, port=5000)