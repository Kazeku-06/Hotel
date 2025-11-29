import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

export const RoomCard = ({ room }) => {
  const getStatusColor = (status) => {
    return status === 'available' 
      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  }

  const getRoomTypeColor = (roomType) => {
    const colors = {
      'Standard': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'Deluxe': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'Suite': 'bg-gradient-to-r from-yellow-500 to-orange-500',
      'Executive': 'bg-gradient-to-r from-indigo-500 to-purple-500',
      'Presidential': 'bg-gradient-to-r from-red-500 to-yellow-500'
    }
    return colors[roomType] || 'bg-gradient-to-r from-gray-500 to-gray-700'
  }

  const getRoomTypeIcon = (roomType) => {
    const icons = {
      'Standard': '⭐',
      'Deluxe': '✨',
      'Suite': '🏆',
      'Executive': '👑',
      'Presidential': '💎'
    }
    return icons[roomType] || '🏨'
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-yellow-500/30 hover:scale-105 w-full mx-auto mb-6"> {/* Added margin bottom and center */}
      {/* Room Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        {room.primary_photo ? (
          <img 
            src={`http://localhost:5000${room.primary_photo}`}
            alt={room.room_number}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        
        {/* Fallback Image */}
        <div 
          className={`w-full h-full flex items-center justify-center ${room.primary_photo ? 'hidden' : 'flex'}`}
        >
          <div className="text-center">
            <span className="text-yellow-500 text-5xl mb-2 block">🏨</span>
            <p className="text-gray-400 text-sm font-semibold">Grand Imperion</p>
          </div>
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-black rounded-full ${getStatusColor(room.status)} shadow-lg`}>
            {room.status === 'available' ? '✅ AVAILABLE' : '❌ UNAVAILABLE'}
          </span>
        </div>
        
        {/* Room Type Badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-black text-white rounded-full ${getRoomTypeColor(room.room_type?.name)} shadow-lg`}>
            <span>{getRoomTypeIcon(room.room_type?.name)}</span>
            <span>{room.room_type?.name}</span>
          </span>
        </div>

        {/* Capacity Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center space-x-1 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <span>👤</span>
            <span>{room.capacity} {room.capacity === 1 ? 'GUEST' : 'GUESTS'}</span>
          </span>
        </div>

        {/* View Details Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-white font-black text-sm">VIEW DETAILS →</span>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-6">
        {/* Header - Layout diperbaiki */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 truncate">
              {room.room_type?.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
              Room {room.room_number}
            </p>
          </div>
          
          {/* Starting Price - Dipindahkan ke atas */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mb-1">
              STARTS FROM
            </div>
            <div className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
              {formatCurrency(room.price_no_breakfast)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              per night
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed line-clamp-2 min-h-[3rem]">
          {room.description || `Experience luxury in our premium ${room.room_type?.name?.toLowerCase()} room with modern amenities and exceptional comfort.`}
        </p>

        {/* Pricing with Breakfast - Dipisah dari button */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mb-2">
            WITH BREAKFAST
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-black text-yellow-500 whitespace-nowrap">
              {formatCurrency(room.price_with_breakfast)}
            </span>
            {room.price_with_breakfast < room.price_no_breakfast && (
              <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                SAVE {Math.round((1 - room.price_with_breakfast / room.price_no_breakfast) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* View Details Button - Dipisah sendiri dengan spacing yang cukup */}
        <div className="mt-4">
          <Link 
            to={`/rooms/${room.id}`}
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 flex items-center justify-center space-x-2 whitespace-nowrap w-full text-center"
          >
            <span>🔍</span>
            <span>VIEW DETAILS</span>
          </Link>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-500/20 rounded-2xl pointer-events-none transition-all duration-500"></div>
    </div>
  )
}

export default RoomCard