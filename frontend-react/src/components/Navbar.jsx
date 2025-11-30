import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gold-500">🏨 Grand Imperion</span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
                {isAdmin ? (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 dark:text-gray-300 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/my-bookings" 
                    className="text-gray-700 dark:text-gray-300 hover:text-gold-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                  >
                    My Bookings
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Hello, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-gold-500 px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar