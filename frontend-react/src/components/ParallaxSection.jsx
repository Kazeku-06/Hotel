import { useEffect, useState } from 'react'
import { motion, useTransform, useScroll } from 'framer-motion'

const ParallaxSection = ({ children, speed = 0.5, className = '' }) => {
  const [elementTop, setElementTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const { scrollY } = useScroll()

  const initial = elementTop - clientHeight
  const final = elementTop + clientHeight

  const yRange = useTransform(scrollY, [initial, final], [clientHeight * speed, -clientHeight * speed])

  useEffect(() => {
    const element = document.getElementById('parallax-element')
    if (element) {
      const onResize = () => {
        setElementTop(element.offsetTop + element.offsetHeight / 2)
        setClientHeight(window.innerHeight)
      }
      onResize()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <motion.div
      id="parallax-element"
      style={{ y: yRange }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default ParallaxSection