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
    <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 shadow-2xl border-b border-yellow-500/20 transition-all duration-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-yellow-500 text-black p-3 rounded-2xl font-black text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-500/25">
              🏨
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                GRAND IMPERION
              </h1>
              <p className="text-yellow-400 text-xs font-bold tracking-wider">
                LUXURY HOTEL COLLECTION
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-1">
              <ThemeToggle />
            </div>

            {user ? (
              <>
                {/* Admin/User Links */}
                {isAdmin ? (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 hover:scale-105 group"
                  >
                    <span>👑</span>
                    <span>ADMIN DASHBOARD</span>
                  </Link>
                ) : (
                  <Link 
                    to="/my-bookings" 
                    className="flex items-center space-x-2 text-white hover:text-yellow-500 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group"
                  >
                    <span className="text-lg">📋</span>
                    <span className="group-hover:underline">MY BOOKINGS</span>
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-2xl pl-4 pr-2 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-500 text-black p-2 rounded-xl text-sm">
                      👤
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{user.name}</p>
                      <p className="text-yellow-400 text-xs font-semibold">
                        {isAdmin ? 'ADMIN' : 'MEMBER'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-6 w-px bg-yellow-500/30"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm font-bold flex items-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>LOGOUT</span>
                  </button>
                </div>
              </>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-500 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 group flex items-center space-x-2 border border-white/10 hover:border-yellow-500/50"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">🔑</span>
                  <span>SIGN IN</span>
                </Link>
                
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 flex items-center space-x-2"
                >
                  <span className="text-lg">✨</span>
                  <span>JOIN NOW</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-yellow-500/10 pt-4 pb-2">
          <div className="flex justify-center items-center space-x-8">
            <Link 
              to="/rooms" 
              className="text-gray-300 hover:text-yellow-500 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:bg-white/5 group flex items-center space-x-2"
            >
              <span className="text-yellow-500 group-hover:scale-110 transition-transform">🛏️</span>
              <span>ROOMS & SUITES</span>
            </Link>
            
            <Link 
              to="/facilities" 
              className="text-gray-300 hover:text-yellow-500 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:bg-white/5 group flex items-center space-x-2"
            >
              <span className="text-yellow-500 group-hover:scale-110 transition-transform">🏊</span>
              <span>FACILITIES</span>
            </Link>
            
            <Link 
              to="/offers" 
              className="text-gray-300 hover:text-yellow-500 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:bg-white/5 group flex items-center space-x-2"
            >
              <span className="text-yellow-500 group-hover:scale-110 transition-transform">🎁</span>
              <span>SPECIAL OFFERS</span>
            </Link>
            
            <Link 
              to="/gallery" 
              className="text-gray-300 hover:text-yellow-500 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:bg-white/5 group flex items-center space-x-2"
            >
              <span className="text-yellow-500 group-hover:scale-110 transition-transform">📸</span>
              <span>GALLERY</span>
            </Link>
            
            <Link 
              to="/contact" 
              className="text-gray-300 hover:text-yellow-500 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:bg-white/5 group flex items-center space-x-2"
            >
              <span className="text-yellow-500 group-hover:scale-110 transition-transform">📞</span>
              <span>CONTACT</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center space-x-6 text-sm font-black">
            <div className="flex items-center space-x-2">
              <span>🏆</span>
              <span>BEST LUXURY HOTEL 2024</span>
            </div>
            <div className="h-4 w-px bg-black/30"></div>
            <div className="flex items-center space-x-2">
              <span>⭐</span>
              <span>5-STAR RATING</span>
            </div>
            <div className="h-4 w-px bg-black/30"></div>
            <div className="flex items-center space-x-2">
              <span>🎯</span>
              <span>PRIME CITY CENTER LOCATION</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar