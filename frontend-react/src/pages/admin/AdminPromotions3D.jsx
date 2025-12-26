import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../api/admin'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiPercent, 
  FiDollarSign, 
  FiCalendar,
  FiTag,
  FiEye,
  FiEyeOff
} from 'react-icons/fi'

const AdminPromotions3D = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_nights: '1',
    valid_from: '',
    valid_until: '',
    is_active: true,
    room_type_id: ''
  })

  const queryClient = useQueryClient()

  // Fetch promotions
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: adminAPI.getPromotions
  })

  // Fetch room types for dropdown
  const { data: roomTypes = [] } = useQuery({
    queryKey: ['room-types'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/room-types')
      return response.json()
    }
  })

  // Create promotion mutation
  const createMutation = useMutation({
    mutationFn: adminAPI.createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-promotions'])
      setShowCreateModal(false)
      resetForm()
    }
  })

  // Update promotion mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-promotions'])
      setEditingPromotion(null)
      resetForm()
    }
  })

  // Delete promotion mutation
  const deleteMutation = useMutation({
    mutationFn: adminAPI.deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-promotions'])
    }
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_nights: '1',
      valid_from: '',
      valid_until: '',
      is_active: true,
      room_type_id: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discount_ty 1,
      valid_from: '',
      valid_until: '',
      is_active: true,
      room_type_id: ''
    })
  }

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && promotion.is_active) ||
                         (filterStatus === 'inactive' && !promotion.is_active)
    
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDiscountText = (promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}%`
    } else {
      return `Rp ${promotion.discount_value.toLocaleString('id-ID')}`
    }
  }

  const isPromotionActive = (promotion) => {
    const today = new Date()
    const validFrom = new Date(promotion.valid_from)
    const validUntil = new Date(promotion.valid_until)
    return promotion.is_active && today >= validFrom && today <= validUntil
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Promotions Management
            </h1>
            <p className="text-gray-600 mt-2">Manage hotel promotions and special offers</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm()
              setEditingPromotion(null)
              setShowCreateModal(true)
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Promotion
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search promotions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Promotions</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Promotions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPromotions.map((promotion, index) => (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className={`p-4 ${isPromotionActive(promotion) 
                ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                : promotion.is_active 
                  ? 'bg-gradient-to-r from-orange-400 to-pink-500'
                  : 'bg-gradient-to-r from-gray-400 to-gray-600'
              } text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      {isPromotionActive(promotion) ? 'ACTIVE' : promotion.is_active ? 'SCHEDULED' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(promotion)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(promotion.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Percent className="w-6 h-6 mr-2" />
                  <span className="text-2xl font-bold">
                    {getDiscountText(promotion)} OFF
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {promotion.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {promotion.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatDate(promotion.valid_from)} - {formatDate(promotion.valid_until)}
                    </span>
                  </div>
                  
                  {promotion.min_nights > 1 && (
                    <div className="flex items-center text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>Min {promotion.min_nights} nights</span>
                    </div>
                  )}

                  {promotion.room_type && (
                    <div className="flex items-center text-gray-600">
                      <span className="w-4 h-4 mr-2 bg-blue-500 rounded-full"></span>
                      <span>{promotion.room_type.name} rooms only</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created {formatDate(promotion.created_at)}
                    </span>
                    <div className="flex items-center">
                      {promotion.is_active ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredPromotions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Promotions Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first promotion to get started'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Summer Special Offer"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your promotion..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Type *
                      </label>
                      <select
                        required
                        value={formData.discount_type}
                        onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step={formData.discount_type === 'percentage' ? '1' : '1000'}
                        value={formData.discount_value}
                        onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={formData.discount_type === 'percentage' ? '10' : '100000'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Nights
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.min_nights}
                        onChange={(e) => setFormData({...formData, min_nights: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type (Optional)
                      </label>
                      <select
                        value={formData.room_type_id}
                        onChange={(e) => setFormData({...formData, room_type_id: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Room Types</option>
                        <option value="1">Standard</option>
                        <option value="2">Deluxe</option>
                        <option value="3">Suite</option>
                        <option value="4">Presidential</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid From *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.valid_from}
                        onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid Until *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.valid_until}
                        onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                          className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Active (promotion will be visible to customers)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        setEditingPromotion(null)
                        resetForm()
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminPromotions3D