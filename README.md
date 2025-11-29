📚 API Documentation
Base URL
text
http://localhost:5000
Authentication
All protected endpoints require JWT token in the Authorization header:

text
Authorization: Bearer <your_jwt_token>
🔐 AUTHENTICATION ENDPOINTS
POST /api/auth/login
Login user

Body: { "email": "user@example.com", "password": "password" }

Response: { "access_token": "jwt_token", "user": { ... } }

GET /api/auth/me
Get current user profile

Headers: Authorization: Bearer <token>

Response: { "id": "...", "name": "...", "email": "...", "role": "..." }

🏨 ROOM ENDPOINTS
GET /api/rooms
Get all available rooms with filtering

Query Parameters:

room_type - Filter by room type name

min_price - Minimum price filter

max_price - Maximum price filter

capacity - Minimum capacity filter

facilities[] - Array of facility IDs

Response: Array of room objects with photos and facilities

GET /api/rooms/{room_id}
Get single room details

Response: Complete room object with photos, facilities, and room type

📋 ROOM TYPES ENDPOINTS
GET /api/room-types
Get all room types

Response: { "success": true, "data": [...], "count": 0 }

⭐ RATINGS ENDPOINTS
GET /api/ratings
Get all ratings (Protected)

Headers: Authorization: Bearer <token>

Response: Array of rating objects with user info

POST /api/ratings
Submit a rating (Protected)

Headers: Authorization: Bearer <token>

Body: { "booking_id": "...", "star": 5, "comment": "..." }

Response: { "success": true, "message": "Rating submitted" }

🛎️ FACILITIES ENDPOINTS
GET /api/facilities
Get all facilities

Response: Array of facility objects

📖 BOOKING ENDPOINTS
POST /api/bookings
Create a new booking (Protected)

Headers: Authorization: Bearer <token>

Body:

json
{
  "nik": "123456789",
  "guest_name": "John Doe",
  "phone": "08123456789",
  "check_in": "2024-01-01",
  "check_out": "2024-01-03",
  "total_guests": 2,
  "payment_method": "credit_card",
  "rooms": [
    {
      "room_id": "room-uuid",
      "quantity": 1,
      "breakfast_option": "with"
    }
  ]
}
GET /api/bookings/me
Get user's bookings (Protected)

Headers: Authorization: Bearer <token>

Response: Array of booking objects with room details

👑 ADMIN ENDPOINTS
GET /api/admin/dashboard/stats
Get dashboard statistics (Admin only)

Headers: Authorization: Bearer <token>

Response: Statistics data including bookings, revenue, rooms, etc.

ROOM MANAGEMENT
GET /api/admin/rooms
Get all rooms (Admin only)

Response: Complete room data for admin

POST /api/admin/rooms
Create new room (Admin only)

Headers: Authorization: Bearer <token>

Content-Type: multipart/form-data or application/json

Body: Room data with optional photos and facilities

PUT /api/admin/rooms/{room_id}
Update room (Admin only)

Headers: Authorization: Bearer <token>

Body: Updated room data

DELETE /api/admin/rooms/{room_id}
Delete room (Admin only)

Headers: Authorization: Bearer <token>

DELETE /api/admin/rooms/{room_id}/photos/{photo_id}
Delete room photo (Admin only)

ROOM TYPE MANAGEMENT
GET /api/admin/room-types
Get all room types (Admin only)

Response: Room types with room counts

POST /api/admin/room-types
Create new room type (Admin only)

Body: { "name": "Deluxe", "description": "..." }

FACILITY MANAGEMENT
GET /api/admin/facilities
Get all facilities (Admin only)

POST /api/admin/facilities
Create new facility (Admin only)

Body: { "name": "WiFi", "icon": "📶" }

ROOM FACILITIES MANAGEMENT
GET /api/admin/rooms/{room_id}/facilities
Get room facilities (Admin only)

POST /api/admin/rooms/{room_id}/facilities
Add facility to room (Admin only)

Body: { "facility_id": "..." }

DELETE /api/admin/rooms/{room_id}/facilities?facility_id={id}
Remove facility from room (Admin only)

BOOKING MANAGEMENT
GET /api/admin/bookings
Get all bookings (Admin only)

Response: All bookings in the system

PUT /api/admin/bookings/{booking_id}/status
Update booking status (Admin only)

Body: { "status": "confirmed" }

Valid statuses: pending, confirmed, checked_in, checked_out, cancelled

RATING MANAGEMENT
GET /api/admin/ratings
Get all ratings (Admin only)

Response: All ratings with user information

📁 FILE UPLOADS
GET /uploads/{filename}
Serve uploaded files

Used for room photos and other uploaded content

🛠️ SETUP INSTRUCTIONS
Prerequisites
Python 3.7+

MySQL with Laragon

Required packages: flask, flask-sqlalchemy, flask-jwt-extended, flask-cors, flask-migrate, pymysql, python-dotenv

Installation
Clone the repository

Install dependencies: pip install -r requirements.txt

Create MySQL database named hotel_db

Run the application: python single_app.py

The API will be available at http://localhost:5000

Database Setup
The application will automatically create tables and run necessary migrations on first run.

CORS Configuration
CORS is configured to allow requests from http://localhost:3000 for frontend development.

🔧 ENVIRONMENT VARIABLES
Create a .env file with:

env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
If not provided, default development keys will be used.

📝 NOTES
All admin endpoints require user role to be admin

JWT tokens are required for protected endpoints

File uploads are limited to 16MB and allowed formats: png, jpg, jpeg, gif, webp

The API uses UUIDs for all primary keys

MySQL database connection uses Laragon default credentials

