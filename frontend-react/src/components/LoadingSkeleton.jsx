export const RoomCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-200 dark:border-gray-700">
    <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
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