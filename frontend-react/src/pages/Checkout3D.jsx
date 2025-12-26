import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Shield,
  CheckCircle,
  Clock,
  Star,
  ArrowLeft,
  Lock
} from 'lucide-react'
import Layout3D from '../components/Layout3D'
import { useAuth } from '../context/AuthContext'

const Checkout3D = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { room, bookingData } = location.state || {}
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (!room || !bookingData) {
      navigate('/')
    }
  }, [room, bookingData, navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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

  const calculateTotal = () => {
    const nights = calculateNights()
    const roomPrice = room?.price || room?.price_no_breakfast || 0
    const subtotal = roomPrice * nights
    const tax = subtotal * 0.1 // 10% tax
    const serviceFee = 50000 // Service fee
    return {
      subtotal,
      tax,
      serviceFee,
      total: subtotal + tax + serviceFee
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      navigate('/booking-success', { 
        state: { 
          room, 
          bookingData, 
          guestInfo: formData,
          total: calculateTotal().total
        } 
      })
    }, 3000)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!room || !bookingData) {
    return null
  }

  const pricing = calculateTotal()

  return (
    <Layout3D>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Room Details</span>
            </button>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Complete Your Booking</h1>
            <p className="text-gray-600">Secure your luxury stay at Grand Imperion</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 1, title: 'Guest Details', icon: User },
                { step: 2, title: 'Review Booking', icon: CheckCircle },
                { step: 3, title: 'Payment', icon: CreditCard }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${
                      currentStep >= step ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      Step {step}
                    </div>
                    <div className={`text-xs ${
                      currentStep >= step ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {title}
                    </div>
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ml-8 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Guest Details */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Guest Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Any special requests or preferences..."
                      />
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                      >
                        Continue to Review
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Review Booking */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Booking</h2>
                    
                    {/* Room Details */}
                    <div className="border border-gray-200 rounded-lg p-6 mb-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={room.image_url || room.primary_photo ? `http://localhost:5000${room.primary_photo}` : '/hotel1.jpeg'}
                          alt={room.name || `Room ${room.room_number}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {room.name || `Room ${room.room_number}`}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {room.room_type?.name || room.room_type || 'Standard'}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Up to {room.capacity || 2} guests</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm text-gray-600">4.8 (124 reviews)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Booking Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Check-in: {new Date(bookingData.checkIn).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Check-out: {new Date(bookingData.checkOut).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>Guests: {bookingData.guests}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Nights: {calculateNights()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Guest Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Name: </span>
                            <span>{formData.firstName} {formData.lastName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email: </span>
                            <span>{formData.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone: </span>
                            <span>{formData.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                      >
                        Back to Details
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                      >
                        Continue to Payment
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            required
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="Name as it appears on card"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">Secure Payment</span>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                      </p>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                      >
                        Back to Review
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={isProcessing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            <span>Complete Booking</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8 sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Rate ({calculateNights()} nights)</span>
                    <span className="font-semibold">{formatPrice(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-semibold">{formatPrice(pricing.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-semibold">{formatPrice(pricing.serviceFee)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">{formatPrice(pricing.total)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Included Benefits</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complimentary breakfast</li>
                    <li>• Free WiFi</li>
                    <li>• 24/7 room service</li>
                    <li>• Free cancellation (24h)</li>
                  </ul>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  <Shield className="inline w-4 h-4 mr-1" />
                  100% secure booking
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout3D>
  )
}

export default Checkout3D