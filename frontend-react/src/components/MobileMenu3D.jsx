import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Calendar, 
  Star, 
  Settings, 
  User, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MobileMenu3D = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isAdmin, user } = useAuth()
  const location = useLocation()

  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin', icon: Settings },
    { name: 'Rooms', path: '/admin/rooms', icon: Home },
    { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Reviews', path: '/admin/ratings', icon: Star },
  ]

  const memberMenuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'My Bookings', path: '/my-bookings', icon: Calendar },
  ]

  const menuItems = isAdmin ? adminMenuItems : memberMenuItems

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  if (!isAuthenticated) return null

  return (
    <>
      {/* Mobile Menu Button - Fixed Bottom Right */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl lg:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{user?.name || 'User'}</h3>
                      <p className="text-sm text-gray-500">
                        {isAdmin ? 'Administrator' : 'Member'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon
                    const isActive = location.pathname === item.path
                    
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={closeMenu}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>

                {/* Quick Stats for Admin */}
                {isAdmin && (
                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">156</div>
                        <div className="text-xs text-gray-600">Bookings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">48</div>
                        <div className="text-xs text-gray-600">Rooms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">4.8</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">24/7</div>
                        <div className="text-xs text-gray-600">Support</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileMenu3D