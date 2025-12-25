import { motion } from 'framer-motion'
import Navbar3D from './Navbar3D'
import Footer3D from './Footer3D'

const Layout3D = ({ children, showHero = false }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar3D />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={showHero ? '' : 'pt-16 lg:pt-20'}
      >
        {children}
      </motion.main>
      
      <Footer3D />
    </div>
  )
}

export default Layout3D