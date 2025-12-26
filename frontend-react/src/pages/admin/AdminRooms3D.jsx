import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Home,
  Users,
  DollarSign,
  Star,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Bath,
  X,
  Save,
  Upload,
  AlertCircle
} from 'lucide-react'
import Layout3D from '../../components/Layout3D'
import { adminAPI } from '../../api/admin'

const AdminRooms3D = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('view') // view, edit, create
  const [formData, setFormData] = useState({
    room_number: '',
    name: '',
    room_type: '',
    capacity: 1,
    price_no_breakfast: '',
    price_with_breakfast: '',
    description: '',
    facilities: [],
    status: 'available'
  })

  const queryClient = useQueryClient()

  // Fetch rooms
  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: () => adminAPI.getRooms()
  })

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: adminAPI.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
      setIsModalOpen(false)
      resetForm()
    }
  })

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
      setIsModalOpen(false)
      resetForm()
    }
  })

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: adminAPI.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
    }
  })

  const facilityOptions = [
    { value: 'WiFi', label: 'WiFi', icon: Wifi },
    { value: 'Parking', label: 'Parking', icon: Car },
    { value: 'Breakfast', label: 'Breakfast', icon: Coffee },
    { value: 'TV', label: 'TV', icon: Tv },
    { value: 'AC', label: 'Air Conditioning', icon: Wind },
    { value: 'Bathroom', label: 'Private Bathroom', icon: Bath }
  ]

  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential']

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const resetForm = () => {
    setFormData({
      room_number: '',
      name: '',
      room_type: '',
      capacity: 1,
      price_no_breakfast: '',
      price_with_breakfast: '',
      description: '',
      facilities: [],
      status: 'available'
    })
    setSelectedRoom(null)
  }

  const openModal = (mode, room = null) => {
    setModalMode(mode)
    if (room) {
      setSelectedRoom(room)
      setFormData({
        room_number: room.room_number || '',
        name: room.name || '',
        room_type: room.room_type?.name || room.room_type || '',
        capacity: room.capacity || 1,
        price_no_breakfast: room.price_no_breakfast || '',
        price_with_breakfast: room.price_with_breakfast || '',
        description: room.description || '',
        facilities: room.facilities || [],
        status: room.status || 'available'
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (modalMode === 'create') {
      createRoomMutation.mutate(formData)
    } else if (modalMode === 'edit') {
      updateRoomMutation.mutate({ id: selectedRoom.id, data: formData })
    }
  }

  const handleDelete = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteRoomMutation.mutate(roomId)
    }
  }

  const toggleFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_number?.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesType = typeFilter === 'all' || room.room_type?.name === typeFilter || room.room_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  if (isLoading) {
    return (
      <Layout3D>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading rooms...</p>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Room <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
                </h1>
                <p className="text-gray-600">Manage hotel rooms and their details</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 md:px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add New Room</span>
                <span className="sm:hidden">Add Room</span>
              </motion.button>
            </div>
          </motion.div>

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
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Rooms Grid */}
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">Failed to load rooms</p>
                <p className="text-sm mt-1">Please try again later</p>
              </div>
            </motion.div>
          ) : filteredRooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-gray-100 rounded-2xl p-8 md:p-12 max-w-md mx-auto">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Rooms Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No rooms match your search criteria'
                    : 'No rooms available. Add your first room!'
                  }
                </p>
                <button
                  onClick={() => openModal('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Add First Room
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Room Image */}
                  <div className="relative h-48">
                    <img
                      src={room.image_url || room.primary_photo ? `http://localhost:5000${room.primary_photo}` : '/hotel1.jpeg'}
                      alt={room.name || `Room ${room.room_number}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/hotel1.jpeg'
                      }}
                    />
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
                      room.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : room.status === 'occupied'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {room.status}
                    </div>
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {room.room_type?.name || room.room_type || 'Standard'}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {room.name || `Room ${room.room_number}`}
                        </h3>
                        <div className="text-sm text-gray-600">
                          Room #{room.room_number}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{room.capacity || 2} guests</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatPrice(room.price_no_breakfast || 0)}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {room.description || 'Comfortable room with modern amenities.'}
                    </p>

                    {/* Facilities */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(room.facilities || ['WiFi', 'AC']).slice(0, 3).map((facility, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {typeof facility === 'string' ? facility : facility?.name || 'Unknown'}
                        </span>
                      ))}
                      {(room.facilities || []).length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{(room.facilities || []).length - 3}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal('view', room)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-1 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal('edit', room)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-1 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(room.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Modal */}
          <AnimatePresence>
            {isModalOpen && (
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
                      <h2 className="text-2xl font-bold text-gray-800">
                        {modalMode === 'create' ? 'Add New Room' : 
                         modalMode === 'edit' ? 'Edit Room' : 'Room Details'}
                      </h2>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {modalMode === 'view' ? (
                      // View Mode
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
                            <div className="text-gray-800">{selectedRoom?.room_number}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Name</label>
                            <div className="text-gray-800">{selectedRoom?.name}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                            <div className="text-gray-800">{selectedRoom?.room_type?.name || selectedRoom?.room_type}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                            <div className="text-gray-800">{selectedRoom?.capacity} guests</div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (No Breakfast)</label>
                            <div className="text-gray-800">{formatPrice(selectedRoom?.price_no_breakfast || 0)}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (With Breakfast)</label>
                            <div className="text-gray-800">{formatPrice(selectedRoom?.price_with_breakfast || 0)}</div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <div className="text-gray-800">{selectedRoom?.description}</div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Facilities</label>
                          <div className="flex flex-wrap gap-2">
                            {(selectedRoom?.facilities || []).map((facility, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {typeof facility === 'string' ? facility : facility?.name || 'Unknown'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Create/Edit Mode
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
                            <input
                              type="text"
                              value={formData.room_number}
                              onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Name</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                            <select
                              value={formData.room_type}
                              onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                              <option value="">Select Type</option>
                              {roomTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity *</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={formData.capacity}
                              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (No Breakfast) *</label>
                            <input
                              type="number"
                              value={formData.price_no_breakfast}
                              onChange={(e) => setFormData({...formData, price_no_breakfast: e.target.value})}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (With Breakfast) *</label>
                            <input
                              type="number"
                              value={formData.price_with_breakfast}
                              onChange={(e) => setFormData({...formData, price_with_breakfast: e.target.value})}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Facilities</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {facilityOptions.map(facility => {
                              const IconComponent = facility.icon
                              const isSelected = formData.facilities.includes(facility.value)
                              
                              return (
                                <button
                                  key={facility.value}
                                  type="button"
                                  onClick={() => toggleFacility(facility.value)}
                                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-300 ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                  <span className="text-sm font-medium">{facility.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-6">
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                          >
                            Cancel
                          </button>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={createRoomMutation.isLoading || updateRoomMutation.isLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            <span>
                              {createRoomMutation.isLoading || updateRoomMutation.isLoading 
                                ? 'Saving...' 
                                : modalMode === 'create' ? 'Create Room' : 'Update Room'
                              }
                            </span>
                          </motion.button>
                        </div>
                      </form>
                    )}
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

export default AdminRooms3D