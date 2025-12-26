import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Calendar, Percent, Gift, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { enhancedAPI } from '../api/enhanced'

const PromotionsBanner3D = () => {
  const [promotions, setPromotions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const response = await enhancedAPI.getActivePromotions()
      setPromotions(response.promotions || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-slide promotions
  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % promotions.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [promotions.length])

  const nextPromotion = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length)
  }

  const prevPromotion = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDiscountText = (promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}% OFF`
    } else {
      return `Rp ${promotion.discount_value.toLocaleString('id-ID')} OFF`
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-8 text-white text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"
        />
        <p className="mt-4">Loading promotions...</p>
      </motion.div>
    )
  }

  if (promotions.length === 0) {
    return null
  }

  const currentPromotion = promotions[currentIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl shadow-2xl mb-8"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 p-8 text-white relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-white bg-opacity-20 p-3 rounded-full mr-4"
                  >
                    <Gift className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">
                      {currentPromotion.title}
                    </h3>
                    <div className="flex items-center text-white text-opacity-90">
                      <Tag className="w-4 h-4 mr-2" />
                      <span className="text-lg font-semibold">
                        {getDiscountText(currentPromotion)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-white text-opacity-90 mb-4 text-lg">
                  {currentPromotion.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Valid until {formatDate(currentPromotion.valid_until)}</span>
                  </div>
                  
                  {currentPromotion.min_nights > 1 && (
                    <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Min {currentPromotion.min_nights} nights</span>
                    </div>
                  )}

                  {currentPromotion.room_type && (
                    <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      <span>{currentPromotion.room_type.name} rooms only</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Badge */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="hidden md:block ml-8"
              >
                <div className="bg-white text-orange-500 rounded-full w-32 h-32 flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <Percent className="w-8 h-8 mx-auto mb-1" />
                    <div className="text-2xl font-bold">
                      {currentPromotion.discount_type === 'percentage' 
                        ? `${currentPromotion.discount_value}%`
                        : 'SAVE'
                      }
                    </div>
                    <div className="text-xs font-semibold">OFF</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {promotions.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevPromotion}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextPromotion}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}

          {/* Dots Indicator */}
          {promotions.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {promotions.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default PromotionsBanner3D