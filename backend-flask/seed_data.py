#!/usr/bin/env python3
"""
Script untuk mengisi database dengan data sample yang real
"""

import os
import sys
from datetime import datetime, date, timedelta
import random

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, RoomType, Room, RoomPhoto, Facility, FacilityRoom, Booking, BookingRoom, Rating

def create_sample_data():
    app = create_app()
    
    with app.app_context():
        print("🚀 Starting to seed database with real data...")
        
        # Clear existing data
        print("🧹 Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Create admin user
        print("👤 Creating admin user...")
        admin = User(
            name="Admin Hotel",
            email="admin@grandimperion.com",
            phone="+62812345678",
            role="admin"
        )
        admin.set_password("admin123")
        db.session.add(admin)
        
        # Create sample members
        print("👥 Creating sample members...")
        members = [
            {
                "name": "John Doe",
                "email": "john.doe@email.com",
                "phone": "+62812345679",
                "password": "password123"
            },
            {
                "name": "Jane Smith",
                "email": "jane.smith@email.com",
                "phone": "+62812345680",
                "password": "password123"
            },
            {
                "name": "Bob Wilson",
                "email": "bob.wilson@email.com",
                "phone": "+62812345681",
                "password": "password123"
            },
            {
                "name": "Alice Johnson",
                "email": "alice.johnson@email.com",
                "phone": "+62812345682",
                "password": "password123"
            },
            {
                "name": "David Brown",
                "email": "david.brown@email.com",
                "phone": "+62812345683",
                "password": "password123"
            }
        ]
        
        member_objects = []
        for member_data in members:
            member = User(
                name=member_data["name"],
                email=member_data["email"],
                phone=member_data["phone"],
                role="member"
            )
            member.set_password(member_data["password"])
            db.session.add(member)
            member_objects.append(member)
        
        # Create room types
        print("🏠 Creating room types...")
        room_types_data = [
            {
                "name": "Standard",
                "description": "Comfortable standard room with essential amenities"
            },
            {
                "name": "Deluxe",
                "description": "Spacious deluxe room with premium amenities and city view"
            },
            {
                "name": "Suite",
                "description": "Luxurious suite with separate living area and premium facilities"
            },
            {
                "name": "Presidential",
                "description": "Ultimate luxury suite with exclusive amenities and panoramic views"
            }
        ]
        
        room_type_objects = []
        for rt_data in room_types_data:
            room_type = RoomType(
                name=rt_data["name"],
                description=rt_data["description"]
            )
            db.session.add(room_type)
            room_type_objects.append(room_type)
        
        # Create facilities
        print("🛠️ Creating facilities...")
        facilities_data = [
            {"name": "WiFi", "icon": "wifi"},
            {"name": "AC", "icon": "wind"},
            {"name": "TV", "icon": "tv"},
            {"name": "Bathroom", "icon": "bath"},
            {"name": "Coffee", "icon": "coffee"},
            {"name": "Parking", "icon": "car"},
            {"name": "Breakfast", "icon": "utensils"},
            {"name": "Pool", "icon": "waves"},
            {"name": "Gym", "icon": "dumbbell"},
            {"name": "Spa", "icon": "heart"}
        ]
        
        facility_objects = []
        for fac_data in facilities_data:
            facility = Facility(
                name=fac_data["name"],
                icon=fac_data["icon"]
            )
            db.session.add(facility)
            facility_objects.append(facility)
        
        # Commit to get IDs
        db.session.commit()
        
        # Create rooms
        print("🏨 Creating rooms...")
        rooms_data = [
            # Standard Rooms
            {"room_number": "101", "room_type": "Standard", "capacity": 2, "price_no_breakfast": 800000, "price_with_breakfast": 1000000, "description": "Comfortable standard room with garden view"},
            {"room_number": "102", "room_type": "Standard", "capacity": 2, "price_no_breakfast": 800000, "price_with_breakfast": 1000000, "description": "Comfortable standard room with garden view"},
            {"room_number": "103", "room_type": "Standard", "capacity": 3, "price_no_breakfast": 900000, "price_with_breakfast": 1100000, "description": "Standard room with extra bed and garden view"},
            {"room_number": "201", "room_type": "Standard", "capacity": 2, "price_no_breakfast": 850000, "price_with_breakfast": 1050000, "description": "Standard room on second floor with better view"},
            {"room_number": "202", "room_type": "Standard", "capacity": 2, "price_no_breakfast": 850000, "price_with_breakfast": 1050000, "description": "Standard room on second floor with better view"},
            
            # Deluxe Rooms
            {"room_number": "301", "room_type": "Deluxe", "capacity": 2, "price_no_breakfast": 1500000, "price_with_breakfast": 1800000, "description": "Spacious deluxe room with city view and premium amenities"},
            {"room_number": "302", "room_type": "Deluxe", "capacity": 2, "price_no_breakfast": 1500000, "price_with_breakfast": 1800000, "description": "Spacious deluxe room with city view and premium amenities"},
            {"room_number": "303", "room_type": "Deluxe", "capacity": 3, "price_no_breakfast": 1700000, "price_with_breakfast": 2000000, "description": "Deluxe room with extra space and city view"},
            {"room_number": "401", "room_type": "Deluxe", "capacity": 2, "price_no_breakfast": 1600000, "price_with_breakfast": 1900000, "description": "Premium deluxe room with panoramic city view"},
            {"room_number": "402", "room_type": "Deluxe", "capacity": 4, "price_no_breakfast": 2000000, "price_with_breakfast": 2400000, "description": "Large deluxe room perfect for families"},
            
            # Suites
            {"room_number": "501", "room_type": "Suite", "capacity": 4, "price_no_breakfast": 3500000, "price_with_breakfast": 4000000, "description": "Luxurious suite with separate living area and premium facilities"},
            {"room_number": "502", "room_type": "Suite", "capacity": 4, "price_no_breakfast": 3500000, "price_with_breakfast": 4000000, "description": "Luxurious suite with separate living area and premium facilities"},
            {"room_number": "601", "room_type": "Suite", "capacity": 6, "price_no_breakfast": 4500000, "price_with_breakfast": 5200000, "description": "Executive suite with multiple bedrooms and living areas"},
            
            # Presidential Suite
            {"room_number": "701", "room_type": "Presidential", "capacity": 8, "price_no_breakfast": 8000000, "price_with_breakfast": 9500000, "description": "Ultimate luxury presidential suite with exclusive amenities and panoramic views"}
        ]
        
        room_objects = []
        for room_data in rooms_data:
            # Find room type
            room_type = next((rt for rt in room_type_objects if rt.name == room_data["room_type"]), None)
            
            room = Room(
                room_number=room_data["room_number"],
                room_type_id=room_type.id if room_type else None,
                capacity=room_data["capacity"],
                price_no_breakfast=room_data["price_no_breakfast"],
                price_with_breakfast=room_data["price_with_breakfast"],
                status="available",
                description=room_data["description"]
            )
            db.session.add(room)
            room_objects.append(room)
        
        db.session.commit()
        
        # Add facilities to rooms
        print("🔗 Linking facilities to rooms...")
        for room in room_objects:
            # Basic facilities for all rooms
            basic_facilities = ["WiFi", "AC", "TV", "Bathroom"]
            
            # Additional facilities based on room type
            if room.room_type.name == "Standard":
                room_facilities = basic_facilities + ["Coffee"]
            elif room.room_type.name == "Deluxe":
                room_facilities = basic_facilities + ["Coffee", "Parking"]
            elif room.room_type.name == "Suite":
                room_facilities = basic_facilities + ["Coffee", "Parking", "Breakfast", "Pool"]
            else:  # Presidential
                room_facilities = basic_facilities + ["Coffee", "Parking", "Breakfast", "Pool", "Gym", "Spa"]
            
            for facility_name in room_facilities:
                facility = next((f for f in facility_objects if f.name == facility_name), None)
                if facility:
                    facility_room = FacilityRoom(
                        room_id=room.id,
                        facility_id=facility.id
                    )
                    db.session.add(facility_room)
        
        # Create sample bookings
        print("📅 Creating sample bookings...")
        booking_statuses = ["confirmed", "pending", "cancelled", "checked_out"]
        
        for i in range(15):  # Create 15 sample bookings
            member = random.choice(member_objects)
            room = random.choice(room_objects)
            
            # Random dates
            start_date = date.today() + timedelta(days=random.randint(-30, 60))
            end_date = start_date + timedelta(days=random.randint(1, 7))
            
            booking = Booking(
                user_id=member.id,
                nik=f"317{random.randint(1000000000000, 9999999999999)}",
                guest_name=member.name,
                phone=member.phone,
                check_in=start_date,
                check_out=end_date,
                total_guests=random.randint(1, room.capacity),
                payment_method=random.choice(["credit_card", "bank_transfer", "cash"]),
                total_price=room.price_with_breakfast * (end_date - start_date).days,
                status=random.choice(booking_statuses)
            )
            db.session.add(booking)
            db.session.commit()  # Commit to get booking ID
            
            # Create booking room
            booking_room = BookingRoom(
                booking_id=booking.id,
                room_id=room.id,
                room_type=room.room_type.name,
                quantity=1,
                breakfast_option="with",
                price_per_night=room.price_with_breakfast,
                subtotal=room.price_with_breakfast * (end_date - start_date).days
            )
            db.session.add(booking_room)
        
        # Create sample ratings
        print("⭐ Creating sample ratings...")
        completed_bookings = Booking.query.filter(Booking.status.in_(["confirmed", "checked_out"])).all()
        
        rating_comments = [
            "Excellent service and beautiful rooms! The staff was incredibly helpful.",
            "Great location and friendly staff. The room was clean and comfortable.",
            "Outstanding experience! The breakfast was amazing and the pool area was perfect.",
            "Decent stay overall. The room was okay but could use some updates.",
            "Room was not as clean as expected but staff tried to help.",
            "Perfect for a romantic getaway. The suite was luxurious and well-appointed.",
            "Family-friendly hotel with great amenities. Kids loved the pool!",
            "Business trip was comfortable. Good WiFi and quiet environment.",
            "The presidential suite exceeded all expectations. Truly luxurious!",
            "Value for money is excellent. Will definitely stay here again."
        ]
        
        for booking in completed_bookings[:10]:  # Create ratings for first 10 completed bookings
            rating = Rating(
                user_id=booking.user_id,
                booking_id=booking.id,
                star=random.randint(3, 5),
                comment=random.choice(rating_comments)
            )
            db.session.add(rating)
        
        # Commit all changes
        db.session.commit()
        
        print("✅ Database seeded successfully!")
        print(f"📊 Created:")
        print(f"   - {len(member_objects) + 1} users (1 admin, {len(member_objects)} members)")
        print(f"   - {len(room_type_objects)} room types")
        print(f"   - {len(facility_objects)} facilities")
        print(f"   - {len(room_objects)} rooms")
        print(f"   - 15 sample bookings")
        print(f"   - 10 sample ratings")
        
        print("\n🔑 Login credentials:")
        print("Admin: admin@grandimperion.com / admin123")
        print("Member: john.doe@email.com / password123")
        print("       jane.smith@email.com / password123")
        print("       (and others...)")

if __name__ == "__main__":
    create_sample_data()