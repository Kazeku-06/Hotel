import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

export const RoomCard = ({ room }) => {
  const getStatusColor = (status) => {
    return status === 'available' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const getRoomTypeColor = (roomType) => {
    const colors = {
      'Standard': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Deluxe': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Suite': 'bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200'
    }
    return colors[roomType] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Room Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {room.primary_photo ? (
          <img 
            src={`http://localhost:5000${room.primary_photo}`}
            alt={room.room_number}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center ${room.primary_photo ? 'hidden' : 'flex'}`}
        >
          <span className="text-gray-400 text-4xl">🏨</span>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
            {room.status}
          </span>
        </div>
        
        {/* Room Type Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoomTypeColor(room.room_type?.name)}`}>
            {room.room_type?.name}
          </span>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Room {room.room_number}
          </h3>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">starts from</div>
            <div className="text-xl font-bold text-gold-500">
              {formatCurrency(room.price_no_breakfast)}
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {room.description || `${room.room_type?.name} room with modern amenities`}
        </p>


        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="text-gray-500 dark:text-gray-400">With breakfast:</div>
            <div className="font-semibold text-gold-500">
              {formatCurrency(room.price_with_breakfast)}
            </div>
          </div>
          
          <Link 
            to={`/rooms/${room.id}`}
            className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
export default RoomCard