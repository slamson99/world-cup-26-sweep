export interface TeamMeta {
  flag: string;
  odds: string;
  group: string;
  opponents: string[];
  ranking: number;
  bestFinish: string;
  marqueePlayer: string;
}

export const TEAM_METADATA: Record<string, TeamMeta> = {
  argentina: {
    flag: "🇦🇷",
    odds: "5/1",
    group: "Group J",
    opponents: ["Algeria", "Austria", "Jordan"],
    ranking: 1,
    bestFinish: "Winners (1978, 1986, 2022)",
    marqueePlayer: "Lionel Messi"
  },
  france: {
    flag: "🇫🇷",
    odds: "6/1",
    group: "Group I",
    opponents: ["Senegal", "Iraq", "Norway"],
    ranking: 2,
    bestFinish: "Winners (1998, 2018)",
    marqueePlayer: "Kylian Mbappé"
  },
  brazil: {
    flag: "🇧🇷",
    odds: "11/2",
    group: "Group C",
    opponents: ["Morocco", "Haiti", "Scotland"],
    ranking: 5,
    bestFinish: "Winners (1958, 1962, 1970, 1994, 2002)",
    marqueePlayer: "Vinícius Júnior"
  },
  england: {
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    odds: "6/1",
    group: "Group L",
    opponents: ["Croatia", "Ghana", "Panama"],
    ranking: 4,
    bestFinish: "Winners (1966)",
    marqueePlayer: "Jude Bellingham"
  },
  spain: {
    flag: "🇪🇸",
    odds: "7/1",
    group: "Group H",
    opponents: ["Cape Verde", "Saudi Arabia", "Uruguay"],
    ranking: 3,
    bestFinish: "Winners (2010)",
    marqueePlayer: "Lamine Yamal"
  },
  germany: {
    flag: "🇩🇪",
    odds: "9/1",
    group: "Group E",
    opponents: ["Curaçao", "Ivory Coast", "Ecuador"],
    ranking: 11,
    bestFinish: "Winners (1954, 1974, 1990, 2014)",
    marqueePlayer: "Florian Wirtz"
  },
  portugal: {
    flag: "🇵🇹",
    odds: "10/1",
    group: "Group K",
    opponents: ["DR Congo", "Uzbekistan", "Colombia"],
    ranking: 7,
    bestFinish: "Third place (1966)",
    marqueePlayer: "Cristiano Ronaldo"
  },
  netherlands: {
    flag: "🇳🇱",
    odds: "14/1",
    group: "Group F",
    opponents: ["Japan", "Sweden", "Tunisia"],
    ranking: 8,
    bestFinish: "Runners-up (1974, 1978, 2010)",
    marqueePlayer: "Virgil van Dijk"
  },
  belgium: {
    flag: "🇧🇪",
    odds: "16/1",
    group: "Group G",
    opponents: ["Egypt", "Iran", "New Zealand"],
    ranking: 6,
    bestFinish: "Third place (2018)",
    marqueePlayer: "Kevin De Bruyne"
  },
  croatia: {
    flag: "🇭🇷",
    odds: "25/1",
    group: "Group L",
    opponents: ["England", "Ghana", "Panama"],
    ranking: 12,
    bestFinish: "Runners-up (2018)",
    marqueePlayer: "Luka Modrić"
  },
  morocco: {
    flag: "🇲🇦",
    odds: "28/1",
    group: "Group C",
    opponents: ["Brazil", "Haiti", "Scotland"],
    ranking: 13,
    bestFinish: "Fourth place (2022)",
    marqueePlayer: "Achraf Hakimi"
  },
  uruguay: {
    flag: "🇺🇾",
    odds: "22/1",
    group: "Group H",
    opponents: ["Spain", "Cape Verde", "Saudi Arabia"],
    ranking: 14,
    bestFinish: "Winners (1930, 1950)",
    marqueePlayer: "Federico Valverde"
  },
  colombia: {
    flag: "🇨🇴",
    odds: "20/1",
    group: "Group K",
    opponents: ["Portugal", "DR Congo", "Uzbekistan"],
    ranking: 9,
    bestFinish: "Quarter-finals (2014)",
    marqueePlayer: "Luis Díaz"
  },
  unitedstates: {
    flag: "🇺🇸",
    odds: "33/1",
    group: "Group D",
    opponents: ["Paraguay", "Australia", "Türkiye"],
    ranking: 16,
    bestFinish: "Third place (1930)",
    marqueePlayer: "Christian Pulisic"
  },
  mexico: {
    flag: "🇲🇽",
    odds: "40/1",
    group: "Group A",
    opponents: ["South Africa", "South Korea", "Czechia"],
    ranking: 15,
    bestFinish: "Quarter-finals (1970, 1986)",
    marqueePlayer: "Santiago Giménez"
  },
  senegal: {
    flag: "🇸🇳",
    odds: "50/1",
    group: "Group I",
    opponents: ["France", "Iraq", "Norway"],
    ranking: 21,
    bestFinish: "Quarter-finals (2002)",
    marqueePlayer: "Sadio Mané"
  },
  japan: {
    flag: "🇯🇵",
    odds: "66/1",
    group: "Group F",
    opponents: ["Netherlands", "Sweden", "Tunisia"],
    ranking: 18,
    bestFinish: "Round of 16",
    marqueePlayer: "Kaoru Mitoma"
  },
  southkorea: {
    flag: "🇰🇷",
    odds: "80/1",
    group: "Group A",
    opponents: ["Mexico", "South Africa", "Czechia"],
    ranking: 22,
    bestFinish: "Fourth place (2002)",
    marqueePlayer: "Son Heung-min"
  },
  iran: {
    flag: "🇮🇷",
    odds: "150/1",
    group: "Group G",
    opponents: ["Belgium", "Egypt", "New Zealand"],
    ranking: 20,
    bestFinish: "Group Stage",
    marqueePlayer: "Mehdi Taremi"
  },
  australia: {
    flag: "🇦🇺",
    odds: "100/1",
    group: "Group D",
    opponents: ["United States", "Paraguay", "Türkiye"],
    ranking: 23,
    bestFinish: "Round of 16",
    marqueePlayer: "Nestory Irankunda"
  },
  ecuador: {
    flag: "🇪🇨",
    odds: "80/1",
    group: "Group E",
    opponents: ["Germany", "Curaçao", "Ivory Coast"],
    ranking: 30,
    bestFinish: "Round of 16 (2006)",
    marqueePlayer: "Moisés Caicedo"
  },
  sweden: {
    flag: "🇸🇪",
    odds: "80/1",
    group: "Group F",
    opponents: ["Netherlands", "Japan", "Tunisia"],
    ranking: 28,
    bestFinish: "Runners-up (1958)",
    marqueePlayer: "Alexander Isak"
  },
  switzerland: {
    flag: "🇨🇭",
    odds: "66/1",
    group: "Group B",
    opponents: ["Canada", "Bosnia & Herzegovina", "Qatar"],
    ranking: 19,
    bestFinish: "Quarter-finals",
    marqueePlayer: "Granit Xhaka"
  },
  austria: {
    flag: "🇦🇹",
    odds: "80/1",
    group: "Group J",
    opponents: ["Argentina", "Algeria", "Jordan"],
    ranking: 25,
    bestFinish: "Third place (1954)",
    marqueePlayer: "David Alaba"
  },
  czechia: {
    flag: "🇨🇿",
    odds: "100/1",
    group: "Group A",
    opponents: ["Mexico", "South Africa", "South Korea"],
    ranking: 36,
    bestFinish: "Runners-up (1934, 1962)",
    marqueePlayer: "Patrik Schick"
  },
  norway: {
    flag: "🇳🇴",
    odds: "66/1",
    group: "Group I",
    opponents: ["France", "Senegal", "Iraq"],
    ranking: 47,
    bestFinish: "Round of 16",
    marqueePlayer: "Erling Haaland"
  },
  scotland: {
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    odds: "150/1",
    group: "Group C",
    opponents: ["Brazil", "Morocco", "Haiti"],
    ranking: 39,
    bestFinish: "Group Stage",
    marqueePlayer: "Scott McTominay"
  },
  turkiye: {
    flag: "🇹🇷",
    odds: "66/1",
    group: "Group D",
    opponents: ["United States", "Paraguay", "Australia"],
    ranking: 26,
    bestFinish: "Third place (2002)",
    marqueePlayer: "Arda Güler"
  },
  paraguay: {
    flag: "🇵🇾",
    odds: "150/1",
    group: "Group D",
    opponents: ["United States", "Australia", "Türkiye"],
    ranking: 56,
    bestFinish: "Quarter-finals (2010)",
    marqueePlayer: "Julio Enciso"
  },
  ivorycoast: {
    flag: "🇨🇮",
    odds: "100/1",
    group: "Group E",
    opponents: ["Germany", "Curaçao", "Ecuador"],
    ranking: 38,
    bestFinish: "Group Stage",
    marqueePlayer: "Franck Kessié"
  },
  egypt: {
    flag: "🇪🇬",
    odds: "100/1",
    group: "Group G",
    opponents: ["Belgium", "Iran", "New Zealand"],
    ranking: 37,
    bestFinish: "Group Stage",
    marqueePlayer: "Mohamed Salah"
  },
  algeria: {
    flag: "🇩🇿",
    odds: "120/1",
    group: "Group J",
    opponents: ["Argentina", "Austria", "Jordan"],
    ranking: 44,
    bestFinish: "Round of 16 (2014)",
    marqueePlayer: "Riyad Mahrez"
  },
  canada: {
    flag: "🇨🇦",
    odds: "150/1",
    group: "Group B",
    opponents: ["Bosnia & Herzegovina", "Qatar", "Switzerland"],
    ranking: 40,
    bestFinish: "Group Stage",
    marqueePlayer: "Alphonso Davies"
  },
  newzealand: {
    flag: "🇳🇿",
    odds: "500/1",
    group: "Group G",
    opponents: ["Belgium", "Egypt", "Iran"],
    ranking: 107,
    bestFinish: "Group Stage",
    marqueePlayer: "Chris Wood"
  },
  saudiarabia: {
    flag: "🇸🇦",
    odds: "250/1",
    group: "Group H",
    opponents: ["Spain", "Cape Verde", "Uruguay"],
    ranking: 53,
    bestFinish: "Round of 16 (1994)",
    marqueePlayer: "Salem Al-Dawsari"
  },
  qatar: {
    flag: "🇶🇦",
    odds: "250/1",
    group: "Group B",
    opponents: ["Canada", "Bosnia & Herzegovina", "Switzerland"],
    ranking: 35,
    bestFinish: "Group Stage",
    marqueePlayer: "Akram Afif"
  },
  panama: {
    flag: "🇵🇦",
    odds: "350/1",
    group: "Group L",
    opponents: ["England", "Croatia", "Ghana"],
    ranking: 43,
    bestFinish: "Group Stage",
    marqueePlayer: "Adalberto Carrasquilla"
  },
  southafrica: {
    flag: "🇿🇦",
    odds: "300/1",
    group: "Group A",
    opponents: ["Mexico", "South Korea", "Czechia"],
    ranking: 59,
    bestFinish: "Group Stage",
    marqueePlayer: "Percy Tau"
  },
  iraq: {
    flag: "🇮🇶",
    odds: "400/1",
    group: "Group I",
    opponents: ["France", "Senegal", "Norway"],
    ranking: 58,
    bestFinish: "Group Stage",
    marqueePlayer: "Aymen Hussein"
  },
  uzbekistan: {
    flag: "🇺🇿",
    odds: "300/1",
    group: "Group K",
    opponents: ["Portugal", "DR Congo", "Colombia"],
    ranking: 64,
    bestFinish: "Debut (2026)",
    marqueePlayer: "Eldor Shomurodov"
  },
  jordan: {
    flag: "🇯🇴",
    odds: "500/1",
    group: "Group J",
    opponents: ["Argentina", "Algeria", "Austria"],
    ranking: 71,
    bestFinish: "Debut (2026)",
    marqueePlayer: "Mousa Al-Tamari"
  },
  haiti: {
    flag: "🇭🇹",
    odds: "500/1",
    group: "Group C",
    opponents: ["Brazil", "Morocco", "Scotland"],
    ranking: 90,
    bestFinish: "Group Stage",
    marqueePlayer: "Frantzdy Pierrot"
  },
  capeverde: {
    flag: "🇨🇻",
    odds: "400/1",
    group: "Group H",
    opponents: ["Spain", "Saudi Arabia", "Uruguay"],
    ranking: 65,
    bestFinish: "Debut (2026)",
    marqueePlayer: "Ryan Mendes"
  },
  congodr: {
    flag: "🇨🇩",
    odds: "300/1",
    group: "Group K",
    opponents: ["Portugal", "Uzbekistan", "Colombia"],
    ranking: 61,
    bestFinish: "Group Stage (1974)",
    marqueePlayer: "Yoane Wissa"
  },
  curacao: {
    flag: "🇨🇼",
    odds: "500/1",
    group: "Group E",
    opponents: ["Germany", "Ivory Coast", "Ecuador"],
    ranking: 91,
    bestFinish: "Debut (2026)",
    marqueePlayer: "Juninho Bacuna"
  },
  tunisia: {
    flag: "🇹🇳",
    odds: "300/1",
    group: "Group F",
    opponents: ["Netherlands", "Japan", "Sweden"],
    ranking: 41,
    bestFinish: "Group Stage",
    marqueePlayer: "Ellyes Skhiri"
  },
  bosniaherzegovina: {
    flag: "🇧🇦",
    odds: "250/1",
    group: "Group B",
    opponents: ["Canada", "Qatar", "Switzerland"],
    ranking: 74,
    bestFinish: "Group Stage (2014)",
    marqueePlayer: "Edin Džeko"
  },
  ghana: {
    flag: "🇬🇭",
    odds: "150/1",
    group: "Group L",
    opponents: ["England", "Croatia", "Panama"],
    ranking: 68,
    bestFinish: "Quarter-finals (2010)",
    marqueePlayer: "Mohammed Kudus"
  }
};
