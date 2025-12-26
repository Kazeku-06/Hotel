import { motion } from 'framer-motion'

const ResponsiveGrid3D = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className = '',
  stagger = true
}) => {
  const gridClasses = `
    grid gap-${gap}
    grid-cols-${cols.sm}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
    ${className}
  `

  if (stagger) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className={gridClasses}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

export default ResponsiveGrid3D