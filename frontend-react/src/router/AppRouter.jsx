import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Import dengan default exports
import Home3D from '../pages/Home3D'
import RoomDetail3D from '../pages/RoomDetail3D'
import Login3D from '../pages/Login3D'
import Register3D from '../pages/Register3D'
import Checkout3D from '../pages/Checkout3D'
import MemberBookings3D from '../pages/MemberBookings3D'
import BookingSuccess3D from '../pages/BookingSuccess3D'
import MemberRate from '../pages/MemberRate'
import AdminDashboard3D from '../pages/admin/AdminDashboard3D'
import AdminRooms3D from '../pages/admin/AdminRooms3D'
import AdminBookings3D from '../pages/admin/AdminBookings3D'
import AdminRatings3D from '../pages/admin/AdminRatings3D'
import AdminPromotions3D from '../pages/admin/AdminPromotions3D'

// Protected Route untuk member only (mencegah admin mengakses)
const MemberRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }
  
  return children
}

// Protected Route untuk umum (bisa diakses member dan admin)
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home3D />} />
      <Route path="/rooms/:id" element={<RoomDetail3D />} />
      
      <Route path="/login" element={
        <PublicRoute>
          <Login3D />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register3D />
        </PublicRoute>
      } />

      {/* Member Only Routes - Admin tidak bisa akses */}
      <Route path="/checkout" element={
        <MemberRoute>
          <Checkout3D />
        </MemberRoute>
      } />
      
      <Route path="/my-bookings" element={
        <MemberRoute>
          <MemberBookings3D />
        </MemberRoute>
      } />
      
      <Route path="/booking-success" element={
        <MemberRoute>
          <BookingSuccess3D />
        </MemberRoute>
      } />
      
      <Route path="/rate/:bookingId" element={
        <MemberRoute>
          <MemberRate />
        </MemberRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard3D />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/rooms" element={
        <ProtectedRoute requireAdmin>
          <AdminRooms3D />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/bookings" element={
        <ProtectedRoute requireAdmin>
          <AdminBookings3D />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/ratings" element={
        <ProtectedRoute requireAdmin>
          <AdminRatings3D />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/promotions" element={
        <ProtectedRoute requireAdmin>
          <AdminPromotions3D />
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter