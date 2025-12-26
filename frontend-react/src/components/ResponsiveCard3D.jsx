import { motion } from 'framer-motion'

const ResponsiveCard3D = ({ 
  children, 
  className = '', 
  padding = 'p-4 md:p-6 lg:p-8',
  rounded = 'rounded-xl md:rounded-2xl',
  shadow = 'shadow-lg hover:shadow-xl',
  background = 'bg-white',
  border = 'border border-gray-200',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${background} ${rounded} ${shadow} ${border} ${padding} transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default ResponsiveCard3D