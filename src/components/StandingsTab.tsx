'use client';

import React from 'react';
import { UserStandings } from '../types';
import { getTeamTier } from '../utils/helpers';

interface StandingsTabProps {
  standings: UserStandings[];
}

export default function StandingsTab({ standings }: StandingsTabProps) {
  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Standings Summary / Header */}
      <div className="mb-4 text-center md:text-left">
        <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
          🏆 Leaderboard Standings
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Sum of your 3 allocated teams (Win = 3 pts, Draw = 1 pt, Loss = 0 pts). Tiebreakers: GD, then GF.
        </p>
      </div>

      {/* Standings Leaderboard Table / Card List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
        {/* Table Headers (Hidden on small screens, shown on md+) */}
        <div className="hidden md:grid grid-cols-12 gap-2 bg-black/40 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-3">User</div>
          <div className="col-span-4 text-center">Allocated Teams (Tier 1 / 2 / 3)</div>
          <div className="col-span-1 text-center">MP</div>
          <div className="col-span-1 text-center">GF</div>
          <div className="col-span-1 text-center">GD</div>
          <div className="col-span-1 text-center text-trophy-gold font-bold">Pts</div>
        </div>

        {/* User Rows */}
        <div className="divide-y divide-white/5">
          {standings.map((userRow, index) => {
            const isTop3 = userRow.rank <= 3;
            const rankMedal = userRow.rank === 1 ? '🥇' : userRow.rank === 2 ? '🥈' : userRow.rank === 3 ? '🥉' : null;

            return (
              <div
                key={userRow.user}
                className={`grid grid-cols-12 md:grid-cols-12 gap-2 items-center px-4 py-4 md:px-6 transition-all hover:bg-white/10 ${
                  isTop3
                    ? 'bg-trophy-gold/5 border-l-4 border-trophy-gold'
                    : 'border-l-4 border-transparent'
                }`}
              >
                {/* Mobile Rank & User combined, desktop separated */}
                <div className="col-span-12 md:col-span-1 flex items-center md:justify-center justify-between border-b border-white/5 pb-2 md:pb-0 md:border-b-0">
                  {/* Rank Display */}
                  <div className="flex items-center gap-1.5">
                    {rankMedal ? (
                      <span className="text-xl">{rankMedal}</span>
                    ) : (
                      <span className="text-sm font-bold font-mono text-white/40 w-6 text-center">
                        {userRow.rank}
                      </span>
                    )}
                    <span className="md:hidden font-bold text-white text-base">
                      {userRow.user}
                    </span>
                  </div>

                  {/* Points (Mobile-only display in header) */}
                  <div className="md:hidden flex items-center gap-2">
                    <span className="text-xs text-white/40">Points:</span>
                    <span className="text-base font-extrabold text-trophy-gold font-mono">
                      {userRow.totalPts}
                    </span>
                  </div>
                </div>

                {/* Desktop User Name */}
                <div className="hidden md:block col-span-3">
                  <span className={`text-sm font-bold tracking-wide ${isTop3 ? 'text-trophy-gold text-base' : 'text-white'}`}>
                    {userRow.user}
                  </span>
                </div>

                {/* Allocated Teams */}
                <div className="col-span-12 md:col-span-4 py-2 md:py-0">
                  <div className="flex justify-around md:justify-center items-center gap-4">
                    {userRow.teams.map((team, idx) => {
                      const tier = idx + 1; // index 0 is Tier 1, index 1 is Tier 2, index 2 is Tier 3
                      return (
                        <div
                          key={team.name}
                          className="flex flex-col items-center group relative cursor-help"
                          title={`${team.name} (Tier ${tier}) - Pts: ${team.pts}, GD: ${team.gd}`}
                        >
                          {/* Flag logo with elimination overlay */}
                          <div className="relative">
                            {team.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={team.logo}
                                alt={team.name}
                                className={`w-8 h-8 md:w-9 md:h-9 object-contain filter drop-shadow-md transition-all ${
                                  team.eliminated ? 'grayscale opacity-30 brightness-50' : 'group-hover:scale-110'
                                }`}
                              />
                            ) : (
                              <div className={`w-8 h-8 md:w-9 md:h-9 rounded bg-white/5 flex items-center justify-center text-xs ${team.eliminated ? 'opacity-30' : ''}`}>🏳️</div>
                            )}
                            
                            {/* Eliminated Badge overlay */}
                            {team.eliminated && (
                              <span className="absolute -bottom-1 -right-1 bg-red-600/90 border border-red-500 text-[8px] font-black text-white px-1 py-0.2 rounded-full leading-none tracking-tight">
                                OUT
                              </span>
                            )}
                          </div>

                          {/* Team Name / Abbr */}
                          <span className={`text-[10px] mt-1 font-semibold tracking-wide ${
                            team.eliminated ? 'text-white/20 line-through' : 'text-white/70'
                          }`}>
                            {team.abbreviation || team.name.slice(0, 3).toUpperCase()}
                          </span>

                          {/* Tier Badge */}
                          <span className={`text-[8px] px-1 rounded-sm mt-0.5 leading-none font-bold uppercase ${
                            tier === 1 ? 'bg-trophy-gold/20 text-trophy-gold' :
                            tier === 2 ? 'bg-blue-400/20 text-blue-300' :
                            'bg-green-400/20 text-green-300'
                          }`}>
                            T{tier}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Stats Table */}
                <div className="col-span-12 md:hidden grid grid-cols-4 gap-1 text-center bg-black/20 p-2 rounded-lg text-xs mt-1 border border-white/5">
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase font-medium">Played</span>
                    <span className="font-bold text-white font-mono text-sm">
                      {userRow.teams.reduce((acc, t) => acc + t.mp, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase font-medium">GF</span>
                    <span className="font-bold text-white font-mono text-sm">{userRow.totalGF}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase font-medium">GD</span>
                    <span className={`font-bold font-mono text-sm ${userRow.totalGD > 0 ? 'text-green-400' : userRow.totalGD < 0 ? 'text-red-400' : 'text-white'}`}>
                      {userRow.totalGD > 0 ? `+${userRow.totalGD}` : userRow.totalGD}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase font-medium">Points</span>
                    <span className="font-bold text-trophy-gold font-mono text-sm">{userRow.totalPts}</span>
                  </div>
                </div>

                {/* Desktop-only Stats Columns */}
                <div className="hidden md:block col-span-1 text-center text-sm font-semibold font-mono text-white/70">
                  {userRow.teams.reduce((acc, t) => acc + t.mp, 0)}
                </div>
                <div className="hidden md:block col-span-1 text-center text-sm font-semibold font-mono text-white/70">
                  {userRow.totalGF}
                </div>
                <div className="hidden md:block col-span-1 text-center text-sm font-semibold font-mono">
                  <span className={userRow.totalGD > 0 ? 'text-green-400' : userRow.totalGD < 0 ? 'text-red-400' : 'text-white/70'}>
                    {userRow.totalGD > 0 ? `+${userRow.totalGD}` : userRow.totalGD}
                  </span>
                </div>
                <div className="hidden md:block col-span-1 text-center text-base font-extrabold font-mono text-trophy-gold">
                  {userRow.totalPts}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
