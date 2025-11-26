# app/__init_models__.py
from app import db

# Import all models here to ensure they are registered with SQLAlchemy
from app.models import User, RoomType, Room, RoomPhoto, Facility, FacilityRoom, Booking, BookingRoom, Rating

__all__ = [
    'User', 
    'RoomType', 
    'Room', 
    'RoomPhoto', 
    'Facility', 
    'FacilityRoom', 
    'Booking', 
    'BookingRoom', 
    'Rating'
]