from app import db
import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

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

class RoomPhoto(db.Model):
    __tablename__ = 'room_photos'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    room_id = db.Column(db.String(36), db.ForeignKey('rooms.id'), nullable=False)
    photo_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=False)
    star = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)