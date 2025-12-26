import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const MobileTable3D = ({ 
  data = [], 
  columns = [], 
  onRowClick = null,
  renderMobileCard = null,
  className = ''
}) => {
  const defaultMobileCard = (item, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-lg p-4 mb-4 ${
        onRowClick ? 'cursor-pointer hover:shadow-xl transition-shadow duration-300' : ''
      }`}
      onClick={() => onRowClick && onRowClick(item)}
    >
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <span className="text-sm font-medium text-gray-600">{column.header}</span>
          <span className="text-sm text-gray-800 font-semibold">
            {typeof column.accessor === 'function' 
              ? column.accessor(item) 
              : item[column.accessor]
            }
          </span>
        </div>
      ))}
      {onRowClick && (
        <div className="flex justify-end mt-3">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </motion.div>
  )

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-4 text-left text-sm font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-800">
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : item[column.accessor]
                    }
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {data.map((item, index) => 
          renderMobileCard ? renderMobileCard(item, index) : defaultMobileCard(item, index)
        )}
      </div>
    </div>
  )
}

export default MobileTable3D