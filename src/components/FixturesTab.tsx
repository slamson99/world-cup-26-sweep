'use client';

import React, { useState, useMemo } from 'react';
import { ESPNEvent, UserAllocation } from '../types';
import { formatToAEST, normalizeTeamName, isPlaceholder } from '../utils/helpers';

interface FixturesTabProps {
  events: ESPNEvent[];
  allocations: UserAllocation[];
}

const GROUPS_DATA = [
  { name: 'Group A', teams: ['Mexico', 'South Africa', 'South Korea', 'Czechia'] },
  { name: 'Group B', teams: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'] },
  { name: 'Group C', teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'] },
  { name: 'Group D', teams: ['United States', 'Paraguay', 'Australia', 'Türkiye'] },
  { name: 'Group E', teams: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'] },
  { name: 'Group F', teams: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'] },
  { name: 'Group G', teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'] },
  { name: 'Group H', teams: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'] },
  { name: 'Group I', teams: ['France', 'Senegal', 'Iraq', 'Norway'] },
  { name: 'Group J', teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'] },
  { name: 'Group K', teams: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'] },
  { name: 'Group L', teams: ['England', 'Croatia', 'Ghana', 'Panama'] }
];

export default function FixturesTab({ events, allocations }: FixturesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'group' | 'knockout'>('all');

  // Lookup allocation details for a team
  const getAllocation = useMemo(() => {
    const map = new Map<string, { user: string; tier: number }>();
    allocations.forEach(alloc => {
      map.set(normalizeTeamName(alloc.tier_1), { user: alloc.user, tier: 1 });
      map.set(normalizeTeamName(alloc.tier_2), { user: alloc.user, tier: 2 });
      map.set(normalizeTeamName(alloc.tier_3), { user: alloc.user, tier: 3 });
    });
    return (teamName: string) => map.get(normalizeTeamName(teamName)) || null;
  }, [allocations]);

  // Extract logo and abbreviation lookups from events for group rendering
  const teamDetailsMap = useMemo(() => {
    const map = new Map<string, { logo: string; abbreviation: string }>();
    events.forEach(event => {
      event.competitions?.[0]?.competitors?.forEach(comp => {
        const name = comp.team?.displayName;
        if (name && !isPlaceholder(name)) {
          const norm = normalizeTeamName(name);
          if (!map.has(norm)) {
            map.set(norm, {
              logo: comp.team.logo || '',
              abbreviation: comp.team.abbreviation || ''
            });
          }
        }
      });
    });
    return map;
  }, [events]);

  // Process and filter chronological events
  const groupedFixtures = useMemo(() => {
    const filtered = events.filter(event => {
      const slug = event.season?.slug || '';
      const isKnockout = slug !== 'group-stage';
      
      // Stage Filter (for chronological matches list)
      if (activeFilter === 'group' && isKnockout) return false;
      if (activeFilter === 'knockout' && !isKnockout) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        
        // Match details
        const matchName = (event.name || '').toLowerCase();
        
        // Competitors & their sweep owners
        const competitors = event.competitions?.[0]?.competitors || [];
        const matchesTeamOrUser = competitors.some(comp => {
          const teamName = comp.team?.displayName || '';
          if (teamName.toLowerCase().includes(query)) return true;
          
          const alloc = getAllocation(teamName);
          if (alloc && alloc.user.toLowerCase().includes(query)) return true;
          
          return false;
        });

        if (!matchName.includes(query) && !matchesTeamOrUser) {
          return false;
        }
      }

      return true;
    });

    // Sort chronologically
    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by date in AEST
    const groups: { dateHeader: string; sortDateStr: string; matches: ESPNEvent[] }[] = [];

    sorted.forEach(event => {
      const { dateHeader, sortDateStr } = formatToAEST(event.date);
      let group = groups.find(g => g.sortDateStr === sortDateStr);
      if (!group) {
        group = { dateHeader, sortDateStr, matches: [] };
        groups.push(group);
      }
      group.matches.push(event);
    });

    return groups;
  }, [events, activeFilter, searchQuery, getAllocation]);

  // Filter Group Stage grid view
  const filteredGroups = useMemo(() => {
    if (searchQuery.trim() === '') return GROUPS_DATA;
    const query = searchQuery.toLowerCase();
    
    return GROUPS_DATA.filter(group => {
      if (group.name.toLowerCase().includes(query)) return true;
      return group.teams.some(teamName => {
        if (teamName.toLowerCase().includes(query)) return true;
        const alloc = getAllocation(teamName);
        if (alloc && alloc.user.toLowerCase().includes(query)) return true;
        return false;
      });
    });
  }, [searchQuery, getAllocation]);

  // Helper to get status pill styling and text
  const getStatusDisplay = (event: ESPNEvent) => {
    const state = event.status?.type?.state;
    const isCompleted = event.status?.type?.completed;

    if (isCompleted || state === 'post') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-white/10 text-white/60 uppercase">
          FT
        </span>
      );
    }
    if (state === 'in') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/80 text-white animate-pulse border border-red-500 uppercase">
          LIVE
        </span>
      );
    }
    // Scheduled/Upcoming
    const { kickoffTime } = formatToAEST(event.date);
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-trophy-gold/20 text-trophy-gold border border-trophy-gold/30">
        {kickoffTime}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters & Search Header */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search teams or players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-trophy-gold transition-colors placeholder-white/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Stage Tabs */}
        <div className="flex rounded-full bg-black/30 p-1 border border-white/5 w-full md:w-auto">
          {(['all', 'group', 'knockout'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-trophy-gold text-black shadow-md font-extrabold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'group' ? 'Group Stage' : 'Knockouts'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
        {activeFilter === 'group' ? (
          /* 12-Group Stage Visual Grid view */
          filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/40">
              <span className="text-4xl mb-2">⚽</span>
              <p className="text-sm">No groups found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.name}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between"
                >
                  <div>
                    {/* Group Card Header */}
                    <h3 className="text-trophy-gold font-black text-base border-b border-white/10 pb-2 mb-3 tracking-wide uppercase">
                      {group.name}
                    </h3>
                    {/* Vertical List of Group Teams */}
                    <div className="space-y-1">
                      {group.teams.map((teamName) => {
                        const norm = normalizeTeamName(teamName);
                        const details = teamDetailsMap.get(norm);
                        const flag = details?.logo || '';
                        const abbr = details?.abbreviation || teamName.slice(0, 3).toUpperCase();
                        const alloc = getAllocation(teamName);

                        // Highlight match in search query
                        const query = searchQuery.trim().toLowerCase();
                        const isMatch = query !== '' && (
                          teamName.toLowerCase().includes(query) ||
                          (alloc && alloc.user.toLowerCase().includes(query))
                        );

                        return (
                          <div
                            key={teamName}
                            className={`flex items-center justify-between py-2 px-2.5 rounded-lg border transition-all ${
                              isMatch
                                ? 'bg-trophy-gold/15 border-trophy-gold/30 text-white shadow-sm'
                                : 'border-transparent hover:bg-white/5 text-white/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {flag ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={flag}
                                  alt=""
                                  className="w-6 h-6 object-contain filter drop-shadow-sm flex-shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-[10px] flex-shrink-0">🏳️</div>
                              )}
                              <span className="text-xs md:text-sm font-semibold truncate" title={teamName}>
                                {teamName} <span className="text-[10px] text-white/30 font-normal">({abbr})</span>
                              </span>
                            </div>

                            {alloc ? (
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide flex-shrink-0 ${
                                alloc.tier === 1 ? 'bg-trophy-gold/20 text-trophy-gold border border-trophy-gold/30' :
                                alloc.tier === 2 ? 'bg-blue-400/20 text-blue-300 border border-blue-400/20' :
                                'bg-green-400/20 text-green-300 border border-green-400/20'
                              }`}>
                                {alloc.user} <span className="opacity-60 text-[7px]">T{alloc.tier}</span>
                              </span>
                            ) : (
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/20 flex-shrink-0">
                                Unassigned
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Chronological Match List view */
          groupedFixtures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/40">
              <span className="text-4xl mb-2">⚽</span>
              <p className="text-sm">No matches found matching your filters.</p>
            </div>
          ) : (
            groupedFixtures.map((group) => (
              <div key={group.sortDateStr} className="mb-4">
                {/* Sticky Date Header - Solid Opaque */}
                <div className="sticky top-[108px] md:top-[69px] bg-[#0B251E] py-2.5 px-3.5 z-20 border-b border-white/10 rounded-xl shadow-md mb-2">
                  <h3 className="text-xs font-bold tracking-wider text-trophy-gold/90 uppercase inline-block">
                    {group.dateHeader}
                  </h3>
                </div>

                {/* Day's Matches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.matches.map((event) => {
                    const competitors = event.competitions?.[0]?.competitors || [];
                    const home = competitors.find(c => c.homeAway === 'home');
                    const away = competitors.find(c => c.homeAway === 'away');
                    
                    if (!home || !away) return null;

                    const homeAlloc = getAllocation(home.team?.displayName);
                    const awayAlloc = getAllocation(away.team?.displayName);

                    const isLive = event.status?.type?.state === 'in';
                    const isCompleted = event.status?.type?.completed;

                    return (
                      <div
                        key={event.id}
                        className={`relative overflow-hidden rounded-xl border p-3.5 transition-all bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 flex flex-col justify-between ${
                          isLive ? 'ring-1 ring-red-500/50 bg-red-500/5 border-red-500/30' : ''
                        }`}
                      >
                        {/* Top Row: Stage & Status */}
                        <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-1.5">
                          <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono truncate max-w-[70%]">
                            {event.season?.slug?.replace(/-/g, ' ')}
                          </span>
                          {getStatusDisplay(event)}
                        </div>

                        {/* Middle Row: The Match details */}
                        <div className="grid grid-cols-7 items-center justify-center text-center gap-0.5">
                          
                          {/* Home Country */}
                          <div className="col-span-3 flex flex-col items-center min-w-0">
                            {home.team?.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={home.team.logo}
                                alt={home.team.displayName}
                                className="w-8 h-8 object-contain shadow-md mb-1.5 filter drop-shadow-md"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-sm mb-1.5">🏳️</div>
                            )}
                            <span className="text-xs md:text-sm font-semibold truncate w-full text-white px-1">
                              {home.team?.displayName}
                            </span>
                            
                            {/* Sweep Allocation badge */}
                            {homeAlloc ? (
                              <span className={`mt-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide truncate max-w-full ${
                                homeAlloc.tier === 1 ? 'bg-trophy-gold/20 text-trophy-gold border border-trophy-gold/30' :
                                homeAlloc.tier === 2 ? 'bg-blue-400/20 text-blue-300 border border-blue-400/20' :
                                'bg-green-400/20 text-green-300 border border-green-400/20'
                              }`}>
                                {homeAlloc.user} <span className="opacity-60 text-[7px]">T{homeAlloc.tier}</span>
                              </span>
                            ) : (
                              !isPlaceholder(home.team?.displayName) && (
                                <span className="mt-1 text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 truncate max-w-full">
                                  Unassigned
                                </span>
                              )
                            )}
                          </div>

                          {/* Scores / VS */}
                          <div className="col-span-1 flex flex-col justify-center items-center">
                            {(isLive || isCompleted) ? (
                              <div className="flex items-center justify-center gap-1">
                                <span className={`text-lg font-bold font-mono tracking-tight ${isLive ? 'text-red-400' : 'text-white'}`}>
                                  {home.score}
                                </span>
                                <span className="text-white/30 text-[10px]">-</span>
                                <span className={`text-lg font-bold font-mono tracking-tight ${isLive ? 'text-red-400' : 'text-white'}`}>
                                  {away.score}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                VS
                              </span>
                            )}
                          </div>

                          {/* Away Country */}
                          <div className="col-span-3 flex flex-col items-center min-w-0">
                            {away.team?.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={away.team.logo}
                                alt={away.team.displayName}
                                className="w-8 h-8 object-contain shadow-md mb-1.5 filter drop-shadow-md"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-sm mb-1.5">🏳️</div>
                            )}
                            <span className="text-xs md:text-sm font-semibold truncate w-full text-white px-1">
                              {away.team?.displayName}
                            </span>

                            {/* Sweep Allocation badge */}
                            {awayAlloc ? (
                              <span className={`mt-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide truncate max-w-full ${
                                awayAlloc.tier === 1 ? 'bg-trophy-gold/20 text-trophy-gold border border-trophy-gold/30' :
                                awayAlloc.tier === 2 ? 'bg-blue-400/20 text-blue-300 border border-blue-400/20' :
                                'bg-green-400/20 text-green-300 border border-green-400/20'
                              }`}>
                                {awayAlloc.user} <span className="opacity-60 text-[7px]">T{awayAlloc.tier}</span>
                              </span>
                            ) : (
                              !isPlaceholder(away.team?.displayName) && (
                                <span className="mt-1 text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 truncate max-w-full">
                                  Unassigned
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {/* Detail Text (Venue or Live Detail) */}
                        {isLive && event.status?.type?.detail && (
                          <div className="mt-1.5 text-center text-[9px] text-red-400 font-bold animate-pulse">
                            {event.status.type.detail}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
