'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Users, Trophy, Calendar, Info, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { NBA_TEAMS, NBATeam } from '../../../data/nbaTeams'

interface TeamStats {
  wins: number
  losses: number
  winPct: number
  lastTenRecord: string
  streak: string
  pointsPerGame: number
  pointsAllowed: number
}

interface Game {
  id: string
  date: string
  home_team: {
    abbreviation: string
    name: string
    logo?: string
    score: number
  }
  visitor_team: {
    abbreviation: string
    name: string
    logo?: string
    score: number
  }
  status: string
  period: number
  time: string
  type: 'live' | 'past' | 'upcoming'
}

interface GameData {
  [key: number]: any
}

interface PlayerStats {
  name: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  minutes: number
}

interface TopPerformers {
  gameId: string
  date: string
  players: PlayerStats[]
}

export default function TeamPage() {
  const params = useParams()
  const router = useRouter()
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformers[]>([])
  const [loading, setLoading] = useState(true)

  const team = NBA_TEAMS[params.teamId as string]

  useEffect(() => {
    if (!team) {
      console.error('Team not found:', params.teamId)
      router.push('/')
      return
    }

    const fetchTeamData = async () => {
      try {
        if (!team) {
          console.error('Team not found:', params.teamId)
          return
        }

        console.log('Fetching data for team:', team.name)
        
        const teamId = params.teamId
        if (!teamId) {
          throw new Error('Invalid team ID')
        }

        const response = await fetch(`/api/teams/${teamId}`)
        console.log('Response status:', response.status)

        if (!response.ok) {
          throw new Error('Failed to fetch team data')
        }

        const data = await response.json()
        console.log('Raw API response:', JSON.stringify(data, null, 2))

        if (data.error) {
          throw new Error(data.error)
        }

        // Extract team data
        const teamData = data.team
        const schedule = data.schedule || []
        const stats = data.stats || {}
        
        // Process games data
        const games = schedule
          .filter((event: any) => event.status?.type?.completed)
          .map((event: any) => {
            const competition = event.competitions[0]
            const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home')
            const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away')
            const isHome = homeTeam.team.id === teamId
            const teamScore = parseInt(isHome ? homeTeam.score : awayTeam.score)
            const opponentScore = parseInt(isHome ? awayTeam.score : homeTeam.score)
            const won = teamScore > opponentScore

            return {
              id: event.id,
              date: event.date,
              teamScore,
              opponentScore,
              won,
              isHome,
              opponent: {
                id: isHome ? awayTeam.team.id : homeTeam.team.id,
                name: isHome ? awayTeam.team.name : homeTeam.team.name,
                abbreviation: isHome ? awayTeam.team.abbreviation : homeTeam.team.abbreviation,
                logo: isHome ? awayTeam.team.logo : homeTeam.team.logo
              }
            }
          })
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Calculate stats
        const statsData = stats[0] || {}
        
        // Basic stats with safe defaults
        const wins = Math.max(0, parseInt(String(statsData.wins)) || 0)
        const losses = Math.max(0, parseInt(String(statsData.losses)) || 0)
        const totalGames = wins + losses
        
        // Recent games stats
        const last10Games = games.slice(0, 10)
        const last10Wins = last10Games.filter(g => g.won).length

        // Points stats with safe defaults
        let ppg = 0
        let papg = 0
        
        try {
          ppg = Math.round((Number(statsData.ppg) || 0) * 10) / 10
          papg = Math.round((Number(statsData.papg) || 0) * 10) / 10
        } catch (e) {
          console.error('Error processing points stats:', e)
        }

        const teamStats = {
          wins,
          losses,
          winPct: totalGames > 0 ? wins / totalGames : 0,
          lastTenRecord: `${last10Wins}-${10 - last10Wins}`,
          streak: calculateStreak(games),
          pointsPerGame: ppg,
          pointsAllowed: papg
        }

        console.log('Calculated stats:', teamStats)
        setTeamStats(teamStats)

        // Format recent games for display
        const recentGames = games.slice(0, 10).map(game => ({
          id: game.id,
          date: game.date,
          home_team: {
            abbreviation: game.isHome ? teamData.abbreviation : game.opponent.abbreviation,
            name: game.isHome ? teamData.name : game.opponent.name,
            logo: game.isHome ? teamData.logos[0].href : game.opponent.logo,
            score: game.isHome ? game.teamScore : game.opponentScore
          },
          visitor_team: {
            abbreviation: game.isHome ? game.opponent.abbreviation : teamData.abbreviation,
            name: game.isHome ? game.opponent.name : teamData.name,
            logo: game.isHome ? game.opponent.logo : teamData.logos[0].href,
            score: game.isHome ? game.opponentScore : game.teamScore
          },
          status: 'Final',
          period: 4,
          time: '0:00',
          type: 'past' as 'past'
        }))

        console.log('Formatted recent games:', recentGames)
        setRecentGames(recentGames)

        // For ESPN API, we'll show team leaders instead of per-game top performers
        const leaders = teamData.leaders || []
        const topPerformers = [{
          gameId: 'season',
          date: new Date().toISOString(),
          players: leaders.map((leader: any) => ({
            name: leader.athlete.fullName,
            points: leader.statistics?.points || 0,
            rebounds: leader.statistics?.rebounds || 0,
            assists: leader.statistics?.assists || 0,
            steals: leader.statistics?.steals || 0,
            blocks: leader.statistics?.blocks || 0,
            minutes: leader.statistics?.minutes || '0'
          })).slice(0, 3)
        }]

        console.log('Processed top performers:', topPerformers)
        setTopPerformers(topPerformers)
      } catch (error) {
        console.error('Error fetching team data:', error)
        setTeamStats({
          wins: 0,
          losses: 0,
          winPct: 0,
          lastTenRecord: '0-0',
          streak: '0',
          pointsPerGame: 0,
          pointsAllowed: 0
        })
        setRecentGames([])
        setTopPerformers([])
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [params.teamId, router, team])

  if (!team) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 relative"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black opacity-75 blur-xl"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10"></div>

      {/* Team Header */}
      <div className="relative flex items-center space-x-6 bg-gradient-to-r from-gray-900/90 to-black/90 p-6 rounded-xl backdrop-blur-xl border border-white/10">
        <img 
          src={`https://cdn.nba.com/teams/legacy/logos/1610${team.id}/global/L/logo.svg`} 
          alt={team.name}
          className="w-32 h-32 object-contain"
        />
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{team.name}</h1>
          <div className="flex space-x-4 text-gray-400">
            {teamStats && (
              <>
                <span>{teamStats.wins}-{teamStats.losses}</span>
                <span>|</span>
                <span>Last 10: {teamStats.lastTenRecord}</span>
                <span>|</span>
                <span>{(teamStats.winPct * 100).toFixed(1)}%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Team Stats */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-gray-900/90 to-black/90 p-6 rounded-xl backdrop-blur-xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-cyan-400" />
              Team Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Points Per Game</p>
                <p className="text-2xl font-bold text-white">{teamStats.pointsPerGame.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-gray-400">Points Allowed</p>
                <p className="text-2xl font-bold text-white">{teamStats.pointsAllowed.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Games */}
      <div className="bg-gradient-to-r from-gray-900/90 to-black/90 p-6 rounded-xl backdrop-blur-xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
          Recent Games
        </h2>
        <div className="space-y-4">
          {recentGames.map(game => (
            <div 
              key={game.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <img 
                  src={game.visitor_team.logo} 
                  alt={game.visitor_team.name}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-white">{game.visitor_team.name}</span>
                {game.type !== 'upcoming' && (
                  <span className="text-xl font-bold text-white">{game.visitor_team.score}</span>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">
                  {format(parseISO(game.date), 'MMM d')}
                </div>
                {game.type === 'live' ? (
                  <div className="text-red-500 font-bold">
                    Q{game.period} {game.time}
                  </div>
                ) : game.type === 'upcoming' ? (
                  <div className="text-cyan-400">
                    {format(parseISO(game.date), 'h:mm a')}
                  </div>
                ) : (
                  <div className="text-gray-400">Final</div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {game.type !== 'upcoming' && (
                  <span className="text-xl font-bold text-white">{game.home_team.score}</span>
                )}
                <span className="text-white">{game.home_team.name}</span>
                <img 
                  src={game.home_team.logo} 
                  alt={game.home_team.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-gradient-to-r from-gray-900/90 to-black/90 p-6 rounded-xl backdrop-blur-xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-cyan-400" />
          Top Performers
        </h2>
        <div className="space-y-4">
          {topPerformers.map(performance => (
            <div 
              key={performance.gameId}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-white">{format(parseISO(performance.date), 'MMM d')}</span>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Top Performers</div>
              </div>
              <div className="flex items-center space-x-3">
                {performance.players.map(player => (
                  <div 
                    key={player.name}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-white">{player.name}</span>
                    <span className="text-xl font-bold text-white">{player.points}pts</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function calculateStreak(games: any[]) {
  let currentStreak = 0
  let streakType = games[0]?.won ? 'W' : 'L'
  for (let i = 0; i < games.length; i++) {
    if ((streakType === 'W' && games[i].won) ||
        (streakType === 'L' && !games[i].won)) {
      currentStreak++
    } else {
      break
    }
  }

  return `${currentStreak}${streakType}`
}
