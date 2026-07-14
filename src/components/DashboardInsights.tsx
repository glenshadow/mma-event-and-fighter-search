import { useMemo, useState } from 'react';
import { FighterProfile, EventSummary, StatsSummary } from '../types';
import { Award, ShieldAlert, Sparkles, TrendingUp, Users, Calendar, Trophy, ListCollapse, Crown, ChevronRight, Target, Activity, Info } from 'lucide-react';
import { motion } from 'motion/react';
import fighterImages from '../data/fighter-images.json';
// @ts-ignore
import heroBannerImage from '../assets/images/mma_blueprint_hero_1784042998091.jpg';

interface DashboardProps {
  fighters: FighterProfile[];
  events: EventSummary[];
  statsSummary?: StatsSummary | null;
  champions?: any[] | null;
  onSelectFighter: (id: number) => void;
  onSelectEvent: (id: number) => void;
}

function DashboardFighterHeadshot({ fighter, className = "w-10 h-10" }: { fighter: FighterProfile; className?: string }) {
  const [error, setError] = useState(false);
  const [evenFallbackFails, setEvenFallbackFails] = useState(false);
  const initials = `${fighter.firstName?.[0] || ""}${fighter.lastName?.[0] || ""}`.toUpperCase();

  // Official silhouette headshot as fallback
  const defaultHeadshot = "https://ufc.com/images/styles/event_results_athlete_headshot/s3/2019-04/SILHOUETTE.png?itok=YsYQ-PdM";
  
  // Resolve from both fighter object and the master fighter-images list for ultimate robustness
  const cachedHeadshot = (fighterImages as any)[fighter.id]?.headshot;
  const headshotUrl = fighter.headshot || cachedHeadshot || defaultHeadshot;

  if (evenFallbackFails) {
    return (
      <div className={`${className} rounded-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900 border border-white/10 text-white font-mono text-[10px] font-bold shadow-inner shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={error ? defaultHeadshot : headshotUrl}
      alt={fighter.fullName}
      className={`${className} rounded-full object-cover border border-white/10 bg-black/40 shrink-0`}
      onError={() => {
        if (!error) {
          setError(true);
        } else {
          setEvenFallbackFails(true);
        }
      }}
      referrerPolicy="no-referrer"
    />
  );
}

const CHAMPIONS_DATA = [
  {
    id: 1409,
    fullName: "Daniel Cormier",
    nickName: "DC",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2020-08/CORMIER_DANIEL_L_08-15.png?VersionId=8c0xGmF.jAN.__8bESM5BDrDOjfgi0MX&itok=NnPB2J6Y",
    weightClass: "Heavyweight Champion",
    record: "22-3-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1139,
    fullName: "Alexander Gustafsson",
    nickName: "The Mauler",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2022-07/GUSTAFSSON_ALEXANDER_L_07-23.png?itok=4dniStrY",
    weightClass: "Light Heavyweight King",
    record: "18-8-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1294,
    fullName: "Luke Rockhold",
    nickName: "Strike Legend",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2022-08/ROCKHOLD_LUKE_L_08-20.png?itok=UNf2uomC",
    weightClass: "Middleweight Champion",
    record: "16-6-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1386,
    fullName: "Tyron Woodley",
    nickName: "The Chosen One",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/image/ufc-fighter-container/69431/profile-galery/fullbodyleft-picture/WOODLEY_TYRON_L_09-19.png?itok=S5ke3OqX",
    weightClass: "Welterweight Champion",
    record: "19-7-1",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1069,
    fullName: "Anthony Pettis",
    nickName: "Showtime",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2019-08/PETTIS_ANTHONY_L_0.png?VersionId=1oy1Wmt9DLTlTc9prpWF6HliIZEh0Yj8&itok=Irr2WaBH",
    weightClass: "Lightweight Champion",
    record: "24-10-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1052,
    fullName: "Jose Aldo",
    nickName: "The King of Rio",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2025-05/ALDO_JOSE_L_05-10.png?itok=fpmGp-Kn",
    weightClass: "Featherweight Champion",
    record: "32-10-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1057,
    fullName: "Dominick Cruz",
    nickName: "The Dominator",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2024-10/2/CRUZ_DOMINICK_L_12-11.png?itok=EhbJRfom",
    weightClass: "Bantamweight Champion",
    record: "24-4-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1091,
    fullName: "Ian McCall",
    nickName: "Uncle Creepy",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2022-03/682fc11d-ca78-43c0-a23e-5289f256f990%252FIan-McCall_234155_LeftFullBodyImage.png?itok=xMRFQNol",
    weightClass: "Flyweight Divisional King",
    record: "13-5-1",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1194,
    fullName: "Cristiane Justino",
    nickName: "Cyborg",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2019-06/CYBORG_CRIS_L_0.png?VersionId=8RkA6LjP76IrkyjrMo1KpGcdZqQMUWJ_&itok=ExlJN4lK",
    weightClass: "Women's Featherweight Champion",
    record: "21-2-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  },
  {
    id: 1347,
    fullName: "Michelle Waterson-Gomez",
    nickName: "The Karate Hottie",
    bodyShot: "https://ufc.com/images/styles/athlete_bio_full_body/s3/2024-06/WATERSON-GOMEZ_MICHELLE_L_06-29.png?itok=o_Uf2Tdi",
    weightClass: "Women's Strawweight Queen",
    record: "18-13-0",
    theme: "from-amber-600/10 via-amber-950/5 to-black/40 border-amber-500/20 shadow-amber-500/5"
  }
];

export default function DashboardInsights({ fighters, events, statsSummary, champions, onSelectFighter, onSelectEvent }: DashboardProps) {
  const [visibleUpcomingCount, setVisibleUpcomingCount] = useState(4);
  const [visibleChampionsCount, setVisibleChampionsCount] = useState(4);

  const actualChampions = useMemo(() => {
    return (champions && champions.length > 0) ? champions : CHAMPIONS_DATA;
  }, [champions]);

  const displayedChampions = useMemo(() => {
    return actualChampions.slice(0, visibleChampionsCount);
  }, [actualChampions, visibleChampionsCount]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => e.status === 'Upcoming' || (e.date && new Date(e.date) > new Date()))
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [events]);

  const displayedUpcoming = useMemo(() => {
    return upcomingEvents.slice(0, visibleUpcomingCount);
  }, [upcomingEvents, visibleUpcomingCount]);

  const stats = useMemo(() => {
    if (!fighters.length) return null;

    // 1. Top fighters by wins in current record
    const topWins = [...fighters]
      .sort((a, b) => b.record.wins - a.record.wins)
      .slice(0, 5);

    // 2. Stance distribution
    const stances: Record<string, number> = {};
    let totalWithStance = 0;
    fighters.forEach(f => {
      if (f.stance) {
        const key = f.stance.trim();
        stances[key] = (stances[key] || 0) + 1;
        totalWithStance++;
      }
    });
    const stanceList = Object.entries(stances)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalWithStance ? Math.round((count / totalWithStance) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Most experienced fighters in our dataset
    const mostExperienced = [...fighters]
      .sort((a, b) => (b.fightsCount ?? (b.fightsParticipated || []).length) - (a.fightsCount ?? (a.fightsParticipated || []).length))
      .slice(0, 5);

    // 4. Events count by year
    const eventsByYear: Record<string, number> = {};
    events.forEach(e => {
      if (e.date) {
        const year = new Date(e.date).getFullYear().toString();
        eventsByYear[year] = (eventsByYear[year] || 0) + 1;
      }
    });
    
    const recentEventsYears = Object.entries(eventsByYear)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => Number(b.year) - Number(a.year))
      .slice(0, 6);

    // 5. Finishing methods (use precomputed list if available, fallback to dynamic calculation)
    let finishList = statsSummary?.finishList || [];
    if (!finishList.length) {
      const finishes: Record<string, number> = {};
      let totalWinsWithHist = 0;
      fighters.forEach(f => {
        (f.fightsParticipated || []).forEach(fight => {
          if (fight.outcome === 'Win' && fight.method && fight.method !== 'N/A') {
            const methodGroup = fight.method.split(' ')[0].split('/')[0].split('(')[0].trim();
            finishes[methodGroup] = (finishes[methodGroup] || 0) + 1;
            totalWinsWithHist++;
          }
        });
      });
      finishList = Object.entries(finishes)
        .map(([name, count]) => ({
          name: name === 'Decision' ? 'Decision (U/M/S/D)' : name,
          count,
          percentage: totalWinsWithHist ? Math.round((count / totalWinsWithHist) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    const totalFights = events.reduce((sum, e) => sum + (e.fightsCount || 0), 0);

    return {
      topWins,
      stanceList,
      mostExperienced,
      recentEventsYears,
      finishList,
      totalEvents: events.length,
      totalFighters: fighters.length,
      totalFights
    };
  }, [fighters, events, statsSummary]);

  const randomShortcuts = useMemo(() => {
    if (!fighters.length || !events.length) return null;
    
    // Choose first random fighter
    const idx1 = Math.floor(Math.random() * fighters.length);
    const f1 = fighters[idx1];
    
    // Choose random event
    const idxEvent = Math.floor(Math.random() * events.length);
    const ev = events[idxEvent];
    
    // Choose second random fighter (try to make it different)
    let idx2 = Math.floor(Math.random() * fighters.length);
    if (fighters.length > 1 && idx2 === idx1) {
      idx2 = (idx2 + 1) % fighters.length;
    }
    const f2 = fighters[idx2];
    
    return { f1, ev, f2 };
  }, [fighters, events]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-mono">
        Analyzing StandardMMA archives...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white relative">
      {/* Dynamic Career Analytics Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-gradient-to-b from-zinc-900/80 to-black/95 border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden relative shadow-2xl shadow-red-950/10"
        id="analytics-hero-banner"
      >
        {/* Subtle tech background grids/accents */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>
        <div className="absolute -left-16 -top-16 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          {/* Hero Explanatory Text */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
                High-Precision <span className="text-red-500">Combat Sports</span> Analytics
              </h2>
              <p className="text-sm font-mono text-white/50 uppercase tracking-widest font-bold">
                StandardMMA Fighter Trajectory & Division Mapping System
              </p>
            </div>

            <p className="text-sm leading-relaxed text-zinc-300 max-w-xl">
              StandardMMA offers a comprehensive, data-driven window into fighter careers and match-ups. Utilizing advanced career trajectory mapping, active division standings, and multi-era timeline filters, this platform reconstructs historical fighter performance to isolate true athletic peaks, win-streak ratios, and championship-tier metrics.
            </p>

            {/* Career Analytics Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5 max-w-lg">
              <button
                onClick={() => { window.location.hash = 'fighters'; }}
                className="text-left space-y-1 hover:bg-white/5 p-2 -m-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 group cursor-pointer"
              >
                <span className="text-[10px] text-white/40 font-mono block uppercase group-hover:text-red-400 transition-colors">ACTIVE FIGHTERS</span>
                <span className="text-lg font-black italic text-red-500 group-hover:scale-105 inline-block transition-transform">{(stats.totalFighters || 0).toLocaleString()}</span>
              </button>
              <button
                onClick={() => { window.location.hash = 'events'; }}
                className="text-left space-y-1 hover:bg-white/5 p-2 -m-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white/20 group cursor-pointer"
              >
                <span className="text-[10px] text-white/40 font-mono block uppercase group-hover:text-white/80 transition-colors">RECORDED BOUTS</span>
                <span className="text-lg font-black italic text-white group-hover:scale-105 inline-block transition-transform">{(stats.totalFights || 0).toLocaleString()}</span>
              </button>
              <button
                onClick={() => { window.location.hash = 'events'; }}
                className="text-left space-y-1 hover:bg-white/5 p-2 -m-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50 group cursor-pointer"
              >
                <span className="text-[10px] text-white/40 font-mono block uppercase group-hover:text-amber-400 transition-colors">MAPPED EVENTS</span>
                <span className="text-lg font-black italic text-amber-500 group-hover:scale-105 inline-block transition-transform">{(stats.totalEvents || 0).toLocaleString()}</span>
              </button>
            </div>
          </div>

          {/* Hero Stylized Image and Overlay Section */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[16/9] lg:aspect-square bg-zinc-950/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {/* Background blueprint graphic */}
              <img
                src={heroBannerImage}
                alt="MMA Blueprint Combat Schematic"
                className="w-full h-full object-cover opacity-75 pointer-events-none filter saturate-75 brightness-95"
                referrerPolicy="no-referrer"
              />

              {/* Statistical Overlay 1: Real-time data model tracking */}
              <div className="absolute top-4 left-4 bg-black/75 border border-red-500/30 p-2 rounded text-[9px] font-mono space-y-0.5 pointer-events-none shadow-lg">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>RED CORNER</span>
                </div>
                <div className="text-white/60 font-medium">STANCE: SOUTHPAW</div>
                <div className="text-white/60 font-medium">RECORD: 18-3-0</div>
              </div>

              {/* Statistical Overlay 2: Dynamic division metadata */}
              <div className="absolute bottom-4 right-4 bg-black/75 border border-amber-500/30 p-2 rounded text-[9px] font-mono space-y-0.5 pointer-events-none shadow-lg text-right">
                <div className="flex items-center justify-end gap-1.5 text-amber-400 font-bold">
                  <span>BLUE CORNER</span>
                  <Target className="w-2.5 h-2.5 text-amber-500" />
                </div>
                <div className="text-white/60 font-medium">STANCE: ORTHODOX</div>
                <div className="text-white/60 font-medium">RECORD: 22-5-0</div>
              </div>

              {/* Statistical Overlay 3: Strike Trajectory Arc label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-red-500/20 border-dashed animate-spin flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border border-amber-500/30"></div>
                  </div>
                  <span className="text-[8px] font-mono text-white/50 mt-1 uppercase tracking-wider bg-black/50 px-1 rounded">PEAK_REF_X</span>
                </div>
              </div>

              {/* Subtle grid HUD scanning line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-1/3 w-full animate-[pulse_3s_infinite] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Current Divisional Champions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="space-y-4"
        id="divisional-champions-section"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-black text-lg tracking-tighter italic uppercase text-white">Division Champions</h3>
          </div>
          <span className="text-[10px] tracking-widest text-amber-500 font-bold uppercase font-mono">CHAMPIONSHIP ELITE</span>
        </div>

        {/* Grid Container */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedChampions.map((champ) => (
              <motion.div
                key={champ.id}
                onClick={() => onSelectFighter(champ.id)}
                className={`relative w-full h-44 rounded-2xl bg-gradient-to-b ${champ.theme} p-5 overflow-hidden shadow-xl cursor-pointer backdrop-blur-md transition-all flex flex-col justify-between hover:scale-[1.02] hover:border-amber-500/30 duration-300`}
              >
                {/* Gold ambient background glow */}
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Full Body Shot overlapping or positioned cleanly on the right */}
                <div className="absolute right-1 bottom-0 h-40 w-32 flex items-end justify-center pointer-events-none overflow-hidden select-none">
                  {champ.bodyShot ? (
                    <img
                      src={champ.bodyShot}
                      alt={champ.fullName}
                      className="object-contain max-h-full w-full transform drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-white/5 font-mono font-black italic text-8xl -mr-10 select-none">
                      CHAMP
                    </div>
                  )}
                </div>

                {/* Card Content - Text on Left */}
                <div className="relative z-10 flex flex-col h-full justify-between max-w-[55%] pointer-events-none">
                  <div>
                    {/* Gold Category Badge */}
                    <span className="text-[9px] font-bold tracking-widest text-amber-500 font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg inline-block leading-normal text-center">
                      {champ.weightClass}
                    </span>
                    
                    {/* Name */}
                    <h4 className="font-black italic tracking-tighter text-white text-lg mt-2 leading-tight uppercase">
                      {champ.fullName}
                    </h4>

                    {/* Nickname */}
                    {champ.nickName && (
                      <p className="text-[10px] text-white/45 italic font-mono mt-0.5">
                        "{champ.nickName}"
                      </p>
                    )}
                  </div>

                  {/* Career Record stats */}
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-white/40">RECORD</span>
                      <span className="font-mono text-xs font-black text-white/90 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                        {champ.record}
                      </span>
                    </div>
                    
                    {/* View Stats Link */}
                    <span className="text-[9px] text-amber-500/80 font-mono font-bold tracking-wider flex items-center gap-0.5 uppercase">
                      View Profile <ChevronRight className="w-3 h-3 animate-pulse" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {actualChampions.length > visibleChampionsCount && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleChampionsCount(prev => prev + 4)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 border border-white/10 rounded-xl text-xs text-amber-500 hover:text-amber-400 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider shadow-lg hover:shadow-amber-500/5 active:scale-95 focus:outline-none"
              >
                Load More Champions ({actualChampions.length - visibleChampionsCount} Remaining)
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="space-y-4"
          id="upcoming-events-section"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500 animate-pulse" />
              <h3 className="font-black text-lg tracking-tighter italic uppercase text-white">Upcoming Events</h3>
            </div>
            <span className="text-[10px] tracking-widest text-red-500 font-bold uppercase font-mono">LIVE FIGHT SCHEDULER</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedUpcoming.map((event) => {
              const eventDate = event.date ? new Date(event.date) : null;
              const formattedDate = eventDate
                ? eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Date TBA';

              return (
                <motion.div
                  key={event.id}
                  onClick={() => onSelectEvent(event.id)}
                  className="bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-white/[0.08] rounded-2xl p-5 shadow-xl cursor-pointer backdrop-blur-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-[140px]"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-650/5 rounded-full blur-xl pointer-events-none transition-all duration-300 group-hover:bg-red-650/10"></div>
                  
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest font-black bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-md">
                        {event.fightsCount} Fights
                      </span>
                    </div>

                    <h4 className="font-black italic tracking-tighter text-white text-base leading-tight uppercase group-hover:text-red-400 transition-colors">
                      {event.name}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-white/70">
                      <Calendar className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span className="font-mono text-[11px] leading-none text-white/80">{formattedDate}</span>
                    </div>
                    {event.location && (
                      <div className="text-[10px] text-white/40 font-mono flex items-center gap-1 leading-none uppercase tracking-wide truncate max-w-full">
                        <span>📍</span> <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {upcomingEvents.length > visibleUpcomingCount && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleUpcomingCount(prev => prev + 4)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 hover:border-red-500/30 border border-white/10 rounded-xl text-xs text-red-400 hover:text-red-300 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider shadow-lg hover:shadow-red-500/5 active:scale-95 focus:outline-none"
              >
                Load More Events ({upcomingEvents.length - visibleUpcomingCount} Remaining)
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => { window.location.hash = 'fighters'; }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-red-500/30 transition-colors cursor-pointer"
          id="stat-fighters-card"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block font-bold">Total Athletes Indexed</span>
            <span className="text-4xl font-black italic tracking-tighter mt-1 block text-white group-hover:text-red-500 transition-colors">
              {stats.totalFighters.toLocaleString()}
            </span>
            <span className="text-[10px] text-white/30 font-mono">MMA PARTICIPANTS</span>
          </div>
          <div className="bg-red-600/10 p-3 rounded-xl border border-red-500/20">
            <Users className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          onClick={() => { window.location.hash = 'events?e_sort=date&e_dir=asc'; }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-red-500/30 transition-colors cursor-pointer"
          id="stat-events-card"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block font-bold">Recorded Events</span>
            <span className="text-4xl font-black italic tracking-tighter mt-1 block text-white group-hover:text-red-500 transition-colors">
              {stats.totalEvents.toLocaleString()}
            </span>
            <span className="text-[10px] text-white/30 font-mono">EVENT 1 TO PRESENT CARD ARCS</span>
          </div>
          <div className="bg-red-600/10 p-3 rounded-xl border border-red-500/20">
            <Calendar className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          onClick={() => { window.location.hash = 'events?e_sort=date&e_dir=asc'; }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-red-500/30 transition-colors cursor-pointer"
          id="stat-fights-card"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block font-bold">Total Fights Logged</span>
            <span className="text-4xl font-black italic tracking-tighter mt-1 block text-white group-hover:text-red-500 transition-colors">
              {stats.totalFights.toLocaleString()}
            </span>
            <span className="text-[10px] text-white/30 font-mono">ALL-TIME BOUTS ANALYZED</span>
          </div>
          <div className="bg-red-600/10 p-3 rounded-xl border border-red-500/20">
            <Trophy className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          onClick={() => { window.location.hash = 'events?e_sort=date&e_dir=asc'; }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-red-500/30 transition-colors cursor-pointer"
          id="stat-era-card"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block font-bold font-mono">Operational Era</span>
            <span className="text-4xl font-black italic tracking-tighter mt-1 block text-white group-hover:text-red-500 transition-colors">
              33+ YEARS
            </span>
            <span className="text-[10px] text-white/30 font-mono">1993 - 2026 EVENT LOGS</span>
          </div>
          <div className="bg-red-600/10 p-3 rounded-xl border border-red-500/20">
            <TrendingUp className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Leaderboards and breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Experienced Fighters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl"
          id="experience-breakdown"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ListCollapse className="w-5 h-5 text-red-500" />
              <h3 className="font-black text-lg tracking-tighter italic uppercase text-white">Most Indexed Fights</h3>
            </div>
            <span className="text-[10px] tracking-widest text-red-500 font-bold uppercase font-mono">EXPERIENCE DEPTH</span>
          </div>
          <div className="space-y-4">
            {stats.mostExperienced.map((fighter, i) => (
              <div 
                key={fighter.id} 
                onClick={() => onSelectFighter(fighter.id)}
                className="flex items-center justify-between gap-3 group cursor-pointer bg-white/5 border border-white/5 rounded-xl p-3 sm:p-3.5 hover:bg-white/10 hover:border-white/15 transition-all text-sm font-medium min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="font-mono text-xs text-red-500 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black italic shrink-0">
                    {i + 1}
                  </div>
                  <DashboardFighterHeadshot fighter={fighter} className="w-10 h-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-black italic text-white group-hover:text-red-550 transition-colors tracking-tight text-sm sm:text-base truncate">
                      {fighter.fullName}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono flex items-center gap-1.5 capitalize truncate">
                      {fighter.stance || 'Orthodox'} • {fighter.weight ? `${fighter.weight} lbs` : 'Welterweight'}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] sm:text-xs font-bold bg-white/10 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/15 whitespace-nowrap">
                    {fighter.fightsCount ?? fighter.fightsParticipated?.length ?? 0} FIGHTS
                  </span>
                  <div className="text-[9px] text-white/45 font-mono mt-1">
                    ({fighter.record.wins}W - {fighter.record.losses}L)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ending Methods Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl"
          id="finishing-breakdown"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" />
              <h3 className="font-black text-lg tracking-tighter italic uppercase text-white">Fight Finishing Methods</h3>
            </div>
            <span className="text-[10px] tracking-widest text-red-500 font-bold uppercase font-mono">FINISH RATIOS</span>
          </div>
          <div className="space-y-4">
            {stats.finishList.map((m) => (
              <div key={m.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span className="text-white/80 font-bold uppercase tracking-tight">{m.name}</span>
                  <span className="font-mono text-white/50">{m.count.toLocaleString()} finishes ({m.percentage}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${m.percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-405 rounded-full" 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fight Stance Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl"
          id="stance-breakdown"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <h3 className="font-black text-lg tracking-tighter italic uppercase text-white">Combat Stance Distribution</h3>
            </div>
            <span className="text-[10px] tracking-widest text-white/40 font-mono">OFFENSIVE ANGLE</span>
          </div>
          <div className="space-y-4">
            {stats.stanceList.map((st) => (
              <div key={st.name} className="flex items-center justify-between bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div>
                  <div className="font-black italic text-white capitalize text-base">{st.name}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono">COMBAT FOOTWORK PROFILE</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base font-black italic text-red-500">
                     {st.percentage}%
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    {st.count.toLocaleString()} Fighters
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Wins Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden"
          id="wins-leaderboard"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" />
              <h3 className="font-black text-lg tracking-tighter italic uppercase text-white">Most Career Wins</h3>
            </div>
            <span className="text-[10px] tracking-widest text-red-500 font-bold uppercase font-mono">HALL OF FAME</span>
          </div>
          <div className="space-y-4">
            {stats.topWins.map((fighter, i) => (
              <div 
                key={fighter.id} 
                onClick={() => onSelectFighter(fighter.id)}
                className="flex items-center justify-between gap-3 group cursor-pointer bg-white/5 border border-white/5 rounded-xl p-3 sm:p-3.5 hover:bg-white/10 hover:border-white/15 transition-all text-sm font-medium min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="font-mono text-xs text-red-500 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black italic shrink-0">
                    {i + 1}
                  </div>
                  <DashboardFighterHeadshot fighter={fighter} className="w-10 h-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-black italic text-white group-hover:text-red-550 transition-colors tracking-tight text-sm sm:text-base truncate">
                      {fighter.fullName}
                    </div>
                    <div className="text-[10px] text-white/45 font-mono uppercase tracking-wide truncate">
                      {fighter.nickName ? `"${fighter.nickName}"` : 'Bio Link Details'}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] sm:text-xs font-bold bg-white/10 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/15 whitespace-nowrap">
                    {fighter.record.wins} WINS
                  </span>
                  <div className="text-[9px] text-white/40 font-mono mt-1">
                    ({fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dynamic Search Tips banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-[#0a0a0a] to-red-950/20 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h4 className="font-black text-white flex items-center gap-2 text-sm uppercase tracking-widest font-sans italic">
            <ShieldAlert className="w-4 h-4 text-red-500" /> StandardMMA DATA STREAM ARCHIVE
          </h4>
          <p className="text-xs text-white/60 mt-1.5 max-w-xl leading-relaxed">
            This specialized intelligence system indexes historical combat cards spanning several legendary decades. Select any athlete or event from the directories to dive into dynamic fight metrics instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {randomShortcuts && (
            <>
              <span className="bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-white/10 text-white text-[10px] tracking-wider uppercase font-mono font-bold px-3.5 py-2 rounded-full cursor-pointer transition-all shadow-sm" onClick={() => onSelectFighter(randomShortcuts.f1.id)}>
                {randomShortcuts.f1.fullName}
              </span>
              <span className="bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-white/10 text-white text-[10px] tracking-wider uppercase font-mono font-bold px-3.5 py-2 rounded-full cursor-pointer transition-all shadow-sm" onClick={() => onSelectEvent(randomShortcuts.ev.id)}>
                {randomShortcuts.ev.name}
              </span>
              <span className="bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-white/10 text-white text-[10px] tracking-wider uppercase font-mono font-bold px-3.5 py-2 rounded-full cursor-pointer transition-all shadow-sm" onClick={() => onSelectFighter(randomShortcuts.f2.id)}>
                {randomShortcuts.f2.fullName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
