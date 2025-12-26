import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Download,
  Mail,
  Phone,
  Home,
  Star
} from 'lucide-react'
import Layout3D from '../components/Layout3D'

const BookingSuccess3D = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { room, bookingData, guestInfo, total } = location.state || {}

  useEffect(() => {
    if (!room || !bookingData) {
      navigate('/')
    }
  }, [room, bookingData, navigate])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateNights = () => {
    if (!bookingData?.checkIn || !bookingData?.checkOut) return 1
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  }

  if (!room || !bookingData) {
    return null
  }

  return (
    <Layout3D>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            >
              Booking <span className="text-green-600">Confirmed!</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600"
            >
              Thank you for choosing Grand Imperion. Your reservation has been successfully processed.
            </motion.p>
          </motion.div>

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Booking Confirmation</h2>
                  <p className="opacity-90">Confirmation #GI-2024-001</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{formatPrice(total)}</div>
                  <div className="opacity-90">Total Amount</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Room Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Room Details</h3>
                <div className="flex items-start space-x-6">
                  <img
                    src={room.image_url || room.primary_photo ? `http://localhost:5000${room.primary_photo}` : '/hotel1.jpeg'}
                    alt={room.name || `Room ${room.room_number}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {room.name || `Room ${room.room_number}`}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                        {room.room_type?.name || room.room_type || 'Standard'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Grand Imperion Hotel</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm text-gray-600">4.8 (124 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Stay Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">Check-in</div>
                        <div className="text-gray-600">{new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</div>
                        <div className="text-sm text-gray-500">After 3:00 PM</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">Check-out</div>
                        <div className="text-gray-600">{new Date(bookingData.checkOut).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</div>
                        <div className="text-sm text-gray-500">Before 12:00 PM</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">Guests</div>
                        <div className="text-gray-600">{bookingData.guests} Guest{bookingData.guests > 1 ? 's' : ''}</div>
                        <div className="text-sm text-gray-500">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Guest Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold">Primary Guest</div>
                      <div className="text-gray-600">{guestInfo?.firstName} {guestInfo?.lastName}</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">Email</div>
                        <div className="text-gray-600">{guestInfo?.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">Phone</div>
                        <div className="text-gray-600">{guestInfo?.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {guestInfo?.specialRequests && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Special Requests</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{guestInfo.specialRequests}</p>
                  </div>
                </div>
              )}

              {/* Important Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-800 mb-3">Important Information</h3>
                <ul className="space-y-2 text-blue-700 text-sm">
                  <li>• A confirmation email has been sent to {guestInfo?.email}</li>
                  <li>• Please bring a valid ID for check-in</li>
                  <li>• Free cancellation up to 24 hours before check-in</li>
                  <li>• Complimentary breakfast is included in your stay</li>
                  <li>• Free WiFi and parking available</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Confirmation</span>
                </motion.button>
                
                <Link
                  to="/my-bookings"
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>View My Bookings</span>
                </Link>
                
                <Link
                  to="/"
                  className="flex-1 border-2 border-blue-600 text-blue-600 font-bold py-4 px-6 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Our 24/7 customer service team is here to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+6221234567"
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>Call Us</span>
              </a>
              <a
                href="mailto:support@grandimperion.com"
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Email Support</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout3D>
  )
}

export default BookingSuccess3D