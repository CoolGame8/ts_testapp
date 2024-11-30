'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}
export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetDate = new Date('2026-01-01T00:00:00')

    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex justify-center gap-8">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <motion.div
          key={unit}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-4xl font-bold dark:text-white text-gray-800">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-sm dark:text-gray-300 text-gray-600 capitalize">
            {unit}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
