import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Wind, 
  Bath,
  Heart,
  Eye,
  MapPin
} from 'lucide-react'

const RoomCard3D = ({ room, index = 0 }) => {
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const facilityIcons = {
    'WiFi': Wifi,
    'Parking': Car,
    'Breakfast': Coffee,
    'TV': Tv,
    'AC': Wind,
    'Bathroom': Bath,
  }

  const handleViewDetails = () => {
    navigate(`/rooms/${room.id}`)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.3 }
      }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={room.image_url || room.primary_photo ? `http://localhost:5000${room.primary_photo}` : '/hotel1.jpeg'}
          alt={room.name || `Room ${room.room_number}`}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/hotel1.jpeg'
            setImageLoaded(true)
          }}
        />
        
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300"
        >
          <Heart 
            className={`w-5 h-5 transition-colors duration-300 ${
              isLiked ? 'text-red-500 fill-current' : 'text-gray-600'
            }`} 
          />
        </motion.button>

        {/* Room Type Badge */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {room.room_type?.name || room.room_type || 'Standard'}
        </div>

        {/* Quick View Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
          onClick={handleViewDetails}
        >
          <Eye className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
              {room.name || `Room ${room.room_number}` || 'Luxury Room'}
            </h3>
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-yellow-700">4.8</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Grand Imperion Hotel</span>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {room.description || 'Luxurious room with premium amenities and stunning city views.'}
          </p>
        </div>

        {/* Facilities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {room.facilities?.slice(0, 4).map((facility, idx) => {
              // Handle both string and object formats
              const facilityName = typeof facility === 'string' ? facility : facility?.name || 'Unknown'
              const IconComponent = facilityIcons[facilityName] || Wifi
              return (
                <div
                  key={idx}
                  className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600"
                >
                  <IconComponent className="w-3 h-3" />
                  <span>{facilityName}</span>
                </div>
              )
            })}
            {room.facilities?.length > 4 && (
              <div className="bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600">
                +{room.facilities.length - 4} more
              </div>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <Users className="w-4 h-4 mr-2" />
          <span>Up to {room.capacity} guests</span>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {formatPrice(room.price || room.price_no_breakfast || 0)}
            </div>
            <div className="text-sm text-gray-500">per night</div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewDetails}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Book Now
          </motion.button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-2xl transition-all duration-300 pointer-events-none" />
    </motion.div>
  )
}

export default RoomCard3D