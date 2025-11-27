import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { facilitiesAPI, roomsAPI } from '../api/rooms'

export const RoomFilter = ({ onFilter, filters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    room_type: '',
    min_price: '',
    max_price: '',
    capacity: '',
    facilities: [],
    ...filters
  })

  const { data: facilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => facilitiesAPI.getFacilities(),
  })

  const { data: roomsData } = useQuery({
    queryKey: ['rooms-for-types'],
    queryFn: () => roomsAPI.getRooms(),
  })

  // Extract unique room types from rooms data
  const roomTypes = [...new Set(
    (Array.isArray(roomsData?.data) ? roomsData.data : 
     Array.isArray(roomsData) ? roomsData : [])
    .map(room => room.room_type?.name)
    .filter(Boolean)
  )].map(name => ({ value: name.toLowerCase(), label: name }))

  // Capacity options
  const capacityOptions = [
    { value: '1', label: '1 Guest' },
    { value: '2', label: '2 Guests' },
    { value: '3', label: '3 Guests' },
    { value: '4', label: '4+ Guests' }
  ]

  // Price range options
  const priceRanges = [
    { min: 0, max: 500000, label: 'Under 500K' },
    { min: 500000, max: 1000000, label: '500K - 1M' },
    { min: 1000000, max: 2000000, label: '1M - 2M' },
    { min: 2000000, max: '', label: 'Above 2M' }
  ]

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleInputChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    console.log('🔄 FILTER CHANGED:', newFilters)
    onFilter(newFilters)
  }

  const handleFacilityToggle = (facilityId) => {
    const currentFacilities = localFilters.facilities || []
    const newFacilities = currentFacilities.includes(facilityId)
      ? currentFacilities.filter(id => id !== facilityId)
      : [...currentFacilities, facilityId]
    
    const newFilters = { ...localFilters, facilities: newFacilities }
    setLocalFilters(newFilters)
    console.log('🔄 FACILITIES CHANGED:', newFilters)
    onFilter(newFilters)
  }

  const handlePriceRangeSelect = (min, max) => {
    const newFilters = { 
      ...localFilters, 
      min_price: min, 
      max_price: max 
    }
    setLocalFilters(newFilters)
    console.log('🔄 PRICE RANGE CHANGED:', newFilters)
    onFilter(newFilters)
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
    console.log('🔄 CLEARED ALL FILTERS')
    onClearFilters()
  }

  // Hitung jumlah filter aktif
  const activeFiltersCount = Object.values(localFilters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== ''
  }).length

  console.log('📊 CURRENT LOCAL FILTERS:', localFilters)
  console.log('📊 ACTIVE FILTERS COUNT:', activeFiltersCount)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        {/* Room Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Room Type
          </label>
          <div className="space-y-2">
            {roomTypes.map(type => (
              <label key={type.value} className="flex items-center">
                <input
                  type="radio"
                  name="room_type"
                  value={type.value}
                  checked={localFilters.room_type === type.value}
                  onChange={(e) => handleInputChange('room_type', e.target.value)}
                  className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {type.label}
                </span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="room_type"
                value=""
                checked={localFilters.room_type === ''}
                onChange={(e) => handleInputChange('room_type', e.target.value)}
                className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                All Types
              </span>
            </label>
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Price Range (per night)
          </label>
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name="price_range"
                  checked={localFilters.min_price == range.min && localFilters.max_price == range.max}
                  onChange={() => handlePriceRangeSelect(range.min, range.max)}
                  className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {range.label}
                </span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="price_range"
                checked={localFilters.min_price === '' && localFilters.max_price === ''}
                onChange={() => handlePriceRangeSelect('', '')}
                className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Any Price
              </span>
            </label>
          </div>
        </div>

        {/* Custom Price Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Min Price
            </label>
            <input
              type="number"
              placeholder="0"
              value={localFilters.min_price}
              onChange={(e) => handleInputChange('min_price', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Max Price
            </label>
            <input
              type="number"
              placeholder="Any"
              value={localFilters.max_price}
              onChange={(e) => handleInputChange('max_price', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Capacity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Capacity
          </label>
          <select
            value={localFilters.capacity}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="">Any Capacity</option>
            {capacityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Facilities Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Facilities
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {facilities?.data?.map(facility => (
              <label key={facility.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.facilities?.includes(facility.id) || false}
                  onChange={() => handleFacilityToggle(facility.id)}
                  className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {facility.icon && <span className="mr-2">{facility.icon}</span>}
                  {facility.name}
                </span>
              </label>
            ))}
            {(!facilities?.data || facilities.data.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No facilities available
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={clearAllFilters}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300 mb-2"
          >
            Reset Filters
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Showing only available rooms
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoomFilter