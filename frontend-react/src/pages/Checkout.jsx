import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { bookingsAPI } from '../api/bookings'
import { formatCurrency } from '../utils/formatCurrency'
import { calculateNights } from '../utils/dateUtils'

export const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const room = location.state?.room

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      guest_name: user?.name || '',
      phone: user?.phone || '',
      nik: '',
      check_in: '',
      check_out: '',
      total_guests: room?.capacity || 1,
      payment_method: 'credit_card',
      breakfast_option: 'without'
    }
  })

  const checkIn = watch('check_in')
  const checkOut = watch('check_out')
  const totalGuests = watch('total_guests')
  const breakfastOption = watch('breakfast_option')

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
  const pricePerNight = breakfastOption === 'with' ? room?.price_with_breakfast : room?.price_no_breakfast
  const totalPrice = nights * (pricePerNight || 0)

  const onSubmit = async (data) => {
    if (!room) {
      setError('Room information is missing')
      return
    }

    setLoading(true)
    setError('')

    try {
      const bookingData = {
        ...data,
        total_price: totalPrice,
        booking_rooms: [
          {
            room_id: room.id,
            quantity: 1,
            breakfast_option: data.breakfast_option
          }
        ]
      }

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

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Room selection required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please select a room before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Browse Rooms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Booking Information
              </h2>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guest Name *
                    </label>
                    <input
                      {...register('guest_name', { required: 'Guest name is required' })}
                      type="text"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                    />
                    {errors.guest_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.guest_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                      placeholder="16 digit NIK"
                    />
                    {errors.nik && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nik.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    type="tel"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Check-in Date *
                    </label>
                    <input
                      {...register('check_in', { required: 'Check-in date is required' })}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                    />
                    {errors.check_in && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.check_in.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Check-out Date *
                    </label>
                    <input
                      {...register('check_out', { 
                        required: 'Check-out date is required',
                        validate: value => !checkIn || value > checkIn || 'Check-out must be after check-in'
                      })}
                      type="date"
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                    />
                    {errors.check_out && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.check_out.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Guests *
                    </label>
                    <select
                      {...register('total_guests', { 
                        required: 'Total guests is required',
                        max: { value: room.capacity, message: `Maximum capacity is ${room.capacity}` }
                      })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                    >
                      {Array.from({ length: room.capacity }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                    {errors.total_guests && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.total_guests.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Breakfast Option
                    </label>
                    <select
                      {...register('breakfast_option')}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="without">Without Breakfast</option>
                      <option value="with">With Breakfast</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method *
                  </label>
                  <select
                    {...register('payment_method', { required: 'Payment method is required' })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                  {errors.payment_method && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.payment_method.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !checkIn || !checkOut}
                  className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Complete Booking - ${formatCurrency(totalPrice)}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300">🏨</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      {room.room_type?.name} - {room.room_number}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Capacity: {room.capacity} people
                    </p>
                  </div>
                </div>

                {checkIn && checkOut && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Check-in</span>
                        <span className="text-gray-800 dark:text-white">{checkIn}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Check-out</span>
                        <span className="text-gray-800 dark:text-white">{checkOut}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Nights</span>
                        <span className="text-gray-800 dark:text-white">{nights}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Room price</span>
                        <span className="text-gray-800 dark:text-white">
                          {formatCurrency(pricePerNight)}/night
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Breakfast</span>
                        <span className="text-gray-800 dark:text-white">
                          {breakfastOption === 'with' ? 'Included' : 'Not included'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-gold-500">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}