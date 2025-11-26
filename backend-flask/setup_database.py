import os
from app import create_app, db
from app.models import User, RoomType, Room, Facility

def setup_database():
    app = create_app()
    
    with app.app_context():
        try:
            print("🔧 Creating database tables...")
            
            # Create all tables
            db.create_all()
            print("✅ Database tables created!")
            
            # Create sample data
            print("🌱 Creating sample data...")
            
            # Create admin user
            admin = User(
                name="Admin User",
                email="admin@hotel.com",
                phone="081234567890",
                role="admin"
            )
            admin.set_password("admin123")
            db.session.add(admin)
            
            # Create member user
            member = User(
                name="John Doe",
                email="john@example.com", 
                phone="081298765432",
                role="member"
            )
            member.set_password("password123")
            db.session.add(member)
            
            # Create room types
            room_types = [
                RoomType(name="Standard", description="Comfortable standard room with basic amenities"),
                RoomType(name="Deluxe", description="Spacious deluxe room with extra comfort"),
                RoomType(name="Suite", description="Luxury suite with premium amenities")
            ]
            
            for rt in room_types:
                db.session.add(rt)
            
            db.session.commit()
            
            # Create rooms
            rooms = [
                Room(
                    room_type_id=room_types[0].id,
                    room_number="101",
                    capacity=2,
                    price_no_breakfast=500000,
                    price_with_breakfast=600000,
                    status="available",
                    description="Standard room with city view and comfortable bed"
                ),
                Room(
                    room_type_id=room_types[1].id,
                    room_number="201", 
                    capacity=3,
                    price_no_breakfast=800000,
                    price_with_breakfast=900000,
                    status="available",
                    description="Deluxe room with balcony and extra space"
                ),
                Room(
                    room_type_id=room_types[2].id,
                    room_number="301",
                    capacity=4, 
                    price_no_breakfast=1200000,
                    price_with_breakfast=1400000,
                    status="available",
                    description="Luxury suite with jacuzzi and premium amenities"
                )
            ]
            
            for room in rooms:
                db.session.add(room)
            
            db.session.commit()
            
            print("✅ Sample data created successfully!")
            print("👤 Admin: admin@hotel.com / admin123")
            print("👤 Member: john@example.com / password123")
            print("🏨 Rooms: 101, 201, 301 created")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    setup_database()