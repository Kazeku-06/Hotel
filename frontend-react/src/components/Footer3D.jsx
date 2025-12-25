import { motion } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Star,
  Award,
  Shield,
  Clock
} from 'lucide-react'

const Footer3D = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', color: 'hover:text-sky-500' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-600' },
    { icon: Youtube, href: '#', color: 'hover:text-red-600' }
  ]

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Rooms & Suites', href: '/rooms' },
    { name: 'Dining', href: '/dining' },
    { name: 'Facilities', href: '/facilities' },
    { name: 'Events', href: '/events' },
    { name: 'Contact', href: '/contact' }
  ]

  const services = [
    { name: 'Room Service', href: '#' },
    { name: 'Concierge', href: '#' },
    { name: 'Spa & Wellness', href: '#' },
    { name: 'Business Center', href: '#' },
    { name: 'Airport Transfer', href: '#' },
    { name: 'Laundry Service', href: '#' }
  ]

  const awards = [
    { icon: Star, text: '5-Star Rating' },
    { icon: Award, text: 'Best Service 2024' },
    { icon: Shield, text: 'Safe & Secure' },
    { icon: Clock, text: '24/7 Support' }
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Hotel Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">GI</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Grand Imperion</h3>
                  <p className="text-gray-400 text-sm">Luxury Hotel</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Experience unparalleled luxury and comfort in the heart of the city. 
                Where every moment becomes a cherished memory.
              </p>

              {/* Awards */}
              <div className="grid grid-cols-2 gap-3">
                {awards.map((award, index) => {
                  const IconComponent = award.icon
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg p-3"
                    >
                      <IconComponent className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-gray-300">{award.text}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-blue-500 rounded-full group-hover:w-2 transition-all duration-300" />
                      <span>{link.name}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={service.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-purple-500 rounded-full group-hover:w-2 transition-all duration-300" />
                      <span>{service.name}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white">Contact Info</h4>
              <div className="space-y-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg"
                >
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">
                      Jl. Sudirman No. 123<br />
                      Jakarta Pusat, 10220<br />
                      Indonesia
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg"
                >
                  <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">+62 21 1234 5678</p>
                    <p className="text-gray-400 text-xs">24/7 Available</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg"
                >
                  <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">info@grandimperion.com</p>
                    <p className="text-gray-400 text-xs">We'll reply within 24h</p>
                  </div>
                </motion.div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <h5 className="text-sm font-semibold mb-3 text-gray-300">Follow Us</h5>
                <div className="flex space-x-3">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <motion.a
                        key={index}
                        href={social.href}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:bg-white/20`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.a>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-gray-700"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-2">Stay Updated</h4>
              <p className="text-gray-400 mb-6">Subscribe to our newsletter for exclusive offers and updates</p>
              
              <div className="max-w-md mx-auto flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-r-lg transition-all duration-300"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © {currentYear} Grand Imperion Hotel. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <motion.a 
                  whileHover={{ color: '#ffffff' }}
                  href="#" 
                  className="hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </motion.a>
                <motion.a 
                  whileHover={{ color: '#ffffff' }}
                  href="#" 
                  className="hover:text-white transition-colors duration-300"
                >
                  Terms of Service
                </motion.a>
                <motion.a 
                  whileHover={{ color: '#ffffff' }}
                  href="#" 
                  className="hover:text-white transition-colors duration-300"
                >
                  Cookie Policy
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ 
          y: [0, 15, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 right-16 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
      />
    </footer>
  )
}

export default Footer3D