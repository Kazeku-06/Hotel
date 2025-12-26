import { motion } from 'framer-motion'

const MobileForm3D = ({ 
  children, 
  onSubmit, 
  title,
  subtitle,
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg p-4 md:p-8 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6 text-center md:text-left">
          {title && (
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
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
      
      <form onSubmit={onSubmit} className="space-y-4 md:space-y-6" {...props}>
        {children}
      </form>
    </motion.div>
  )
}

const FormField = ({ 
  label, 
  children, 
  error, 
  required = false,
  className = '' 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

const FormInput = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  icon: Icon,
  ...props 
}) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-300 text-sm md:text-base
          ${Icon ? 'pl-12' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

const FormSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option',
  className = '',
  icon: Icon,
  ...props 
}) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      )}
      <select
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-300 appearance-none bg-white
          text-sm md:text-base
          ${Icon ? 'pl-12' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const FormTextarea = ({ 
  placeholder, 
  value, 
  onChange, 
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`
        w-full px-4 py-3 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-transparent 
        transition-all duration-300 resize-none
        text-sm md:text-base
        ${className}
      `}
      {...props}
    />
  )
}

const FormButton = ({ 
  children, 
  type = 'button', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm md:text-base',
    lg: 'px-8 py-4 text-base md:text-lg'
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  )
}

// Export all components
MobileForm3D.Field = FormField
MobileForm3D.Input = FormInput
MobileForm3D.Select = FormSelect
MobileForm3D.Textarea = FormTextarea
MobileForm3D.Button = FormButton

export default MobileForm3D