# Google OAuth Setup Guide

## ⚠️ SECURITY NOTICE
**NEVER commit .env files to version control!** 
- Use .env.example as template
- Copy .env.example to .env and fill with real values
- .env files are already added to .gitignore

## Langkah-langkah Setup Google OAuth

### 1. Konfigurasi Google Cloud Console

Anda sudah melakukan ini dengan mendaftarkan redirect URI: `http://localhost:3000/auth/google/callback`

### 2. Dapatkan Credentials dari Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda atau buat project baru
3. Pergi ke **APIs & Services** > **Credentials**
4. Klik **Create Credentials** > **OAuth 2.0 Client IDs**
5. Pilih **Web application**
6. Tambahkan **Authorized redirect URIs**: `http://localhost:3000/auth/google/callback`
7. Salin **Client ID** dan **Client Secret**

### 3. Update Environment Variables

#### Frontend (.env)
```bash
# Copy template and fill with real values
cp .env.example .env
```

```env
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Backend (.env)
```bash
# Copy template and fill with real values
cp .env.example .env
```

```env
SECRET_KEY=your-generated-secret-key
JWT_SECRET_KEY=your-generated-jwt-secret
DATABASE_URL=mysql+pymysql://root:@localhost/hotel_db
GOOGLE_CLIENT_ID=YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

### 4. Yang Sudah Dikonfigurasi

✅ **Frontend Components:**
- `GoogleOAuth3D.jsx` - Komponen tombol Google OAuth
- `GoogleCallback.jsx` - Halaman callback untuk menangani response dari Google
- `googleAuth.js` - Service untuk mengelola OAuth flow

✅ **Backend Endpoints:**
- `/api/auth/google` - Endpoint untuk autentikasi Google (JWT method)
- `/api/auth/google/callback` - Endpoint untuk menangani callback dari Google

✅ **Router Configuration:**
- Route `/auth/google/callback` sudah ditambahkan ke AppRouter

### 5. Flow Autentikasi

1. User klik tombol "Sign in with Google"
2. User diarahkan ke Google OAuth consent screen
3. Setelah user memberikan izin, Google redirect ke `http://localhost:3000/auth/google/callback`
4. Frontend menangkap authorization code dan mengirim ke backend
5. Backend menukar code dengan access token dari Google
6. Backend mendapatkan user info dari Google API
7. Backend membuat atau update user di database
8. Backend mengembalikan JWT token ke frontend
9. Frontend menyimpan token dan redirect user ke dashboard

### 6. Testing

1. Pastikan kedua server berjalan:
   ```bash
   # Frontend
   cd frontend-react
   npm run dev

   # Backend
   cd backend-flask
   python single_app.py
   ```

2. Buka `http://localhost:3000/login`
3. Klik tombol "Sign in with Google"
4. Ikuti flow OAuth Google

### 7. Troubleshooting

**Error: "redirect_uri_mismatch"**
- Pastikan redirect URI di Google Cloud Console sama persis: `http://localhost:3000/auth/google/callback`

**Error: "invalid_client"**
- Periksa GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di file .env

**Error: "access_denied"**
- User membatalkan proses OAuth atau tidak memberikan izin

### 8. Production Setup

Untuk production, ubah:
- Redirect URI ke domain production: `https://yourdomain.com/auth/google/callback`
- Update environment variables dengan domain production
- Pastikan HTTPS diaktifkan

## File yang Dimodifikasi

1. `frontend-react/.env` - Environment variables
2. `frontend-react/src/services/googleAuth.js` - Google OAuth service
3. `frontend-react/src/components/GoogleOAuth3D.jsx` - OAuth button component
4. `frontend-react/src/pages/GoogleCallback.jsx` - Callback handler page
5. `frontend-react/src/pages/Login3D.jsx` - Added Google OAuth button
6. `frontend-react/src/pages/Register3D.jsx` - Added Google OAuth button
7. `frontend-react/src/router/AppRouter.jsx` - Added callback route
8. `backend-flask/.env` - Environment variables
9. `backend-flask/single_app.py` - Added Google OAuth endpoints

## Next Steps

1. **Ganti placeholder credentials** dengan credentials Google yang sebenarnya
2. **Test OAuth flow** dengan mengklik tombol Google di halaman login/register
3. **Verifikasi user creation** di database setelah OAuth berhasil
4. **Test logout functionality** untuk memastikan session management bekerja dengan baik