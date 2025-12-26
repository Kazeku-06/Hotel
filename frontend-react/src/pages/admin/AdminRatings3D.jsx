import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Star,
  Trash2,
  Eye,
  Calendar,
  Users,
  MapPin,
  AlertCircle,
  X,
  MessageSquare
} from 'lucide-react'
import Layout3D from '../../components/Layout3D'
import { adminAPI } from '../../api/admin'

const AdminRatings3D = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedReview, setSelectedReview] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch reviews
  const { data: reviewsResponse, isLoading, error } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => adminAPI.getReviews()
  })

  // Ensure reviews is always an array
  const reviews = Array.isArray(reviewsResponse) 
    ? reviewsResponse 
    : reviewsResponse?.data && Array.isArray(reviewsResponse.data) 
      ? reviewsResponse.data 
      : []

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: adminAPI.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews'])
      setIsModalOpen(false)
    }
  })

  const openModal = (review) => {
    setSelectedReview(review)
    setIsModalOpen(true)
  }

  const handleDelete = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100'
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const filteredReviews = Array.isArray(reviews) ? reviews.filter(review => {
    const matchesSearch = review.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.room?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRating = ratingFilter === 'all' || 
                         (ratingFilter === '5' && review.rating === 5) ||
                         (ratingFilter === '4' && review.rating === 4) ||
                         (ratingFilter === '3' && review.rating === 3) ||
                         (ratingFilter === '1-2' && review.rating <= 2)
    
    return matchesSearch && matchesRating
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now())
      case 'oldest':
        return new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now())
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  }) : []

  // Calculate stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 
      ? Math.round((reviews.filter(review => review.rating === rating).length / reviews.length) * 100)
      : 0
  }))

  if (isLoading) {
    return (
      <Layout3D>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </Layout3D>
    )
  }

  return (
    <Layout3D>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Reviews & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ratings</span>
            </h1>
            <p className="text-gray-600">Monitor guest feedback and ratings</p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
            {/* Average Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-2">{averageRating}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(averageRating))}
                </div>
                <div className="text-gray-600">Average Rating</div>
                <div className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</div>
              </div>
            </motion.div>

            {/* Rating Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-12">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-12 text-right">{count}</div>
                    <div className="text-sm text-gray-500 w-12 text-right">{percentage}%</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="1-2">1-2 Stars</option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Reviews List */}
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">Failed to load reviews</p>
                <p className="text-sm mt-1">Please try again later</p>
              </div>
            </motion.div>
          ) : filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-gray-100 rounded-2xl p-8 md:p-12 max-w-md mx-auto">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reviews Found</h3>
                <p className="text-gray-600">
                  {searchTerm || ratingFilter !== 'all'
                    ? 'No reviews match your search criteria'
                    : 'No reviews available yet'
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {review.guest_name || 'Anonymous Guest'}
                              </h3>
                              <div className="text-sm text-gray-500">
                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex space-x-1">
                              {renderStars(review.rating || 5)}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingColor(review.rating || 5)}`}>
                              {review.rating || 5}/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal(review)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-1 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(review.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-1 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </motion.button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment || 'Great experience! Highly recommended.'}
                        </p>
                      </div>

                      {/* Room Info */}
                      {review.room && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {review.room.name || `Room ${review.room.room_number}`} - 
                              {review.room.room_type?.name || review.room.room_type || 'Standard'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Review Detail Modal */}
          <AnimatePresence>
            {isModalOpen && selectedReview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Review Details</h2>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Guest Info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {selectedReview.guest_name || 'Anonymous Guest'}
                          </h3>
                          <div className="text-gray-500">
                            {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Rating</h4>
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {renderStars(selectedReview.rating || 5)}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(selectedReview.rating || 5)}`}>
                            {selectedReview.rating || 5} out of 5 stars
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Review Comment</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">
                            {selectedReview.comment || 'Great experience! Highly recommended.'}
                          </p>
                        </div>
                      </div>

                      {/* Room Info */}
                      {selectedReview.room && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Room Information</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Room:</span>
                                <div className="font-semibold">
                                  {selectedReview.room.name || `Room ${selectedReview.room.room_number}`}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Type:</span>
                                <div className="font-semibold">
                                  {selectedReview.room.room_type?.name || selectedReview.room.room_type || 'Standard'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => handleDelete(selectedReview.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Review</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout3D>
  )
}

export default AdminRatings3D