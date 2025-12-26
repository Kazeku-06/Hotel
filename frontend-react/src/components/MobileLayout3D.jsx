import { motion } from 'framer-motion'

const MobileLayout3D = ({ 
  children, 
  className = '',
  padding = 'px-4 sm:px-6 lg:px-8',
  maxWidth = 'max-w-7xl',
  center = true,
  ...props 
}) => {
  return (
    <div className={`${maxWidth} ${center ? 'mx-auto' : ''} ${padding} ${className}`} {...props}>
      {children}
    </div>
  )
}

const Section = ({ 
  children, 
  className = '',
  spacing = 'py-8 md:py-12 lg:py-16',
  background = '',
  ...props 
}) => {
  return (
    <section className={`${spacing} ${background} ${className}`} {...props}>
      {children}
    </section>
  )
}

const Grid = ({ 
  children, 
  cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  gap = 'gap-6 md:gap-8',
  className = '',
  ...props 
}) => {
  return (
    <div className={`grid ${cols} ${gap} ${className}`} {...props}>
      {children}
    </div>
  )
}

const Stack = ({ 
  children, 
  spacing = 'space-y-4 md:space-y-6',
  className = '',
  ...props 
}) => {
  return (
    <div className={`${spacing} ${className}`} {...props}>
      {children}
    </div>
  )
}

const Flex = ({ 
  children, 
  direction = 'flex-col sm:flex-row',
  align = 'items-start sm:items-center',
  justify = 'justify-start',
  gap = 'gap-4',
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex ${direction} ${align} ${justify} ${gap} ${className}`} {...props}>
      {children}
    </div>
  )
}

const Text = ({ 
  children, 
  variant = 'body',
  className = '',
  ...props 
}) => {
  const variants = {
    h1: 'text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800',
    h2: 'text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800',
    h3: 'text-xl md:text-2xl font-bold text-gray-800',
    h4: 'text-lg md:text-xl font-semibold text-gray-800',
    body: 'text-sm md:text-base text-gray-600',
    small: 'text-xs md:text-sm text-gray-500',
    caption: 'text-xs text-gray-400'
  }

  const Component = variant.startsWith('h') ? variant : 'p'
  
  return (
    <Component className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  )
}

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    secondary: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-sm md:text-base',
    lg: 'py-4 px-8 text-base md:text-lg'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl 
        flex items-center justify-center space-x-2
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}

MobileLayout3D.Section = Section
MobileLayout3D.Grid = Grid
MobileLayout3D.Stack = Stack
MobileLayout3D.Flex = Flex
MobileLayout3D.Text = Text
MobileLayout3D.Button = Button

export default MobileLayout3D