import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomsAPI, facilitiesAPI } from '../../api/rooms'
import { formatCurrency } from '../../utils/formatCurrency'
import { useState, useMemo, useEffect } from 'react'

export const AdminRooms = () => {
  const [showModal, setShowModal] = useState(false)
  const [showFacilityModal, setShowFacilityModal] = useState(false)
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedFacilities, setSelectedFacilities] = useState([])
  const [newFacility, setNewFacility] = useState({ name: '', icon: '' })
  const [newRoomType, setNewRoomType] = useState({ name: '', description: '' })
  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    capacity: 2,
    price_no_breakfast: '',
    price_with_breakfast: '',
    description: '',
    status: 'available'
  })
  
  const queryClient = useQueryClient()

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    console.log('🔐 DEBUG - AdminRooms mounted:')
    console.log('  - Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing')
    console.log('  - User:', userStr ? JSON.parse(userStr) : 'Missing')
    
    if (!token || !userStr) {
      alert('Please log in to access admin features')
      window.location.href = '/login'
      return
    }
    
    try {
      const userData = JSON.parse(userStr)
      if (userData.role !== 'admin') {
        alert('Admin access required. Your role: ' + userData.role)
        window.location.href = '/'
      }
    } catch (e) {
      console.error('Error parsing user data:', e)
      window.location.href = '/login'
    }
  }, [])

  // Query untuk admin rooms dengan auth
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: () => roomsAPI.getAdminRooms(),
    retry: 1
  })

  // Query untuk facilities
  const { data: facilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => facilitiesAPI.getFacilities(),
  })

  // Query untuk room types
  const { data: roomTypes, error: roomTypesError } = useQuery({
    queryKey: ['room-types'],
    queryFn: () => roomsAPI.getRoomTypes(),
    retry: 1,
    onError: (error) => {
      console.warn('⚠️ Room types endpoint not available:', error.message)
    }
  })

  // Extract room types dengan handle response structure yang berbeda
  const availableRoomTypes = useMemo(() => {
    console.log('🎯 Room Types Data from API:', roomTypes)
    
    if (roomTypes?.data) {
      // Structure 1: { success: true, data: [], count: number }
      if (roomTypes.data.success && Array.isArray(roomTypes.data.data)) {
        return roomTypes.data.data
      }
      // Structure 2: langsung array
      else if (Array.isArray(roomTypes.data)) {
        return roomTypes.data
      }
    }
    
    // Fallback: extract dari rooms data
    console.log('🔄 Using fallback: extracting room types from rooms data')
    if (!rooms?.data) return []
    
    const roomTypesMap = {}
    rooms.data.forEach(room => {
      if (room.room_type && room.room_type.id && room.room_type.name) {
        roomTypesMap[room.room_type.id] = {
          id: room.room_type.id,
          name: room.room_type.name,
          description: room.room_type.description
        }
      }
    })
    
    return Object.values(roomTypesMap)
  }, [rooms?.data, roomTypes?.data])

  // Mutation untuk create room dengan form data
  const createRoomMutation = useMutation({
    mutationFn: (formDataWithFiles) => roomsAPI.createRoomWithPhotos(formDataWithFiles),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
      setShowModal(false)
      resetForm()
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create room')
    }
  })

  // Mutation untuk update room dengan form data
  const updateRoomMutation = useMutation({
    mutationFn: ({ id, formData }) => roomsAPI.updateRoomWithPhotos(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
      setShowModal(false)
      setEditingRoom(null)
      resetForm()
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update room')
    }
  })

  // Mutation untuk delete room
  const deleteRoomMutation = useMutation({
    mutationFn: (id) => roomsAPI.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete room')
    }
  })

  // Mutation untuk delete photo
  const deletePhotoMutation = useMutation({
    mutationFn: ({ roomId, photoId }) => roomsAPI.deleteRoomPhoto(roomId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete photo')
    }
  })

  // Mutation untuk create new facility
  const createFacilityMutation = useMutation({
    mutationFn: (data) => facilitiesAPI.createFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['facilities'])
      setNewFacility({ name: '', icon: '' })
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create facility')
    }
  })

  // Mutation untuk create new room type
  const createRoomTypeMutation = useMutation({
    mutationFn: (data) => {
      console.log('🔐 DEBUG - Creating room type with data:', data)
      return roomsAPI.createRoomType(data)
    },
    onSuccess: (response) => {
      console.log('✅ DEBUG - Room type created successfully:', response.data)
      queryClient.invalidateQueries(['room-types'])
      setNewRoomType({ name: '', description: '' })
      setShowRoomTypeModal(false)
      alert('Room type created successfully!')
    },
    onError: (error) => {
      console.error('❌ DEBUG - Failed to create room type:')
      console.error('  - Error:', error)
      console.error('  - Response:', error.response)
      console.error('  - Status:', error.response?.status)
      console.error('  - Data:', error.response?.data)
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else if (error.response?.status === 403) {
        alert('Admin access required.')
      } else if (error.response?.status === 404) {
        alert('Endpoint not found. Please check the server URL.')
      } else {
        alert(error.response?.data?.message || 'Failed to create room type.')
      }
    }
  })

  // Function untuk toggle facility selection
  const toggleFacility = (facilityId) => {
    setSelectedFacilities(prev => {
      if (prev.includes(facilityId)) {
        return prev.filter(id => id !== facilityId);
      } else {
        return [...prev, facilityId];
      }
    });
  };

  const getStatusColor = (status) => {
    return status === 'available' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : status === 'booked'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const resetForm = () => {
    setFormData({
      room_number: '',
      room_type_id: '',
      capacity: 2,
      price_no_breakfast: '',
      price_with_breakfast: '',
      description: '',
      status: 'available'
    })
    setSelectedFiles([])
    setSelectedFacilities([])
    setEditingRoom(null)
  }

  const handleEdit = (room) => {
    setEditingRoom(room)
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      capacity: room.capacity,
      price_no_breakfast: room.price_no_breakfast,
      price_with_breakfast: room.price_with_breakfast,
      description: room.description || '',
      status: room.status
    })
    setSelectedFiles([])
    
    // PERBAIKAN: Pastikan facilities tersync dengan benar
    if (room.facility_rooms && room.facility_rooms.length > 0) {
      const facilityIds = room.facility_rooms.map(fr => fr.facility_id);
      setSelectedFacilities(facilityIds);
      console.log('🔧 DEBUG - Editing room facilities:', facilityIds)
    } else {
      setSelectedFacilities([]);
    }
    
    setShowModal(true)
  }

  const handleDelete = (room) => {
    if (window.confirm(`Are you sure you want to delete room ${room.room_number}?`)) {
      deleteRoomMutation.mutate(room.id)
    }
  }

  const handleDeletePhoto = (roomId, photoId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deletePhotoMutation.mutate({ roomId, photoId })
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateFacility = () => {
    if (newFacility.name.trim()) {
      createFacilityMutation.mutate(newFacility)
    }
  }

  // Handle create room type dengan better debugging
  const handleCreateRoomType = async () => {
    if (!newRoomType.name.trim()) {
      alert('Room type name is required')
      return
    }

    // Debug authentication sebelum API call
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    console.log('🔐 DEBUG - Authentication check before room type creation:')
    console.log('  - Token:', token ? 'Present' : 'Missing')
    console.log('  - User:', userStr ? JSON.parse(userStr) : 'Missing')
    
    if (!token) {
      alert('❌ No authentication token found. Please log in.')
      window.location.href = '/login'
      return
    }

    try {
      console.log('🚀 DEBUG - Proceeding with room type creation...')
      await createRoomTypeMutation.mutateAsync(newRoomType)
    } catch (error) {
      // Error sudah dihandle di onError
      console.error('Create room type final error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validasi room type
    if (!formData.room_type_id) {
      alert('Please select a room type')
      return
    }
    
    const formDataToSend = new FormData()
    formDataToSend.append('room_number', formData.room_number)
    formDataToSend.append('room_type_id', formData.room_type_id)
    formDataToSend.append('capacity', formData.capacity.toString())
    formDataToSend.append('price_no_breakfast', formData.price_no_breakfast.toString())
    formDataToSend.append('price_with_breakfast', formData.price_with_breakfast.toString())
    formDataToSend.append('description', formData.description)
    formDataToSend.append('status', formData.status)
    
    // PERBAIKAN: Append facilities dengan format yang benar
    selectedFacilities.forEach(facilityId => {
      formDataToSend.append('facilities[]', facilityId)
    })
    
    // Debug: log facilities yang akan dikirim
    console.log('🔧 DEBUG - Facilities to send:', selectedFacilities)
    
    // Append files
    selectedFiles.forEach(file => {
      formDataToSend.append('photos', file)
    })
    
    try {
      if (editingRoom) {
        await updateRoomMutation.mutateAsync({ 
          id: editingRoom.id, 
          formData: formDataToSend 
        })
      } else {
        createRoomMutation.mutate(formDataToSend)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save room')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Render facilities untuk room
  const renderRoomFacilities = (room) => {
    if (!room.facility_rooms || room.facility_rooms.length === 0) {
      return <span className="text-gray-400 text-sm">No facilities</span>
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {room.facility_rooms.slice(0, 3).map((fr) => (
          <span 
            key={fr.facility_id}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            {fr.facility?.name}
          </span>
        ))}
        {room.facility_rooms.length > 3 && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            +{room.facility_rooms.length - 3}
          </span>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Manage Rooms
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all hotel rooms | Room Types: {availableRoomTypes.length}
              {roomTypesError && (
                <span className="text-yellow-600 ml-2">
                  (Using fallback data)
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 font-semibold"
          >
            Add New Room
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Failed to load rooms</p>
            <p className="text-sm mt-1">
              {error.response?.data?.message || error.message}
            </p>
          </div>
        )}

        {!error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Facilities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Photos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {rooms?.data?.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            {room.photos && room.photos.length > 0 ? (
                              <img 
                                src={`http://localhost:5000${room.photos.find(p => p.is_primary)?.photo_path || room.photos[0].photo_path}`}
                                alt={room.room_number}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 dark:text-gray-300">🏨</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {room.room_number}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {room.photos?.length || 0} photos
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {room.room_type?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderRoomFacilities(room)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {room.photos?.slice(0, 3).map((photo) => (
                            <div key={photo.id} className="relative">
                              <img 
                                src={`http://localhost:5000${photo.photo_path}`}
                                alt="Room"
                                className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                              />
                              {photo.is_primary && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                          ))}
                          {room.photos?.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                              +{room.photos.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {room.capacity} people
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(room.price_no_breakfast)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(room)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 transition-colors duration-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(room)}
                          disabled={deleteRoomMutation.isLoading}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!error && rooms?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                No rooms found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start by adding your first room to the system.
              </p>
            </div>
          </div>
        )}

        {/* Add/Edit Room Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {editingRoom ? 'Edit Room' : 'Add New Room'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Room Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                      placeholder="e.g., 101"
                    />
                  </div>

                  {/* Room Type */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Room Type * ({availableRoomTypes.length} available)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRoomTypeModal(true)}
                        className="text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        + Add New Type
                      </button>
                    </div>
                    <select
                      name="room_type_id"
                      value={formData.room_type_id}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="">Select Room Type</option>
                      {availableRoomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} {type.description && `- ${type.description}`}
                        </option>
                      ))}
                    </select>
                    {availableRoomTypes.length === 0 && (
                      <p className="text-red-500 text-sm mt-1">
                        No room types available. Please add a room type first.
                      </p>
                    )}
                  </div>

                  {/* Facilities Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Facilities
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">
                          Select Facilities {selectedFacilities.length > 0 && `(${selectedFacilities.length} selected)`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFacilityModal(true)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Add New Facility
                        </button>
                      </div>
                      
                      {/* Available Facilities untuk dipilih */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Available facilities ({facilities?.data?.length || 0}):
                        </p>
                        {facilities?.data && facilities.data.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {facilities.data.map((facility) => (
                              <button
                                key={facility.id}
                                type="button"
                                onClick={() => toggleFacility(facility.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                                  selectedFacilities.includes(facility.id)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                              >
                                {facility.icon && <span className="mr-1">{facility.icon}</span>}
                                {facility.name}
                                {selectedFacilities.includes(facility.id) && (
                                  <span className="ml-1">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No facilities available</p>
                        )}
                      </div>

                      {/* Selected Facilities Preview */}
                      {selectedFacilities.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Selected facilities:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedFacilities.map(facilityId => {
                              const facility = facilities?.data?.find(f => f.id === facilityId);
                              return facility ? (
                                <div key={facility.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                                  {facility.icon && <span className="mr-1">{facility.icon}</span>}
                                  <span className="text-sm">{facility.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => toggleFacility(facility.id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Photos
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 inline-block mb-3"
                      >
                        Choose Photos
                      </label>
                      
                      {/* Selected Files Preview */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Selected files ({selectedFiles.length}):
                          </p>
                          <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSelectedFile(index)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Existing Photos for Edit Mode */}
                      {editingRoom && editingRoom.photos && editingRoom.photos.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Current photos:
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {editingRoom.photos.map((photo) => (
                              <div key={photo.id} className="relative group">
                                <img 
                                  src={`http://localhost:5000${photo.photo_path}`}
                                  alt="Room"
                                  className="h-16 w-16 object-cover rounded border-2 border-gray-300 dark:border-gray-600"
                                />
                                {photo.is_primary && (
                                  <div className="absolute top-0 right-0 w-3 h-3 bg-gold-500 rounded-full border-2 border-white"></div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeletePhoto(editingRoom.id, photo.id, e)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Upload room photos (PNG, JPG, JPEG, GIF, WEBP). First photo will be set as primary.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Capacity *
                      </label>
                      <select
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="booked">Booked</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (No Breakfast) *
                      </label>
                      <input
                        type="number"
                        name="price_no_breakfast"
                        value={formData.price_no_breakfast}
                        onChange={handleChange}
                        required
                        min="0"
                        step="1000"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                        placeholder="500000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (With Breakfast) *
                      </label>
                      <input
                        type="number"
                        name="price_with_breakfast"
                        value={formData.price_with_breakfast}
                        onChange={handleChange}
                        required
                        min="0"
                        step="1000"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                        placeholder="600000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                      placeholder="Room description..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createRoomMutation.isLoading || updateRoomMutation.isLoading || availableRoomTypes.length === 0}
                      className="flex-1 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300"
                    >
                      {(createRoomMutation.isLoading || updateRoomMutation.isLoading) ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {editingRoom ? 'Updating...' : 'Adding...'}
                        </div>
                      ) : (
                        editingRoom ? 'Update Room' : 'Add Room'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Room Type Modal */}
        {showRoomTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Add New Room Type
                  </h3>
                  <button
                    onClick={() => {
                      setShowRoomTypeModal(false)
                      setNewRoomType({ name: '', description: '' })
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Type Name *
                    </label>
                    <input
                      type="text"
                      value={newRoomType.name}
                      onChange={(e) => setNewRoomType({...newRoomType, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                      placeholder="e.g., Deluxe, Suite, Executive"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newRoomType.description}
                      onChange={(e) => setNewRoomType({...newRoomType, description: e.target.value})}
                      rows="3"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                      placeholder="e.g., Spacious room with premium amenities..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoomTypeModal(false)
                        setNewRoomType({ name: '', description: '' })
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateRoomType}
                      disabled={!newRoomType.name.trim() || createRoomTypeMutation.isLoading}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300"
                    >
                      {createRoomTypeMutation.isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add Room Type'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRooms