import { useState, useEffect } from 'react';
import { FighterProfile, FightHistoryItem } from '../types';
import { 
  ArrowLeft, Trophy, Activity, Calendar, Ruler, Scale, 
  MapPin, Clock, Zap, TrendingUp, Sparkles, AlertCircle, Crown
} from 'lucide-react';
import { motion } from 'motion/react';
import fighterImages from '../data/fighter-images.json';
import DualTrajectoryGraph from './DualTrajectoryGraph';

interface FightDetailProps {
  fighterAId: number;
  fighterBId: number;
  fightId: number | null;
  onBack: () => void;
  onSelectFighter: (id: number) => void;
  onSelectEvent?: (id: number) => void;
  backLabel?: string;
}

export default function FightDetail({ 
  fighterAId, 
  fighterBId, 
  fightId, 
  onBack, 
  onSelectFighter, 
  onSelectEvent,
  backLabel 
}: FightDetailProps) {
  const [fighterA, setFighterA] = useState<FighterProfile | null>(null);
  const [fighterB, setFighterB] = useState<FighterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

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
        const res = o === 'win' ? 'W' : o === 'loss' ? 'L' : 'O';
        return {
          res,
          opponentId: fight.opponentId,
          fightId: fight.fightId,
          opponentName: fight.opponentName,
          eventName: fight.eventName
        };
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
      const res = o === 'win' ? 'W' : o === 'loss' ? 'L' : 'O';
      return {
        res,
        opponentId: fight.opponentId,
        fightId: fight.fightId,
        opponentName: fight.opponentName,
        eventName: fight.eventName
      };
    });
  };

  const streakA = getStreakBeforeFight(fighterA, fightDateStr);
  const streakB = getStreakBeforeFight(fighterB, fightDateStr);

  const getBarPct = (val1: number, val2: number) => {
    if (val1 === 0 && val2 === 0) return { pct1: 0, pct2: 0 };
    const total = val1 + val2;
    return {
      pct1: val1 > 0 ? Math.max(6, Math.min(94, (val1 / total) * 100)) : 0,
      pct2: val2 > 0 ? Math.max(6, Math.min(94, (val2 / total) * 100)) : 0,
    };
  };

  const ageBar = getBarPct(ageA > 0 ? ageA : 0, ageB > 0 ? ageB : 0);
  const heightBar = getBarPct(valA, valB);
  const reachBar = getBarPct(reachA, reachB);
  const weightBar = getBarPct(fightWeightA.lbs || 0, fightWeightB.lbs || 0);
  const winRateBar = { pct1: winRateA, pct2: winRateB };
  const winsBar = getBarPct(winsA, winsB);

  // Algorithmic Prediction Engine
  const calculatePrediction = () => {
    let pointsA = 50;
    let pointsB = 50;

    // 1. Youth & Vitality Factor
    let agePointsA = 0;
    let agePointsB = 0;
    if (ageA > 0 && ageB > 0) {
      const ageDelta = ageB - ageA; // Positive means A is younger
      if (ageDelta > 0) {
        agePointsA += Math.min(15, ageDelta * 2);
      } else if (ageDelta < 0) {
        agePointsB += Math.min(15, Math.abs(ageDelta) * 2);
      }
      if (ageA >= 35) agePointsA -= 5;
      if (ageB >= 35) agePointsB -= 5;
    }

    // 2. Height Leverage
    let heightPointsA = 0;
    let heightPointsB = 0;
    if (valA > 0 && valB > 0) {
      const heightDelta = valA - valB;
      if (heightDelta > 0) heightPointsA += heightDelta * 2.0;
      else if (heightDelta < 0) heightPointsB += Math.abs(heightDelta) * 2.0;
    }

    // 3. Reach Advantage
    let reachPointsA = 0;
    let reachPointsB = 0;
    if (reachA > 0 && reachB > 0) {
      const reachDelta = reachA - reachB;
      if (reachDelta > 0) reachPointsA += reachDelta * 3.5;
      else if (reachDelta < 0) reachPointsB += Math.abs(reachDelta) * 3.5;
    }

    // 4. Weight & Mass Leverage
    let weightPointsA = 0;
    let weightPointsB = 0;
    const wA = fightWeightA.lbs || 0;
    const wB = fightWeightB.lbs || 0;
    if (wA > 0 && wB > 0) {
      const weightDelta = wA - wB;
      if (weightDelta > 0) weightPointsA += Math.min(10, weightDelta * 0.35);
      else if (weightDelta < 0) weightPointsB += Math.min(10, Math.abs(weightDelta) * 0.35);
    }

    // 5. Win Rate Efficiency
    let wrPointsA = 0;
    let wrPointsB = 0;
    if (winRateA > 0 || winRateB > 0) {
      const wrDelta = winRateA - winRateB;
      if (wrDelta > 0) wrPointsA += wrDelta * 0.25;
      else if (wrDelta < 0) wrPointsB += Math.abs(wrDelta) * 0.25;
    }

    // 6. Experience & Veteran Status
    let expPointsA = 0;
    let expPointsB = 0;
    const totalFightsA = recA.wins + recA.losses + recA.draws + recA.noContests;
    const totalFightsB = recB.wins + recB.losses + recB.draws + recB.noContests;
    if (totalFightsA > 0 || totalFightsB > 0) {
      const expDelta = totalFightsA - totalFightsB;
      if (expDelta > 0) expPointsA += Math.min(8, expDelta * 0.3);
      else if (expDelta < 0) expPointsB += Math.min(8, Math.abs(expDelta) * 0.3);
      
      // Small bonus for cumulative absolute wins
      expPointsA += winsA * 0.15;
      expPointsB += winsB * 0.15;
    }

    // 7. Momentum & Recent Form (Past 5 fights before the bout date)
    let momentumPointsA = 0;
    let momentumPointsB = 0;
    const processMomentum = (streak: any[]) => {
      if (!streak || streak.length === 0) return 0;
      let score = 0;
      const wins = streak.filter(s => s.res === 'W').length;
      const losses = streak.filter(s => s.res === 'L').length;
      score += (wins * 4.5) - (losses * 2.5);

      let activeStreak = 0;
      for (const item of streak) {
        if (item.res === 'W') activeStreak++;
        else break;
      }
      score += activeStreak * 2.5;
      return score;
    };
    momentumPointsA = processMomentum(streakA);
    momentumPointsB = processMomentum(streakB);

    // 8. Tactical Stance Mechanics
    let tacticalPointsA = 0;
    let tacticalPointsB = 0;
    const sA = (fighterA.stance || 'Orthodox').trim().toLowerCase();
    const sB = (fighterB.stance || 'Orthodox').trim().toLowerCase();
    if (sA === 'southpaw' && sB === 'orthodox') {
      tacticalPointsA += 4;
    } else if (sB === 'southpaw' && sA === 'orthodox') {
      tacticalPointsB += 4;
    } else if (sA === 'switch' && sB !== 'switch') {
      tacticalPointsA += 2.5;
    } else if (sB === 'switch' && sA !== 'switch') {
      tacticalPointsB += 2.5;
    }

    // 9. Fight Activity & Freshness (Ring Rust)
    let rustPointsA = 0;
    let rustPointsB = 0;
    const getDaysSinceLastFight = (fighter: FighterProfile, targetDateStr: string | null | undefined) => {
      if (!targetDateStr || !fighter.fightsParticipated) return null;
      const targetTime = new Date(targetDateStr).getTime();
      if (isNaN(targetTime)) return null;

      const pastDates = fighter.fightsParticipated
        .map(f => f.eventDate ? new Date(f.eventDate).getTime() : 0)
        .filter(t => t > 0 && t < targetTime);

      if (pastDates.length === 0) return null;
      const mostRecentTime = Math.max(...pastDates);
      const diffMs = targetTime - mostRecentTime;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return diffDays;
    };
    const daysSinceA = getDaysSinceLastFight(fighterA, fightDateStr);
    const daysSinceB = getDaysSinceLastFight(fighterB, fightDateStr);

    const calculateRustPoints = (days: number | null) => {
      if (days === null) return 0;
      if (days > 540) return -7;
      if (days > 365) return -4;
      if (days >= 90 && days <= 270) return 3;
      return 0;
    };
    rustPointsA = calculateRustPoints(daysSinceA);
    rustPointsB = calculateRustPoints(daysSinceB);

    // 10. Championship & High-Stakes Experience
    let champPointsA = 0;
    let champPointsB = 0;
    const getChampionshipExperience = (fighter: FighterProfile, targetDateStr: string | null | undefined) => {
      if (!fighter.fightsParticipated) return 0;
      const targetTime = targetDateStr ? new Date(targetDateStr).getTime() : Infinity;
      return fighter.fightsParticipated.filter(f => {
        const fTime = f.eventDate ? new Date(f.eventDate).getTime() : 0;
        if (targetDateStr && fTime >= targetTime) return false;
        
        const hasAccolade = f.accolades && f.accolades.length > 0;
        const isTitle = (f.eventName || '').toLowerCase().includes('title') || 
                        (f.weightClass || '').toLowerCase().includes('title') ||
                        (f.method || '').toLowerCase().includes('championship');
        return hasAccolade || isTitle;
      }).length;
    };
    const champFightsA = getChampionshipExperience(fighterA, fightDateStr);
    const champFightsB = getChampionshipExperience(fighterB, fightDateStr);
    champPointsA = Math.min(10, champFightsA * 2.0);
    champPointsB = Math.min(10, champFightsB * 2.0);

    const totalA = pointsA + agePointsA + heightPointsA + reachPointsA + weightPointsA + wrPointsA + expPointsA + momentumPointsA + tacticalPointsA + rustPointsA + champPointsA;
    const totalB = pointsB + agePointsB + heightPointsB + reachPointsB + weightPointsB + wrPointsB + expPointsB + momentumPointsB + tacticalPointsB + rustPointsB + champPointsB;

    const tempK = 22; // spread factor
    const expA = Math.exp(totalA / tempK);
    const expB = Math.exp(totalB / tempK);
    const probA = Math.round((expA / (expA + expB)) * 100);
    const probB = 100 - probA;

    return {
      probA,
      probB,
      breakdown: [
        { label: 'Youth & Vitality', valA: ageA > 0 ? `${ageA} yrs` : 'N/A', valB: ageB > 0 ? `${ageB} yrs` : 'N/A', scoreA: agePointsA, scoreB: agePointsB, desc: 'Favors the younger fighter, penalizes age 35+ decline' },
        { label: 'Height Leverage', valA: valA > 0 ? `${Math.floor(valA / 12)}'${valA % 12}"` : 'N/A', valB: valB > 0 ? `${Math.floor(valB / 12)}'${valB % 12}"` : 'N/A', scoreA: heightPointsA, scoreB: heightPointsB, desc: 'Structural leverage from physical height stature' },
        { label: 'Reach Advantage', valA: reachA > 0 ? `${reachA}.0"` : 'N/A', valB: reachB > 0 ? `${reachB}.0"` : 'N/A', scoreA: reachPointsA, scoreB: reachPointsB, desc: 'Wingspan and distance control leverage' },
        { label: 'Weight & Mass', valA: wA > 0 ? `${wA} lbs` : 'N/A', valB: wB > 0 ? `${wB} lbs` : 'N/A', scoreA: weightPointsA, scoreB: weightPointsB, desc: 'Grappling/clinch mass advantage in division parameters' },
        { label: 'Win Rate Efficiency', valA: `${winRateA}%`, valB: `${winRateB}%`, scoreA: wrPointsA, scoreB: wrPointsB, desc: 'Percentage-based standard of winning career records' },
        { label: 'Experience Volume', valA: `${totalFightsA} fights`, valB: `${totalFightsB} fights`, scoreA: expPointsA, scoreB: expPointsB, desc: 'Overall veteran battle volume and aggregate career victories' },
        { label: 'Momentum & Form', valA: `${streakA.filter(s => s.res === 'W').length}W - ${streakA.filter(s => s.res === 'L').length}L`, valB: `${streakB.filter(s => s.res === 'W').length}W - ${streakB.filter(s => s.res === 'L').length}L`, scoreA: momentumPointsA, scoreB: momentumPointsB, desc: 'Evaluates past 5 fight results and active win streak velocity' },
        { label: 'Stance Mechanics', valA: fighterA.stance || 'Orthodox', valB: fighterB.stance || 'Orthodox', scoreA: tacticalPointsA, scoreB: tacticalPointsB, desc: 'Assesses southpaw/switch stance statistical matchup advantage' },
        { label: 'Fight Activity & Layoff', valA: daysSinceA !== null ? (daysSinceA > 365 ? `${Math.round(daysSinceA / 30.5)}mo layoff` : `${daysSinceA} days`) : 'Debut', valB: daysSinceB !== null ? (daysSinceB > 365 ? `${Math.round(daysSinceB / 30.5)}mo layoff` : `${daysSinceB} days`) : 'Debut', scoreA: rustPointsA, scoreB: rustPointsB, desc: 'Evaluates recent competitive activity and potential ring rust' },
        { label: 'Championship Experience', valA: `${champFightsA} bouts`, valB: `${champFightsB} bouts`, scoreA: champPointsA, scoreB: champPointsB, desc: 'Bout experience under championship or high-stakes conditions' }
      ]
    };
  };

  const prediction = calculatePrediction();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-md relative"
      id={`fight-detail-comparison-${fightId}`}
    >
      {/* Top Banner Action Panel */}
      <div className="bg-black/40 px-3 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs text-red-400 hover:text-red-300 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {backLabel || 'Back to Profile'}
        </button>
        <span className="text-[9px] sm:text-[10px] text-white/40 font-mono uppercase tracking-widest font-bold text-right shrink-0">
          Stats Comparison
        </span>
      </div>

      {/* Hero VERSUS Section with Full-Body Shots */}
      <div className="relative min-h-[360px] md:min-h-[440px] bg-gradient-to-b from-black/50 to-black/10 border-b border-white/5 overflow-hidden flex flex-col justify-end p-4 sm:p-6 select-none">
        
        {/* Background Atmosphere Lights */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-red-650/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-650/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none hidden md:block"></div>

        {/* Dynamic Matchup Header Info */}
        <div className="absolute top-8 left-6 right-6 flex flex-col items-center text-center z-20 space-y-2 pointer-events-auto">
          {match ? (
            <>
              <span className="text-[10px] font-mono text-red-500 font-black tracking-widest uppercase bg-red-950/40 border border-red-550/20 px-2.5 py-1 rounded">
                {match.weightClass || 'MMA Weightclass'} Bout
              </span>
              {match.accolades && match.accolades.some(acc => acc.Type === 'Belt') && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 px-3 py-1 rounded-full animate-pulse shrink-0">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-mono text-amber-400 font-black uppercase tracking-wider">
                    {match.accolades.find(acc => acc.Type === 'Belt')?.Name || "Championship Bout"}
                  </span>
                </div>
              )}
              {onSelectEvent && match.eventId ? (
                <button 
                  onClick={() => onSelectEvent(match.eventId)}
                  className="text-sm md:text-base font-black italic text-white uppercase tracking-tight hover:text-red-500 cursor-pointer transition-colors focus:outline-none focus:text-red-500 text-center max-w-full truncate px-1"
                >
                  {match.eventName}
                </button>
              ) : (
                <h3 className="text-sm md:text-base font-black italic text-white uppercase tracking-tight">
                  {match.eventName}
                </h3>
              )}
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
              <button 
                onClick={() => onSelectFighter(fighterA.id)}
                className="h-56 md:h-80 w-full flex items-end justify-center overflow-hidden pointer-events-auto relative mb-4 cursor-pointer hover:scale-[1.03] transition-transform duration-300 focus:outline-none"
              >
                <img 
                  src={bodyShotA} 
                  alt={fighterA.fullName} 
                  className="h-full object-contain object-bottom drop-shadow-[0_15px_24px_rgba(0,0,0,0.85)] filter brightness-105"
                  referrerPolicy="no-referrer"
                />
              </button>
            ) : (
              <button 
                onClick={() => onSelectFighter(fighterA.id)}
                className="h-56 md:h-80 w-full flex items-center justify-center text-4xl font-black font-mono text-white/10 uppercase mb-4 shadow-inner pointer-events-auto cursor-pointer focus:outline-none"
              >
                {fighterA.firstName?.[0]}{fighterA.lastName?.[0]}
              </button>
            )}
            
            <button 
              onClick={() => onSelectFighter(fighterA.id)}
              className="space-y-1 z-20 pointer-events-auto bg-black/40 hover:bg-black/60 hover:border-red-500/30 group-hover:border-red-500/30 transition-all backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-lg max-w-[170px] sm:max-w-[220px] text-center w-full cursor-pointer flex flex-col items-center focus:outline-none"
            >
              <span className="text-[9px] text-red-500 font-mono font-black uppercase tracking-widest">RED CORNER</span>
              <span className="block font-black italic text-white text-xs sm:text-sm md:text-base leading-tight uppercase transition-colors tracking-tight text-center w-full truncate">
                {fighterA.fullName}
              </span>
              {fighterA.nickName && (
                <span className="text-[10px] text-white/50 italic font-mono block uppercase truncate">&ldquo;{fighterA.nickName}&rdquo;</span>
              )}
            </button>
          </div>

          {/* Fighter B (Blue Corner) */}
          <div className="flex flex-col items-center justify-end text-center h-full relative group">
            {bodyShotB ? (
              <button 
                onClick={() => onSelectFighter(fighterB.id)}
                className="h-56 md:h-80 w-full flex items-end justify-center overflow-hidden pointer-events-auto relative mb-4 cursor-pointer hover:scale-[1.03] transition-transform duration-300 focus:outline-none"
              >
                <img 
                  src={bodyShotB} 
                  alt={fighterB.fullName} 
                  className="h-full object-contain object-bottom drop-shadow-[0_15px_24px_rgba(0,0,0,0.85)] scale-x-[-1] filter brightness-105"
                  referrerPolicy="no-referrer"
                />
              </button>
            ) : (
              <button 
                onClick={() => onSelectFighter(fighterB.id)}
                className="h-56 md:h-80 w-full flex items-center justify-center text-4xl font-black font-mono text-white/10 uppercase mb-4 shadow-inner pointer-events-auto cursor-pointer focus:outline-none"
              >
                {fighterB.firstName?.[0]}{fighterB.lastName?.[0]}
              </button>
            )}

            <button 
              onClick={() => onSelectFighter(fighterB.id)}
              className="space-y-1 z-20 pointer-events-auto bg-black/40 hover:bg-black/60 hover:border-indigo-450/30 group-hover:border-indigo-450/30 transition-all backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-lg max-w-[170px] sm:max-w-[220px] text-center w-full cursor-pointer flex flex-col items-center focus:outline-none"
            >
              <span className="text-[9px] text-indigo-400 font-mono font-black uppercase tracking-widest">BLUE CORNER</span>
              <span className="block font-black italic text-white text-xs sm:text-sm md:text-base leading-tight uppercase transition-colors tracking-tight text-center w-full truncate">
                {fighterB.fullName}
              </span>
              {fighterB.nickName && (
                <span className="text-[10px] text-white/50 italic font-mono block uppercase truncate">&ldquo;{fighterB.nickName}&rdquo;</span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Fight Detail Outcome Box if match is active */}
      {match && (
        <div className="bg-[#121212] border-b border-white/10 p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-bold italic uppercase tracking-wider text-xs border-b border-white/5 pb-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Bout Outcome & Analytics
          </div>
          
          <div className={`grid grid-cols-1 ${
            match.accolades && match.accolades.some(acc => acc.Type === 'Belt') 
              ? 'sm:grid-cols-2 md:grid-cols-4' 
              : 'sm:grid-cols-3'
          } gap-4 items-stretch`}>
            
            {/* Fighter A Outcome Card */}
            <button 
              onClick={() => onSelectFighter(fighterA.id)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center w-full transition-all duration-300 hover:scale-[1.03] cursor-pointer focus:outline-none order-2 md:order-1 ${
                (matchA?.outcome || '').toLowerCase() === 'win' 
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/25 text-emerald-400 hover:border-emerald-500/40' 
                  : (matchA?.outcome || '').toLowerCase() === 'loss'
                    ? 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20 text-red-400 hover:border-red-500/35'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1 truncate max-w-full group-hover:text-white/60">
                {fighterA.fullName}
              </span>
              <span className="text-lg font-black italic uppercase">
                {matchA?.outcome || 'OTHER'}
              </span>
            </button>

            {/* Method / Round detail */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center items-center order-3 md:order-2">
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
            <button 
              onClick={() => onSelectFighter(fighterB.id)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center w-full transition-all duration-300 hover:scale-[1.03] cursor-pointer focus:outline-none order-4 md:order-3 ${
                (matchB?.outcome || '').toLowerCase() === 'win' 
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/25 text-emerald-400 hover:border-emerald-500/40' 
                  : (matchB?.outcome || '').toLowerCase() === 'loss'
                    ? 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20 text-red-400 hover:border-red-500/35'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1 truncate max-w-full group-hover:text-white/60">
                {fighterB.fullName}
              </span>
              <span className="text-lg font-black italic uppercase">
                {matchB?.outcome || 'OTHER'}
              </span>
            </button>

            {/* Championship Belt Card */}
            {match.accolades && match.accolades.some(acc => acc.Type === 'Belt') && (
              <div className="bg-gradient-to-b from-amber-500/15 via-yellow-650/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center shadow-[0_0_20px_rgba(245,158,11,0.05)] order-1 md:order-4 h-full min-h-[90px]">
                <Crown className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                <div className="space-y-0.5">
                  <span className="block text-[9px] text-amber-400 font-mono font-black uppercase tracking-widest leading-none">
                    Championship Belt Bout
                  </span>
                  <span className="block font-black italic text-white text-xs sm:text-sm leading-tight uppercase tracking-tight max-w-full line-clamp-2">
                    {match.accolades.find(acc => acc.Type === 'Belt')?.Name}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Numerical Stats & Physical specifications Comparison */}
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        
        {fighterA.fightsParticipated && fighterB.fightsParticipated && (
          <DualTrajectoryGraph
            fightsA={fighterA.fightsParticipated}
            fightsB={fighterB.fightsParticipated}
            nameA={fighterA.fullName}
            nameB={fighterB.fullName}
            onSelectEvent={(eventId) => {
              window.location.hash = `events/${eventId}`;
            }}
          />
        )}

        {/* Career & Physical Algorithmic Match-up Predictor */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Datalogic Simulation Model
              </div>
              <h4 className="text-sm font-black italic text-white uppercase tracking-tight mt-1">
                Predictive Matchup Simulation
              </h4>
            </div>
            <div className="text-[9px] font-mono text-white/40 uppercase bg-black/30 border border-white/5 px-2 py-1 rounded max-w-xs leading-normal">
              🔮 Computed strictly via pre-fight variables. Independent of real outcome.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Fighter A Probability Display */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-center justify-between relative overflow-hidden gap-4" id="prediction-card-fighter-a">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Headshot on the LEFT ("end-left") */}
              <div className="shrink-0 relative z-10" id="prediction-headshot-fighter-a">
                {imagesA.headshot ? (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-red-500/30 overflow-hidden bg-black/40">
                    <img 
                      src={imagesA.headshot} 
                      alt={fighterA.fullName} 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-red-500/30 overflow-hidden bg-black/40 flex items-center justify-center font-mono font-black text-red-400 text-base sm:text-lg">
                    {fighterA.firstName?.[0]}{fighterA.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Text details on the RIGHT */}
              <div className="flex flex-col items-end text-right relative z-10 flex-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded mb-1.5 truncate max-w-full">
                  {fighterA.fullName}
                </span>
                <span className="text-3xl sm:text-4xl font-black italic font-mono text-white leading-none font-sans">
                  {prediction.probA}%
                </span>
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider mt-1">
                  Predicted Probability
                </span>
              </div>
            </div>

            {/* Fighter B Probability Display */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center justify-between relative overflow-hidden gap-4" id="prediction-card-fighter-b">
              <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Text details on the LEFT */}
              <div className="flex flex-col items-start text-left relative z-10 flex-1 order-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded mb-1.5 truncate max-w-full">
                  {fighterB.fullName}
                </span>
                <span className="text-3xl sm:text-4xl font-black italic font-mono text-white leading-none font-sans">
                  {prediction.probB}%
                </span>
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider mt-1">
                  Predicted Probability
                </span>
              </div>

              {/* Headshot on the RIGHT ("end-right") */}
              <div className="shrink-0 relative z-10 order-2" id="prediction-headshot-fighter-b">
                {imagesB.headshot ? (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-500/30 overflow-hidden bg-black/40">
                    <img 
                      src={imagesB.headshot} 
                      alt={fighterB.fullName} 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-500/30 overflow-hidden bg-black/40 flex items-center justify-center font-mono font-black text-blue-400 text-base sm:text-lg">
                    {fighterB.firstName?.[0]}{fighterB.lastName?.[0]}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Probability Split Slider Bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-500" 
                style={{ width: `${prediction.probA}%` }}
              />
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-650 h-full transition-all duration-500" 
                style={{ width: `${prediction.probB}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-white/40 uppercase tracking-widest">
              <span>{fighterA.lastName || 'RED'} ({prediction.probA}%)</span>
              <span>PROBABILITY RATIO</span>
              <span>{fighterB.lastName || 'BLUE'} ({prediction.probB}%)</span>
            </div>
          </div>

          {/* Interactive Factor Breakdown */}
          <div className="pt-2">
            <button 
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{showBreakdown ? 'Hide Simulated Factor Analysis' : 'Expand Simulated Factor Analysis'}</span>
              <span className="text-amber-500">{showBreakdown ? '▲' : '▼'}</span>
            </button>

            {showBreakdown && (
              <div className="border border-white/10 rounded-xl mt-3 overflow-hidden bg-black/45 divide-y divide-white/5">
                {prediction.breakdown.map((b, i) => {
                  const diff = b.scoreA - b.scoreB;
                  const favA = diff > 0;
                  const favB = diff < 0;

                  return (
                    <div key={i} className="p-3 sm:p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[11px] font-black italic text-white uppercase tracking-tight block">
                            {b.label}
                          </span>
                          <span className="text-[9px] text-white/40 block font-mono leading-none mt-0.5">
                            {b.desc}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          favA 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : favB 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-white/5 text-white/40 border border-white/5'
                        }`}>
                          {favA ? 'RED ADVANTAGE' : favB ? 'BLUE ADVANTAGE' : 'EVEN'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center text-center font-mono text-[10px]">
                        {/* Redcorner metric */}
                        <div className={`text-right ${favA ? 'text-red-400 font-bold' : 'text-white/60'}`}>
                          {b.valA}
                          <span className="text-[8px] text-white/30 block">
                            {b.scoreA > 0 ? `+${b.scoreA.toFixed(1)} pts` : b.scoreA < 0 ? `${b.scoreA.toFixed(1)} pts` : '0.0 pts'}
                          </span>
                        </div>

                        {/* Mid-label line */}
                        <div className="h-[1px] bg-white/10 relative">
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                            favA ? 'bg-red-500' : favB ? 'bg-blue-500' : 'bg-white/35'
                          }`} />
                        </div>

                        {/* Bluecorner metric */}
                        <div className={`text-left ${favB ? 'text-blue-400 font-bold' : 'text-white/60'}`}>
                          {b.valB}
                          <span className="text-[8px] text-white/30 block">
                            {b.scoreB > 0 ? `+${b.scoreB.toFixed(1)} pts` : b.scoreB < 0 ? `${b.scoreB.toFixed(1)} pts` : '0.0 pts'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
                <span className="block text-xs sm:text-sm font-black italic uppercase text-white tracking-tight mt-1 truncate pr-2">
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
                <span className="block text-xs sm:text-sm font-black italic uppercase text-white tracking-tight mt-1 truncate pr-2">
                  {fighterB.lastName || fighterB.fullName}
                </span>
              </div>
            </div>

            {/* AGE COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right flex flex-col items-end">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${ageA > 0 && ageB > 0 && ageA < ageB ? 'text-amber-500' : 'text-white'}`}>
                  {ageA > 0 ? `${ageA} YRS` : 'Unknown'}
                </span>
                {ageA > 0 && ageB > 0 && ageA < ageB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (YOUNGER, +{ageB - ageA} YRS)
                  </span>
                )}
                {ageA > 0 && ageB > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden flex justify-end ml-auto">
                    <div 
                      className="bg-gradient-to-l from-red-500 to-red-600 h-full rounded-full" 
                      style={{ width: `${ageBar.pct1}%` }}
                    />
                  </div>
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
              <div className="text-left flex flex-col items-start">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${ageA > 0 && ageB > 0 && ageB < ageA ? 'text-amber-500' : 'text-white'}`}>
                  {ageB > 0 ? `${ageB} YRS` : 'Unknown'}
                </span>
                {ageA > 0 && ageB > 0 && ageB < ageA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (YOUNGER, +{ageA - ageB} YRS)
                  </span>
                )}
                {ageA > 0 && ageB > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden mr-auto">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                      style={{ width: `${ageBar.pct2}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* HEIGHT COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right flex flex-col items-end">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${valA > valB ? 'text-amber-500' : 'text-white'}`}>
                  {displayHeight(fighterA.height)}
                </span>
                {valA > valB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(valA - valB).toFixed(0)}&rdquo;)
                  </span>
                )}
                {valA > 0 && valB > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden flex justify-end ml-auto">
                    <div 
                      className="bg-gradient-to-l from-red-500 to-red-600 h-full rounded-full" 
                      style={{ width: `${heightBar.pct1}%` }}
                    />
                  </div>
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
              <div className="text-left flex flex-col items-start">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${valB > valA ? 'text-amber-500' : 'text-white'}`}>
                  {displayHeight(fighterB.height)}
                </span>
                {valB > valA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(valB - valA).toFixed(0)}&rdquo;)
                  </span>
                )}
                {valA > 0 && valB > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden mr-auto">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                      style={{ width: `${heightBar.pct2}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* REACH COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right flex flex-col items-end">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${reachA > reachB ? 'text-amber-500' : 'text-white'}`}>
                  {reachA > 0 ? `${reachA}.0"` : 'Unknown'}
                </span>
                {reachA > reachB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(reachA - reachB).toFixed(0)}&rdquo;)
                  </span>
                )}
                {reachA > 0 && reachB > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden flex justify-end ml-auto">
                    <div 
                      className="bg-gradient-to-l from-red-500 to-red-600 h-full rounded-full" 
                      style={{ width: `${reachBar.pct1}%` }}
                    />
                  </div>
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
              <div className="text-left flex flex-col items-start">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${reachB > reachA ? 'text-amber-500' : 'text-white'}`}>
                  {reachB > 0 ? `${reachB}.0"` : 'Unknown'}
                </span>
                {reachB > reachA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(reachB - reachA).toFixed(0)}&rdquo;)
                  </span>
                )}
                {reachA > 0 && reachB > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden mr-auto">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                      style={{ width: `${reachBar.pct2}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* COMBATIVE WEIGHT COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right flex flex-col items-end">
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
                {(fightWeightA.lbs || 0) > 0 && (fightWeightB.lbs || 0) > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden flex justify-end ml-auto">
                    <div 
                      className="bg-gradient-to-l from-red-500 to-red-600 h-full rounded-full" 
                      style={{ width: `${weightBar.pct1}%` }}
                    />
                  </div>
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
              <div className="text-left flex flex-col items-start">
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
                {(fightWeightA.lbs || 0) > 0 && (fightWeightB.lbs || 0) > 0 && (
                  <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden mr-auto">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                      style={{ width: `${weightBar.pct2}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* WIN RATE COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right flex flex-col items-end">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winRateA > winRateB ? 'text-amber-500' : 'text-white'}`}>
                  {winRateA}%
                </span>
                {winRateA > winRateB && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(winRateA - winRateB)}%)
                  </span>
                )}
                <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden flex justify-end ml-auto">
                  <div 
                    className="bg-gradient-to-l from-red-500 to-red-600 h-full rounded-full" 
                    style={{ width: `${winRateBar.pct1}%` }}
                  />
                </div>
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  WIN RATE
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left flex flex-col items-start">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winRateB > winRateA ? 'text-amber-500' : 'text-white'}`}>
                  {winRateB}%
                </span>
                {winRateB > winRateA && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500 font-mono block tracking-wider mt-0.5 font-bold uppercase leading-none">
                    ADVANTAGE (+{(winRateB - winRateA)}%)
                  </span>
                )}
                <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden mr-auto">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                    style={{ width: `${winRateBar.pct2}%` }}
                  />
                </div>
              </div>
            </div>

            {/* TOTAL WINS COMPARISON */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="text-right flex flex-col items-end">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winsA > winsB ? 'text-amber-500' : 'text-white'}`}>
                  {winsA} Wins
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/40 font-mono block uppercase tracking-wider mt-0.5 leading-none">
                  {recA.wins}W - {recA.losses}L{recA.draws > 0 ? ` - ${recA.draws}D` : ''}{recA.noContests > 0 ? ` - ${recA.noContests}NC` : ''}
                </span>
                <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden flex justify-end ml-auto">
                  <div 
                    className="bg-gradient-to-l from-red-500 to-red-600 h-full rounded-full" 
                    style={{ width: `${winsBar.pct1}%` }}
                  />
                </div>
              </div>
              
              {/* Stat Mid label */}
              <div className="flex flex-col items-center text-center">
                <Trophy className="w-3.5 h-3.5 text-red-500 mb-1" />
                <span className="text-[8px] sm:text-[10px] text-white/40 font-mono uppercase tracking-wider sm:tracking-widest font-extrabold leading-none">
                  RECORD
                </span>
              </div>

              {/* Fighter B Spec */}
              <div className="text-left flex flex-col items-start">
                <span className={`text-sm sm:text-base font-black italic font-mono uppercase ${winsB > winsA ? 'text-amber-500' : 'text-white'}`}>
                  {winsB} Wins
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/40 font-mono block uppercase tracking-wider mt-0.5 leading-none">
                  {recB.wins}W - {recB.losses}L{recB.draws > 0 ? ` - ${recB.draws}D` : ''}{recB.noContests > 0 ? ` - ${recB.noContests}NC` : ''}
                </span>
                <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden mr-auto">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                    style={{ width: `${winsBar.pct2}%` }}
                  />
                </div>
              </div>
            </div>

            {/* STREAK MOMENTUM */}
            <div className="p-4 grid grid-cols-[1fr_90px_1fr] sm:grid-cols-[1fr_140px_1fr] gap-2 sm:gap-4 items-center transition-colors hover:bg-white/[0.02]">
              {/* Fighter A Spec */}
              <div className="flex items-center justify-end gap-1 flex-wrap">
                {streakA.length > 0 ? streakA.map((item, i) => (
                  <a 
                    key={i} 
                    href={`#fights/${fighterA.id}/${item.opponentId}/${item.fightId}`}
                    title={`${item.res === 'W' ? 'Win' : item.res === 'L' ? 'Loss' : 'Draw/NC'} vs ${item.opponentName} at ${item.eventName}`}
                    className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-mono font-black italic shrink-0 transition-transform hover:scale-115 duration-150 ${
                      item.res === 'W' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                        : item.res === 'L' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {item.res}
                  </a>
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
                {streakB.length > 0 ? streakB.map((item, i) => (
                  <a 
                    key={i} 
                    href={`#fights/${fighterB.id}/${item.opponentId}/${item.fightId}`}
                    title={`${item.res === 'W' ? 'Win' : item.res === 'L' ? 'Loss' : 'Draw/NC'} vs ${item.opponentName} at ${item.eventName}`}
                    className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-mono font-black italic shrink-0 transition-transform hover:scale-115 duration-150 ${
                      item.res === 'W' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                        : item.res === 'L' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {item.res}
                  </a>
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
