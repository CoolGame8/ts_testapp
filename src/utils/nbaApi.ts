import { Team, Player, Game, NBA_TEAMS } from '../types/nba'

export async function getTeamInfo(teamId: string): Promise<Team | null> {
  // For now, return mock data from our NBA_TEAMS constant
  return NBA_TEAMS[teamId] || null
}

export async function getTeamRoster(teamId: string): Promise<Player[]> {
  // Mock data - in a real app, this would fetch from an API
  return [
    {
      id: '1',
      name: 'LeBron James',
      number: '23',
      position: 'F',
      height: '6\'9"',
      weight: '250 lbs',
      age: 38,
      college: 'St. Vincent-St. Mary HS (OH)',
      image: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png'
    },
    // Add more players as needed
  ]
}

export async function getTeamGames(teamId: string): Promise<Game[]> {
  // Mock data - in a real app, this would fetch from an API
  return []
}
