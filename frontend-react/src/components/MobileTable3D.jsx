import { motion } from 'framer-motion'

const MobileTable3D = ({ data, columns, onRowClick, className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          onClick={() => onRowClick && onRowClick(item)}
          className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm font-medium text-gray-600 capitalize">
                {column.header}
              </span>
              <span className="text-sm text-gray-900 text-right max-w-[60%] truncate">
                {column.render ? column.render(item) : item[column.key]}
              </span>
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

export default MobileTable3D