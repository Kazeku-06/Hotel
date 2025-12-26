import { motion } from 'framer-motion'

const MobileForm3D = ({ 
  children, 
  onSubmit, 
  className = '',
  title,
  subtitle,
  submitText = 'Submit',
  isLoading = false,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="text-center mb-6 md:mb-8">
          {title && (
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
        {children}
        
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 md:py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>{submitText}</span>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}

const FormField = ({ 
  label, 
  icon: Icon, 
  children, 
  required = false,
  error,
  className = '' 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {Icon && <Icon className="inline w-4 h-4 mr-1" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}

MobileForm3D.Field = FormField

export default MobileForm3D