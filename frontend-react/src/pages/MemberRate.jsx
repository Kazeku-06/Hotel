import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ratingsAPI } from '../api/ratings'

export const MemberRate = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setLoading(true)
    setError('')

    try {
      const ratingData = {
        ...data,
        booking_id: bookingId,
        star: rating
      }

      const response = await ratingsAPI.createRating(ratingData)
      
      if (response.data) {
        navigate('/my-bookings', { 
          state: { message: 'Thank you for your rating!' } 
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Rate Your Stay
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Share your experience to help us improve our service
          </p>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                How would you rate your stay? *
              </label>
              <div className="flex justify-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-4xl focus:outline-none transition-transform duration-300 hover:scale-110"
                  >
                    <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {rating === 0 ? 'Select a rating' : `${rating}.0 stars`}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                {...register('comment', {
                  maxLength: {
                    value: 500,
                    message: 'Comment must be less than 500 characters'
                  }
                })}
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                placeholder="Share details about your experience..."
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment.message}</p>
              )}
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/my-bookings')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}