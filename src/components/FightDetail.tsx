import { useState, useEffect } from 'react';
import { FighterProfile, FightHistoryItem } from '../types';
import { 
  ArrowLeft, Trophy, Activity, Calendar, Ruler, Scale, 
  MapPin, Clock, Zap, TrendingUp, Sparkles, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import fighterImages from '../data/fighter-images.json';

interface FightDetailProps {
  fighterAId: number;
  fighterBId: number;
  fightId: number | null;
  onBack: () => void;
  onSelectFighter: (id: number) => void;
  backLabel?: string;
}

export default function FightDetail({ fighterAId, fighterBId, fightId, onBack, onSelectFighter, backLabel }: FightDetailProps) {
  const [fighterA, setFighterA] = useState<FighterProfile | null>(null);
  const [fighterB, setFighterB] = useState<FighterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStr, setErrorStr] = useState<string | null>(null);

  // Helper to fetch fighter details dynamically
  const fetchFighterDetail = async (id: number): Promise<FighterProfile> => {
    const filename = `fighters/${id}.json`;
    const base = (import.meta as any).env?.BASE_URL || '/';
    const pageUrlDir = window.location.href.endsWith('/') 
      ? window.location.href 
      : window.location.href.split('/').slice(0, -1).join('/') + '/';
    const pageUrlWithSlash = window.location.href.endsWith('/') 
      ? window.location.href 
      : window.location.href + '/';

    const candidates = [
      `${window.location.origin}/data/${filename}`,
      new URL('data/' + filename, pageUrlWithSlash).href,
      new URL('data/' + filename, pageUrlDir).href,
      new URL('./data/' + filename, window.location.href).href,
      `${base}data/${filename}`,
      `${base.endsWith('/') ? base : base + '/'}data/${filename}`,
      `/data/${filename}`,
      `./data/${filename}`,
      `data/${filename}`
    ];
    
    const uniquePaths = Array.from(new Set(candidates)).map(p => {
      if (p.includes('://')) {
        const [proto, rest] = p.split('://');
        return proto + '://' + rest.replace(/\/+/g, '/');
      }
      return p.replace(/\/+/g, '/');
    });

    for (const path of uniquePaths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          const data = await res.json();
          if (data) return data;
        }
      } catch (err) {
        // try next candidate
      }
    }
    throw new Error(`Fighter profile #${id} not found.`);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadFighters() {
      setLoading(true);
      setErrorStr(null);
      try {
        const [fA, fB] = await Promise.all([
          fetchFighterDetail(fighterAId),
          fetchFighterDetail(fighterBId)
        ]);

        if (isMounted) {
          setFighterA(fA);
          setFighterB(fB);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorStr(err.message || 'Failed to initialize fighter profiles for comparison.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFighters();
    return () => {
      isMounted = false;
    };
  }, [fighterAId, fighterBId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/50 font-mono text-xs uppercase tracking-widest bg-white/5 border border-white/10 rounded-2xl p-8" id="fight-detail-loading">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 1.5 }}
          className="w-10 h-10 rounded-full border-4 border-white/5 border-t-red-500"
        />
        <span>Analyzing Combat Specs & Loading Telemetry...</span>
      </div>
    );
  }

  if (errorStr || !fighterA || !fighterB) {
    return (
      <div className="bg-red-500/10 border border-red-550/20 p-8 rounded-2xl max-w-xl mx-auto space-y-4 text-center" id="fight-detail-error">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-bold text-sm uppercase tracking-wide text-slate-100">Tactical Comparison Failed</h2>
        <p className="text-xs text-slate-400 font-mono leading-relaxed">{errorStr || 'Unable to load fighters'}</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-red-400 font-mono tracking-widest font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Previous View
        </button>
      </div>
    );
  }

  // Find the exact fight matching fightId
  const matchA = fighterA.fightsParticipated?.find(f => f.fightId === fightId);
  const matchB = fighterB.fightsParticipated?.find(f => f.fightId === fightId);
  const match = matchA || matchB;

  // Retrieve images and body-shots
  const imagesA = (fighterImages as any)[fighterA.id] || {};
  const imagesB = (fighterImages as any)[fighterB.id] || {};
  const bodyShotA = imagesA.bodyShot || imagesA.headshot || null;
  const bodyShotB = imagesB.bodyShot || imagesB.headshot || null;

  const fightDateStr = match?.eventDate;

  // Calculate age at the time of the fight
  const getAgeAtFight = (dobStr: string | null | undefined, eventDateStr: string | null | undefined, defaultAge: number) => {
    if (!dobStr || !eventDateStr) return defaultAge;
    const birthDate = new Date(dobStr);
    const fightDate = new Date(eventDateStr);
    if (isNaN(birthDate.getTime()) || isNaN(fightDate.getTime())) return defaultAge;
    let age = fightDate.getFullYear() - birthDate.getFullYear();
    const m = fightDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && fightDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const ageA = getAgeAtFight(fighterA.dob, fightDateStr, fighterA.age || 0);
  const ageB = getAgeAtFight(fighterB.dob, fightDateStr, fighterB.age || 0);

  // Calculate Entering Record at the time of the fight
  interface SimpleRecord {
    wins: number;
    losses: number;
    draws: number;
    noContests: number;
  }

  const getEnteringRecord = (fighter: FighterProfile, targetFightDateStr: string | null | undefined): SimpleRecord => {
    const rec: SimpleRecord = {
      wins: fighter.record.wins || 0,
      losses: fighter.record.losses || 0,
      draws: fighter.record.draws || 0,
      noContests: fighter.record.noContests || 0
    };

    if (!targetFightDateStr || !fighter.fightsParticipated) {
      return rec;
    }

    const targetTime = new Date(targetFightDateStr).getTime();
    if (isNaN(targetTime)) return rec;

    for (const f of fighter.fightsParticipated) {
      if (!f.eventDate) continue;
      const fTime = new Date(f.eventDate).getTime();
      if (isNaN(fTime)) continue;

      if (fTime >= targetTime) {
        const outcome = (f.outcome || '').toLowerCase().trim();
        if (outcome === 'win' || outcome === 'w') {
          rec.wins = Math.max(0, rec.wins - 1);
        } else if (outcome === 'loss' || outcome === 'l') {
          rec.losses = Math.max(0, rec.losses - 1);
        } else if (outcome === 'draw' || outcome === 'd') {
          rec.draws = Math.max(0, rec.draws - 1);
        } else if (outcome === 'no contest' || outcome === 'nc' || outcome === 'no_contest') {
          rec.noContests = Math.max(0, rec.noContests - 1);
        }
      }
    }

    return rec;
  };

  const recA = getEnteringRecord(fighterA, fightDateStr);
  const recB = getEnteringRecord(fighterB, fightDateStr);

  const calcWinRate = (rec: SimpleRecord) => {
    const total = rec.wins + rec.losses + rec.draws + rec.noContests;
    return total > 0 ? Math.round((rec.wins / total) * 100) : 0;
  };

  const winRateA = calcWinRate(recA);
  const winRateB = calcWinRate(recB);

  // Function to determine weight at the time of the bout based on weight class
  const getFightWeight = (fighter: FighterProfile, weightClass: string | null | undefined) => {
    const defaultWeight = fighter.weight || 170;
    if (!weightClass) return { lbs: defaultWeight, kg: Math.round(defaultWeight * 0.453592) };

    const wc = weightClass.toLowerCase();

    if (wc.includes('strawweight')) {
      return { lbs: 115, kg: 52 };
    }
    if (wc.includes('flyweight')) {
      return { lbs: 125, kg: 57 };
    }
    if (wc.includes('bantamweight')) {
      return { lbs: 135, kg: 61 };
    }
    if (wc.includes('featherweight')) {
      return { lbs: 145, kg: 66 };
    }
    if (wc.includes('lightweight')) {
      return { lbs: 155, kg: 70 };
    }
    if (wc.includes('welterweight')) {
      return { lbs: 170, kg: 77 };
    }
    if (wc.includes('middleweight')) {
      return { lbs: 185, kg: 84 };
    }
    if (wc.includes('light heavyweight')) {
      return { lbs: 205, kg: 93 };
    }
    if (wc.includes('heavyweight')) {
      // Heavyweights can weigh anything up to 265 LBS.
      // If fighter's standard weight is in the Heavyweight range (> 205), use it.
      if (fighter.weight && fighter.weight > 205 && fighter.weight <= 265) {
        return { lbs: fighter.weight, kg: Math.round(fighter.weight * 0.453592) };
      }
      // Otherwise, if they stepped up from light heavyweight/middleweight, they'd weigh more (e.g., ~215 or 220 LBS, or default)
      const estimatedWeight = Math.max(215, defaultWeight);
      return { lbs: estimatedWeight, kg: Math.round(estimatedWeight * 0.453592) };
    }
    if (wc.includes('catchweight')) {
      return { lbs: defaultWeight, kg: Math.round(defaultWeight * 0.453592) };
    }

    // Default Fallback
    return { lbs: defaultWeight, kg: Math.round(defaultWeight * 0.453592) };
  };

  const fightWeightA = getFightWeight(fighterA, match?.weightClass);
  const fightWeightB = getFightWeight(fighterB, match?.weightClass);

  // Height conversion for UI display
  const displayHeight = (inches: number | null) => {
    if (!inches) return 'N/A';
    const ft = Math.floor(inches / 12);
    const inch = inches % 12;
    return `${ft}'${inch}" (${inches} cm)`;
  };

  // Safe stat parsing helpers for highlighting advantages
  const valA = fighterA.height || 0;
  const valB = fighterB.height || 0;
  const reachA = fighterA.reach || 0;
  const reachB = fighterB.reach || 0;
  const winsA = recA.wins;
  const winsB = recB.wins;

  // Stance matchup label
  const stanceMatchup = () => {
    const sA = (fighterA.stance || 'Orthodox').trim().toLowerCase();
    const sB = (fighterB.stance || 'Orthodox').trim().toLowerCase();
    if (sA !== sB) {
      return `${fighterA.stance || 'Orthodox'} vs ${fighterB.stance || 'Orthodox'} (Mixed Matching)`;
    }
    return `${fighterA.stance || 'Orthodox'} Matching`;
  };

  // Recent streaks before the fight
  const getStreakBeforeFight = (fighter: FighterProfile, targetFightDateStr: string | null | undefined) => {
    if (!fighter.fightsParticipated) return [];
    if (!targetFightDateStr) {
      return fighter.fightsParticipated.slice(0, 5).map(fight => {
        const o = (fight.outcome || '').toLowerCase().trim();
        return o === 'win' ? 'W' : o === 'loss' ? 'L' : 'O';
      });
    }

    const targetTime = new Date(targetFightDateStr).getTime();
    if (isNaN(targetTime)) return [];

    const pastFights = fighter.fightsParticipated.filter(f => {
      if (!f.eventDate) return false;
      const fTime = new Date(f.eventDate).getTime();
      return !isNaN(fTime) && fTime < targetTime;
    });

    pastFights.sort((a, b) => {
      const tA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const tB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      return tB - tA;
    });

    return pastFights.slice(0, 5).map(fight => {
      const o = (fight.outcome || '').toLowerCase().trim();
      return o === 'win' ? 'W' : o === 'loss' ? 'L' : 'O';
    });
  };

  const streakA = getStreakBeforeFight(fighterA, fightDateStr);
  const streakB = getStreakBeforeFight(fighterB, fightDateStr);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-md relative"
      id={`fight-detail-comparison-${fightId}`}
    >
      {/* Top Banner Action Panel */}
      <div className="bg-black/40 px-6 py-4 border-b border-white/10 flex items-center justify-between relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-red-400 hover:text-red-300 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel || 'Back to Profile'}
        </button>
        <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-bold">
          Tactical Fight Detail & Stats Companion
        </span>
      </div>

      {/* Hero VERSUS Section with Full-Body Shots */}
      <div className="relative min-h-[360px] md:min-h-[440px] bg-gradient-to-b from-black/50 to-black/10 border-b border-white/5 overflow-hidden flex flex-col justify-end p-6 select-none">
        
        {/* Background Atmosphere Lights */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-red-650/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-650/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none hidden md:block"></div>

        {/* Dynamic Matchup Header Info */}
        <div className="absolute top-8 left-6 right-6 flex flex-col items-center text-center z-20 space-y-2 pointer-events-auto">
          {match ? (
            <>
              <span className="text-[10px] font-mono text-red-500 font-black tracking-widest uppercase bg-red-950/40 border border-red-550/20 px-2.5 py-1 rounded">
                {match.weightClass || 'UFC Weightclass'} Bout
              </span>
              <h3 className="text-sm md:text-base font-black italic text-white uppercase tracking-tight">
                {match.eventName}
              </h3>
              {match.eventDate && (
                <span className="text-[11px] text-white/40 font-mono uppercase tracking-widest">
                  {new Date(match.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded">
              Hypothetical Fighter Matchup
            </span>
          )}
        </div>

        {/* Versus Overlay Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center">
          <span className="text-6xl md:text-8xl font-black italic tracking-tighter text-white/5 uppercase leading-none select-none">
            VS
          </span>
        </div>

        {/* Fighters Side-by-Side Full Body Layout */}
        <div className="grid grid-cols-2 h-full items-end gap-1 relative z-10 pt-20">
          
          {/* Fighter A (Left Corner) */}
          <div className="flex flex-col items-center justify-end text-center h-full relative group">
            {bodyShotA ? (
              <div className="h-56 md:h-80 w-full flex items-end justify-center overflow-hidden pointer-events-none relative mb-4">
                <img 
                  src={bodyShotA} 
                  alt={fighterA.fullName} 
                  className="h-full object-contain object-bottom drop-shadow-[0_15px_24px_rgba(0,0,0,0.85)] filter brightness-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="h-32 md:h-44 w-32 md:h-44 rounded-full border border-white/15 bg-black/50 flex items-center justify-center text-4xl font-black font-mono text-white/30 uppercase mb-4 shadow-xl">
                {fighterA.firstName?.[0]}{fighterA.lastName?.[0]}
              </div>
            )}
            
            <div className="space-y-1 z-20 pointer-events-auto bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-lg max-w-[170px] sm:max-w-[220px]">
              <span className="text-[9px] text-red-500 font-mono font-black uppercase tracking-widest">RED CORNER</span>
              <button 
                onClick={() => onSelectFighter(fighterA.id)}
                className="block font-black italic text-white text-xs sm:text-sm md:text-base leading-tight uppercase hover:text-red-400 cursor-pointer transition-colors tracking-tight text-center w-full truncate"
              >
                {fighterA.fullName}
              </button>
              {fighterA.nickName && (
                <span className="text-[10px] text-white/50 italic font-mono block uppercase truncate">&ldquo;{fighterA.nickName}&rdquo;</span>
              )}
            </div>
          </div>

          {/* Fighter B (Blue Corner) */}
          <div className="flex flex-col items-center justify-end text-center h-full relative group">
            {bodyShotB ? (
              <div className="h-56 md:h-80 w-full flex items-end justify-center overflow-hidden pointer-events-none relative mb-4">
                <img 
                  src={bodyShotB} 
                  alt={fighterB.fullName} 
                  className="h-full object-contain object-bottom drop-shadow-[0_15px_24px_rgba(0,0,0,0.85)] scale-x-[-1] filter brightness-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="h-32 md:h-44 w-32 md:h-44 rounded-full border border-white/15 bg-black/50 flex items-center justify-center text-4xl font-black font-mono text-white/30 uppercase mb-4 shadow-xl">
                {fighterB.firstName?.[0]}{fighterB.lastName?.[0]}
              </div>
            )}

            <div className="space-y-1 z-20 pointer-events-auto bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-lg max-w-[170px] sm:max-w-[220px]">
              <span className="text-[9px] text-indigo-400 font-mono font-black uppercase tracking-widest">BLUE CORNER</span>
              <button 
                onClick={() => onSelectFighter(fighterB.id)}
                className="block font-black italic text-white text-xs sm:text-sm md:text-base leading-tight uppercase hover:text-indigo-400 cursor-pointer transition-colors tracking-tight text-center w-full truncate"
              >
                {fighterB.fullName}
              </button>
              {fighterB.nickName && (
                <span className="text-[10px] text-white/50 italic font-mono block uppercase truncate">&ldquo;{fighterB.nickName}&rdquo;</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Fight Detail Outcome Box if match is active */}
      {match && (
        <div className="bg-[#121212] border-b border-white/10 p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-bold italic uppercase tracking-wider text-xs border-b border-white/5 pb-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Bout Outcome & Analytics
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            {/* Fighter A Outcome Card */}
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
              (matchA?.outcome || '').toLowerCase() === 'win' 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                : (matchA?.outcome || '').toLowerCase() === 'loss'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-white/5 border-white/10 text-white/60'
            }`}>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1">RED OUTCOME</span>
              <span className="text-lg font-black italic uppercase">
                {matchA?.outcome || 'OTHER'}
              </span>
            </div>

            {/* Method / Round detail */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center items-center">
              <span className="text-xs font-black italic text-red-500 uppercase tracking-tight mb-1">
                {match.method || 'Result'}
              </span>
              {match.endingRound && (
                <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  Round {match.endingRound} • {match.endingTime || '0:00'}
                </span>
              )}
            </div>

            {/* Fighter B Outcome Card */}
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
              (matchB?.outcome || '').toLowerCase() === 'win' 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                : (matchB?.outcome || '').toLowerCase() === 'loss'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-white/5 border-white/10 text-white/60'
            }`}>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1">BLUE OUTCOME</span>
              <span className="text-lg font-black italic uppercase">
                {matchB?.outcome || 'OTHER'}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Numerical Stats & Physical specifications Comparison */}
      <div className="p-6 space-y-6">
        
        <div className="space-y-4">
          <h4 className="text-xs font-black italic text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" /> Statistical & Physical Head-to-Head
          </h4>

          {/* Stance matching alert badge */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-2.5 text-xs text-white/60 uppercase tracking-wider font-mono">
            <Zap className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Tactical Stance Matchup:</span>
            <span className="font-extrabold text-red-550">{stanceMatchup()}</span>
          </div>

          <div className="bg-black/25 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
            
            {/* TAIL OF THE TAPE TABLE HEADER */}
            <div className="bg-white/[0.02] py-2.5 px-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center border-b border-white/5 text-center">
              <div className="text-right">
                <span className="text-[8px] sm:text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase bg-red-950/40 border border-red-500/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                  RED CORNER
                </span>
                <span className="block text-xs sm:text-sm font-black italic uppercase text-white tracking-tight mt-1 truncate">
                  {fighterA.lastName || fighterA.fullName}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[9px] sm:text-xs font-mono font-black text-white/30 tracking-widest uppercase">
                  MATCHUP
                </span>
              </div>
              <div className="text-left">
                <span className="text-[8px] sm:text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase bg-blue-950/40 border border-blue-500/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                  BLUE CORNER
                </span>
                <span className="block text-xs sm:text-sm font-black italic uppercase text-white tracking-tight mt-1 truncate">
                  {fighterB.lastName || fighterB.fullName}
                </span>
              </div>
            </div>

            {/* AGE COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${ageA > 0 && ageB > 0 && ageA < ageB ? 'text-amber-500' : 'text-white'}`}>
                  {ageA > 0 ? `${ageA} YRS` : 'Unknown'}
                </span>
                {ageA > 0 && ageB > 0 && ageA < ageB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (YOUNGER)
                  </span>
                )}
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <Calendar className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  AGE AT BOUT
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${ageA > 0 && ageB > 0 && ageB < ageA ? 'text-amber-500' : 'text-white'}`}>
                  {ageB > 0 ? `${ageB} YRS` : 'Unknown'}
                </span>
                {ageA > 0 && ageB > 0 && ageB < ageA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (YOUNGER)
                  </span>
                )}
              </div>
            </div>

            {/* HEIGHT COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${valA > valB ? 'text-amber-500' : 'text-white'}`}>
                  {displayHeight(fighterA.height)}
                </span>
                {valA > valB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(valA - valB).toFixed(0)}&rdquo;)
                  </span>
                )}
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <Ruler className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  HEIGHT
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${valB > valA ? 'text-amber-500' : 'text-white'}`}>
                  {displayHeight(fighterB.height)}
                </span>
                {valB > valA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(valB - valA).toFixed(0)}&rdquo;)
                  </span>
                )}
              </div>
            </div>

            {/* REACH COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${reachA > reachB ? 'text-amber-500' : 'text-white'}`}>
                  {reachA > 0 ? `${reachA}.0"` : 'Unknown'}
                </span>
                {reachA > reachB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(reachA - reachB).toFixed(0)}&rdquo;)
                  </span>
                )}
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <Sparkles className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  WINGSPAN
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${reachB > reachA ? 'text-amber-500' : 'text-white'}`}>
                  {reachB > 0 ? `${reachB}.0"` : 'Unknown'}
                </span>
                {reachB > reachA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(reachB - reachA).toFixed(0)}&rdquo;)
                  </span>
                )}
              </div>
            </div>

            {/* COMBATIVE WEIGHT COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${(fightWeightA.lbs || 0) > (fightWeightB.lbs || 0) ? 'text-amber-500' : 'text-white'}`}>
                  {fightWeightA.lbs ? `${fightWeightA.lbs} LBS` : 'N/A'}
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/40 font-mono block uppercase tracking-wider mt-0.5 leading-none">
                  {fightWeightA.kg ? `${fightWeightA.kg} KG` : 'N/A'}
                </span>
                {(fightWeightA.lbs || 0) > (fightWeightB.lbs || 0) && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-1 font-bold uppercase leading-none">
                    ADVANTAGE (+{(fightWeightA.lbs || 0) - (fightWeightB.lbs || 0)} LBS)
                  </span>
                )}
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <Scale className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  WEIGHT BOUT
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${(fightWeightB.lbs || 0) > (fightWeightA.lbs || 0) ? 'text-amber-500' : 'text-white'}`}>
                  {fightWeightB.lbs ? `${fightWeightB.lbs} LBS` : 'N/A'}
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/40 font-mono block uppercase tracking-wider mt-0.5 leading-none">
                  {fightWeightB.kg ? `${fightWeightB.kg} KG` : 'N/A'}
                </span>
                {(fightWeightB.lbs || 0) > (fightWeightA.lbs || 0) && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-1 font-bold uppercase leading-none">
                    ADVANTAGE (+{(fightWeightB.lbs || 0) - (fightWeightA.lbs || 0)} LBS)
                  </span>
                )}
              </div>
            </div>

            {/* WIN RATE COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winRateA > winRateB ? 'text-amber-500' : 'text-white'}`}>
                  {winRateA}%
                </span>
                {winRateA > winRateB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(winRateA - winRateB)}%)
                  </span>
                )}
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  WIN RATE
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winRateB > winRateA ? 'text-amber-500' : 'text-white'}`}>
                  {winRateB}%
                </span>
                {winRateB > winRateA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(winRateB - winRateA)}%)
                  </span>
                )}
              </div>
            </div>

            {/* TOTAL WINS COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winsA > winsB ? 'text-amber-500' : 'text-white'}`}>
                  {winsA} Wins
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/40 font-mono block uppercase tracking-wider mt-0.5 leading-none">
                  {recA.wins}W - {recA.losses}L{recA.draws > 0 ? ` - ${recA.draws}D` : ''}{recA.noContests > 0 ? ` - ${recA.noContests}NC` : ''}
                </span>
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <Trophy className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  RECORD
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winsB > winsA ? 'text-amber-500' : 'text-white'}`}>
                  {winsB} Wins
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/40 font-mono block uppercase tracking-wider mt-0.5 leading-none">
                  {recB.wins}W - {recB.losses}L{recB.draws > 0 ? ` - ${recB.draws}D` : ''}{recB.noContests > 0 ? ` - ${recB.noContests}NC` : ''}
                </span>
              </div>
            </div>

            {/* STREAK MOMENTUM */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="flex items-center justify-end gap-1 flex-wrap">
                {streakA.length > 0 ? streakA.map((res, i) => (
                  <span 
                    key={i} 
                    className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-mono font-black italic shrink-0 ${
                      res === 'W' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : res === 'L' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    {res}
                  </span>
                )) : (
                  <span className="text-[9px] font-mono text-white/30 uppercase">None</span>
                )}
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  RECENT FORM
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="flex items-center justify-start gap-1 flex-wrap">
                {streakB.length > 0 ? streakB.map((res, i) => (
                  <span 
                    key={i} 
                    className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-mono font-black italic shrink-0 ${
                      res === 'W' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : res === 'L' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    {res}
                  </span>
                )) : (
                  <span className="text-[9px] font-mono text-white/30 uppercase">None</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
}
