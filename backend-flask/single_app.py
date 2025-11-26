# single_app.py - FOR LARAGON
import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
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

# Explicitly add automatic OPTIONS response for preflight CORS requests
@app.before_request
def handle_options_request():
    from flask import request, make_response
    if request.method == 'OPTIONS':
        response = make_response()
        response.status_code = 200
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# MODELS - SAMA DENGAN SEBELUMNYA
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    room = db.relationship('Room', backref='photos')

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
    rooms = Room.query.all()
    result = []
    for room in rooms:
        result.append({
            'id': room.id,
            'room_number': room.room_number,
            'capacity': room.capacity,
            'price_no_breakfast': room.price_no_breakfast,
            'price_with_breakfast': room.price_with_breakfast,
            'status': room.status,
            'description': room.description,
            'room_type': {
                'id': room.room_type.id,
                'name': room.room_type.name
            } if room.room_type else None
        })
    return jsonify(result), 200

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
    print("   POST http://localhost:5000/api/auth/register")
    print("   POST http://localhost:5000/api/auth/login")
    
    app.run(debug=True, port=5000)