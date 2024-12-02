'use client'

import { motion } from 'framer-motion'
import WeatherWidget from '../components/WeatherWidget'
import NBAScores from '../components/NBAScores'

export default function Home() {
  return (
    <div className="container mx-auto p-4 relative">
      {/* Fixed background with reduced complexity */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 -z-20" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 -z-10" />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Weather Widget */}
        <div className="md:sticky md:top-4 h-fit rounded-lg bg-white/10 p-6 shadow-lg">
          <div className="backdrop-blur-sm absolute inset-0 rounded-lg -z-10" />
          <h2 className="mb-4 text-2xl font-bold text-white">Weather</h2>
          <WeatherWidget />
        </div>

        {/* NBA Scores */}
        <div className="rounded-lg bg-white/10 p-6 shadow-lg">
          <div className="backdrop-blur-sm absolute inset-0 rounded-lg -z-10" />
          <h2 className="mb-4 text-2xl font-bold text-white">NBA Live Scores</h2>
          <NBAScores />
        </div>
      </motion.div>
    </div>
  )
}
