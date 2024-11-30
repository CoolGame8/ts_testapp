'use client'

import { motion } from 'framer-motion'
import WeatherWidget from '../components/WeatherWidget'
import NBAScores from '../components/NBAScores'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Weather Widget */}
        <div className="rounded-lg dark:bg-white/10 bg-white/50 p-6 backdrop-blur-lg">
          <h2 className="mb-4 text-2xl font-bold dark:text-white text-gray-800">Weather</h2>
          <WeatherWidget />
        </div>

        {/* NBA Scores */}
        <div className="rounded-lg dark:bg-white/10 bg-white/50 p-6 backdrop-blur-lg">
          <h2 className="mb-4 text-2xl font-bold dark:text-white text-gray-800">NBA Live Scores</h2>
          <NBAScores />
        </div>
      </motion.div>
    </div>
  )
}
