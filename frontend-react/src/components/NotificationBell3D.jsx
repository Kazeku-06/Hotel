import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Calendar, Gift, AlertCircle } from 'lucide-react'
import { enhancedAPI } from '../api/enhanced'
import { useAuth } from '../context/AuthContext'

const NotificationBell3D = () => {
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoadi