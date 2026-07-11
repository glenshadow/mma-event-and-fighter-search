import { useState, useEffect } from 'react';
import { FighterProfile } from '../types';
import { Award, Calendar, Globe, Layers, MapPin, Ruler, User, ExternalLink, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import fighterImages from '../data/fighter-images.json';

function OpponentHeadshot({ fighterId, name, className = "w-10 h-10" }: { fighterId: number; name: string; className?: string }) {
  const [error, setError] = useState(false);
  const images = (fighterImages as any)[fighterId] || { headshot: null, bodyShot: null };
  
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  if (images.headshot && !error) {
    return (
      <img
        src={images.headshot}
        alt={name}
        className={`${className} rounded-full object-cover border border-white/10 bg-black/40 shrink-0`}
        onError={() => setError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`${className} rounded-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-300/30 text-slate-700 font-mono text-[10px] font-bold shadow-inner shrink-0`}>
      {initials}
    </div>
  );
}

interface FighterDetailProps {
  fighter: FighterProfile;
  onSelectFighter: (id: number) => void;
  onSelectEvent: (id: number) => void;
}

export default function FighterDetail({ fighter, onSelectFighter, onSelectEvent }: FighterDetailProps) {
  const [detailedFighter, setDetailedFighter] = useState<FighterProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Dynamically load complete fighter details (with full fight history)
  useEffect(() => {
    let isMounted = true;
    
    async function fetchDetail() {
      setLoading(true);
      setDetailedFighter(null);
      
      const filename = `fighters/${fighter.id}.json`;
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
              setDetailedFighter(data);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          // try next path
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [fighter.id]);

  const currentFighter = detailedFighter || fighter;

  // Convert height in inches to feet-inches
  const formatHeight = (inches: number | null) => {
    if (!inches) return 'Unknown';
    const ft = Math.floor(inches / 12);
    const inch = inches % 12;
    return `${ft}'${inch}" (${inches} cm)`;
  };

  // Ape Index metric (Reach - Height) is highly watched in combat sports
  const getApeIndex = (height: number | null, reach: number | null) => {
    if (!height || !reach) return null;
    const diff = reach - height;
    if (diff > 0) return `+${diff}" reach advantage`;
    if (diff < 0) return `${diff}" reach deficit`;
    return 'Neutral ape index';
  };

  const getOutcomeClass = (outcome: string) => {
    switch (outcome.toLowerCase().trim()) {
      case 'win':
        return 'bg-emerald-500/10 text-win-color border border-emerald-500/20 font-black italic';
      case 'loss':
        return 'bg-loss-badge text-loss-color border border-loss-badge font-black italic';
      default:
        return 'bg-other-badge text-other-badge border font-black italic';
    }
  };

  const winPercentage = currentFighter.record.wins + currentFighter.record.losses > 0
    ? Math.round((currentFighter.record.wins / (currentFighter.record.wins + currentFighter.record.losses + currentFighter.record.draws + currentFighter.record.noContests)) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-md relative"
      id={`fighter-detail-${currentFighter.id}`}
    >
      {/* Top Header Card */}
      <div className="bg-black/30 p-6 border-b border-white/10 relative overflow-hidden min-h-[160px] md:min-h-[180px]">
        {/* Ambient red glow */}
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-red-650/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Full-body fighter profile standing tall on the right */}
        {currentFighter.bodyShot && (
          <div className="absolute right-4 md:right-12 top-0 bottom-0 w-1/3 md:w-1/2 select-none pointer-events-none z-0 flex justify-end items-end">
            <img 
              src={currentFighter.bodyShot} 
              alt="" 
              className="h-[200%] w-auto max-w-none object-contain opacity-40 md:opacity-75 translate-y-[52%]" 
              referrerPolicy="no-referrer"
              style={{
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 100%)'
              }}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
          <div className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/15 bg-black/40 flex items-center justify-center shadow-lg">
            {currentFighter.headshot ? (
              <img 
                src={currentFighter.headshot} 
                alt={currentFighter.fullName} 
                className="w-full h-full object-cover shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as any).style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.fallback-badge');
                  if (fb) (fb as any).classList.remove('hidden');
                }}
              />
            ) : null}

            <div className={`fallback-badge ${currentFighter.headshot ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 text-2xl font-black font-mono`}>
              {`${currentFighter.firstName?.[0] || ""}${currentFighter.lastName?.[0] || ""}`.toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase leading-none mb-1">
              {currentFighter.fullName}
            </h2>
            {currentFighter.nickName && (
              <span className="text-red-500 italic block font-mono text-xs font-bold uppercase tracking-widest mb-2.5">
                &ldquo;{currentFighter.nickName}&rdquo;
              </span>
            )}
            
            {/* Scoreboard Record */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold bg-black/40 text-red-550 px-3 py-1.5 rounded-xl border border-white/10 tracking-widest">
                {currentFighter.record.wins}W - {currentFighter.record.losses}L - {currentFighter.record.draws}D
                {currentFighter.record.noContests > 0 && ` (${currentFighter.record.noContests} NC)`}
              </span>
              <span className="text-[11px] text-white/40 font-mono uppercase tracking-widest">
                {winPercentage}% WINRATE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Stats / Bio section */}
      <div className="flex-1 p-6 space-y-6 bg-black/10">
        
        {/* Physical Stats Grid */}
        <div className="bg-black/20 rounded-2xl border border-white/10 p-5">
          <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-1.5 font-bold">
            <Activity className="w-3.5 h-3.5 text-red-505" /> Professional athlete specifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">STANCE stance</span>
              <span className="text-[13px] font-black italic text-white uppercase mt-1 block">
                {currentFighter.stance || 'Orthodox'}
              </span>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold font-mono">SPEC HEIGHT</span>
              <span className="text-[13px] font-black italic text-white mt-1 block uppercase">
                {formatHeight(currentFighter.height)}
              </span>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">SPEC REACH</span>
              <span className="text-[13px] font-black italic text-white mt-1 block uppercase">
                {currentFighter.reach ? `${currentFighter.reach}.0" (${Math.round(currentFighter.reach * 2.54)} CM)` : 'Unknown'}
              </span>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-white/40 text-[9px] uppercase font-mono tracking-widest block font-bold">COMBATIVE WEIGHT</span>
              <span className="text-[13px] font-black italic text-white mt-1 block uppercase">
                {currentFighter.weight ? `${currentFighter.weight} LBS (${Math.round(currentFighter.weight * 0.453)} KG)` : 'Unknown'}
              </span>
            </div>

          </div>

          {/* Reach Advantage Metric */}
          {getApeIndex(currentFighter.height, currentFighter.reach) && (
            <div className="mt-4 border-t border-white/5 pt-3.5 flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase tracking-widest">
              <Ruler className="w-3.5 h-3.5 text-red-500" />
              <span>APE INDEX advantage:</span>
              <span className="font-extrabold italic text-red-550">{getApeIndex(currentFighter.height, currentFighter.reach)}</span>
            </div>
          )}
        </div>

        {/* Biography Metadata Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Birth & Residence */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3.5">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono flex items-center gap-1.5 font-bold">
              <Globe className="w-3.5 h-3.5 text-red-500" /> GEOGRAPHIC ROOTS
            </h4>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-white/40 font-mono block font-bold uppercase">PLACE OF BIRTH</span>
                  <span className="text-xs font-bold text-white/80 uppercase">
                    {currentFighter.born?.city ? `${currentFighter.born.city}, ` : ''}
                    {currentFighter.born?.state ? `${currentFighter.born.state}, ` : ''}
                    {currentFighter.born?.country || 'UFC Record'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-white/40 font-mono block font-bold uppercase">FIGHTING OUT OF</span>
                  <span className="text-xs font-bold text-white/80 uppercase">
                    {currentFighter.fightingOutOf?.city ? `${currentFighter.fightingOutOf.city}, ` : ''}
                    {currentFighter.fightingOutOf?.state ? `${currentFighter.fightingOutOf.state}, ` : ''}
                    {currentFighter.fightingOutOf?.country || 'UFC Training camp'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Age and DOB */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3.5">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-red-500" /> ATHLETE CHRONICLE
            </h4>
            
            <div className="space-y-3.5">
              <div>
                <span className="text-[9px] text-white/40 font-mono block font-bold uppercase font-mono">SPECIFIED AGE</span>
                <span className="text-sm font-black italic text-white uppercase">
                  {currentFighter.age ? `${currentFighter.age} YEARS OLD` : 'UFC Record'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 font-mono block font-bold uppercase">DATE OF BIRTH</span>
                <span className="text-xs font-bold text-white/60">
                  {currentFighter.dob ? new Date(currentFighter.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fight History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-black italic text-white uppercase tracking-tight flex items-center gap-2 text-base">
              <Layers className="w-4 h-4 text-red-500" /> Career Combat Timeline 
              <span className="text-xs text-white/40 font-mono not-italic lowercase">({currentFighter.fightsCount ?? currentFighter.fightsParticipated?.length ?? 0} bouts)</span>
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/40 font-mono text-xs uppercase tracking-widest">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: 'linear', duration: 1.5 }}
                className="w-6 h-6 rounded-full border-2 border-white/5 border-t-red-500"
              />
              <span>Loading fighter timeline...</span>
            </div>
          ) : !currentFighter.fightsParticipated || currentFighter.fightsParticipated.length === 0 ? (
            <div className="text-center py-8 text-white/40 font-mono text-xs uppercase tracking-widest">
              No historical matches indexed for this fighter.
            </div>
          ) : (
            <div className="space-y-3">
              {currentFighter.fightsParticipated.map((fight, index) => {
                const outcomeLower = (fight.outcome || '').toLowerCase().trim();
                const leftBorderColorRaw = outcomeLower === 'win'
                  ? '#22c55e' // Green for win
                  : outcomeLower === 'loss'
                    ? '#ef4444' // Red for loss
                    : '#94a3b8'; // Grey for other outcomes

                return (
                  <div 
                    key={`${fight.fightId || index}-${index}`}
                    onClick={() => {
                      if (fight.opponentId && fight.fightId) {
                        const slugify = (text: string) => {
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
                        const fighterASlug = slugify(currentFighter.fullName);
                        const fighterBSlug = slugify(fight.opponentName || 'unknown');
                        const fightSlug = `${fighterASlug}-vs-${fighterBSlug}`;
                        window.location.hash = `fights/${currentFighter.id}/${fight.opponentId}/${fight.fightId}/${fightSlug}`;
                      }
                    }}
                    className="bg-[#121212] border border-white/10 hover:border-red-500/40 hover:bg-white/5 transition-all p-4 pl-6 sm:pl-7 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden cursor-pointer group/timeline-card"
                  >
                    {/* Left vertical accent indicator */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5 z-10" 
                      style={{ backgroundColor: leftBorderColorRaw }}
                    />
                    {/* Left: Opponent Info & Headshot */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Outcome badge column */}
                      <div className="flex flex-col items-center justify-center shrink-0 min-w-[75px] text-center">
                        <span className={`inline-flex items-center justify-center w-full px-1 py-0.5 text-[10px] rounded-md tracking-wider font-extrabold text-center uppercase ${getOutcomeClass(fight.outcome)}`}>
                          {fight.outcome ? fight.outcome.toUpperCase() : 'OTHER'}
                        </span>
                      </div>

                      {/* Opponent Avatar */}
                      <div className="relative shrink-0">
                        <OpponentHeadshot 
                          fighterId={fight.opponentId} 
                          name={fight.opponentName || 'Unknown'}
                          className="w-11 h-11 md:w-13 md:h-13 border border-white/10 shadow-md rounded-full"
                        />
                      </div>

                      {/* Fighter & Matchup Detail */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest font-semibold">Opponent</span>
                          <span className="text-white/20 font-mono">•</span>
                          <span className="text-white/50 font-mono text-[9px] font-bold uppercase tracking-wider">{fight.weightClass || 'UFC Bout'}</span>
                        </div>

                        <div className="flex items-center">
                          {fight.opponentName ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                fight.opponentId && onSelectFighter(fight.opponentId);
                              }}
                              className="font-black italic text-white group-hover/timeline-card:text-red-450 hover:!text-red-300 text-sm md:text-base tracking-tight transition-colors cursor-pointer text-left uppercase"
                            >
                              {fight.opponentName}
                            </button>
                          ) : (
                            <span className="font-black italic text-white/60 text-sm md:text-base uppercase">Unknown Opponent</span>
                          )}
                        </div>

                        {fight.eventName && fight.eventId ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEvent(fight.eventId);
                            }}
                            className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer font-mono flex items-center gap-1 hover:underline text-left uppercase tracking-tight"
                          >
                            {fight.eventName} 
                            {fight.eventDate && (
                              <span className="text-white/30 font-mono">
                                &nbsp;({new Date(fight.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })})
                              </span>
                            )}
                            <ArrowRight className="w-3 h-3 shrink-0 text-red-500" />
                          </button>
                        ) : (
                          <div className="text-[11px] text-white/30 font-mono uppercase">
                            Unknown Card
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Method & Endings */}
                    <div className="flex flex-col items-start sm:items-end justify-center shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 gap-1 text-left sm:text-right">
                      <div className="font-black italic text-red-500 group-hover/timeline-card:text-red-400 text-xs md:text-sm tracking-tight uppercase transition-colors">
                        {fight.method || 'Result Pending'}
                      </div>
                      {fight.endingRound && (
                        <div className="text-[10px] text-white/40 font-mono font-medium tracking-wider uppercase flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/5">
                          Round {fight.endingRound} <span className="text-white/20">•</span> {fight.endingTime || '0:00'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
