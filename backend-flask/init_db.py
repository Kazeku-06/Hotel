# init_db.py
from app import create_app, db

app = create_app()

with app.app_context():
    try:
        print("Creating database tables...")
        db.create_all()
        print("✅ All tables created successfully!")
        
        # Test if we can query
        from app.models import User
        users = User.query.all()
        print(f"✅ Database test successful. Found {len(users)} users.")
        
    except Exception as e:
        print(f"❌ Error: {e}")