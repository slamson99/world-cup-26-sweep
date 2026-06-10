import { UserAllocation, ESPNEvent, TeamStats, UserStandings } from '../types';

export const MOCK_USER_ALLOCATIONS: UserAllocation[] = [
  { user: "John", tier1_team: "Argentina", tier2_team: "Japan", tier3_team: "Canada" },
  { user: "Sarah", tier1_team: "France", tier2_team: "South Korea", tier3_team: "New Zealand" },
  { user: "Mike", tier1_team: "Brazil", tier2_team: "Iran", tier3_team: "Saudi Arabia" },
  { user: "Emily", tier1_team: "England", tier2_team: "Australia", tier3_team: "Qatar" },
  { user: "David", tier1_team: "Spain", tier2_team: "Ecuador", tier3_team: "Panama" },
  { user: "Jessica", tier1_team: "Germany", tier2_team: "Sweden", tier3_team: "South Africa" },
  { user: "James", tier1_team: "Portugal", tier2_team: "Switzerland", tier3_team: "Iraq" },
  { user: "Ashley", tier1_team: "Netherlands", tier2_team: "Austria", tier3_team: "Uzbekistan" },
  { user: "Robert", tier1_team: "Belgium", tier2_team: "Czechia", tier3_team: "Jordan" },
  { user: "Amanda", tier1_team: "Croatia", tier2_team: "Norway", tier3_team: "Haiti" },
  { user: "Michael", tier1_team: "Morocco", tier2_team: "Scotland", tier3_team: "Cape Verde" },
  { user: "Jennifer", tier1_team: "Uruguay", tier2_team: "Türkiye", tier3_team: "Congo DR" },
  { user: "William", tier1_team: "Colombia", tier2_team: "Paraguay", tier3_team: "Curaçao" },
  { user: "Taylor", tier1_team: "United States", tier2_team: "Ivory Coast", tier3_team: "Tunisia" },
  { user: "Chris", tier1_team: "Mexico", tier2_team: "Egypt", tier3_team: "Bosnia-Herzegovina" },
  { user: "Megan", tier1_team: "Senegal", tier2_team: "Algeria", tier3_team: "Ghana" }
];

export function normalizeTeamName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "") // remove spaces & punctuation
    .replace("usa", "unitedstates")
    .replace("unitedstatesofamerica", "unitedstates")
    .replace("turkey", "turkiye")
    .replace("southkorearepublic", "southkorea")
    .replace("korearepublic", "southkorea");
}

export function isPlaceholder(name: string): boolean {
  if (!name) return true;
  const lower = name.toLowerCase();
  return (
    lower.includes("winner") ||
    lower.includes("loser") ||
    lower.includes("place") ||
    lower.includes("group") ||
    lower.includes("tbd") ||
    lower.includes("to be decided") ||
    lower.includes("match")
  );
}

export function getTeamTier(teamName: string): number {
  const normalized = normalizeTeamName(teamName);
  
  const tier1 = new Set([
    "argentina", "france", "brazil", "england", "spain", "germany", 
    "portugal", "netherlands", "belgium", "croatia", "morocco", 
    "uruguay", "colombia", "unitedstates", "mexico", "senegal"
  ]);

  const tier2 = new Set([
    "japan", "southkorea", "iran", "australia", "ecuador", "sweden", 
    "switzerland", "austria", "czechia", "norway", "scotland", 
    "turkiye", "paraguay", "ivorycoast", "egypt", "algeria"
  ]);

  const tier3 = new Set([
    "canada", "newzealand", "saudiarabia", "qatar", "panama", 
    "southafrica", "iraq", "uzbekistan", "jordan", "haiti", 
    "capeverde", "congodr", "curacao", "tunisia", "bosniaherzegovina", "ghana"
  ]);

  if (tier1.has(normalized)) return 1;
  if (tier2.has(normalized)) return 2;
  if (tier3.has(normalized)) return 3;
  return 3; // default fallback
}

