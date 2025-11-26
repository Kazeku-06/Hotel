import { AuthProvider } from './context/AuthContext'
import AppRouter from './router/AppRouter'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <main className="min-h-screen">
          <AppRouter />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App