import { useQuery } from '@tanstack/react-query'
import { ratingsAPI } from '../../api/ratings'

export const AdminRatings = () => {
  const { data: ratingsResponse, isLoading, error } = useQuery({
    queryKey: ['admin-ratings'],
    queryFn: () => ratingsAPI.getAdminRatings(),
    retry: 1 // Hanya retry sekali
  })

  // FIX: Proper data extraction
  const ratings = ratingsResponse?.data?.data || [] // ratingsResponse.data.data
  const count = ratingsResponse?.data?.count || 0

  console.log('🔍 Ratings Response:', ratingsResponse)
  console.log('🔍 Extracted ratings:', ratings)

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      >
        ★
      </span>
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error loading ratings</p>
            <p className="text-sm">{error.message}</p>
            <p className="text-xs mt-2">Please check if the backend server is running on port 5000</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Guest Ratings & Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all guest feedback and ratings ({count} total)
          </p>
        </div>

        <div className="space-y-6">
          {/* FIX: ratings is now properly an array */}
          {Array.isArray(ratings) && ratings.map((rating) => (
            <div key={rating.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                    {rating.user?.name || 'Anonymous Guest'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {rating.user?.email}
                  </p>
                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(rating.star)}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {rating.star}.0 stars
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(rating.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              {rating.comment && (
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  "{rating.comment}"
                </p>
              )}
              
              {!rating.comment && (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No comment provided
                </p>
              )}
              
              <div className="mt-3 text-xs text-gray-400">
                Booking ID: {rating.booking_id}
              </div>
            </div>
          ))}
        </div>

        {Array.isArray(ratings) && ratings.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                No ratings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Guest ratings will appear here once customers start reviewing their stays.
              </p>
            </div>
          </div>
        )}

        {/* Safety check - if ratings is not an array */}
        {!Array.isArray(ratings) && (
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg">
            <p>Unexpected data format received from server</p>
            <pre className="text-xs mt-2">{JSON.stringify(ratingsResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRatings