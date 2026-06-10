'use client';

import React from 'react';
import { UserStandings } from '../types';

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

      {/* Standings Leaderboard Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto whitespace-nowrap rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-white/60">
              <th className="px-4 py-4 text-center w-16">Rank</th>
              <th className="px-6 py-4">User</th>
              <th className="px-4 py-4 text-center">Allocated Teams (T1 / T2 / T3)</th>
              <th className="px-4 py-4 text-center w-16">MP</th>
              <th className="px-4 py-4 text-center w-16">W</th>
              <th className="px-4 py-4 text-center w-16">D</th>
              <th className="px-4 py-4 text-center w-16">L</th>
              <th className="px-4 py-4 text-center w-16">GF</th>
              <th className="px-4 py-4 text-center w-16">GD</th>
              <th className="px-6 py-4 text-center text-trophy-gold font-black w-24">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {standings.map((userRow) => {
              const isTop3 = userRow.rank <= 3;
              const rankMedal = userRow.rank === 1 ? '🥇' : userRow.rank === 2 ? '🥈' : userRow.rank === 3 ? '🥉' : null;
              const totalMP = userRow.teams.reduce((acc, t) => acc + t.mp, 0);

              return (
                <tr
                  key={userRow.user}
                  className={`transition-all hover:bg-white/10 ${
                    isTop3 ? 'bg-trophy-gold/5' : ''
                  }`}
                >
                  {/* Rank Column with Gold Border Highlight for Top 3 */}
                  <td className={`px-4 py-4 text-center font-mono ${
                    isTop3 ? 'border-l-4 border-trophy-gold' : 'border-l-4 border-transparent'
                  }`}>
                    {rankMedal ? (
                      <span className="text-xl">{rankMedal}</span>
                    ) : (
                      <span className="text-sm font-bold text-white/40">{userRow.rank}</span>
                    )}
                  </td>

                  {/* Username */}
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold tracking-wide ${
                      isTop3 ? 'text-trophy-gold text-base' : 'text-white'
                    }`}>
                      {userRow.user}
                    </span>
                  </td>

                  {/* Allocated Teams (Tier 1, Tier 2, Tier 3) */}
                  <td className="px-4 py-4">
                    <div className="flex justify-center items-center gap-6">
                      {userRow.teams.map((team, idx) => {
                        const tier = idx + 1;
                        return (
                          <div
                            key={team.name}
                            className="flex flex-col items-center group relative cursor-help"
                            title={`${team.name} (Tier ${tier}) - Pts: ${team.pts}, GD: ${team.gd}, W-D-L: ${team.w}-${team.d}-${team.l}`}
                          >
                            {/* Flag logo with elimination overlay */}
                            <div className="relative">
                              {team.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={team.logo}
                                  alt={team.name}
                                  className={`w-8 h-8 object-contain filter drop-shadow-md transition-all ${
                                    team.eliminated ? 'grayscale opacity-30 brightness-50' : 'group-hover:scale-110'
                                  }`}
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs ${team.eliminated ? 'opacity-30' : ''}`}>🏳️</div>
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
                  </td>

                  {/* Matches Played */}
                  <td className="px-4 py-4 text-center text-sm font-semibold font-mono text-white/70">
                    {totalMP}
                  </td>

                  {/* Total Wins */}
                  <td className="px-4 py-4 text-center text-sm font-semibold font-mono text-green-400/95">
                    {userRow.totalW}
                  </td>

                  {/* Total Draws */}
                  <td className="px-4 py-4 text-center text-sm font-semibold font-mono text-white/70">
                    {userRow.totalD}
                  </td>

                  {/* Total Losses */}
                  <td className="px-4 py-4 text-center text-sm font-semibold font-mono text-red-400/95">
                    {userRow.totalL}
                  </td>

                  {/* Goals For */}
                  <td className="px-4 py-4 text-center text-sm font-semibold font-mono text-white/70">
                    {userRow.totalGF}
                  </td>

                  {/* Goal Difference */}
                  <td className="px-4 py-4 text-center text-sm font-semibold font-mono">
                    <span className={userRow.totalGD > 0 ? 'text-green-400' : userRow.totalGD < 0 ? 'text-red-400' : 'text-white/70'}>
                      {userRow.totalGD > 0 ? `+${userRow.totalGD}` : userRow.totalGD}
                    </span>
                  </td>

                  {/* Total Points */}
                  <td className="px-6 py-4 text-center text-base font-black font-mono text-trophy-gold">
                    {userRow.totalPts}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