export function formatToAEST(dateStr: string) {
  const date = new Date(dateStr);
  
  // Format in Australia/Sydney (AEST)
  const optionsDate = { timeZone: 'Australia/Sydney', weekday: 'long', month: 'long', day: 'numeric' } as const;
  const optionsTime = { timeZone: 'Australia/Sydney', hour: 'numeric', minute: '2-digit', hour12: true } as const;
  
  const datePartsFormatter = new Intl.DateTimeFormat('en-US', optionsDate);
  const timeFormatter = new Intl.DateTimeFormat('en-US', optionsTime);
  
  const formattedTime = timeFormatter.format(date);
  const parts = datePartsFormatter.formatToParts(date);
  
  let weekday = '';
  let month = '';
  let dayNum = '';
  for (const part of parts) {
    if (part.type === 'weekday') weekday = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') dayNum = part.value;
  }
  
  const day = parseInt(dayNum);
  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) suffix = 'st';
  else if (day === 2 || day === 22) suffix = 'nd';
  else if (day === 3 || day === 23) suffix = 'rd';
  
  const dateHeader = `${weekday}, ${month} ${day}${suffix}`;
  
  // Create stable sort key "YYYY-MM-DD" in Sydney timezone
  const yearStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Sydney', year: 'numeric' }).format(date);
  const monthStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Sydney', month: '2-digit' }).format(date);
  const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Sydney', day: '2-digit' }).format(date);
  const sortDateStr = `${yearStr}-${monthStr}-${dayStr}`;

  return {
    dateHeader,
    kickoffTime: formattedTime,
    sortDateStr
  };
}

export function computeTeamStats(events: ESPNEvent[]): Record<string, TeamStats> {
  const teamStats: Record<string, TeamStats> = {};

  // First pass: Discover all real teams and initialize stats
  for (const event of events) {
    const competitors = event.competitions?.[0]?.competitors || [];
    for (const comp of competitors) {
      const rawName = comp.team?.displayName;
      if (!rawName || isPlaceholder(rawName)) continue;
      
      const normalized = normalizeTeamName(rawName);
      if (!teamStats[normalized]) {
        teamStats[normalized] = {
          name: rawName,
          logo: comp.team.logo || "",
          abbreviation: comp.team.abbreviation || "",
          mp: 0,
          w: 0,
          d: 0,
          l: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          pts: 0,
          eliminated: false
        };
      }
    }
  }

  // Second pass: Calculate match outcomes and stats
  for (const event of events) {
    const isCompleted = event.status?.type?.completed;
    if (!isCompleted) continue;

    const competitors = event.competitions?.[0]?.competitors || [];
    if (competitors.length < 2) continue;

    const compHome = competitors.find(c => c.homeAway === 'home');
    const compAway = competitors.find(c => c.homeAway === 'away');
    if (!compHome || !compAway) continue;

    const homeName = compHome.team?.displayName;
    const awayName = compAway.team?.displayName;
    if (!homeName || !awayName || isPlaceholder(homeName) || isPlaceholder(awayName)) continue;

    const homeNorm = normalizeTeamName(homeName);
    const awayNorm = normalizeTeamName(awayName);

    const homeScore = parseInt(compHome.score) || 0;
    const awayScore = parseInt(compAway.score) || 0;

    // Retrieve stats records
    const homeStats = teamStats[homeNorm];
    const awayStats = teamStats[awayNorm];

    if (!homeStats || !awayStats) continue;

    homeStats.mp += 1;
    awayStats.mp += 1;
    homeStats.gf += homeScore;
    awayStats.gf += awayScore;
    homeStats.ga += awayScore;
    awayStats.ga += homeScore;

    let homeResult: 'win' | 'draw' | 'loss' = 'draw';
    let awayResult: 'win' | 'draw' | 'loss' = 'draw';

    // Account for penalty shootouts / winner flag
    if (compHome.winner === true) {
      homeResult = 'win';
      awayResult = 'loss';
    } else if (compAway.winner === true) {
      homeResult = 'loss';
      awayResult = 'win';
    } else if (homeScore > awayScore) {
      homeResult = 'win';
      awayResult = 'loss';
    } else if (awayScore > homeScore) {
      homeResult = 'loss';
      awayResult = 'win';
    }

    if (homeResult === 'win') {
      homeStats.w += 1;
      homeStats.pts += 3;
      awayStats.l += 1;
    } else if (homeResult === 'loss') {
      homeStats.l += 1;
      awayStats.w += 1;
      awayStats.pts += 3;
    } else {
      homeStats.d += 1;
      homeStats.pts += 1;
      awayStats.d += 1;
      awayStats.pts += 1;
    }

    homeStats.gd = homeStats.gf - homeStats.ga;
    awayStats.gd = awayStats.gf - awayStats.ga;
  }

  // Third pass: Determine elimination status
  const r32Teams = new Set<string>();
  let r32HasRealTeams = false;

  for (const event of events) {
    const slug = event.season?.slug;
    if (slug === 'round-of-32') {
      const competitors = event.competitions?.[0]?.competitors || [];
      for (const comp of competitors) {
        const name = comp.team?.displayName;
        if (name && !isPlaceholder(name)) {
          r32HasRealTeams = true;
          r32Teams.add(normalizeTeamName(name));
        }
      }
    }
  }

  // If Round of 32 has started to be populated, any team not present is eliminated
  if (r32HasRealTeams) {
    for (const normalized of Object.keys(teamStats)) {
      if (!r32Teams.has(normalized)) {
        teamStats[normalized].eliminated = true;
      }
    }
  }

  // Also check completed knockout matches
  for (const event of events) {
    const slug = event.season?.slug;
    const isKnockout = slug && slug !== 'group-stage' && slug !== '3rd-place-match';
    const isCompleted = event.status?.type?.completed;

    if (isKnockout && isCompleted) {
      const competitors = event.competitions?.[0]?.competitors || [];
      for (const comp of competitors) {
        const name = comp.team?.displayName;
        if (name && !isPlaceholder(name)) {
          const normalized = normalizeTeamName(name);
          if (comp.winner === false && teamStats[normalized]) {
            teamStats[normalized].eliminated = true;
          }
        }
      }
    }
  }

  return teamStats;
}

