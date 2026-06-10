export interface UserAllocation {
  user: string;
  tier_1: string;
  tier_2: string;
  tier_3: string;
}

export interface ESPNTeam {
  id: string;
  uid?: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName?: string;
  name: string;
  location?: string;
  logo: string;
}

export interface ESPNCompetitor {
  id: string;
  uid?: string;
  type?: string;
  order?: number;
  homeAway: 'home' | 'away';
  winner: boolean;
  score: string;
  team: ESPNTeam;
}

export interface ESPNCompetition {
  id: string;
  date: string;
  startDate?: string;
  status: {
    clock: number;
    displayClock: string;
    type: {
      id: string;
      name: string;
      state: 'pre' | 'in' | 'post';
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  competitors: ESPNCompetitor[];
}

export interface ESPNEvent {
  id: string;
  uid?: string;
  date: string;
  name: string;
  shortName?: string;
  season?: {
    year: number;
    type: number;
    slug: 'group-stage' | 'round-of-32' | 'round-of-16' | 'quarterfinals' | 'semifinals' | '3rd-place-match' | 'final';
  };
  competitions: ESPNCompetition[];
  status: {
    clock: number;
    displayClock: string;
    type: {
      id: string;
      name: string;
      state: 'pre' | 'in' | 'post';
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
}

export interface TeamStats {
  name: string;
  logo: string;
  abbreviation: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  eliminated: boolean;
}

export interface UserStandings {
  user: string;
  rank: number;
  teams: TeamStats[];
  totalPts: number;
  totalGD: number;
  totalGF: number;
}
