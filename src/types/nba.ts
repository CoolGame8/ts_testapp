export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  height: string;
  weight: string;
  age: number;
  college: string;
  image?: string;
}

export interface Game {
  id: string;
  date: string;
  home_team: Team;
  visitor_team: Team;
  home_team_score?: number;
  visitor_team_score?: number;
  status: string;
  period?: number;
  time?: string;
  type: 'past' | 'live' | 'upcoming';
}

export const NBA_TEAMS: Record<string, Team> = {
  'LAL': {
    id: 'LAL',
    name: 'Lakers',
    city: 'Los Angeles',
    abbreviation: 'LAL',
    primaryColor: '#552583',
    secondaryColor: '#FDB927',
    logo: 'https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg'
  },
  'BOS': {
    id: 'BOS',
    name: 'Celtics',
    city: 'Boston',
    abbreviation: 'BOS',
    primaryColor: '#007A33',
    secondaryColor: '#BA9653',
    logo: 'https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg'
  },
  // Add more teams as needed
}
