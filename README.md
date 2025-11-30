# 🏨 Hotel Management System - Fullstack

This is a full-stack hotel management system with a React frontend and a Flask backend.

## ✨ Features

*   User registration and authentication (JWT-based)
*   Room browsing and filtering
*   Room booking
*   Admin dashboard for managing rooms, bookings, and ratings
*   Image uploads for room photos
*   User roles (member and admin)

## 🛠️ Tech Stack

### Backend (Flask)

*   Flask
*   Flask-SQLAlchemy
*   Flask-Migrate
*   Flask-JWT-Extended
*   Flask-CORS
*   PyMySQL
*   python-dotenv

### Frontend (React)

*   React
*   React Router
*   Axios
*   Tailwind CSS
*   Vite

## ✍️ Author

*   **GitHub:** [Kazeku-06](https://github.com/Kazeku-06)

## 🚀 Getting Started

### Prerequisites

*   Python 3.10+
*   Node.js 16+
*   MySQL

### 📦 Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Kazeku-06/Hotel.git
    cd hotel
    ```

2.  **Backend Setup (Flask):**

    ```bash
    cd backend-flask
    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    pip install -r requirements.txt
    ```

    Create a `.env` file in the `backend-flask` directory and add the following:

    ```env
    FLASK_APP=run.py
    FLASK_ENV=development
    SECRET_KEY=your-super-secret-key
    JWT_SECRET_KEY=your-jwt-secret-key
    SQLALCHEMY_DATABASE_URI=mysql+pymysql://user:password@localhost/hotel_db
    UPLOAD_FOLDER=uploads
    ```

    Initialize the database:

    ```bash
    # these commands are not available in the project, you need to create them
    # flask db init
    # flask db migrate
    # flask db upgrade
    ```

    Run the backend server:

    ```bash
    flask run
    ```

    The backend will be running at `http://127.0.0.1:5000`.

3.  **Frontend Setup (React):**

    ```bash
    cd frontend-react
    npm install
    npm run dev
    ```

    The frontend development server will be running at `http://localhost:5173`.

##  API Documentation

### Auth (`/api/auth`)

*   **POST `/register`**
    *   **Description:** Registers a new user.
    *   **Request Body:**
        ```json
        {
          "name": "John Doe",
          "email": "john.doe@example.com",
          "password": "password123",
          "phone": "1234567890"
        }
        ```
    *   **Response:**
        *   `201 Created`: User registered successfully.
        *   `400 Bad Request`: If email already exists or data is invalid.

*   **POST `/login`**
    *   **Description:** Logs in a user and returns a JWT token.
    *   **Request Body:**
        ```json
        {
          "email": "john.doe@example.com",
          "password": "password123"
        }
        ```
    *   **Response:**
        *   `200 OK`: Returns access token and user info.
        *   `401 Unauthorized`: Invalid credentials.

*   **GET `/me`**
    *   **Description:** Gets the currently authenticated user's information.
    *   **Requires:** Authentication (JWT Token).
    *   **Response:**
        *   `200 OK`: Returns user information.
        *   `404 Not Found`: User not found.

### Main (`/api`)

*   **GET `/rooms`**
    *   **Description:** Gets a list of available rooms. Can be filtered by `room_type`, `min_price`, `max_price`, and `capacity`.
    *   **Query Parameters (Optional):**
        *   `room_type` (integer)
        *   `min_price` (float)
        *   `max_price` (float)
        *   `capacity` (integer)
    *   **Response:**
        *   `200 OK`: Returns a list of rooms.

*   **GET `/rooms/<room_id>`**
    *   **Description:** Gets the details of a specific room.
    *   **Response:**
        *   `200 OK`: Returns room details.
        *   `404 Not Found`: Room not found.

### Admin (`/api/admin`)

*All admin routes require an admin role and JWT authentication.*

*   **GET `/room-types`**: Get all room types.
*   **GET `/rooms`**: Get all rooms (not just available ones).
*   **POST `/rooms`**: Create a new room.
*   **PUT `/rooms/<room_id>`**: Update a room.
*   **DELETE `/rooms/<room_id>`**: Delete a room.
*   **POST `/rooms/<room_id>/photos`**: Upload photos for a room.
*   **DELETE `/room-photos/<photo_id>`**: Delete a room photo.
*   **GET `/bookings`**: Get all bookings.
*   **PUT `/bookings/<booking_id>/status`**: Update the status of a booking.
*   **GET `/ratings`**: Get all ratings.
