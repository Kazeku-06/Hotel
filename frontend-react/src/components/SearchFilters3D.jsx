import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, 
  X, 
  DollarSign, 
  Users, 
  Home, 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Wind,
  ChevronDown,
  RotateCcw
} from 'lucide-react'

const SearchFilters3D = ({ filters, onFilter, onClearFilters, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const roomTypes = [
    { value: '', label: 'All Types' },
    { value: 'Standard', label: 'Standard Room' },
    { value: 'Deluxe', label: 'Deluxe Room' },
    { value: 'Suite', label: 'Suite' },
    { value: 'Presidential', label: 'Presidential Suite' }
  ]

  const capacityOptions = [
    { value: '', label: 'Any Capacity' },
    { value: '1', label: '1 Guest' },
    { value: '2', label: '2 Guests' },
    { value: '3', label: '3 Guests' },
    { value: '4', label: '4+ Guests' }
  ]

  const facilityOptions = [
    { value: 'WiFi', label: 'WiFi', icon: Wifi },
    { value: 'Parking', label: 'Parking', icon: Car },
    { value: 'Breakfast', label: 'Breakfast', icon: Coffee },
    { value: 'TV', label: 'TV', icon: Tv },
    { value: 'AC', label: 'Air Conditioning', icon: Wind }
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleFacilityToggle = (facility) => {
    const currentFacilities = localFilters.facilities || []
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(f => f !== facility)
      : [...currentFacilities, facility]
    
    handleFilterChange('facilities', newFacilities)
  }

  const applyFilters = () => {
    onFilter(localFilters)
    setIsOpen(false)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      room_type: '',
      min_price: '',
      max_price: '',
      capacity: '',
      facilities: []
    }
    setLocalFilters(clearedFilters)
    onClearFilters()
    setIsOpen(false)
  }

  const activeFiltersCount = Object.values(localFilters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== ''
  }).length

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 hover:border-blue-400 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 w-full lg:w-auto"
      >
        <Filter className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Filter Content */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 lg:right-auto lg:w-80 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Filter Rooms</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
                {/* Room Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Home className="inline w-4 h-4 mr-1" />
                    Room Type
                  </label>
                  <select
                    value={localFilters.room_type}
                    onChange={(e) => handleFilterChange('room_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {roomTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Price Range (IDR)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min price"
                      value={localFilters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max price"
                      value={localFilters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Users className="inline w-4 h-4 mr-1" />
                    Capacity
                  </label>
                  <select
                    value={localFilters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {capacityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Facilities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Facilities
                  </label>
                  <div className="space-y-2">
                    {facilityOptions.map(facility => {
                      const IconComponent = facility.icon
                      const isSelected = (localFilters.facilities || []).includes(facility.value)
                      
                      return (
                        <motion.button
                          key={facility.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleFacilityToggle(facility.value)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="font-medium">{facility.label}</span>
                          {isSelected && (
                            <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAllFilters}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyFilters}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchFilters3D