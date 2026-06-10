'use client';

import React, { useMemo } from 'react';
import { UserStandings } from '../types';

interface PayoutsTabProps {
  standings: UserStandings[];
}

export default function PayoutsTab({ standings }: PayoutsTabProps) {
  // Determine users who have at least one team still alive
  const aliveUsers = useMemo(() => {
    return standings
      .filter(u => u.teams.some(t => !t.eliminated))
      .map(u => ({
        user: u.user,
        aliveTeams: u.teams.filter(t => !t.eliminated)
      }));
  }, [standings]);

  // Find standings expected winners
  const standings1st = standings.find(u => u.rank === 1)?.user || 'TBD';
  const standings2nd = standings.find(u => u.rank === 2)?.user || 'TBD';
  const standings3rd = standings.find(u => u.rank === 3)?.user || 'TBD';

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Tab Header */}
      <div className="mb-6 text-center md:text-left">
        <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
          💰 Sweepstakes Payouts & Prizes
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Financial rewards structure and real-time expected prize distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Standings Leaderboard Prizes */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-trophy-gold border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
              📊 Standings Leaderboard Prizes
            </h3>
            <p className="text-xs text-white/60 mb-6">
              Paid out to the players who accumulate the highest points from all three of their allocated teams.
            </p>

            <div className="space-y-4">
              {/* 1st Place */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="block text-xs text-white/40 font-bold uppercase tracking-wider">1st Place</span>
                  <span className="text-sm font-semibold text-white/80">Expected: <strong className="text-trophy-gold">{standings1st}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-trophy-gold font-mono">$300</span>
                </div>
              </div>

              {/* 2nd Place */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="block text-xs text-white/40 font-bold uppercase tracking-wider">2nd Place</span>
                  <span className="text-sm font-semibold text-white/80">Expected: <strong className="text-white">{standings2nd}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white/95 font-mono">$200</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="block text-xs text-white/40 font-bold uppercase tracking-wider">3rd Place</span>
                  <span className="text-sm font-semibold text-white/80">Expected: <strong className="text-white/80">{standings3rd}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white/80 font-mono">$100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-white/40 text-center italic">
            Calculated dynamically based on real-time leaderboard rankings.
          </div>
        </div>

        {/* Card: Tournament Playoff Prizes */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-trophy-gold border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
              🏆 Tournament Knockout Prizes
            </h3>
            <p className="text-xs text-white/60 mb-6">
              Paid out based on the performance of a single team reaching the World Cup Final.
            </p>

            <div className="space-y-4 mb-6">
              {/* Champion */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="block text-xs text-white/40 font-bold uppercase tracking-wider">Final Winner</span>
                  <span className="text-[10px] text-white/50">Owner of the World Cup Champion team</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-trophy-gold font-mono">$500</span>
                </div>
              </div>

              {/* Runner Up */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                <div>
                  <span className="block text-xs text-white/40 font-bold uppercase tracking-wider">Final Runner Up</span>
                  <span className="text-[10px] text-white/50">Owner of the World Cup Second-place team</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white/95 font-mono">$100</span>
                </div>
              </div>
            </div>

            {/* Dynamic Alive / Expected Winners display */}
            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <span className="block text-xs font-bold text-trophy-gold uppercase tracking-wider mb-2">
                👥 Expected Winners ({aliveUsers.length} Players Alive)
              </span>
              
              {aliveUsers.length === 0 ? (
                <p className="text-xs text-white/30">No users have teams remaining.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {aliveUsers.map(u => (
                    <div key={u.user} className="flex flex-wrap items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <span className="font-semibold text-white/90">{u.user}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u.aliveTeams.map(t => (
                          <span
                            key={t.name}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/70"
                            title={t.name}
                          >
                            {t.logo && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={t.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                            )}
                            {t.abbreviation}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-[10px] text-white/40 text-center italic">
            Mathematically alive: Users who have at least one team not yet eliminated.
          </div>
        </div>
      </div>
    </div>
  );
}
