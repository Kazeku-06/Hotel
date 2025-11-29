export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-16 pb-8 border-t border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-yellow-500 text-black p-2 rounded-xl font-black text-xl">
                GI
              </div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                GRAND IMPERION
              </h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Experience unparalleled luxury and world-class service in the heart of the city. 
              Your perfect stay begins with us.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/5 hover:bg-yellow-500 hover:text-black p-3 rounded-xl transition-all duration-300 transform hover:scale-110 border border-white/10">
                <span className="text-lg">📘</span>
              </a>
              <a href="#" className="bg-white/5 hover:bg-yellow-500 hover:text-black p-3 rounded-xl transition-all duration-300 transform hover:scale-110 border border-white/10">
                <span className="text-lg">📷</span>
              </a>
              <a href="#" className="bg-white/5 hover:bg-yellow-500 hover:text-black p-3 rounded-xl transition-all duration-300 transform hover:scale-110 border border-white/10">
                <span className="text-lg">🐦</span>
              </a>
              <a href="#" className="bg-white/5 hover:bg-yellow-500 hover:text-black p-3 rounded-xl transition-all duration-300 transform hover:scale-110 border border-white/10">
                <span className="text-lg">💼</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-black text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></span>
              QUICK LINKS
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium flex items-center group">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium flex items-center group">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Rooms & Suites
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium flex items-center group">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Facilities
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium flex items-center group">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Special Offers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium flex items-center group">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-black text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></span>
              CONTACT US
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-500 text-black p-2 rounded-lg mt-1">
                  📍
                </div>
                <div>
                  <p className="text-gray-400 font-medium">123 Luxury Avenue</p>
                  <p className="text-gray-400 font-medium">City Center, 10100</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 text-black p-2 rounded-lg">
                  📞
                </div>
                <div>
                  <p className="text-gray-400 font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 text-black p-2 rounded-lg">
                  ✉️
                </div>
                <div>
                  <p className="text-gray-400 font-medium">info@grandimperion.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-black text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></span>
              NEWSLETTER
            </h4>
            <p className="text-gray-400 mb-4">
              Subscribe to get special offers and luxury travel tips.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-400 transition-all duration-300"
              />
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25">
                →
              </button>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-gray-400 text-sm">
              <span>🔒</span>
              <span>We respect your privacy</span>
            </div>
          </div>
        </div>

        {/* Awards & Certifications */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
              <div className="text-yellow-500 text-2xl mb-2">🏆</div>
              <div className="text-white font-black text-sm">Best Luxury Hotel 2024</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
              <div className="text-yellow-500 text-2xl mb-2">⭐</div>
              <div className="text-white font-black text-sm">5-Star Rating</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
              <div className="text-yellow-500 text-2xl mb-2">💎</div>
              <div className="text-white font-black text-sm">Luxury Collection</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
              <div className="text-yellow-500 text-2xl mb-2">🌍</div>
              <div className="text-white font-black text-sm">Global Excellence</div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 font-semibold">
                &copy; 2025 <span className="text-yellow-500 font-black">Grand Imperion</span>. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium text-sm">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 font-medium text-sm">
                Sitemap
              </a>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>💳</span>
              <span>Secure Payment</span>
              <span className="text-yellow-500">•</span>
              <span>🔒</span>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Trust Seals */}
        <div className="flex justify-center items-center space-x-6 mt-8 pt-6 border-t border-gray-700">
          <div className="text-center">
            <div className="text-yellow-500 text-lg mb-1">⭐</div>
            <div className="text-gray-400 text-xs font-bold">TRUSTPILOT 4.9</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-500 text-lg mb-1">🏅</div>
            <div className="text-gray-400 text-xs font-bold">TRIPADVISOR</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-500 text-lg mb-1">🌐</div>
            <div className="text-gray-400 text-xs font-bold">BOOKING.COM 9.2</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer