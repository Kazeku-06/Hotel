import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Wind, 
  Bath,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn
} from 'lucide-react'
import Layout3D from '../components/Layout3D'
import { roomsAPI } from '../api/rooms'
import { useAuth } from '../context/AuthContext'

const RoomDetail3D = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  // Fetch room details
  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsAPI.getRoomById(id),
    enabled: !!id
  })

  const facilityIcons = {
    'WiFi': Wifi,
    'Parking': Car,
    'Breakfast': Coffee,
    'TV': Tv,
    'AC': Wind,
    'Bathroom': Bath,
  }

  // Mock images for gallery
  const roomImages = [
    room?.image_url || '/hotel1.jpeg',
    '/hotel2.jpeg',
    '/hotel3.jpeg',
    '/hotel4.jpeg'
  ]

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const bookingData = {
      roomId: id,
      checkIn,
      checkOut,
      guests
    }
    navigate('/checkout', { state: { room, bookingData } })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length)
  }

  if (isLoading) {
    return (
      <Layout3D>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading room details...</p>
          </div>
        </div>
      </Layout3D>
    )
  }

  if (error || !room) {
    return (
      <Layout3D>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Not Found</h2>
            <p className="text-gray-600 mb-6">The room you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Layout3D>
    )
  }

  return (
    <Layout3D>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Image Gallery */}
        <section className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img
                src={roomImages[currentImageIndex]}
                alt={`${room.name || `Room ${room.room_number}`} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/hotel1.jpeg'
                }}
              />
              <div className="absolute inset-0 bg-black/30" />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          {/* Image Counter and Actions */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 flex items-center space-x-2 md:space-x-3">
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 md:p-2 rounded-full transition-all duration-300"
            >
              <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 md:p-2 rounded-full transition-all duration-300"
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </button>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 md:p-2 rounded-full transition-all duration-300">
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {roomImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Room Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white"
            >
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">
                {room.name || `Room ${room.room_number}`}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm md:text-lg space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Grand Imperion Hotel</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                  <span>4.8 (124 reviews)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Room Details */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Room Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Room Details</h2>
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {room.room_type?.name || room.room_type || 'Standard'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Up to {room.capacity || 2} guests</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">
                      {formatPrice(room.price || room.price_no_breakfast || 0)}
                    </div>
                    <div className="text-gray-500">per night</div>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {room.description || 'Experience luxury and comfort in this beautifully appointed room featuring modern amenities, elegant furnishings, and stunning city views. Perfect for both business and leisure travelers seeking a premium accommodation experience.'}
                </p>

                {/* Facilities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Amenities & Facilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(room.facilities || ['WiFi', 'AC', 'TV', 'Bathroom', 'Coffee', 'Parking']).map((facility, index) => {
                      const facilityName = typeof facility === 'string' ? facility : facility?.name || 'Unknown'
                      const IconComponent = facilityIcons[facilityName] || Wifi
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700">{facilityName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Policies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Hotel Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Check-in / Check-out</h4>
                      <p className="text-gray-600 text-sm">Check-in: 3:00 PM<br />Check-out: 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Cancellation</h4>
                      <p className="text-gray-600 text-sm">Free cancellation up to 24 hours before check-in</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Extra Guests</h4>
                      <p className="text-gray-600 text-sm">Additional charges may apply for extra guests</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Coffee className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Breakfast</h4>
                      <p className="text-gray-600 text-sm">Complimentary breakfast included</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl p-8 sticky top-24"
              >
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {formatPrice(room.price || room.price_no_breakfast || 0)}
                  </div>
                  <div className="text-gray-500">per night</div>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Check-in Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="inline w-4 h-4 mr-1" />
                      Number of Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {Array.from({ length: room.capacity || 4 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} Guest{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Booking Summary */}
                {checkIn && checkOut && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="text-gray-800">{new Date(checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="text-gray-800">{new Date(checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="text-gray-800">{guests}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatPrice((room.price || room.price_no_breakfast || 0) * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookNow}
                  disabled={!checkIn || !checkOut}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthenticated ? 'Book Now' : 'Login to Book'}
                </motion.button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Secure booking • Free cancellation
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        <AnimatePresence>
          {isImageModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setIsImageModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={roomImages[currentImageIndex]}
                  alt={`Room Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain rounded-lg"
                />
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout3D>
  )
}

export default RoomDetail3D