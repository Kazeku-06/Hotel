import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Search, MapPin, Users, Wifi, Coffee, Car, Utensils } from 'lucide-react'
import { enhancedAPI } from '../api/enhanced'

const RoomAvailabilityCalendar3D = ({ onRoomSelect }) => {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [roomTypeId, setRoomTypeId] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Set default dates (today and tomorrow)
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setCheckIn(today.toISOString().split('T')[0])
    setCheckOut(tomorrow.toISOString().split('T')[0])
  }, [])

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates')
      return
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after check-in date')
      return
    }

    setLoading(true)
    try {
      const response = await enhancedAPI.checkRoomAvailability(checkIn, checkOut, roomTypeId)
      setAvailableRooms(response.available_rooms || [])
      setSearched(true)
    } catch (error) {
      console.error('Error checking availability:', error)
      alert('Error checking room availability')
    } finally {
      setLoading(false)
    }
  }

  const getFacilityIcon = (iconName) => {
    const icons = {
      wifi: <Wifi className="w-4 h-4" />,
      coffee: <Coffee className="w-4 h-4" />,
      car: <Car className="w-4 h-4" />,
      utensils: <Utensils className="w-4 h-4" />
    }
    return icons[iconName] || <div className="w-4 h-4 bg-blue-500 rounded-full" />
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full mr-4"
          >
            <Calendar className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Room Availability Calendar
          </h2>
        </div>
        <p className="text-gray-600">Find and book available rooms for your perfect stay</p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type (Optional)
            </label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Room Types</option>
              <option value="1">Standard</option>
              <option value="2">Deluxe</option>
              <option value="3">Suite</option>
              <option value="4">Presidential</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search Rooms
                </>
              )}
            </motion.button>
          </div>
        </div>

        {checkIn && checkOut && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-gray-600"
          >
            <span className="font-semibold">{calculateNights()} nights</span> from {checkIn} to {checkOut}
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
          >
            {availableRooms.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Available Rooms ({availableRooms.length})
                  </h3>
                  <div className="text-sm text-gray-600">
                    {calculateNights()} nights • {checkIn} to {checkOut}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Room Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                        {room.primary_photo ? (
                          <img
                            src={`http://localhost:5000${room.primary_photo}`}
                            alt={`Room ${room.room_number}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                          <span className="text-sm font-semibold text-gray-800">
                            Room {room.room_number}
                          </span>
                        </div>
                      </div>

                      {/* Room Details */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xl font-bold text-gray-800">
                            {room.room_type?.name || 'Standard'} Room
                          </h4>
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="text-sm">{room.capacity} guests</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {room.description || room.room_type?.description || 'Comfortable room with modern amenities'}
                        </p>

                        {/* Facilities */}
                        {room.facilities && room.facilities.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {room.facilities.slice(0, 4).map((facility) => (
                                <div
                                  key={facility.id}
                                  className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600"
                                >
                                  {getFacilityIcon(facility.icon)}
                                  <span className="ml-1">{facility.name}</span>
                                </div>
                              ))}
                              {room.facilities.length > 4 && (
                                <div className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                                  +{room.facilities.length - 4} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pricing */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-sm text-gray-600">Without Breakfast</div>
                              <div className="text-lg font-bold text-gray-800">
                                {formatPrice(room.price_no_breakfast)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">With Breakfast</div>
                              <div className="text-lg font-bold text-blue-600">
                                {formatPrice(room.price_with_breakfast)}
                              </div>
                            </div>
                          </div>

                          <div className="text-center text-sm text-gray-500 mb-4">
                            Total for {calculateNights()} nights: {formatPrice(room.price_with_breakfast * calculateNights())}
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onRoomSelect && onRoomSelect(room, checkIn, checkOut)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                          >
                            Select Room
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Available Rooms
                </h3>
                <p className="text-gray-600 mb-4">
                  Sorry, no rooms are available for the selected dates.
                </p>
                <p className="text-sm text-gray-500">
                  Try different dates or contact us for assistance.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default RoomAvailabilityCalendar3D