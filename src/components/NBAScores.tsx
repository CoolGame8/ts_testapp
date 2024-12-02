'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trophy, Clock, Calendar, TrendingUp, Flame } from 'lucide-react'
import { format, parseISO, addDays } from 'date-fns'
import Link from 'next/link'
import { getTeamData as getTeamDataFromDB } from '@/data/nbaTeams'

interface Team {
  name: string
  score?: number
  abbreviation: string
  logo?: string
}

interface Odds {
  price: number
  name: string
}

interface GameOdds {
  homeTeamOdds: Odds
  awayTeamOdds: Odds
  spread: string
}

interface Game {
  id: string
  date: string
  home_team: Team
  visitor_team: Team
  status: string
  period?: number
  time?: string
  type: 'past' | 'live' | 'upcoming'
  spread?: string
  odds?: GameOdds
}

// Helper function to format odds
const formatOdds = (price: number): string => {
  if (price === 0) return 'N/A'
  return price > 0 ? `+${price}` : price.toString()
}

// Helper function to explain odds
const getOddsExplanation = (price: number): string => {
  if (price === 0) return 'Odds not available'
  if (price > 0) {
    return `Win $${price} on $100 bet`
  }
  return `Bet $${Math.abs(price)} to win $100`
}

// Helper function to determine if team is favorite
const isFavorite = (homeOdds: number, awayOdds: number): boolean => {
  return homeOdds < awayOdds
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
  const team = getTeamDataFromDB(normalizedAbbr)
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

const ODDS_CACHE_KEY = 'nba_odds_cache';
const ODDS_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const fetchOdds = async (games: Game[]): Promise<Map<string, GameOdds>> => {
  // Check if we have games to process
  if (games.length === 0) {
    console.log('No games to fetch odds for');
    return new Map();
  }

  // Try to get cached odds first
  try {
    const cachedData = localStorage.getItem(ODDS_CACHE_KEY);
    if (cachedData) {
      const { odds, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < ODDS_CACHE_DURATION) {
        console.log('Using cached odds data');
        return new Map(Object.entries(odds));
      }
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
  }

  // Check for API key
  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.warn('Valid Odds API key not found. Please add your API key to .env.local');
    return new Map();
  }

  try {
    const url = new URL('https://api.the-odds-api.com/v4/sports/basketball_nba/odds');
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('regions', 'us');
    url.searchParams.append('markets', 'h2h,spreads');
    url.searchParams.append('oddsFormat', 'american');

    console.log('Fetching fresh odds data');
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401 && errorText.includes('Usage quota has been reached')) {
        console.warn('API usage limit reached. Using default odds display.');
        return new Map();
      }
      throw new Error(`Odds API Error: Status ${response.status} - ${response.statusText}. Response: ${errorText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Unexpected API response format:', data);
      return new Map();
    }

    const oddsMap = new Map<string, GameOdds>();

    for (const game of data) {
      try {
        if (!game.home_team || !game.away_team || !game.bookmakers) {
          console.log('Skipping game due to missing data:', game);
          continue;
        }

        const homeTeam = game.home_team;
        const awayTeam = game.away_team;
        
        console.log('Processing odds for game:', {
          homeTeam,
          awayTeam,
          bookmakers: game.bookmakers.map((b: any) => b.key)
        });

        // Find matching bookmaker (using FanDuel as primary, DraftKings as backup)
        const bookmaker = game.bookmakers.find(
          (b: any) => b.key === 'fanduel' || b.key === 'draftkings'
        );

        if (!bookmaker?.markets) {
          console.log('No valid bookmaker found for game:', { homeTeam, awayTeam });
          continue;
        }

        const h2hMarket = bookmaker.markets.find((m: any) => m.key === 'h2h');
        const spreadsMarket = bookmaker.markets.find((m: any) => m.key === 'spreads');

        console.log('Markets found:', {
          bookmaker: bookmaker.key,
          h2h: h2hMarket?.outcomes,
          spreads: spreadsMarket?.outcomes
        });

        if (!h2hMarket?.outcomes) {
          console.log('No h2h market found for game:', { homeTeam, awayTeam });
          continue;
        }

        const homeOdds = h2hMarket.outcomes.find((o: any) => o.name === homeTeam);
        const awayOdds = h2hMarket.outcomes.find((o: any) => o.name === awayTeam);
        const spread = spreadsMarket?.outcomes?.find((o: any) => o.name === homeTeam);

        // Find matching game from our games array
        const matchingGame = games.find(g => {
          const homeMatch = g.home_team.name.includes(homeTeam) || homeTeam.includes(g.home_team.name);
          const awayMatch = g.visitor_team.name.includes(awayTeam) || awayTeam.includes(g.visitor_team.name);
          console.log('Matching attempt:', {
            apiHome: homeTeam,
            apiAway: awayTeam,
            ourHome: g.home_team.name,
            ourAway: g.visitor_team.name,
            homeMatch,
            awayMatch
          });
          return homeMatch && awayMatch;
        });

        if (matchingGame && homeOdds && awayOdds) {
          console.log('Found matching game with odds:', {
            gameId: matchingGame.id,
            homeOdds,
            awayOdds,
            spread: spread?.point
          })
          
          oddsMap.set(matchingGame.id, {
            homeTeamOdds: {
              price: parseInt(homeOdds.price) || 0,
              name: homeTeam
            },
            awayTeamOdds: {
              price: parseInt(awayOdds.price) || 0,
              name: awayTeam
            },
            spread: spread ? `${spread.point > 0 ? '+' : ''}${spread.point}` : ''
          });
        } else {
          console.log('No matching game found or missing odds data:', {
            matchingGame: matchingGame?.id,
            hasHomeOdds: !!homeOdds,
            hasAwayOdds: !!awayOdds
          });
        }
      } catch (gameError) {
        console.error('Error processing individual game odds:', gameError);
        continue;
      }
    }

    console.log('Final odds map:', Object.fromEntries(oddsMap));
    // Cache the successful response
    try {
      localStorage.setItem(ODDS_CACHE_KEY, JSON.stringify({
        odds: Object.fromEntries(oddsMap),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Error caching odds data:', error);
    }

    return oddsMap;
  } catch (error) {
    console.error('Error fetching odds:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return new Map();
  }
};

export default function NBAScores() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'live' | 'past' | 'upcoming'>('live')

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Get dates from 7 days ago to 7 days in the future
        const now = new Date()
        const dates = Array.from({ length: 15 }, (_, i) => {
          const date = addDays(now, i - 7) // Start from 7 days ago
          return format(date, 'yyyyMMdd')
        })
        
        console.log('Fetching games for dates:', dates)

        // Fetch games for each date
        const responses = await Promise.all(
          dates.map(async date => {
            const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`
            console.log('Fetching URL:', url)
            
            try {
              const response = await fetch(url)
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }
              const data = await response.json()
              return data
            } catch (error) {
              console.error(`Error fetching games for date ${date}:`, error)
              return { events: [] }
            }
          })
        )

        // Combine and process all games
        const allGames = responses.flatMap(data => {
          if (!data?.events) return []

          return data.events.map((event: any) => {
            try {
              if (!event?.competitions?.[0]?.competitors) {
                return null
              }

              const competition = event.competitions[0]
              const homeTeam = competition.competitors.find(
                (team: any) => team?.homeAway === 'home'
              )
              const awayTeam = competition.competitors.find(
                (team: any) => team?.homeAway === 'away'
              )

              if (!homeTeam?.team || !awayTeam?.team) {
                return null
              }

              const homeTeamData = getTeamData(homeTeam.team.abbreviation)
              const awayTeamData = getTeamData(awayTeam.team.abbreviation)

              const gameStatus = event.status?.type?.state || ''
              const gameDate = new Date(event.date)
              const isToday = format(gameDate, 'yyyyMMdd') === format(now, 'yyyyMMdd')
              
              // Debug log for time values
              console.log('Game time debug:', {
                name: event.name,
                rawDate: event.date,
                parsedDate: gameDate,
                formattedTime: format(gameDate, 'h:mm a'),
                displayClock: event.status?.displayClock,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              })
              
              // Determine game type based on date and status
              let gameType: 'past' | 'live' | 'upcoming' = 'upcoming'
              if (gameStatus === 'in') {
                gameType = 'live'
              } else if (gameStatus === 'post' || (gameDate < now && !isToday)) {
                gameType = 'past'
              }

              console.log(`Game ${event.name}: status=${gameStatus}, date=${format(gameDate, 'yyyy-MM-dd HH:mm')}, type=${gameType}`)

              return {
                id: event.id || '',
                date: event.date,
                home_team: {
                  ...homeTeamData,
                  score: parseInt(homeTeam.score || '0')
                },
                visitor_team: {
                  ...awayTeamData,
                  score: parseInt(awayTeam.score || '0')
                },
                status: event.status?.type?.description || (gameType === 'upcoming' ? 'Scheduled' : 'Unknown'),
                period: event.status?.period || 0,
                time: gameType === 'upcoming' ? format(gameDate, 'h:mm a') : event.status?.displayClock || '',
                type: gameType
              }
            } catch (error) {
              console.error('Error processing game:', error)
              return null
            }
          }).filter(Boolean)
        })

        // Fetch odds for upcoming games
        const upcomingGames = allGames.filter(game => game.type === 'upcoming')
        if (upcomingGames.length > 0) {
          const oddsMap = await fetchOdds(upcomingGames)
          
          // Merge odds data with games
          allGames.forEach(game => {
            if (game.type === 'upcoming') {
              game.odds = oddsMap.get(game.id)
            }
          })
        }

        // Sort games by date with different orders for past and upcoming
        const sortedGames = allGames.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          
          // If both games are of the same type (past or upcoming)
          if (a.type === b.type) {
            if (a.type === 'upcoming') {
              // For upcoming games: chronological order (closest first)
              return dateA.getTime() - dateB.getTime()
            } else {
              // For past games: reverse chronological (newest first)
              return dateB.getTime() - dateA.getTime()
            }
          }
          
          // If games are of different types, maintain type grouping
          // Order: live -> upcoming -> past
          function getTypeOrder(type: Game['type']): number {
            switch(type) {
              case 'live': return 0
              case 'upcoming': return 1
              case 'past': return 2
              default: return 2  // default to past
            }
          }

          const typeA = getTypeOrder(a.type)
          const typeB = getTypeOrder(b.type)
          return typeA - typeB
        })

        console.log('Processed games by type:', {
          past: sortedGames.filter(g => g.type === 'past').length,
          live: sortedGames.filter(g => g.type === 'live').length,
          upcoming: sortedGames.filter(g => g.type === 'upcoming').length
        })

        setGames(sortedGames)
        if (loading) setLoading(false)
      } catch (error) {
        console.error('Fatal error in fetchGames:', error)
        setGames([])
        if (loading) setLoading(false)
      }
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
    <div className="space-y-6 p-4 relative">
      {/* Wild background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black opacity-75 blur-xl"></div>
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" style={{background: "linear-gradient(to right, #232323 1px, transparent 1px), linear-gradient(to bottom, #232323 1px, transparent 1px)"}}></div>

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
            <div>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'live' && (
                <span className="ml-1 text-sm opacity-75">
                  ({tab === 'past' ? '5d' : '5d'})
                </span>
              )}
            </div>
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
                            {/* Home team odds */}
                            {game.type === 'upcoming' && game.odds ? (
                              <div className="text-right relative group">
                                <div className="flex items-center justify-end space-x-2">
                                  <div className="flex items-center">
                                    <div className="flex items-center">
                                      <span className="text-cyan-400 font-medium text-lg">
                                        {isFavorite(game.odds.homeTeamOdds.price, game.odds.awayTeamOdds.price) && (
                                          <Trophy className="w-4 h-4 text-yellow-500 inline-block mr-1 mb-0.5" />
                                        )}
                                        {formatOdds(game.odds.homeTeamOdds.price)}
                                      </span>
                                      {game.odds.spread && (
                                        <span className="text-gray-400 text-sm ml-2 px-2 py-1 bg-gray-800/50 rounded">
                                          {game.odds.spread}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Moneyline
                                    </div>
                                  </div>
                                </div>
                                <div className="hidden group-hover:block absolute right-0 mt-1 bg-gray-800 text-white text-sm p-2 rounded-md z-10 min-w-[200px] shadow-lg">
                                  <div className="font-medium mb-1">Betting Guide:</div>
                                  <div className="text-sm text-gray-300">
                                    {getOddsExplanation(game.odds.homeTeamOdds.price)}
                                  </div>
                                  {game.odds.spread && (
                                    <div className="mt-1 text-sm text-gray-300">
                                      Spread: {game.odds.spread} points
                                    </div>
                                  )}
                                </div>
                              </div>
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
                            {/* Away team odds */}
                            {game.type === 'upcoming' && game.odds ? (
                              <div className="text-right relative group">
                                <div className="flex items-center justify-end space-x-2">
                                  <div className="flex items-center">
                                    <div className="flex items-center">
                                      <span className="text-cyan-400 font-medium text-lg">
                                        {isFavorite(game.odds.awayTeamOdds.price, game.odds.homeTeamOdds.price) && (
                                          <Trophy className="w-4 h-4 text-yellow-500 inline-block mr-1 mb-0.5" />
                                        )}
                                        {formatOdds(game.odds.awayTeamOdds.price)}
                                      </span>
                                      {game.odds.spread && (
                                        <span className="text-gray-400 text-sm ml-2 px-2 py-1 bg-gray-800/50 rounded">
                                          {parseFloat(game.odds.spread) * -1 > 0 ? '+' : ''}{parseFloat(game.odds.spread) * -1}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Moneyline
                                    </div>
                                  </div>
                                </div>
                                <div className="hidden group-hover:block absolute right-0 mt-1 bg-gray-800 text-white text-sm p-2 rounded-md z-10 min-w-[200px] shadow-lg">
                                  <div className="font-medium mb-1">Betting Guide:</div>
                                  <div className="text-sm text-gray-300">
                                    {getOddsExplanation(game.odds.awayTeamOdds.price)}
                                  </div>
                                  {game.odds.spread && (
                                    <div className="mt-1 text-sm text-gray-300">
                                      Spread: {parseFloat(game.odds.spread) * -1} points
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className={`text-2xl font-bold ${getScoreColor(game.visitor_team.score, game.home_team.score)}`}>
                                {game.visitor_team.score}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Game status */}
                        <div className="mt-4 flex items-center justify-center space-x-2 text-gray-400">
                          {game.type === 'live' ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                              <span className="font-medium">
                                {game.status} {game.period ? `- Q${game.period}` : ''} {game.time || ''}
                              </span>
                            </>
                          ) : game.type === 'upcoming' ? (
                            <>
                              <Clock className="w-4 h-4" />
                              <div className="flex flex-col items-center">
                                <span>{game.time}</span>
                                <span className="text-xs text-gray-500">Local Time</span>
                              </div>
                            </>
                          ) : (
                            <span>Final</span>
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
    </div>
  )
}
