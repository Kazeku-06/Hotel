import { useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useLocalStorage('darkMode', true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  )
}

export default ThemeToggle