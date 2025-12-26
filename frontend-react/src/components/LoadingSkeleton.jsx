import { motion } from 'framer-motion'

export const RoomCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden"
  >
    {/* Image skeleton */}
    <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-gradient" />
    
    {/* Content skeleton */}
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-gradient w-3/4" />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-gradient w-1/2" />
        </div>
        <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-gradient" />
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-gradient" />
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-gradient w-5/6" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-gradient" />
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <div className="space-y-1">
          <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-gradient" />
          <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-gradient" />
        </div>
        <div className="h-12 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-gradient" />
      </div>
    </div>
  </motion.div>
)

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="animate-pulse space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 items-center">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
      </div>
    ))}
  </div>
)