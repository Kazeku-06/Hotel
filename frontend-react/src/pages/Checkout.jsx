import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { bookingsAPI } from '../api/bookings'
import { formatCurrency } from '../utils/formatCurrency'
import { calculateNights } from '../utils/dateUtils'

export const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const room = location.state?.room

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm()

  // SOLUSI: Set form values ketika user data tersedia
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Setting form values with user:', user)
      setValue('guest_name', user?.name || '')
      setValue('phone', user?.phone || '')
    }
  }, [user, authLoading, setValue])

  const checkIn = watch('check_in')
  const checkOut = watch('check_out')
  const totalGuests = watch('total_guests')
  const breakfastOption = watch('breakfast_option')
  const guestName = watch('guest_name')
  const phone = watch('phone')

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
  const pricePerNight = breakfastOption === 'with' ? room?.price_with_breakfast : room?.price_no_breakfast
  const totalPrice = nights * (pricePerNight || 0)

  const onSubmit = async (data) => {
    // Double check admin status dan room status sebelum submit
    if (isAdmin) {
      setError('Admin accounts cannot make bookings. Please use a member account.')
      return
    }

    if (!room) {
      setError('Room information is missing')
      return
    }

    if (room.status !== 'available') {
      setError(`This room is currently ${room.status} and cannot be booked. Please choose another room.`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const bookingData = {
        nik: data.nik,
        guest_name: data.guest_name,
        phone: data.phone,
        check_in: data.check_in,
        check_out: data.check_out,
        total_guests: parseInt(data.total_guests),
        payment_method: data.payment_method,
        rooms: [
          {
            room_id: room.id,
            quantity: 1,
            breakfast_option: data.breakfast_option
          }
        ]
      }

      console.log('📤 Sending booking data:', bookingData)

      const response = await bookingsAPI.createBooking(bookingData)
      
      if (response.data) {
        navigate('/my-bookings', { 
          state: { message: 'Booking successful!' } 
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Disable form jika admin atau room tidak available atau masih loading auth
  const isFormDisabled = isAdmin || !room || room.status !== 'available' || authLoading

  // Tampilkan loading selama auth masih loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-white text-lg">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Tampilkan error page untuk admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Access Denied
              </h1>
              <p className="text-gray-300 mb-6">
                Admin accounts cannot make bookings. Please use a member account to book rooms.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 py-3 px-4 rounded-xl font-bold transition-all duration-300"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 border border-gray-600"
                >
                  Go to Admin Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
      {/* Header Premium */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-black font-bold text-xl">🏨</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Checkout
              </h1>
              <p className="text-gray-400">Complete your booking</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Booking ID</div>
            <div className="text-yellow-400 font-mono">#{Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Information
                </h2>
                <p className="text-gray-800 font-medium">
                  Please fill in your details below
                </p>
              </div>

              <div className="p-8">
                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-xl mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {isFormDisabled && !isAdmin && (
                  <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-6 py-4 rounded-xl mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    This room is currently <span className="font-bold ml-1">{room?.status}</span>. Booking is not available.
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Guest Name *
                        </label>
                        <input
                          {...register('guest_name', { required: 'Guest name is required' })}
                          type="text"
                          disabled={isFormDisabled}
                          className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                          placeholder="Enter guest name"
                        />
                        {errors.guest_name && (
                          <p className="mt-2 text-sm text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.guest_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          NIK *
                        </label>
                        <input
                          {...register('nik', { 
                            required: 'NIK is required',
                            pattern: {
                              value: /^[0-9]{16}$/,
                              message: 'NIK must be 16 digits'
                            }
                          })}
                          type="text"
                          disabled={isFormDisabled}
                          className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                          placeholder="16 digit NIK"
                        />
                        {errors.nik && (
                          <p className="mt-2 text-sm text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.nik.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Phone Number *
                      </label>
                      <input
                        {...register('phone', { required: 'Phone number is required' })}
                        type="tel"
                        disabled={isFormDisabled}
                        className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                        placeholder="Enter phone number"
                      />
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stay Details */}
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Stay Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Check-in Date *
                        </label>
                        <input
                          {...register('check_in', { required: 'Check-in date is required' })}
                          type="date"
                          disabled={isFormDisabled}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                        />
                        {errors.check_in && (
                          <p className="mt-2 text-sm text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.check_in.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Check-out Date *
                        </label>
                        <input
                          {...register('check_out', { 
                            required: 'Check-out date is required',
                            validate: value => !checkIn || value > checkIn || 'Check-out must be after check-in'
                          })}
                          type="date"
                          disabled={isFormDisabled}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                        />
                        {errors.check_out && (
                          <p className="mt-2 text-sm text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.check_out.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Total Guests *
                        </label>
                        <select
                          {...register('total_guests', { 
                            required: 'Total guests is required',
                            max: { value: room.capacity, message: `Maximum capacity is ${room.capacity}` }
                          })}
                          disabled={isFormDisabled}
                          className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                        >
                          {Array.from({ length: room.capacity }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                            </option>
                          ))}
                        </select>
                        {errors.total_guests && (
                          <p className="mt-2 text-sm text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.total_guests.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Breakfast Option
                        </label>
                        <select
                          {...register('breakfast_option')}
                          disabled={isFormDisabled}
                          className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                        >
                          <option value="without">Without Breakfast</option>
                          <option value="with">With Breakfast</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Payment Method
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Payment Method *
                      </label>
                      <select
                        {...register('payment_method', { required: 'Payment method is required' })}
                        disabled={isFormDisabled}
                        className="w-full p-4 bg-gray-600 border border-gray-500 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500"
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                      </select>
                      {errors.payment_method && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.payment_method.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !checkIn || !checkOut || isFormDisabled}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-gray-900 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
                        Processing Booking...
                      </>
                    ) : isFormDisabled ? (
                      `Room ${room?.status?.toUpperCase()} - Cannot Book`
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Complete Booking - {formatCurrency(totalPrice)}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h3>
              </div>

              <div className="p-6">
                <div className="space-y-6 mb-6">
                  {/* Room Info */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                      <span className="text-2xl">🏨</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">
                        {room.room_type?.name} - {room.room_number}
                      </h4>
                      <p className="text-gray-300 text-sm mt-1">
                        Capacity: {room.capacity} people
                      </p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                        room.status === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        room.status === 'booked' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {room.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Stay Details */}
                  {checkIn && checkOut && (
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                      <h5 className="font-semibold text-white mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Stay Duration
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Check-in</span>
                          <span className="text-white font-medium">{checkIn}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Check-out</span>
                          <span className="text-white font-medium">{checkOut}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Nights</span>
                          <span className="text-yellow-400 font-bold">{nights} nights</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {checkIn && checkOut && (
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                      <h5 className="font-semibold text-white mb-3">Price Breakdown</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Room price</span>
                          <span className="text-white">
                            {formatCurrency(pricePerNight)}/night
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Breakfast</span>
                          <span className="text-white">
                            {breakfastOption === 'with' ? 'Included' : 'Not included'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Nights</span>
                          <span className="text-white">× {nights}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Price */}
                <div className="border-t border-gray-600 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total Amount</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 text-center">
                    Includes all taxes and fees
                  </p>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center justify-center text-green-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure SSL Encryption
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout