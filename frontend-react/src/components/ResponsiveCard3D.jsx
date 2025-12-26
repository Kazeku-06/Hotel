import { motion } from 'framer-motion'

const ResponsiveCard3D = ({ 
  children, 
  className = '', 
  hover = true, 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`
        bg-white rounded-2xl shadow-lg hover:shadow-xl 
        transition-all duration-300 overflow-hidden
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default ResponsiveCard3D