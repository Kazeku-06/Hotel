import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Star, 
  Users, 
  MapPin, 
  Award, 
  Shield, 
  Clock,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Utensils
} from 'lucide-react'

import Layout3D from '../components/Layout3D'
import Hero3D from '../components/Hero3D'
import RoomCard3D from '../components/RoomCard3D'
import SearchFilters3D from '../components/SearchFilters3D'
import Testimonials3D from '../components/Testimonials3D'
import { RoomCardSkeleton } from '../components/LoadingSkeleton'
import { roomsAPI } from '../api/rooms'

const Home3D = () => {
  const [filters, setFilters] = useState({
    room_type: '',
    min_price: '',
    max_price: '',
    capacity: '',
    facilities: []
  })

  // Intersection Observer refs
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [roomsRef, roomsInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true })

  // Fetch rooms data
  const { 
    data: roomsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['rooms', filters],
    queryFn: async () => {
      try {
        const cleanFilters = {
          room_type: filters.room_type || undefined,
          min_price: filters.min_price || undefined,
          max_price: filters.max_price || undefined,
          capacity: filters.capacity || undefined,
          facilities: filters.facilities.length > 0 ? filters.facilities : undefined
        }
        
        const response = await roomsAPI.getRooms(cleanFilters)
        
        if (response.data && Array.isArray(response.data)) {
          return { data: response.data, success: true }
        } else if (Array.isArray(response)) {
          return { data: response, success: true }
        } else {
          return { data: [], success: false, error: 'Invalid response format' }
        }
      } catch (err) {
        console.error('Error fetching rooms:', err)
        throw err
      }
    },
    keepPreviousData: true,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  })

  const roomsData = roomsResponse?.success ? roomsResponse.data : []
  const hasRooms = roomsData && roomsData.length > 0

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({
      room_type: '',
      min_price: '',
      max_price: '',
      capacity: '',
      facilities: []
    })
  }

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== ''
  }).length

  // Hotel features data
  const features = [
    {
      icon: Wifi,
      title: 'Free High-Speed WiFi',
      description: 'Stay connected with complimentary high-speed internet throughout the hotel',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Car,
      title: 'Valet Parking',
      description: 'Convenient valet parking service available 24/7 for all guests',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Coffee,
      title: 'Premium Dining',
      description: 'World-class restaurants and room service with international cuisine',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Dumbbell,
      title: 'Fitness Center',
      description: 'State-of-the-art gym with modern equipment and personal trainers',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Waves,
      title: 'Infinity Pool',
      description: 'Stunning rooftop infinity pool with panoramic city views',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Utensils,
      title: 'Room Service',
      description: '24/7 room service with extensive menu and quick delivery',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  // Stats data
  const stats = [
    { number: '500+', label: 'Happy Guests', icon: Users },
    { number: '4.9', label: 'Rating', icon: Star },
    { number: '50+', label: 'Luxury Rooms', icon: MapPin },
    { number: '24/7', label: 'Service', icon: Clock }
  ]

  return (
    <Layout3D showHero>
      {/* Hero Section */}
      <Hero3D />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={featuresRef}
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              World-Class <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Amenities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience luxury like never before with our premium facilities and exceptional services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-2xl transition-all duration-300" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join our community of satisfied guests who have experienced the Grand Imperion difference
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 right-16 w-24 h-24 bg-white/10 rounded-full blur-xl"
        />
      </section>

      {/* Rooms Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={roomsRef}
            initial={{ opacity: 0, y: 50 }}
            animate={roomsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Luxury <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Accommodations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover our collection of elegantly designed rooms and suites, each offering comfort and sophistication
            </p>

            {/* Filters */}
            <div className="flex justify-center mb-8">
              <SearchFilters3D
                filters={filters}
                onFilter={handleFilter}
                onClearFilters={clearFilters}
              />
            </div>
          </motion.div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-wrap gap-2 justify-center"
            >
              {filters.room_type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Type: {filters.room_type}
                </span>
              )}
              {filters.capacity && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Capacity: {filters.capacity}+
                </span>
              )}
              {(filters.min_price || filters.max_price) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Price: {filters.min_price || '0'} - {filters.max_price || 'Any'}
                </span>
              )}
              {filters.facilities.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  Facilities: {filters.facilities.length}
                </span>
              )}
            </motion.div>
          )}

          {/* Rooms Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
                <p className="font-semibold">Failed to load rooms</p>
                <p className="text-sm mt-1">
                  {error.response?.data?.message || error.message || 'Please try again later'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          ) : !hasRooms ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-xl max-w-md mx-auto">
                <p className="font-semibold">No rooms found</p>
                <p className="text-sm mt-1">
                  {activeFiltersCount > 0 
                    ? 'Try adjusting your filters' 
                    : 'All rooms are currently booked or unavailable'
                  }
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roomsData.map((room, index) => (
                <RoomCard3D key={room.id} room={room} index={index} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasRooms && roomsData.length >= 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View All Rooms
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials3D />
    </Layout3D>
  )
}

export default Home3D