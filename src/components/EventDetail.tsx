import { useState, useEffect } from 'react';
import { EventSummary, EventDetailed, WorkerFight } from '../types';
import { Calendar, MapPin, Award, Scale, HelpCircle, User, ArrowRight, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import fighterImages from '../data/fighter-images.json';
import ImageWithLoader from './ImageWithLoader';
import { isLegitimateFighterImage } from '../utils/image-validator';

interface EventDetailProps {
  eventSummary: EventSummary;
  onSelectFighter: (id: number) => void;
}

function CornerFighterHeadshot({ 
  fighterId, 
  name, 
  className = "w-12 h-12 sm:w-14 sm:h-14" 
}: { 
  fighterId: number; 
  name: string; 
  className?: string; 
}) {
  const [error, setError] = useState(false);
  const images = (fighterImages as any)[fighterId] || { headshot: null, bodyShot: null };
  
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const activeImageCandidate = images.headshot || images.bodyShot;
  const activeImage = activeImageCandidate && isLegitimateFighterImage(activeImageCandidate, firstName, lastName, name)
    ? activeImageCandidate 
    : null;

  if (activeImage && !error) {
    return (
      <ImageWithLoader
        src={activeImage}
        alt={name}
        className={`${className} rounded-full overflow-hidden border border-white/10 bg-black/40 shrink-0`}
        onError={() => setError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`${className} rounded-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-300/30 text-slate-700 font-mono text-xs font-bold shadow-inner shrink-0`}>
      {initials}
    </div>
  );
}

export default function EventDetail({ eventSummary, onSelectFighter }: EventDetailProps) {
  const [detailed, setDetailed] = useState<EventDetailed | null>(null);
  const [errorStr, setErrorStr] = useState<string | null>(null);

  // Load detailed data dynamically from separate JSON files based on event id
  useEffect(() => {
    let isMounted = true;
    
    async function fetchDetail() {
      setErrorStr(null);
      setDetailed(null);
      
      const filename = `events/${eventSummary.id}.json`;
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
            if (data && isMounted) {
              setDetailed(data);
              return;
            }
          }
        } catch (err) {
          // try next candidate
        }
      }
      
      if (isMounted) {
        setErrorStr(`Failed to load detailed card results for event #${eventSummary.id}.`);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [eventSummary.id]);

  const getOutcomeBadgeClass = (outcome: string) => {
    switch (outcome.toLowerCase().trim()) {
      case 'win':
        return 'bg-green-500/15 text-white border border-green-500/35 font-black italic';
      case 'loss':
        return 'bg-red-500/15 text-white border border-red-500/35 font-black italic';
      case 'draw':
        return 'bg-amber-500/15 text-white border border-amber-500/35 font-black italic';
      default:
        return 'bg-white/5 text-white/60 border border-white/10';
    }
  };

  // Group fights by Main card vs Prelims
  const groupedFights = detailed?.fights ? detailed.fights.reduce((acc, fight) => {
    const segment = fight.cardSegment || 'Main';
    if (!acc[segment]) acc[segment] = [];
    acc[segment].push(fight);
    return acc;
  }, {} as Record<string, WorkerFight[]>) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-md relative"
      id={`event-detail-${eventSummary.id}`}
    >
      {/* Event Header Information */}
      <div className="bg-black/30 p-4 sm:p-6 border-b border-white/10 relative overflow-hidden min-h-[140px] flex flex-col justify-center">
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-red-650/5 rounded-full blur-2xl pointer-events-none"></div>
        <span className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest rounded uppercase inline-block mb-3 relative z-10 self-start ${eventSummary.status.toLowerCase() === 'final' ? 'bg-white/5 text-white/55 border border-white/10' : 'bg-red-500 text-white animate-pulse'}`}>
          {eventSummary.status.toUpperCase()} EVENT INDEX
        </span>

        <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase mb-3 relative z-10 leading-none">
          {eventSummary.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-white/60 relative z-10 font-mono">
          <div className="flex flex-col gap-0.5 col-span-1 justify-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500 shrink-0" />
              <span className="uppercase tracking-tight font-bold text-white/80">
                DATE & TIME
              </span>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider pl-6 block">
              {eventSummary.date ? new Date(eventSummary.date).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'TBA'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 col-span-1 justify-center">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate uppercase tracking-tight font-bold text-white/80">
                {detailed?.location?.venue ? detailed.location.venue : (eventSummary.venue || 'VENUE TBA')}
              </span>
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider pl-6 block">
              {detailed?.location
                ? `${detailed.location.city}, ${detailed.location.state ? detailed.location.state + ', ' : ''}${detailed.location.country}`
                : eventSummary.location}
            </span>
          </div>
        </div>
      </div>

      {/* Fights display section */}
      <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 bg-black/10">
        {errorStr ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-500 font-mono text-center gap-3">
            <HelpCircle className="w-8 h-8 text-red-500" />
            <div className="text-xs uppercase tracking-widest">{errorStr}</div>
          </div>
        ) : !detailed ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40 font-mono text-center gap-3">
            <div className="w-8 h-8 rounded-full border-t-2 border-red-500 animate-spin" />
            <div className="text-xs uppercase tracking-widest">Loading detailed card results...</div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Show segments grouped cleanly */}
            {groupedFights && (Object.entries(groupedFights) as [string, WorkerFight[]][]).map(([segment, fights]) => (
              <div key={segment} className="space-y-3.5">
                <h3 className="text-sm font-black italic tracking-wider text-red-500 uppercase flex items-center gap-2 border-b border-white/10 pb-1.5">
                  <Award className="w-3.5 h-3.5" /> {segment} Card Matches
                </h3>

                <div className="space-y-4">
                  {fights.map((fight, index) => {
                    const rFighter = fight.fighters.find(f => f.corner.toLowerCase() === 'red');
                    const bFighter = fight.fighters.find(f => f.corner.toLowerCase() === 'blue');
                    const championshipAccolade = fight.accolades?.find(acc => acc.Type === 'Belt');
                    const isChampionship = !!championshipAccolade;
                    
                    const handleCardClick = () => {
                      if (rFighter && bFighter && fight.fightId) {
                        const slugifyLocal = (text: string) => {
                          return text
                            .toString()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase()
                            .replace(/[^a-z0-9 -]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-+|-+$/g, '')
                            .trim();
                        };
                        const rSlug = slugifyLocal(rFighter.name);
                        const bSlug = slugifyLocal(bFighter.name);
                        const fightSlug = `${rSlug}-vs-${bSlug}`;
                        window.location.hash = `fights/${rFighter.fighterId}/${bFighter.fighterId}/${fight.fightId}/${fightSlug}`;
                      }
                    };

                    return (
                      <div 
                        key={`${fight.fightId}-${index}`}
                        onClick={handleCardClick}
                        className={`group border rounded-2xl overflow-hidden shadow-xl p-4 space-y-3.5 transition-all duration-300 cursor-pointer ${
                          isChampionship 
                            ? 'bg-gradient-to-br from-amber-500/[0.04] via-white/[0.02] to-transparent border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.03)] hover:border-amber-500/40 hover:bg-amber-500/[0.06]' 
                            : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/[0.07]'
                        }`}
                      >
                        {/* Fight Header specs */}
                        <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                          <span className="font-bold text-white/40 uppercase tracking-widest">
                            Fight #{fight.fightOrder} • {fight.weightClass}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider bg-red-950/20 px-1.5 py-0.5 rounded border border-red-500/10">
                              Compare Stats
                            </span>
                            <span className="text-[10px] text-white/50 uppercase tracking-widest px-2 py-0.5 bg-black/40 border border-white/10 rounded-md font-bold">
                              {fight.status}
                            </span>
                          </div>
                        </div>

                        {/* Championship Banner */}
                        {isChampionship && (
                          <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15 p-2.5 rounded-xl text-amber-400">
                            <Crown className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[9px] tracking-widest font-black uppercase font-mono text-amber-500/80 leading-tight">
                                Championship Belt Bout
                              </span>
                              <span className="text-xs font-black italic tracking-tight uppercase leading-snug">
                                {championshipAccolade.Name}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Matchup Duel display */}
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-stretch relative">
                          
                          {/* Fighter A */}
                          {rFighter && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); onSelectFighter(rFighter.fighterId); }}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] hover:bg-white/[0.05] p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer h-full text-center sm:text-left"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                                <div className="relative shrink-0 mx-auto sm:mx-0">
                                  <CornerFighterHeadshot fighterId={rFighter.fighterId} name={rFighter.name} className="w-12 h-12 sm:w-14 sm:h-14" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onSelectFighter(rFighter.fighterId); }}
                                    className="inline-flex items-center gap-1 font-black italic text-white hover:text-amber-400 transition-colors cursor-pointer text-xs sm:text-sm tracking-tight uppercase hover:underline text-left leading-tight w-full"
                                  >
                                    <span className="whitespace-normal break-words flex-1 text-left">{rFighter.name}</span>
                                    <ArrowRight className="w-3 h-3 shrink-0 self-center" />
                                  </button>
                                  <div className="text-[9px] sm:text-[10px] text-white/40 font-mono mt-0.5 whitespace-normal break-all">
                                    Scorecard: {rFighter.recordStr}
                                  </div>
                                </div>
                              </div>
                              {rFighter.outcome && rFighter.outcome !== 'Unknown' && (
                                <span className={`px-2 py-1 sm:py-0.5 rounded text-[8px] sm:text-[9px] font-mono shrink-0 uppercase tracking-widest text-center w-full sm:w-auto ${getOutcomeBadgeClass(rFighter.outcome)}`}>
                                  {rFighter.outcome}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Fighter B */}
                          {bFighter && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); onSelectFighter(bFighter.fighterId); }}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] hover:bg-white/[0.05] p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer h-full text-center sm:text-left"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                                <div className="relative shrink-0 mx-auto sm:mx-0">
                                  <CornerFighterHeadshot fighterId={bFighter.fighterId} name={bFighter.name} className="w-12 h-12 sm:w-14 sm:h-14" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onSelectFighter(bFighter.fighterId); }}
                                    className="inline-flex items-center gap-1 font-black italic text-white hover:text-amber-400 transition-colors cursor-pointer text-xs sm:text-sm tracking-tight uppercase hover:underline text-left leading-tight w-full"
                                  >
                                    <span className="whitespace-normal break-words flex-1 text-left">{bFighter.name}</span>
                                    <ArrowRight className="w-3 h-3 shrink-0 self-center" />
                                  </button>
                                  <div className="text-[9px] sm:text-[10px] text-white/40 font-mono mt-0.5 whitespace-normal break-all">
                                    Scorecard: {bFighter.recordStr}
                                  </div>
                                </div>
                              </div>
                              {bFighter.outcome && bFighter.outcome !== 'Unknown' && (
                                <span className={`px-2 py-1 sm:py-0.5 rounded text-[8px] sm:text-[9px] font-mono shrink-0 uppercase tracking-widest text-center w-full sm:w-auto ${getOutcomeBadgeClass(bFighter.outcome)}`}>
                                  {bFighter.outcome}
                                </span>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Finishing Match Outcomes */}
                        {fight.result && fight.result.method !== 'N/A' && (
                          <div className="bg-black/25 border border-white/10 p-3.5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-sans font-bold text-white uppercase italic tracking-tight">
                              <Scale className="w-3.5 h-3.5 text-red-500" />
                              <span>Finishing Result:</span>
                              <span className="text-red-550 font-black">{fight.result.method}</span>
                            </div>
                            
                            {fight.result.endingRound && (
                              <div className="text-[10px] text-white/40 font-mono pl-5 uppercase">
                                Ended in Round {fight.result.endingRound} at {fight.result.endingTime || '0:00'}
                              </div>
                            )}

                            {fight.result.endingNotes && (
                              <div className="text-[10px] text-white/50 italic pl-5 mt-1 border-l-2 border-white/10 uppercase">
                                Note: {fight.result.endingNotes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location/Stadium detail footer */}
      <div className="bg-black/30 border-t border-white/15 py-3 px-6 text-[10px] text-white/40 font-mono flex items-center justify-between uppercase tracking-widest">
        <span>Venue: {detailed?.location.venue || eventSummary.location}</span>
        <span>TZ: {detailed?.timezone || 'UTC'}</span>
      </div>
    </motion.div>
  );
}
