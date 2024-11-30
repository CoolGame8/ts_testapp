'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trophy, Clock, Calendar, TrendingUp, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, subDays, parseISO, isBefore, isAfter } from 'date-fns'
import Link from 'next/link'
import { NBA_TEAMS } from '../data/nbaTeams'

interface Team {
  name: string;
  score?: number;
  abbreviation: string;
  logo?: string;
}

interface Game {
  id: string;
  date: string;
  home_team: Team;
  visitor_team: Team;
  status: string;
  period?: number;
  time?: string;
  type: 'past' | 'live' | 'upcoming';
  spread?: string;
}

const normalizeTeamAbbreviation = (abbr: string): string => {
  // ESPN API sometimes uses different abbreviations
  const mapping: { [key: string]: string } = {
    'GS': 'GSW',
    'NY': 'NYK',
    'SA': 'SAS',
    'NO': 'NOP',
    'UTAH': 'UTA',
    'PHO': 'PHX',
    'CHA': 'CHA',
    'WSH': 'WAS'
  }
  return mapping[abbr] || abbr
}

const getTeamData = (teamTricode: string) => {
  const normalizedAbbr = normalizeTeamAbbreviation(teamTricode)
  const team = NBA_TEAMS[normalizedAbbr]
  if (!team) {
    console.warn(`Team not found for abbreviation: ${teamTricode} (normalized: ${normalizedAbbr})`)
  }
  return {
    name: team?.name || teamTricode,
    abbreviation: normalizedAbbr,
    logo: team?.logo
  }
}

const getGameType = (status: string) => {
  if (status === 'in') return 'live'
  if (status === 'post') return 'past'
  return 'upcoming'
}

export default function NBAScores() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'live' | 'past' | 'upcoming'>('live')

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Get dates for 5 days before and after today
        const dates = Array.from({ length: 11 }, (_, i) => {
          const date = addDays(new Date(), i - 5)
          return format(date, 'yyyyMMdd')
        })

        // Fetch games for each date
        const responses = await Promise.all(
          dates.map(date =>
            fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`)
              .then(res => res.json())
              .catch(() => ({ events: [] }))
          )
        )

        // Combine all games
        const allGames = responses.flatMap(data => {
          if (!data.events) return []

          return data.events.map((event: any) => {
            const homeTeam = event.competitions[0].competitors.find(
              (team: any) => team.homeAway === 'home'
            )
            const awayTeam = event.competitions[0].competitors.find(
              (team: any) => team.homeAway === 'away'
            )

            const homeTeamData = getTeamData(homeTeam.team.abbreviation)
            const awayTeamData = getTeamData(awayTeam.team.abbreviation)

            return {
              id: event.id,
              date: event.date,
              home_team: {
                ...homeTeamData,
                score: parseInt(homeTeam.score || '0')
              },
              visitor_team: {
                ...awayTeamData,
                score: parseInt(awayTeam.score || '0')
              },
              status: event.status.type.description,
              period: event.status.period,
              time: event.status.displayClock,
              type: getGameType(event.status.type.state),
              spread: event.competitions[0].odds?.[0]?.details || ''
            }
          })
        })

        // Sort games by date
        const sortedGames = allGames.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateA.getTime() - dateB.getTime()
        })

        setGames(sortedGames)
      } catch (error) {
        console.error('Error fetching games:', error)
        setGames([])
      }
      if (loading) setLoading(false)
    }

    fetchGames()
    // Refresh every 30 seconds
    const interval = setInterval(fetchGames, 30000)
    return () => clearInterval(interval)
  }, [loading])

  // Filter games based on active tab
  const filteredGames = games.filter(game => game.type === activeTab)

  // Function to determine score color
  const getScoreColor = (score1?: number, score2?: number) => {
    if (!score1 || !score2) return ''
    if (score1 > score2) return 'text-green-500'
    if (score1 < score2) return 'text-red-500'
    return 'text-yellow-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 relative"
    >
      {/* Wild background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black opacity-75 blur-xl"></div>
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10"></div>

      {/* Tab Navigation with neon effect */}
      <div className="relative flex space-x-4 mb-8 justify-center">
        {(['live', 'past', 'upcoming'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-110 
              ${activeTab === tab 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110' 
                : 'bg-gray-800/50 text-gray-400 hover:text-white backdrop-blur-lg'
              }`}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: activeTab === tab ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'live' && (
                <span className="ml-1 text-sm opacity-75">
                  ({tab === 'past' ? '5d' : '5d'})
                </span>
              )}
            </motion.div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGames.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-xl font-bold">
              No {activeTab} games available
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="relative"
                >
                  {/* Main content */}
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/90 to-black/90 p-6 backdrop-blur-xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 space-y-4">
                        {/* Date with neon effect */}
                        <div className="text-sm font-medium text-cyan-400 mb-4 tracking-wide">
                          {format(parseISO(game.date), 'MMM dd, yyyy h:mm a')}
                        </div>
                        
                        {/* Teams section */}
                        <div className="space-y-4">
                          {/* Home team */}
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                {game.home_team.logo && (
                                  <img 
                                    src={game.home_team.logo} 
                                    alt={game.home_team.name}
                                    className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform duration-300"
                                  />
                                )}
                              </div>
                              <Link 
                                href={`/teams/${game.home_team.abbreviation}`}
                                className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors duration-300"
                              >
                                {game.home_team.name}
                              </Link>
                            </div>
                            {game.type === 'upcoming' && game.spread ? (
                              <span className="text-cyan-400 font-medium text-lg">
                                {game.spread}
                              </span>
                            ) : (
                              <span className={`text-2xl font-bold ${getScoreColor(game.home_team.score, game.visitor_team.score)}`}>
                                {game.home_team.score}
                              </span>
                            )}
                          </div>
                          
                          {/* Visitor team */}
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                {game.visitor_team.logo && (
                                  <img 
                                    src={game.visitor_team.logo} 
                                    alt={game.visitor_team.name}
                                    className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform duration-300"
                                  />
                                )}
                              </div>
                              <Link 
                                href={`/teams/${game.visitor_team.abbreviation}`}
                                className="font-bold text-xl text-white group-hover:text-purple-400 transition-colors duration-300"
                              >
                                {game.visitor_team.name}
                              </Link>
                            </div>
                            {game.type === 'upcoming' ? (
                              <span className="text-sm text-purple-400">
                                {game.status}
                              </span>
                            ) : (
                              <span className={`text-2xl font-bold ${getScoreColor(game.visitor_team.score, game.home_team.score)}`}>
                                {game.visitor_team.score}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="ml-6">
                        <div className="flex flex-col items-center justify-center px-6 py-4 rounded-xl bg-gray-900/50 backdrop-blur-xl">
                          {game.type === 'past' && (
                            <>
                              <Trophy className="h-8 w-8 text-yellow-400 mb-2" />
                              <span className="text-sm font-medium text-yellow-400">Final</span>
                            </>
                          )}
                          {game.type === 'live' && (
                            <>
                              <Flame className="h-8 w-8 text-red-500 mb-2 animate-pulse" />
                              <span className="text-sm font-medium text-red-400">
                                Q{game.period} {game.time}
                              </span>
                            </>
                          )}
                          {game.type === 'upcoming' && (
                            <>
                              <Calendar className="h-8 w-8 text-green-400 mb-2" />
                              <span className="text-sm font-medium text-green-400">
                                {format(parseISO(game.date), 'h:mm a')}
                              </span>
                              <span className="text-xs font-medium text-gray-400 mt-1">
                                Local Time
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
