'use client';

import React, { useState, useEffect } from 'react';
import { ESPNEvent, UserAllocation, TeamStats, UserStandings } from '../types';
import {
  computeTeamStats,
  computeUserStandings
} from '../utils/helpers';
import FixturesTab from '../components/FixturesTab';
import StandingsTab from '../components/StandingsTab';
import PayoutsTab from '../components/PayoutsTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'standings' | 'payouts'>('standings');
  const [events, setEvents] = useState<ESPNEvent[]>([]);
  const [users, setUsers] = useState<UserAllocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all necessary data
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Fetch ESPN Scoreboard data for the tournament duration
      const espnUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200';
      const espnRes = await fetch(espnUrl);
      if (!espnRes.ok) {
        throw new Error('Failed to fetch ESPN tournament fixtures.');
      }
      const espnData = await espnRes.json();
      const fetchedEvents: ESPNEvent[] = espnData.events || [];

      // 2. Fetch Google Sheets team allocation data
      const sheetsUrl = process.env.NEXT_PUBLIC_SHEET_API_URL;
      if (!sheetsUrl) {
        throw new Error('Google Sheets API URL (NEXT_PUBLIC_SHEET_API_URL) is not configured.');
      }
      
      const sheetsRes = await fetch(sheetsUrl);
      if (!sheetsRes.ok) {
        throw new Error(`Failed to fetch Google Sheets team allocations (Status: ${sheetsRes.status}).`);
      }
      const fetchedUsers = await sheetsRes.json();

      if (!fetchedUsers || fetchedUsers.length === 0) {
        throw new Error('No team allocations returned from Google Sheets API.');
      }

      setEvents(fetchedEvents);
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An error occurred while loading tournament data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute standings in real-time
  const { teamStats, standings } = React.useMemo(() => {
    const stats = computeTeamStats(events);
    const userLeaderboard = computeUserStandings(users, stats);
    return { teamStats: stats, standings: userLeaderboard };
  }, [events, users]);

  // Render the selected tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'fixtures':
        return <FixturesTab events={events} allocations={users} />;
      case 'standings':
        return <StandingsTab standings={standings} />;
      case 'payouts':
        return <PayoutsTab standings={standings} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-midnight-blue to-pitch-green text-white p-6">
        <div className="relative flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-trophy-gold/20 border-t-trophy-gold rounded-full animate-spin mb-4"></div>
          <div className="loading-spinner text-lg font-bold tracking-wider text-trophy-gold animate-pulse">
            Loading live sweepstakes data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0A1D1A] via-[#0D1B2A] to-[#0A3B28] text-white min-h-screen relative overflow-hidden">
      
      {/* Background Turf Grid overlay for pitch aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4 bg-black/35 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-3xl filter drop-shadow-md">🏆</div>
          <div>
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-white flex items-center gap-1.5 leading-none">
              World Cup 26 <span className="text-trophy-gold">Sweep</span>
            </h1>
            <span className="text-[10px] text-white/40 tracking-widest uppercase font-mono mt-1 block">
              16 Players • 48 Teams • Live Standings
            </span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-95 text-white p-2.5 rounded-full transition-all flex items-center justify-center w-10 h-10 disabled:opacity-40"
          title="Refresh scoreboard data"
        >
          <span className={`text-base font-bold leading-none ${refreshing ? 'animate-spin' : ''}`}>
            {refreshing ? '🔄' : '⟳'}
          </span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative z-10 max-w-5xl w-full mx-auto flex flex-col">
        {error ? (
          <div className="m-6 p-6 rounded-2xl bg-red-950/40 border border-red-500/30 text-center">
            <span className="text-3xl block mb-2">⚠️</span>
            <h3 className="font-bold text-red-400">Failed to Load Tournament Data</h3>
            <p className="text-sm text-white/60 mt-1">{error}</p>
            <button
              onClick={() => fetchData()}
              className="mt-4 px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      {/* Sleek Floating Glassmorphic Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-25 max-w-md w-[90%] md:w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-full py-2 px-3 flex items-center justify-between shadow-2xl">
        {/* Tab 1: Fixtures */}
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'fixtures'
              ? 'text-trophy-gold font-bold bg-white/5 scale-105'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span className="text-lg">⚽</span>
          <span className="text-[10px] tracking-wider uppercase font-semibold mt-0.5">Fixtures</span>
        </button>

        {/* Tab 2: Standings */}
        <button
          onClick={() => setActiveTab('standings')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'standings'
              ? 'text-trophy-gold font-bold bg-white/5 scale-105'
              : 'text-trophy-gold/80 hover:text-trophy-gold'
          }`}
        >
          <span className="text-xl">🏆</span>
          <span className="text-[10px] tracking-wider uppercase font-semibold mt-0.5">Leaderboard</span>
        </button>

        {/* Tab 3: Payouts */}
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-full transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'text-trophy-gold font-bold bg-white/5 scale-105'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span className="text-lg">💵</span>
          <span className="text-[10px] tracking-wider uppercase font-semibold mt-0.5">Payouts</span>
        </button>
      </nav>

    </div>
  );
}