export function computeUserStandings(
  allocations: UserAllocation[],
  teamStats: Record<string, TeamStats>
): UserStandings[] {
  const userStandings: UserStandings[] = allocations.map(alloc => {
    const t1 = teamStats[normalizeTeamName(alloc.tier1_team)];
    const t2 = teamStats[normalizeTeamName(alloc.tier2_team)];
    const t3 = teamStats[normalizeTeamName(alloc.tier3_team)];

    // Fallbacks if stats aren't loaded or team name doesn't match
    const stats1: TeamStats = t1 || { name: alloc.tier1_team, logo: "", abbreviation: "", mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, eliminated: false };
    const stats2: TeamStats = t2 || { name: alloc.tier2_team, logo: "", abbreviation: "", mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, eliminated: false };
    const stats3: TeamStats = t3 || { name: alloc.tier3_team, logo: "", abbreviation: "", mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, eliminated: false };

    return {
      user: alloc.user,
      rank: 0,
      teams: [stats1, stats2, stats3],
      totalPts: stats1.pts + stats2.pts + stats3.pts,
      totalGD: stats1.gd + stats2.gd + stats3.gd,
      totalGF: stats1.gf + stats2.gf + stats3.gf
    };
  });

  // Sort by pts DESC, then gd DESC, then gf DESC
  userStandings.sort((a, b) => {
    if (b.totalPts !== a.totalPts) {
      return b.totalPts - a.totalPts;
    }
    if (b.totalGD !== a.totalGD) {
      return b.totalGD - a.totalGD;
    }
    return b.totalGF - a.totalGF;
  });

  // Assign ranks (sequential)
  userStandings.forEach((user, idx) => {
    user.rank = idx + 1;
  });

  return userStandings;
}
