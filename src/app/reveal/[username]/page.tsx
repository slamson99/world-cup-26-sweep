'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getTeamMetadata, normalizeTeamName } from '../../../utils/helpers';
import { UserAllocation, ESPNEvent } from '../../../types';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function RevealPage({ params }: PageProps) {
  // Resolve params using React.use() for Next.js compatibility
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);

  // States
  const [step, setStep] = useState<number>(0); // 0: Vault, 1: Tier 3, 2: Tier 2, 3: Tier 1
  const [allocations, setAllocations] = useState<UserAllocation[]>([]);
  const [events, setEvents] = useState<ESPNEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Animation visual cues
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [shakeActive, setShakeActive] = useState<boolean>(false);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch User Allocations from Google Sheet API
        const sheetsUrl = process.env.NEXT_PUBLIC_SHEET_API_URL;
        if (!sheetsUrl) {
          throw new Error('Google Sheets API URL (NEXT_PUBLIC_SHEET_API_URL) is not configured.');
        }

        const sheetsRes = await fetch(sheetsUrl);
        if (!sheetsRes.ok) {
          throw new Error(`Failed to fetch team allocations (Status: ${sheetsRes.status}).`);
        }
        const allocationsData = await sheetsRes.json();
        setAllocations(allocationsData);

        // Fetch ESPN Scoreboard to extract live logos
        const espnUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200';
        const espnRes = await fetch(espnUrl);
        if (espnRes.ok) {
          const espnData = await espnRes.json();
          setEvents(espnData.events || []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'An error occurred while loading reveal data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Find user allocation (case-insensitive)
  const userAlloc = allocations.find(
    (a) => a.user.trim().toLowerCase() === username.trim().toLowerCase()
  );

  // Extract ESPN team logos mapping
  const logoMap = React.useMemo(() => {
    const map = new Map<string, string>();
    events.forEach((event) => {
      event.competitions?.[0]?.competitors?.forEach((comp) => {
        const name = comp.team?.displayName;
        if (name) {
          map.set(normalizeTeamName(name), comp.team.logo || '');
        }
      });
    });
    return map;
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A1D1A] via-[#0D1B2A] to-[#0A3B28] text-white p-6">
        <div className="w-16 h-16 border-4 border-trophy-gold/20 border-t-trophy-gold rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-bold tracking-wider text-trophy-gold animate-pulse">
          Retrieving Portfolio allocations...
        </div>
      </div>
    );
  }

  if (error || !userAlloc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A1D1A] via-[#0D1B2A] to-[#0A3B28] text-white p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-black text-red-400 uppercase tracking-wide">
            Portfolio Not Found
          </h2>
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            {error || `Could not find any sweepstakes allocations for "${username}". Make sure the username matches the Google Sheet spelling.`}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            >
              Go to Dashboard
            </Link>
            {allocations.length > 0 && (
              <div className="mt-4 text-left">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-2">
                  Active Players list:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {allocations.map((a) => (
                    <Link
                      key={a.user}
                      href={`/reveal/${encodeURIComponent(a.user)}`}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-trophy-gold/20 border border-white/5 hover:border-trophy-gold/30 text-[10px] text-white/70"
                    >
                      {a.user}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Retrieve team info
  const teams = [
    { name: userAlloc.tier_3, tier: 3, key: 'tier_3' },
    { name: userAlloc.tier_2, tier: 2, key: 'tier_2' },
    { name: userAlloc.tier_1, tier: 1, key: 'tier_1' }
  ];

  const handleNextStep = () => {
    if (step === 0) {
      // Step 0 -> 1: White Flash Screen
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 600);
      setStep(1);
    } else if (step === 1) {
      // Step 1 -> 2
      setStep(2);
    } else if (step === 2) {
      // Step 2 -> 3: Shake Container
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
      setStep(3);
    }
  };

  const handleReset = () => {
    setStep(0);
    setFlashActive(false);
    setShakeActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1D1A] via-[#0D1B2A] to-[#0A3B28] text-white relative flex flex-col justify-between overflow-hidden px-4 py-6">
      
      {/* Shake Keyframes & Glowing Animation Styles */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-4px, -2px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translate(4px, 2px) rotate(0.5deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes goldGlow {
          0%, 100% { border-color: rgba(212, 175, 55, 0.4); box-shadow: 0 0 15px rgba(212, 175, 55, 0.2); }
          50% { border-color: rgba(212, 175, 55, 1); box-shadow: 0 0 30px rgba(212, 175, 55, 0.6); }
        }
        .animate-gold-glow {
          animation: goldGlow 2.5s infinite alternate;
        }
        @keyframes shine {
          0% { background-position: -200% 0%; }
          100% { background-position: 200% 0%; }
        }
        .card-shine {
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 60%, transparent 70%);
          background-size: 200% 100%;
          animation: shine 4s infinite linear;
        }
      `}</style>

      {/* Turf lines background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* White Flash overlay */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header Info */}
      <header className="relative z-10 text-center flex flex-col items-center gap-1.5 mt-2">
        <Link
          href="/"
          className="mb-3 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-1.5"
        >
          <span>🏠</span> Back to Dashboard
        </Link>
        <div className="text-xs font-black tracking-widest text-trophy-gold uppercase bg-trophy-gold/10 border border-trophy-gold/20 px-3 py-1 rounded-full shadow-md">
          Sweep Allocations
        </div>
        <h1 className="text-2xl font-black uppercase text-white mt-1">
          {userAlloc.user}&apos;s Reveal
        </h1>
        <p className="text-[10px] text-white/40 tracking-wider uppercase font-mono">
          Click button below to open portfolio
        </p>
      </header>

      {/* Center animation stage */}
      <main className={`flex-1 flex items-center justify-center relative my-6 ${shakeActive ? 'animate-shake' : ''}`}>
        
        {/* Step 0: The Vault / Loot Box */}
        {step === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="flex flex-col items-center justify-center z-10"
          >
            {/* Pulsing luxury loot box */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotateY: [0, 5, -5, 0],
                boxShadow: [
                  "0 0 20px rgba(212,175,55,0.2)",
                  "0 0 40px rgba(212,175,55,0.5)",
                  "0 0 20px rgba(212,175,55,0.2)"
                ]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
              className="w-64 h-80 rounded-[2.5rem] bg-gradient-to-b from-[#1b4332] via-[#0d1b2a] to-[#081c15] border-2 border-trophy-gold/40 flex flex-col items-center justify-center p-6 relative group cursor-pointer overflow-hidden shadow-2xl"
              onClick={handleNextStep}
            >
              {/* Outer glowing ring */}
              <div className="absolute inset-1 rounded-[2.3rem] border border-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
              
              {/* Holographic lines */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />

              <div className="text-7xl mb-4 filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)] select-none">🏆</div>
              
              <h3 className="text-lg font-black uppercase text-trophy-gold tracking-widest text-center select-none">
                World Cup 26
              </h3>
              <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mt-1 select-none">
                Loot Pack
              </p>

              {/* Decorative corner lines */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-trophy-gold/30 rounded-tl-md" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-trophy-gold/30 rounded-tr-md" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-trophy-gold/30 rounded-bl-md" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-trophy-gold/30 rounded-br-md" />

              <div className="mt-8 px-4 py-1.5 rounded-full bg-trophy-gold/10 border border-trophy-gold/20 text-[9px] font-bold tracking-widest uppercase text-trophy-gold select-none animate-pulse">
                UNOPENED
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stacked Cards Area (Step 1 to 3) */}
        {step >= 1 && (
          <div className="relative w-full max-w-[340px] h-[450px] flex items-center justify-center">
            
            {/* RENDER TIER 3 CARD */}
            {step >= 1 && (
              <motion.div
                initial={{ y: 350, opacity: 0, scale: 0.6 }}
                animate={{
                  y: step === 1 ? 0 : step === 2 ? -40 : -75,
                  scale: step === 1 ? 1 : step === 2 ? 0.88 : 0.76,
                  opacity: step === 1 ? 1 : step === 2 ? 0.75 : 0.45,
                  zIndex: 10
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="absolute w-full h-[410px]"
              >
                <RevealCard teamName={userAlloc.tier_3} tier={3} logo={logoMap.get(normalizeTeamName(userAlloc.tier_3))} />
              </motion.div>
            )}

            {/* RENDER TIER 2 CARD */}
            {step >= 2 && (
              <motion.div
                initial={{ scale: 0.2, opacity: 0, rotate: -5 }}
                animate={{
                  scale: step === 2 ? 1 : 0.88,
                  y: step === 2 ? 0 : -35,
                  opacity: step === 2 ? 1 : 0.75,
                  rotate: step === 2 ? 0 : 0,
                  zIndex: 20
                }}
                transition={{ type: 'spring', stiffness: 130, damping: 13 }}
                className="absolute w-full h-[410px]"
              >
                <RevealCard teamName={userAlloc.tier_2} tier={2} logo={logoMap.get(normalizeTeamName(userAlloc.tier_2))} />
              </motion.div>
            )}

            {/* RENDER TIER 1 CARD */}
            {step >= 3 && (
              <motion.div
                initial={{ y: -250, scale: 1.3, opacity: 0 }}
                animate={{
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  zIndex: 30
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                className="absolute w-full h-[410px]"
              >
                <RevealCard 
                  teamName={userAlloc.tier_1} 
                  tier={1} 
                  logo={logoMap.get(normalizeTeamName(userAlloc.tier_1))} 
                  isGlow={true} 
                />
              </motion.div>
            )}

          </div>
        )}

      </main>

      {/* Button Controls */}
      <footer className="relative z-10 flex flex-col items-center gap-4 mt-auto mb-2">
        
        {/* Step Indicator */}
        {step > 0 && (
          <div className="flex gap-2">
            {[3, 2, 1].map((tierNum) => {
              const isActive = (4 - tierNum) <= step;
              const isCurrent = (4 - tierNum) === step;
              return (
                <div
                  key={tierNum}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent 
                      ? 'w-8 bg-trophy-gold' 
                      : isActive 
                        ? 'w-4 bg-emerald-500' 
                        : 'w-2 bg-white/20'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Primary Action Button */}
        {step < 3 ? (
          <button
            onClick={handleNextStep}
            className="w-full max-w-sm cursor-pointer py-4 px-8 rounded-full bg-gradient-to-r from-trophy-gold via-[#ffd700] to-trophy-gold hover:from-[#ffd700] hover:to-trophy-gold active:scale-95 text-black font-black uppercase tracking-widest text-xs md:text-sm shadow-[0_4px_20px_rgba(212,175,55,0.4)] border border-trophy-gold transition-all"
          >
            {step === 0 && 'OPEN PORTFOLIO'}
            {step === 1 && 'REVEAL TIER 2'}
            {step === 2 && 'REVEAL FINAL TEAM'}
          </button>
        ) : (
          <div className="flex flex-col gap-2.5 w-full max-w-sm">
            <Link
              href="/"
              className="w-full text-center py-4 px-8 rounded-full bg-gradient-to-r from-emerald-600 to-pitch-green hover:from-emerald-500 hover:to-emerald-700 active:scale-95 text-white font-black uppercase tracking-widest text-xs md:text-sm shadow-lg border border-emerald-500/30 transition-all"
            >
              GO TO LEADERBOARD
            </Link>
            <button
              onClick={handleReset}
              className="w-full cursor-pointer py-2 px-6 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/60 hover:text-white font-bold uppercase tracking-wider text-[10px] transition-all"
            >
              🔄 Watch Reveal Again
            </button>
          </div>
        )}

      </footer>

    </div>
  );
}

// Single Reveal Card component
interface CardProps {
  teamName: string;
  tier: number;
  logo?: string;
  isGlow?: boolean;
}

function RevealCard({ teamName, tier, logo, isGlow = false }: CardProps) {
  // Fetch detailed metadata from our static store
  const meta = getTeamMetadata(teamName);

  // Styling based on Tier
  const tierConfigs: Record<number, { title: string; color: string; border: string; bg: string; badge: string }> = {
    1: {
      title: "TIER 1 (ELITE)",
      color: "text-trophy-gold",
      border: "border-trophy-gold/50",
      bg: "from-[#1c1404] via-[#0d1b2a] to-[#0A1D1A]",
      badge: "bg-trophy-gold/20 text-trophy-gold border-trophy-gold/40"
    },
    2: {
      title: "TIER 2 (CONTENDER)",
      color: "text-blue-300",
      border: "border-blue-500/30",
      bg: "from-[#05162e] via-[#0D1B2A] to-[#0A1D1A]",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    },
    3: {
      title: "TIER 3 (DARK HORSE)",
      color: "text-emerald-300",
      border: "border-emerald-500/20",
      bg: "from-[#042416] via-[#0d1b2a] to-[#0A1D1A]",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20"
    }
  };

  const config = tierConfigs[tier];

  return (
    <div className={`w-full h-full rounded-[2.2rem] bg-gradient-to-b ${config.bg} border-2 ${isGlow ? 'animate-gold-glow' : config.border} p-5 flex flex-col justify-between relative shadow-2xl overflow-hidden card-shine`}>
      
      {/* Semi-transparent glow backing */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md pointer-events-none" />

      {/* Card Header (Tier Name & Decorative Corner) */}
      <div className="flex items-center justify-between z-10">
        <span className={`text-[9px] font-black tracking-widest uppercase ${config.color}`}>
          {config.title}
        </span>
        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${config.badge}`}>
          T{tier} Allocation
        </span>
      </div>

      {/* Main Flag & Country Details */}
      <div className="flex flex-col items-center text-center my-2 z-10">
        <div className="relative w-24 h-24 flex items-center justify-center bg-white/5 border border-white/10 rounded-full shadow-lg p-2.5 mb-2.5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={teamName}
              className="w-16 h-16 object-contain filter drop-shadow-md"
            />
          ) : (
            <span className="text-5xl">{meta?.flag || '🏳️'}</span>
          )}
          
          {/* Absolute overlay of Flag emoji if logo is from ESPN */}
          {logo && meta?.flag && (
            <span className="absolute bottom-0 right-0 text-2xl filter drop-shadow-md select-none bg-black/40 w-8 h-8 rounded-full flex items-center justify-center border border-white/10">
              {meta.flag}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-black tracking-wide text-white uppercase select-all leading-tight">
          {teamName}
        </h2>
      </div>

      {/* Core Sweep Data (Odds to Win & Group) */}
      <div className="grid grid-cols-2 gap-2 bg-black/30 border border-white/5 rounded-2xl p-3 z-10 text-center">
        <div>
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">
            Odds to Win
          </span>
          <span className="text-sm font-black text-trophy-gold mt-0.5 block">
            {meta?.odds || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">
            Tournament Group
          </span>
          <span className="text-xs font-black text-white mt-0.5 block">
            {meta?.group || 'Group TBC'}
          </span>
        </div>
      </div>

      {/* Sleek Stats Layout */}
      <div className="flex flex-col gap-2 z-10">
        
        {/* FIFA Ranking */}
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-xs">
          <span className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">
            FIFA Ranking
          </span>
          <span className="font-mono font-bold text-white">
            #{meta?.ranking || 'N/A'}
          </span>
        </div>

        {/* Marquee Player */}
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5 text-xs">
          <span className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">
            Marquee Player
          </span>
          <span className="font-bold text-white">
            {meta?.marqueePlayer || 'TBC'}
          </span>
        </div>

        {/* Historical Best Finish */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">
            Best Finish
          </span>
          <span className="font-semibold text-white/90 text-right truncate max-w-[150px]" title={meta?.bestFinish}>
            {meta?.bestFinish || 'N/A'}
          </span>
        </div>

      </div>

      {/* Footer Info (Group Opponents list) */}
      <div className="mt-3.5 pt-2 border-t border-white/5 z-10">
        <span className="text-[8px] font-bold uppercase tracking-wider text-white/35 block mb-1">
          Group Opponents:
        </span>
        <p className="text-[9px] font-semibold text-white/55 truncate">
          {meta?.opponents?.join(', ') || 'To be decided'}
        </p>
      </div>

    </div>
  );
}
