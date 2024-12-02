export interface NBATeam {
  id: string;
  espnId: number;
  name: string;
  city: string;
  abbreviation: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  conference: 'Eastern' | 'Western';
  division: string;
}

export const NBA_TEAMS: Record<string, NBATeam> = {
  'ATL': {
    id: 'ATL',
    espnId: 1,
    name: 'Hawks',
    city: 'Atlanta',
    abbreviation: 'ATL',
    logo: 'https://cdn.nba.com/logos/nba/1610612737/global/L/logo.svg',
    primaryColor: '#E03A3E',
    secondaryColor: '#C1D32F',
    conference: 'Eastern',
    division: 'Southeast'
  },
  'BKN': {
    id: 'BKN',
    espnId: 17,
    name: 'Nets',
    city: 'Brooklyn',
    abbreviation: 'BKN',
    logo: 'https://cdn.nba.com/logos/nba/1610612751/global/L/logo.svg',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    conference: 'Eastern',
    division: 'Atlantic'
  },
  'BOS': {
    id: 'BOS',
    espnId: 2,
    name: 'Celtics',
    city: 'Boston',
    abbreviation: 'BOS',
    logo: 'https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg',
    primaryColor: '#007A33',
    secondaryColor: '#BA9653',
    conference: 'Eastern',
    division: 'Atlantic'
  },
  'CHA': {
    id: 'CHA',
    espnId: 30,
    name: 'Hornets',
    city: 'Charlotte',
    abbreviation: 'CHA',
    logo: 'https://cdn.nba.com/logos/nba/1610612766/global/L/logo.svg',
    primaryColor: '#1D1160',
    secondaryColor: '#00788C',
    conference: 'Eastern',
    division: 'Southeast'
  },
  'CHI': {
    id: 'CHI',
    espnId: 4,
    name: 'Bulls',
    city: 'Chicago',
    abbreviation: 'CHI',
    logo: 'https://cdn.nba.com/logos/nba/1610612741/global/L/logo.svg',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    conference: 'Eastern',
    division: 'Central'
  },
  'CLE': {
    id: 'CLE',
    espnId: 5,
    name: 'Cavaliers',
    city: 'Cleveland',
    abbreviation: 'CLE',
    logo: 'https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg',
    primaryColor: '#860038',
    secondaryColor: '#041E42',
    conference: 'Eastern',
    division: 'Central'
  },
  'DAL': {
    id: 'DAL',
    espnId: 6,
    name: 'Mavericks',
    city: 'Dallas',
    abbreviation: 'DAL',
    logo: 'https://cdn.nba.com/logos/nba/1610612742/global/L/logo.svg',
    primaryColor: '#00538C',
    secondaryColor: '#002B5E',
    conference: 'Western',
    division: 'Southwest'
  },
  'DEN': {
    id: 'DEN',
    espnId: 7,
    name: 'Nuggets',
    city: 'Denver',
    abbreviation: 'DEN',
    logo: 'https://cdn.nba.com/logos/nba/1610612743/global/L/logo.svg',
    primaryColor: '#0E2240',
    secondaryColor: '#FEC524',
    conference: 'Western',
    division: 'Northwest'
  },
  'DET': {
    id: 'DET',
    espnId: 8,
    name: 'Pistons',
    city: 'Detroit',
    abbreviation: 'DET',
    logo: 'https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg',
    primaryColor: '#C8102E',
    secondaryColor: '#1D42BA',
    conference: 'Eastern',
    division: 'Central'
  },
  'GSW': {
    id: 'GSW',
    espnId: 9,
    name: 'Warriors',
    city: 'Golden State',
    abbreviation: 'GSW',
    logo: 'https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg',
    primaryColor: '#1D428A',
    secondaryColor: '#FFC72C',
    conference: 'Western',
    division: 'Pacific'
  },
  'HOU': {
    id: 'HOU',
    espnId: 10,
    name: 'Rockets',
    city: 'Houston',
    abbreviation: 'HOU',
    logo: 'https://cdn.nba.com/logos/nba/1610612745/global/L/logo.svg',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    conference: 'Western',
    division: 'Southwest'
  },
  'IND': {
    id: 'IND',
    espnId: 11,
    name: 'Pacers',
    city: 'Indiana',
    abbreviation: 'IND',
    logo: 'https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg',
    primaryColor: '#002D62',
    secondaryColor: '#FDBB30',
    conference: 'Eastern',
    division: 'Central'
  },
  'LAC': {
    id: 'LAC',
    espnId: 12,
    name: 'Clippers',
    city: 'Los Angeles',
    abbreviation: 'LAC',
    logo: 'https://cdn.nba.com/logos/nba/1610612746/global/L/logo.svg',
    primaryColor: '#C8102E',
    secondaryColor: '#1D428A',
    conference: 'Western',
    division: 'Pacific'
  },
  'LAL': {
    id: 'LAL',
    espnId: 13,
    name: 'Lakers',
    city: 'Los Angeles',
    abbreviation: 'LAL',
    logo: 'https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg',
    primaryColor: '#552583',
    secondaryColor: '#FDB927',
    conference: 'Western',
    division: 'Pacific'
  },
  'MEM': {
    id: 'MEM',
    espnId: 29,
    name: 'Grizzlies',
    city: 'Memphis',
    abbreviation: 'MEM',
    logo: 'https://cdn.nba.com/logos/nba/1610612763/global/L/logo.svg',
    primaryColor: '#5D76A9',
    secondaryColor: '#12173F',
    conference: 'Western',
    division: 'Southwest'
  },
  'MIA': {
    id: 'MIA',
    espnId: 14,
    name: 'Heat',
    city: 'Miami',
    abbreviation: 'MIA',
    logo: 'https://cdn.nba.com/logos/nba/1610612748/global/L/logo.svg',
    primaryColor: '#98002E',
    secondaryColor: '#F9A01B',
    conference: 'Eastern',
    division: 'Southeast'
  },
  'MIL': {
    id: 'MIL',
    espnId: 15,
    name: 'Bucks',
    city: 'Milwaukee',
    abbreviation: 'MIL',
    logo: 'https://cdn.nba.com/logos/nba/1610612749/global/L/logo.svg',
    primaryColor: '#00471B',
    secondaryColor: '#EEE1C6',
    conference: 'Eastern',
    division: 'Central'
  },
  'MIN': {
    id: 'MIN',
    espnId: 16,
    name: 'Timberwolves',
    city: 'Minnesota',
    abbreviation: 'MIN',
    logo: 'https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg',
    primaryColor: '#0C2340',
    secondaryColor: '#236192',
    conference: 'Western',
    division: 'Northwest'
  },
  'NOP': {
    id: 'NOP',
    espnId: 3,
    name: 'Pelicans',
    city: 'New Orleans',
    abbreviation: 'NOP',
    logo: 'https://cdn.nba.com/logos/nba/1610612740/global/L/logo.svg',
    primaryColor: '#0C2340',
    secondaryColor: '#C8102E',
    conference: 'Western',
    division: 'Southwest'
  },
  'NYK': {
    id: 'NYK',
    espnId: 18,
    name: 'Knicks',
    city: 'New York',
    abbreviation: 'NYK',
    logo: 'https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg',
    primaryColor: '#006BB6',
    secondaryColor: '#F58426',
    conference: 'Eastern',
    division: 'Atlantic'
  },
  'OKC': {
    id: 'OKC',
    espnId: 25,
    name: 'Thunder',
    city: 'Oklahoma City',
    abbreviation: 'OKC',
    logo: 'https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg',
    primaryColor: '#007AC1',
    secondaryColor: '#EF3B24',
    conference: 'Western',
    division: 'Northwest'
  },
  'ORL': {
    id: 'ORL',
    espnId: 19,
    name: 'Magic',
    city: 'Orlando',
    abbreviation: 'ORL',
    logo: 'https://cdn.nba.com/logos/nba/1610612753/global/L/logo.svg',
    primaryColor: '#0077C0',
    secondaryColor: '#C4CED4',
    conference: 'Eastern',
    division: 'Southeast'
  },
  'PHI': {
    id: 'PHI',
    espnId: 20,
    name: '76ers',
    city: 'Philadelphia',
    abbreviation: 'PHI',
    logo: 'https://cdn.nba.com/logos/nba/1610612755/global/L/logo.svg',
    primaryColor: '#006BB6',
    secondaryColor: '#ED174C',
    conference: 'Eastern',
    division: 'Atlantic'
  },
  'PHX': {
    id: 'PHX',
    espnId: 21,
    name: 'Suns',
    city: 'Phoenix',
    abbreviation: 'PHX',
    logo: 'https://cdn.nba.com/logos/nba/1610612756/global/L/logo.svg',
    primaryColor: '#1D1160',
    secondaryColor: '#E56020',
    conference: 'Western',
    division: 'Pacific'
  },
  'POR': {
    id: 'POR',
    espnId: 22,
    name: 'Trail Blazers',
    city: 'Portland',
    abbreviation: 'POR',
    logo: 'https://cdn.nba.com/logos/nba/1610612757/global/L/logo.svg',
    primaryColor: '#E03A3E',
    secondaryColor: '#000000',
    conference: 'Western',
    division: 'Northwest'
  },
  'SAC': {
    id: 'SAC',
    espnId: 23,
    name: 'Kings',
    city: 'Sacramento',
    abbreviation: 'SAC',
    logo: 'https://cdn.nba.com/logos/nba/1610612758/global/L/logo.svg',
    primaryColor: '#5A2D81',
    secondaryColor: '#63727A',
    conference: 'Western',
    division: 'Pacific'
  },
  'SAS': {
    id: 'SAS',
    espnId: 24,
    name: 'Spurs',
    city: 'San Antonio',
    abbreviation: 'SAS',
    logo: 'https://cdn.nba.com/logos/nba/1610612759/global/L/logo.svg',
    primaryColor: '#C4CED4',
    secondaryColor: '#000000',
    conference: 'Western',
    division: 'Southwest'
  },
  'TOR': {
    id: 'TOR',
    espnId: 28,
    name: 'Raptors',
    city: 'Toronto',
    abbreviation: 'TOR',
    logo: 'https://cdn.nba.com/logos/nba/1610612761/global/L/logo.svg',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    conference: 'Eastern',
    division: 'Atlantic'
  },
  'UTA': {
    id: 'UTA',
    espnId: 26,
    name: 'Jazz',
    city: 'Utah',
    abbreviation: 'UTA',
    logo: 'https://cdn.nba.com/logos/nba/1610612762/global/L/logo.svg',
    primaryColor: '#002B5C',
    secondaryColor: '#00471B',
    conference: 'Western',
    division: 'Northwest'
  },
  'WAS': {
    id: 'WAS',
    espnId: 27,
    name: 'Wizards',
    city: 'Washington',
    abbreviation: 'WAS',
    logo: 'https://cdn.nba.com/logos/nba/1610612764/global/L/logo.svg',
    primaryColor: '#002B5C',
    secondaryColor: '#E31837',
    conference: 'Eastern',
    division: 'Southeast'
  }
}

export function getTeamData(teamTricode: string): NBATeam | undefined {
  return NBA_TEAMS[teamTricode.toUpperCase()]
}
