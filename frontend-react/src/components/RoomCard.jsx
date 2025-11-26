import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

export const RoomCard = ({ room }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <div className="h-48 overflow-hidden">
        <img
          src={room.photos?.[0]?.photo_url || '/api/placeholder/400/300'}
          alt={room.room_number}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {room.room_type?.name} - {room.room_number}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {room.description || 'Comfortable room with modern amenities'}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <span>👤</span>
              <span>{room.capacity}</span>
            </span>
            <span>•</span>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
              {room.room_type?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gold-500">
              {formatCurrency(room.price_no_breakfast)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">per night</p>
          </div>
          
          <Link
            to={`/rooms/${room.id}`}
            className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RoomCard