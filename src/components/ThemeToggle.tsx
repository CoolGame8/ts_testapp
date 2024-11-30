'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/10 backdrop-blur-lg dark:text-white text-gray-800"
    >
      {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </motion.button>
  )
}
