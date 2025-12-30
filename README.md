# 🏨 Grand Imperion Hotel Management System

Modern hotel management system dengan 3D UI, Google OAuth, dan real-time booking system.

## ✨ Features

- 🎨 **3D UI Design** - Traveloka-inspired dengan Framer Motion animations
- 🔐 **Google OAuth** - Login dengan Google account
- 📱 **Mobile Responsive** - Optimized untuk semua device
- 🏨 **Room Management** - CRUD operations untuk rooms
- 📅 **Booking System** - Real-time booking dengan database integration
- 👨‍💼 **Admin Dashboard** - Complete admin panel dengan statistics
- ⭐ **Rating System** - User reviews dan ratings
- 🔄 **Real Data** - Tidak ada mock data, semua dari database

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Python 3.8+
- MySQL (Laragon recommended)

### 1. Clone Repository

```bash
git clone <repository-url>
cd hotel-management-system
```

### 2. Setup Backend

```bash
cd backend-flask

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your actual values

# Seed database with sample data
python seed_data.py

# Run server
python single_app.py
```

### 3. Setup Frontend

```bash
cd frontend-react

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Google Client ID

# Run development server
npm run dev
```

### 4. Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Create project atau pilih existing project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID dan Client Secret ke .env files

Lihat [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) untuk detail lengkap.

## 📁 Project Structure

```
hotel-management-system/
├── frontend-react/          # React frontend dengan 3D UI
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   ├── .env.example        # Environment template
│   └── package.json
├── backend-flask/           # Flask backend API
│   ├── app/
│   │   ├── models.py       # Database models
│   │   └── routes/         # API routes
│   ├── single_app.py       # Main Flask app
│   ├── seed_data.py        # Database seeder
│   ├── .env.example        # Environment template
│   └── requirements.txt
└── README.md
```

## 🔐 Default Login Credentials

After running `seed_data.py`:

**Admin:**
- Email: `admin@grandimperion.com`
- Password: `admin123`

**Member:**
- Email: `john.doe@email.com`
- Password: `password123`

## 🛠️ Development

### Frontend Development

```bash
cd frontend-react
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd backend-flask
python single_app.py # Start Flask server
python seed_data.py  # Reseed database
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth (JWT method)
- `POST /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - Get all rooms with filters
- `GET /api/rooms/:id` - Get room details
- `POST /api/admin/rooms` - Create room (admin)
- `PUT /api/admin/rooms/:id` - Update room (admin)
- `DELETE /api/admin/rooms/:id` - Delete room (admin)

### Bookings
- `GET /api/bookings/member` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/admin/bookings` - Get all bookings (admin)
- `PATCH /api/admin/bookings/:id/status` - Update booking status (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/reviews` - Get all reviews
- `DELETE /api/admin/reviews/:id` - Delete review

## 🔒 Security Features

- JWT authentication
- CORS protection
- Environment variables for secrets
- Input validation
- SQL injection prevention
- XSS protection

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support, email support@grandimperion.com or create an issue on GitHub.

---

Made with ❤️ by Grand Imperion Team