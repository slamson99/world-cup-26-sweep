'use client';

import React, { useState, useMemo } from 'react';
import { ESPNEvent, UserAllocation, TeamStats } from '../types';
import { normalizeTeamName, isPlaceholder, formatToAEST } from '../utils/helpers';

interface KnockoutBracketProps {
  events: ESPNEvent[];
  allocations: UserAllocation[];
  teamStats: Record<string, TeamStats>;
}

export default function KnockoutBracket({ events, allocations, teamStats }: KnockoutBracketProps) {
  const [activePhase, setActivePhase] = useState<'r32' | 'r16' | 'qf' | 'sf' | 'finals'>('r32');

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

  // Group and sort matches for each knockout round
  const knockoutRounds = useMemo(() => {
    const filterAndSort = (slug: string) => {
      return events
        .filter(e => e.season?.slug === slug)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const r32 = filterAndSort('round-of-32');
    const r16 = filterAndSort('round-of-16');
    const qf = filterAndSort('quarterfinals');
    const sf = filterAndSort('semifinals');
    // Combine Final and 3rd Place Match in the finals column
    const finals = events
      .filter(e => e.season?.slug === 'final' || e.season?.slug === '3rd-place-match')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { r32, r16, qf, sf, finals };
  }, [events]);

  const activeMatches = useMemo(() => {
    switch (activePhase) {
      case 'r32': return knockoutRounds.r32;
      case 'r16': return knockoutRounds.r16;
      case 'qf': return knockoutRounds.qf;
      case 'sf': return knockoutRounds.sf;
      case 'finals': return knockoutRounds.finals;
      default: return [];
    }
  }, [activePhase, knockoutRounds]);

  // Check if a team is eliminated (OUT) or alive (ALIVE)
  const getTeamStatus = (teamName: string): 'ALIVE' | 'OUT' | 'PLACEHOLDER' => {
    if (isPlaceholder(teamName)) return 'PLACEHOLDER';
    const norm = normalizeTeamName(teamName);
    const stats = teamStats[norm];
    if (stats && stats.eliminated) return 'OUT';
    return 'ALIVE';
  };

  // Helper to render a team row in a matchup card
  const renderTeamRow = (competitor: any) => {
    const name = competitor?.team?.displayName || 'TBD';
    const logo = competitor?.team?.logo;
    const score = competitor?.score;
    const winner = competitor?.winner;
    const status = getTeamStatus(name);
    const alloc = getAllocation(name);

    const isOut = status === 'OUT';
    const isAlive = status === 'ALIVE';

    return (
      <div
        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
          isOut 
            ? 'bg-black/20 border-transparent opacity-40' 
            : isAlive 
              ? 'bg-white/5 border-white/5 hover:bg-white/10'
              : 'bg-black/10 border-dashed border-white/5 opacity-50'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Flag logo */}
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={name}
              className={`w-6 h-6 object-contain filter drop-shadow-sm flex-shrink-0 ${isOut ? 'grayscale opacity-50' : ''}`}
            />
          ) : (
            <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-[10px] flex-shrink-0">🏳️</div>
          )}

          {/* Team Name */}
          <div className="flex flex-col min-w-0">
            <span className={`text-xs md:text-sm font-semibold truncate text-white flex items-center gap-1.5 ${
              isOut ? 'line-through text-white/40' : ''
            }`}>
              {name}
              {isOut && (
                <span className="text-[7px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-1 py-0.2 rounded-sm uppercase tracking-wider leading-none">
                  OUT
                </span>
              )}
              {isAlive && !isPlaceholder(name) && (
                <span className="text-[7px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-1 py-0.2 rounded-sm uppercase tracking-wider leading-none">
                  ALIVE
                </span>
              )}
            </span>

            {/* Sweep Owner */}
            {alloc && (
              <span className={`text-[9px] font-medium tracking-wide mt-0.5 ${isOut ? 'text-white/20' : 'text-trophy-gold/80'}`}>
                {alloc.user} <span className="opacity-60 text-[7px] font-mono">T{alloc.tier}</span>
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        {score !== undefined && score !== '' && score !== null && (
          <span className={`text-sm md:text-base font-black font-mono leading-none ${
            winner ? 'text-trophy-gold' : isOut ? 'text-white/30' : 'text-white'
          }`}>
            {score}
          </span>
        )}
      </div>
    );
  };

  // Helper to render a matchup card
  const renderMatchupCard = (event: ESPNEvent) => {
    const competitors = event.competitions?.[0]?.competitors || [];
    const home = competitors.find(c => c.homeAway === 'home');
    const away = competitors.find(c => c.homeAway === 'away');
    
    if (!home || !away) return null;

    const isLive = event.status?.type?.state === 'in';
    const isCompleted = event.status?.type?.completed;
    const { kickoffTime, dateHeader } = formatToAEST(event.date);

    return (
      <div
        key={event.id}
        className={`bg-white/5 border border-white/10 rounded-xl p-3 shadow-md flex flex-col justify-between transition-all ${
          isLive ? 'ring-1 ring-red-500/50 bg-red-500/5 border-red-500/20' : ''
        }`}
      >
        {/* Match Header */}
        <div className="flex justify-between items-center mb-2.5 border-b border-white/5 pb-1.5">
          <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">
            {event.season?.slug?.replace(/-/g, ' ')}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
            isLive ? 'bg-red-500 text-white animate-pulse' :
            isCompleted ? 'bg-white/10 text-white/50' :
            'bg-trophy-gold/10 text-trophy-gold border border-trophy-gold/20'
          }`}>
            {isLive ? 'LIVE' : isCompleted ? 'FT' : `${dateHeader.split(', ')[1]} - ${kickoffTime}`}
          </span>
        </div>

        {/* Teams Stack */}
        <div className="flex flex-col gap-1.5">
          {renderTeamRow(home)}
          {renderTeamRow(away)}
        </div>
      </div>
    );
  };

  // List of rounds for the selector
  const phases = [
    { key: 'r32', label: 'R32', fullName: 'Round of 32', matches: knockoutRounds.r32 },
    { key: 'r16', label: 'R16', fullName: 'Round of 16', matches: knockoutRounds.r16 },
    { key: 'qf', label: 'QF', fullName: 'Quarterfinals', matches: knockoutRounds.qf },
    { key: 'sf', label: 'SF', fullName: 'Semifinals', matches: knockoutRounds.sf },
    { key: 'finals', label: 'Finals', fullName: 'Finals & 3rd Place', matches: knockoutRounds.finals }
  ] as const;

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      
      {/* Title */}
      <div className="mb-4 text-center md:text-left">
        <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
          🏅 Knockout Bracket Progression
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Single elimination bracket starting at the Round of 32. Cross-referenced with sweep user allocations.
        </p>
      </div>

      {/* MOBILE-FIRST SLIDING PHASE SELECTOR (Visible on mobile/tablet) */}
      <div className="block md:hidden mb-4 bg-black/20 p-1 border border-white/5 rounded-full flex overflow-x-auto whitespace-nowrap scrollbar-none">
        {phases.map(phase => (
          <button
            key={phase.key}
            onClick={() => setActivePhase(phase.key)}
            className={`flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activePhase === phase.key
                ? 'bg-trophy-gold text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {phase.label}
          </button>
        ))}
      </div>

      {/* MOBILE MATCHUP CARDS VIEW (Visible on mobile/tablet) */}
      <div className="block md:hidden space-y-3">
        <h3 className="text-xs font-bold uppercase text-trophy-gold/90 tracking-wider mb-2">
          {phases.find(p => p.key === activePhase)?.fullName} Matchups
        </h3>
        
        {activeMatches.length === 0 ? (
          <div className="text-center py-10 bg-white/5 border border-white/10 rounded-xl text-white/40 text-xs">
            No matchups populated yet for this round.
          </div>
        ) : (
          activeMatches.map(event => renderMatchupCard(event))
        )}
      </div>

      {/* DESKTOP TRADITIONAL COLUMN TREE VIEW (Visible on desktop/larger screens) */}
      <div className="hidden md:block overflow-x-auto whitespace-nowrap rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="inline-flex gap-8 items-start min-w-[1200px]">
          {phases.map(phase => (
            <div key={phase.key} className="flex flex-col gap-4 w-72 flex-shrink-0">
              
              {/* Column Header */}
              <div className="bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-center sticky top-0 z-10 backdrop-blur-md">
                <span className="block text-xs font-black uppercase tracking-wider text-trophy-gold">
                  {phase.fullName}
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  {phase.matches.length} Matches
                </span>
              </div>

              {/* Matchups list for this column */}
              <div className="flex flex-col gap-4">
                {phase.matches.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-white/30 text-xs">
                    TBD
                  </div>
                ) : (
                  phase.matches.map(event => renderMatchupCard(event))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
