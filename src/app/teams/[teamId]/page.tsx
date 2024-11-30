'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Users, Trophy, Calendar, Info, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { NBA_TEAMS, NBATeam } from '../../../data/nbaTeams'

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
  };
  image?: string;
}

// Mock player data - in a real app, this would come from an API
const MOCK_PLAYERS: Record<string, Player[]> = {
  'GSW': [
    {
      id: '1',
      name: 'Stephen Curry',
      number: '30',
      position: 'G',
      stats: { ppg: 29.4, rpg: 6.1, apg: 6.3 },
      image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png'
    },
    {
      id: '2',
      name: 'Klay Thompson',
      number: '11',
      position: 'G',
      stats: { ppg: 21.9, rpg: 3.8, apg: 2.4 },
      image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/202691.png'
    }
  ],
  'LAL': [
    {
      id: '1',
      name: 'LeBron James',
      number: '23',
      position: 'F',
      stats: { ppg: 28.9, rpg: 8.3, apg: 6.8 },
      image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png'
    },
    {
      id: '2',
      name: 'Anthony Davis',
      number: '3',
      position: 'F-C',
      stats: { ppg: 24.5, rpg: 12.7, apg: 3.1 },
      image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png'
    }
  ]
}

export default function TeamPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params?.teamId as string
  const [team, setTeam] = useState<NBATeam | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [activeTab, setActiveTab] = useState<'roster' | 'games' | 'stats'>('roster')

  useEffect(() => {
    // Get team data from our NBA_TEAMS constant
    const teamData = NBA_TEAMS[teamId]
    if (!teamData) {
      router.push('/') // Redirect to home if team not found
      return
    }
    
    setTeam(teamData)
    // Get mock player data or empty array if none exists
    setPlayers(MOCK_PLAYERS[teamId] || [])
  }, [teamId, router])

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Animated grid background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"
        style={{
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 110%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 110%)'
        }}
      />

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor}dd 0%, #000 100%)`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Team header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 px-8"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-8">
            <motion.img
              src={team.logo}
              alt={`${team.name} logo`}
              className="w-32 h-32 object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
            />
            <div>
              <h1 
                className="text-5xl font-bold mb-2"
                style={{ 
                  color: team.secondaryColor,
                  textShadow: `0 0 30px ${team.secondaryColor}80`
                }}
              >
                {team.city} {team.name}
              </h1>
              <div className="flex gap-4">
                <span className="text-white/80">Founded: 1947</span>
                <span className="text-white/80">Championships: 17</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="sticky top-0 z-20 mt-8 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex gap-8">
              {(['roster', 'games', 'stats'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 font-bold text-lg transition-all relative ${
                    activeTab === tab ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ background: team.secondaryColor }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <AnimatePresence mode="wait">
            {activeTab === 'roster' && (
              <motion.div
                key="roster"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    {/* Card glow effect */}
                    <div
                      className="absolute -inset-1 rounded-xl opacity-75 blur-lg transition-all duration-300 group-hover:opacity-100"
                      style={{ background: `linear-gradient(45deg, ${team.primaryColor}, ${team.secondaryColor})` }}
                    />
                    
                    {/* Card content */}
                    <div className="relative rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 p-6">
                      <div className="flex items-center gap-4">
                        {player.image ? (
                          <img 
                            src={player.image} 
                            alt={player.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {player.name}
                            <span className="ml-2 text-sm font-normal text-white/60">#{player.number}</span>
                          </h3>
                          <p className="text-white/60">{player.position}</p>
                          <div className="mt-2 flex gap-4 text-sm">
                            <span className="text-white/80">{player.stats.ppg} PPG</span>
                            <span className="text-white/80">{player.stats.rpg} RPG</span>
                            <span className="text-white/80">{player.stats.apg} APG</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
