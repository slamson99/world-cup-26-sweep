'use client';

import React, { useState, useMemo } from 'react';
import { ESPNEvent, UserAllocation } from '../types';
import { formatToAEST, normalizeTeamName, isPlaceholder } from '../utils/helpers';

interface FixturesTabProps {
  events: ESPNEvent[];
  allocations: UserAllocation[];
}

export default function FixturesTab({ events, allocations }: FixturesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'group' | 'knockout'>('all');

  // Lookup allocation details for a team
  const getAllocation = useMemo(() => {
    const map = new Map<string, { user: string; tier: number }>();
    allocations.forEach(alloc => {
      map.set(normalizeTeamName(alloc.tier1_team), { user: alloc.user, tier: 1 });
      map.set(normalizeTeamName(alloc.tier2_team), { user: alloc.user, tier: 2 });
      map.set(normalizeTeamName(alloc.tier3_team), { user: alloc.user, tier: 3 });
    });
    return (teamName: string) => map.get(normalizeTeamName(teamName)) || null;
  }, [allocations]);

  // Process and filter events
  const groupedFixtures = useMemo(() => {
    // 1. Filter events based on search and stage
    const filtered = events.filter(event => {
      const slug = event.season?.slug || '';
      const isKnockout = slug !== 'group-stage';
      
      // Stage Filter
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

    // 2. Sort chronologically
    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 3. Group by date in AEST
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

  // Helper to get status pill styling and text
  const getStatusDisplay = (event: ESPNEvent) => {
    const state = event.status?.type?.state;
    const isCompleted = event.status?.type?.completed;
    const detail = event.status?.type?.detail || '';

    if (isCompleted || state === 'post') {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-white/10 text-white/60">
          FT
        </span>
      );
    }
    if (state === 'in') {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/80 text-white animate-pulse border border-red-500">
          LIVE
        </span>
      );
    }
    // Scheduled/Upcoming
    const { kickoffTime } = formatToAEST(event.date);
    return (
      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-trophy-gold/20 text-trophy-gold border border-trophy-gold/30">
        {kickoffTime}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters & Search Header */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search teams or players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-trophy-gold transition-colors placeholder-white/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
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
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-trophy-gold text-black shadow-md font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'group' ? 'Group Stage' : 'Knockouts'}
            </button>
          ))}
        </div>
      </div>

      {/* Fixtures List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {groupedFixtures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/40">
            <span className="text-4xl mb-2">⚽</span>
            <p className="text-sm">No matches found matching your filters.</p>
          </div>
        ) : (
          groupedFixtures.map((group) => (
            <div key={group.sortDateStr} className="mb-6">
              {/* Sticky Date Header */}
              <div className="sticky top-[73px] md:top-[65px] bg-pitch-green py-2 z-5">
                <h3 className="text-sm font-semibold tracking-wider text-trophy-gold/90 uppercase border-b border-trophy-gold/20 pb-1 inline-block">
                  {group.dateHeader}
                </h3>
              </div>

              {/* Day's Matches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
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
                      className={`relative overflow-hidden rounded-xl border p-4 transition-all bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 flex flex-col justify-between ${
                        isLive ? 'ring-1 ring-red-500/50 bg-red-500/5 border-red-500/30' : ''
                      }`}
                    >
                      {/* Top Row: Stage & Status */}
                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                          {event.season?.slug?.replace(/-/g, ' ')}
                        </span>
                        {getStatusDisplay(event)}
                      </div>

                      {/* Middle Row: The Match details */}
                      <div className="grid grid-cols-7 items-center justify-center text-center gap-1 mb-2">
                        {/* Home Country */}
                        <div className="col-span-3 flex flex-col items-center">
                          {home.team?.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={home.team.logo}
                              alt={home.team.displayName}
                              className="w-10 h-10 object-contain shadow-md mb-2 filter drop-shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-lg mb-2">🏳️</div>
                          )}
                          <span className="text-sm font-semibold truncate max-w-full text-white">
                            {home.team?.displayName}
                          </span>
                          
                          {/* Sweep Allocation badge */}
                          {homeAlloc ? (
                            <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${
                              homeAlloc.tier === 1 ? 'bg-trophy-gold/20 text-trophy-gold border border-trophy-gold/30' :
                              homeAlloc.tier === 2 ? 'bg-blue-400/20 text-blue-300 border border-blue-400/20' :
                              'bg-green-400/20 text-green-300 border border-green-400/20'
                            }`}>
                              {homeAlloc.user} <span className="opacity-60 text-[8px]">T{homeAlloc.tier}</span>
                            </span>
                          ) : (
                            !isPlaceholder(home.team?.displayName) && (
                              <span className="mt-1 text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                                Unallocated
                              </span>
                            )
                          )}
                        </div>

                        {/* Scores / VS */}
                        <div className="col-span-1 flex flex-col justify-center items-center">
                          {(isLive || isCompleted) ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={`text-xl font-bold font-mono tracking-tight ${isLive ? 'text-red-400' : 'text-white'}`}>
                                {home.score}
                              </span>
                              <span className="text-white/40 text-xs">-</span>
                              <span className={`text-xl font-bold font-mono tracking-tight ${isLive ? 'text-red-400' : 'text-white'}`}>
                                {away.score}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                              VS
                            </span>
                          )}
                        </div>

                        {/* Away Country */}
                        <div className="col-span-3 flex flex-col items-center">
                          {away.team?.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={away.team.logo}
                              alt={away.team.displayName}
                              className="w-10 h-10 object-contain shadow-md mb-2 filter drop-shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-lg mb-2">🏳️</div>
                          )}
                          <span className="text-sm font-semibold truncate max-w-full text-white">
                            {away.team?.displayName}
                          </span>

                          {/* Sweep Allocation badge */}
                          {awayAlloc ? (
                            <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${
                              awayAlloc.tier === 1 ? 'bg-trophy-gold/20 text-trophy-gold border border-trophy-gold/30' :
                              awayAlloc.tier === 2 ? 'bg-blue-400/20 text-blue-300 border border-blue-400/20' :
                              'bg-green-400/20 text-green-300 border border-green-400/20'
                            }`}>
                              {awayAlloc.user} <span className="opacity-60 text-[8px]">T{awayAlloc.tier}</span>
                            </span>
                          ) : (
                            !isPlaceholder(away.team?.displayName) && (
                              <span className="mt-1 text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                                Unallocated
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Detail Text (Venue or Live Detail) */}
                      {isLive && event.status?.type?.detail && (
                        <div className="mt-2 text-center text-[10px] text-red-400 font-medium animate-pulse">
                          {event.status.type.detail}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
