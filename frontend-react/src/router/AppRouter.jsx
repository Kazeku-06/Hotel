import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Import dengan default exports
import Home from '../pages/Home'
import RoomDetail from '../pages/RoomDetail'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Checkout from '../pages/Checkout'
import MemberBookings from '../pages/MemberBookings'
import MemberRate from '../pages/MemberRate'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminRooms from '../pages/admin/AdminRooms'
import AdminBookings from '../pages/admin/AdminBookings'
import AdminRatings from '../pages/admin/AdminRatings'

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
    return <Navigate to="/login" />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />
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
    return <Navigate to="/" />
  }

  return children
}

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/rooms/:id" element={<RoomDetail />} />
      
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Member Routes */}
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } />
      
      <Route path="/my-bookings" element={
        <ProtectedRoute>
          <MemberBookings />
        </ProtectedRoute>
      } />
      
      <Route path="/rate/:bookingId" element={
        <ProtectedRoute>
          <MemberRate />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/rooms" element={
        <ProtectedRoute requireAdmin>
          <AdminRooms />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/bookings" element={
        <ProtectedRoute requireAdmin>
          <AdminBookings />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/ratings" element={
        <ProtectedRoute requireAdmin>
          <AdminRatings />
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRouter