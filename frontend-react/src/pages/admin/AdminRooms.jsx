import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomsAPI } from '../../api/rooms'
import { formatCurrency } from '../../utils/formatCurrency'
import { useState } from 'react'

export const AdminRooms = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
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

  // Query untuk rooms dan room types
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: () => roomsAPI.getRooms()
  })

  const { data: roomTypes } = useQuery({
    queryKey: ['room-types'],
    queryFn: () => roomsAPI.getRoomTypes()
  })
  

  // Mutation untuk create room
  const createRoomMutation = useMutation({
    mutationFn: (roomData) => roomsAPI.createRoom(roomData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rooms'])
      setShowModal(false)
      resetForm()
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create room')
    }
  })

  // Mutation untuk update room
  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }) => roomsAPI.updateRoom(id, data),
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

  const getStatusColor = (status) => {
    return status === 'available' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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
    setShowModal(true)
  }

  const handleDelete = (room) => {
    if (window.confirm(`Are you sure you want to delete room ${room.room_number}?`)) {
      deleteRoomMutation.mutate(room.id)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingRoom) {
      updateRoomMutation.mutate({ id: editingRoom.id, data: formData })
    } else {
      createRoomMutation.mutate(formData)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
              View and manage all hotel rooms
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
            Failed to load rooms
          </div>
        )}

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
                {rooms?.data.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-300">🏨</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {room.room_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {room.room_type?.name}
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

        {rooms?.data.length === 0 && (
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room Type *
                    </label>
                    <select
                      name="room_type_id"
                      value={formData.room_type_id}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
                    >
                      <option value="">Select Room Type</option>
                      {roomTypes?.data?.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
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
                      disabled={createRoomMutation.isLoading || updateRoomMutation.isLoading}
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
      </div>
    </div>
  )
}

export default AdminRooms