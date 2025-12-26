import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Calendar, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react'

const Hero3D = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  const heroSlides = [
    {
      id: 1,
      image: '/hotel1.jpeg',
      title: 'Luxury Redefined',
      subtitle: 'Experience unparalleled comfort in the heart of the city',
      overlay: 'from-black/70 via-black/50 to-transparent'
    },
    {
      id: 2,
      image: '/hotel2.jpeg',
      title: 'Premium Hospitality',
      subtitle: 'Where every moment becomes a cherished memory',
      overlay: 'from-blue-900/70 via-blue-800/50 to-transparent'
    },
    {
      id: 3,
      image: '/hotel3.jpeg',
      title: 'Exceptional Service',
      subtitle: 'Discover the perfect blend of elegance and comfort',
      overlay: 'from-purple-900/70 via-purple-800/50 to-transparent'
    },
    {
      id: 4,
      image: '/hotel4.jpeg',
      title: 'Unforgettable Stays',
      subtitle: 'Your gateway to extraordinary experiences',
      overlay: 'from-green-900/70 via-green-800/50 to-transparent'
    }
  ]

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Search data:', searchData)
    // Implement search logic here
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="relative h-full">
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].overlay}`} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 group hidden sm:block"
      >
        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 group hidden sm:block"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2 md:space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-6xl mx-auto w-full">
          {/* Animated Title */}
          <motion.div
            key={`title-${currentSlide}`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto">
              {heroSlides[currentSlide].subtitle}
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-2xl max-w-4xl mx-auto"
          >
            <form onSubmit={handleSearch} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Destination */}
                <div className="relative">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchData.destination}
                    onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                  />
                </div>

                {/* Check-in */}
                <div className="relative">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                  />
                </div>

                {/* Check-out */}
                <div className="relative">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                  />
                </div>

                {/* Guests */}
                <div className="relative">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    <Users className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Guests
                  </label>
                  <select
                    value={searchData.guests}
                    onChange={(e) => setSearchData({...searchData, guests: parseInt(e.target.value)})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                <span>Search Hotels</span>
              </motion.button>
            </form>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
              <div className="text-2xl md:text-3xl font-bold mb-1">500+</div>
              <div className="text-xs md:text-sm text-gray-300">Happy Guests</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
              <div className="text-2xl md:text-3xl font-bold mb-1 flex items-center justify-center">
                4.9 <Star className="w-4 h-4 md:w-5 md:h-5 ml-1 text-yellow-400 fill-current" />
              </div>
              <div className="text-xs md:text-sm text-gray-300">Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
              <div className="text-2xl md:text-3xl font-bold mb-1">50+</div>
              <div className="text-xs md:text-sm text-gray-300">Luxury Rooms</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
              <div className="text-2xl md:text-3xl font-bold mb-1">24/7</div>
              <div className="text-xs md:text-sm text-gray-300">Service</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full hidden lg:block"
      />
      <motion.div
        animate={{ 
          y: [0, 30, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-32 right-16 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full hidden lg:block"
      />
    </div>
  )
}

export default Hero3D