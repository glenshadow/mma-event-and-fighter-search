import React, { useState, useEffect, useRef } from 'react';
import { FighterProfile } from '../types';
import { Crown, TrendingUp, Trophy, ChevronRight, ChevronLeft, Calendar, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CareerTrajectoryGraphProps {
  fights: NonNullable<FighterProfile['fightsParticipated']>;
  fighterName: string;
  onSelectEvent?: (id: number) => void;
}

interface TrajectoryPoint {
  score: number;
  outcome: string;
  opponentName: string;
  opponentId: number;
  eventName: string;
  eventDate: string | null;
  method: string;
  endingRound: number | null;
  endingTime: string | null;
  fightId: number;
  eventId: number;
  recordString: string;
}

export default function CareerTrajectoryGraph({ fights, fighterName, onSelectEvent }: CareerTrajectoryGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 240 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Resize handler using ResizeObserver for perfect responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Adjust height dynamically based on width to fit mobile screens perfectly
        const height = width < 480 ? 180 : 230;
        setDimensions({ width: Math.max(280, width), height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!fights || fights.length === 0) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
        No matches recorded to calculate career trajectory.
      </div>
    );
  }

  // 1. Sort fights chronologically (oldest to newest)
  const sortedFights = [...fights]
    .map((fight, idx) => ({ fight, originalIdx: idx }))
    .sort((a, b) => {
      const timeA = a.fight.eventDate ? new Date(a.fight.eventDate).getTime() : 0;
      const timeB = b.fight.eventDate ? new Date(b.fight.eventDate).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;
      // Preserve original order reversed
      return b.originalIdx - a.originalIdx;
    })
    .map(x => x.fight);

  // 2. Build trajectory points (including a starting debut base point)
  let currentScore = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let nc = 0;

  const points: TrajectoryPoint[] = [
    {
      score: 0,
      outcome: 'Debut Preparation',
      opponentName: 'Career Start',
      opponentId: 0,
      eventName: 'UFC Debut Preparation',
      eventDate: sortedFights[0]?.eventDate 
        ? new Date(new Date(sortedFights[0].eventDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
      method: 'N/A',
      endingRound: null,
      endingTime: null,
      fightId: -1,
      eventId: 0,
      recordString: '0-0-0',
    }
  ];

  sortedFights.forEach((fight) => {
    const outcomeLower = (fight.outcome || '').toLowerCase().trim();
    if (outcomeLower === 'win') {
      currentScore += 1;
      wins += 1;
    } else if (outcomeLower === 'loss') {
      currentScore -= 1;
      losses += 1;
    } else if (outcomeLower === 'draw') {
      draws += 1;
    } else if (outcomeLower === 'no contest') {
      nc += 1;
    }

    points.push({
      score: currentScore,
      outcome: fight.outcome,
      opponentName: fight.opponentName || 'Unknown Opponent',
      opponentId: fight.opponentId || 0,
      eventName: fight.eventName || 'Unknown Card',
      eventDate: fight.eventDate || null,
      method: fight.method || 'Unknown',
      endingRound: fight.endingRound || null,
      endingTime: fight.endingTime || null,
      fightId: fight.fightId || 0,
      eventId: fight.eventId || 0,
      recordString: `${wins}-${losses}-${draws}${nc > 0 ? ` (${nc} NC)` : ''}`,
    });
  });

  // 3. Find Career Peak and Peak Index
  const scores = points.map(p => p.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  const peakPointCandidates = points.filter((p, idx) => idx > 0 && p.score === maxScore);
  const peakPoint = peakPointCandidates.length > 0 ? peakPointCandidates[0] : points[0];
  const peakIndex = points.indexOf(peakPoint);

  // 4. Mobile responsive SVG paddings
  const isMobileSize = dimensions.width < 500;
  const paddingLeft = isMobileSize ? 22 : 36;
  const paddingRight = isMobileSize ? 10 : 36;
  const paddingTop = isMobileSize ? 25 : 30;
  const paddingBottom = isMobileSize ? 25 : 30;

  const chartWidth = dimensions.width - paddingLeft - paddingRight;
  const chartHeight = dimensions.height - paddingTop - paddingBottom;

  const yBuffer = 1;
  const yMin = minScore - yBuffer;
  const yMax = maxScore + yBuffer;
  const yRange = yMax - yMin === 0 ? 2 : yMax - yMin;

  const getCoords = (idx: number, score: number) => {
    const x = points.length > 1
      ? paddingLeft + (idx / (points.length - 1)) * chartWidth
      : paddingLeft + chartWidth / 2;
    const y = paddingTop + (1 - (score - yMin) / yRange) * chartHeight;
    return { x, y };
  };

  // 5. Gridlines density
  let gridStep = 1;
  const scoreSpread = yMax - yMin;
  if (scoreSpread > 10) gridStep = 2;
  if (scoreSpread > 25) gridStep = 5;
  if (scoreSpread > 50) gridStep = 10;

  const gridValues: number[] = [];
  for (let val = Math.ceil(yMin); val <= Math.floor(yMax); val++) {
    if (val % gridStep === 0) {
      gridValues.push(val);
    }
  }

  // 6. Generate SVG path strings
  const pathData = points.map((p, idx) => {
    const { x, y } = getCoords(idx, p.score);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const firstCoords = getCoords(0, points[0].score);
  const lastCoords = getCoords(points.length - 1, points[points.length - 1].score);
  const bottomY = paddingTop + chartHeight;
  const areaPathData = `
    ${pathData}
    L ${lastCoords.x} ${bottomY}
    L ${firstCoords.x} ${bottomY}
    Z
  `;

  // 7. Touch and mouse coordinates mapper
  const getIndexFromX = (clientX: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;

    let closestIdx = 0;
    let minDiff = Infinity;

    points.forEach((p, idx) => {
      const { x } = getCoords(idx, p.score);
      const diff = Math.abs(x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const idx = getIndexFromX(e.clientX);
    setHoveredIndex(idx);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 0) return;
    const idx = getIndexFromX(e.touches[0].clientX);
    setHoveredIndex(idx);
    setSelectedIndex(idx); // Tap locks selection on mobile
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const idx = getIndexFromX(e.clientX);
    setSelectedIndex(idx);
  };

  // Determine active displayed point (Hover state takes precedence over persistent click state)
  const activeIndex = hoveredIndex !== null ? hoveredIndex : (selectedIndex !== null ? selectedIndex : null);
  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  // Next/Prev navigation
  const handlePrev = () => {
    const currentIdx = activeIndex ?? points.length - 1;
    // Walk back but wrap around, skipping starting point 0
    const newIdx = currentIdx <= 1 ? points.length - 1 : currentIdx - 1;
    setSelectedIndex(newIdx);
    setHoveredIndex(null);
  };

  const handleNext = () => {
    const currentIdx = activeIndex ?? 1;
    // Walk forward but wrap around, skipping starting point 0
    const newIdx = currentIdx >= points.length - 1 ? 1 : currentIdx + 1;
    setSelectedIndex(newIdx);
    setHoveredIndex(null);
  };

  const formatScore = (val: number) => {
    if (val > 0) return `+${val}`;
    return val.toString();
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-3 sm:p-6 shadow-xl relative overflow-hidden flex flex-col gap-3 sm:gap-5">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-sm font-black italic text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            Performance Trajectory Over Time
          </h3>
          <p className="text-[11px] text-white/40 font-mono uppercase tracking-tight mt-0.5">
            Cumulative career score (Wins +1, Losses -1) of {fighterName}
          </p>
        </div>

        {/* Peak Stats Badge (hidden on super small mobile to save space, but shown above details card instead) */}
        {peakPoint && peakPoint.score > 0 && (
          <div className="hidden xs:flex items-center gap-3 bg-amber-500/5 border border-amber-500/15 px-3 py-1.5 sm:py-2 rounded-xl shrink-0 self-start md:self-auto">
            <div className="p-1 rounded-lg bg-amber-500/10 shrink-0">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <span className="text-[8px] text-amber-400 font-mono block font-extrabold uppercase tracking-wider">Career Peak</span>
              <span className="text-[11px] font-black italic text-white uppercase flex items-center gap-1">
                {formatScore(peakPoint.score)} Diff
                <span className="text-white/20 font-mono not-italic text-[9px]">•</span>
                <span className="text-white/60 font-mono not-italic text-[9px]">{peakPoint.recordString}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Graphical Stage with ResizeObserver */}
      <div 
        ref={containerRef}
        className="relative w-full border border-white/5 bg-black/40 rounded-xl overflow-hidden cursor-pointer select-none touch-none"
        style={{ height: dimensions.height }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleSvgClick}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
        >
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridValues.map((val) => {
            const tempCoords = getCoords(0, val);
            const isBaseline = val === 0;

            return (
              <g key={`grid-${val}`}>
                <line
                  x1={paddingLeft}
                  y1={tempCoords.y}
                  x2={dimensions.width - paddingRight}
                  y2={tempCoords.y}
                  stroke={isBaseline ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.04)"}
                  strokeDasharray={isBaseline ? "none" : "2, 3"}
                  strokeWidth={isBaseline ? 1.2 : 0.8}
                />
                <text
                  x={paddingLeft - 6}
                  y={tempCoords.y + 3}
                  fill={isBaseline ? "rgba(255,255,255,0.5)" : "rgba(255, 255, 255, 0.25)"}
                  fontSize={isMobileSize ? "8px" : "9px"}
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {formatScore(val)}
                </text>
              </g>
            );
          })}

          {/* Dotted Peak Guideline */}
          {peakPoint && peakIndex >= 0 && (
            <g>
              <line
                x1={getCoords(peakIndex, peakPoint.score).x}
                y1={paddingTop}
                x2={getCoords(peakIndex, peakPoint.score).x}
                y2={paddingTop + chartHeight}
                stroke="#f59e0b"
                strokeOpacity={0.3}
                strokeDasharray="3, 3"
                strokeWidth={1}
              />
            </g>
          )}

          {/* Glow Area under path */}
          <path d={areaPathData} fill="url(#chartGlow)" />

          {/* Primary Trajectory Path */}
          <path
            d={pathData}
            fill="none"
            stroke="#ef4444"
            strokeWidth={isMobileSize ? 2.5 : 3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Career Peak Indicator */}
          {peakPoint && peakIndex >= 0 && (
            <g>
              <circle
                cx={getCoords(peakIndex, peakPoint.score).x}
                cy={getCoords(peakIndex, peakPoint.score).y}
                r={isMobileSize ? 5 : 6}
                fill="#f59e0b"
                stroke="#121212"
                strokeWidth={1.5}
              />
            </g>
          )}

          {/* Active Highlight (Hover / Clicked) */}
          {activeIndex !== null && activePoint && (
            <g>
              <line
                x1={getCoords(activeIndex, activePoint.score).x}
                y1={paddingTop}
                x2={getCoords(activeIndex, activePoint.score).x}
                y2={paddingTop + chartHeight}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeDasharray="2, 2"
                strokeWidth={1}
              />
              <circle
                cx={getCoords(activeIndex, activePoint.score).x}
                cy={getCoords(activeIndex, activePoint.score).y}
                r={isMobileSize ? 6 : 7}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <circle
                cx={getCoords(activeIndex, activePoint.score).x}
                cy={getCoords(activeIndex, activePoint.score).y}
                r={isMobileSize ? 3 : 3.5}
                fill={activePoint.score >= 0 ? "#22c55e" : "#ef4444"}
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip (Only on wider screens, hidden on mobile layouts) */}
        <AnimatePresence>
          {!isMobileSize && activeIndex !== null && activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.12 }}
              className="absolute pointer-events-none bg-black/90 border border-white/10 rounded-lg p-2.5 shadow-2xl backdrop-blur-md text-left text-[11px] font-mono z-30"
              style={{
                left: getCoords(activeIndex, activePoint.score).x > dimensions.width - 150
                  ? getCoords(activeIndex, activePoint.score).x - 160
                  : Math.max(10, getCoords(activeIndex, activePoint.score).x + 15),
                top: Math.max(10, Math.min(dimensions.height - 100, getCoords(activeIndex, activePoint.score).y - 45))
              }}
            >
              <div className="font-extrabold text-white truncate max-w-[130px] uppercase">
                {activeIndex === 0 ? "Career Start" : activePoint.opponentName}
              </div>
              <div className="text-[10px] text-white/50 mb-1 flex items-center justify-between gap-4">
                <span>Bout #{activeIndex}</span>
                <span className={activePoint.score >= 0 ? "text-win-color font-bold" : "text-loss-color font-bold"}>
                  {formatScore(activePoint.score)}
                </span>
              </div>
              <div className="border-t border-white/5 pt-1 space-y-0.5 text-[9px] text-white/40">
                <div className="truncate max-w-[130px] uppercase">{activePoint.eventName}</div>
                <div>Record: {activePoint.recordString}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Axis Labels (Adjusted with responsive spacing, hides center label to prevent squeezing) */}
      <div className="flex items-center justify-between font-mono text-[9px] text-white/30 uppercase tracking-widest mt-[-6px] px-1">
        <span>Debut ({points[0]?.eventDate ? new Date(points[0].eventDate).getFullYear() : 'N/A'})</span>
        <span className="hidden sm:flex items-center gap-1">
          Career Timeline
          <ChevronRight className="w-2.5 h-2.5" />
        </span>
        <span>Latest Bout ({points[points.length - 1]?.eventDate ? new Date(points[points.length - 1].eventDate).getFullYear() : 'N/A'})</span>
      </div>

      {/* Interactive Mobile Slider / Timeline Navigation Console */}
      <div className="flex items-center justify-between gap-2 border-t border-b border-white/5 py-2.5">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-all cursor-pointer shrink-0"
          title="Previous Bout"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Quick Landmarks buttons (Scrollable on small displays, wrapped cleanly) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth shrink">
          <button 
            onClick={() => { setSelectedIndex(1); setHoveredIndex(null); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border shrink-0 ${activeIndex === 1 ? 'bg-red-500/10 text-white border-red-500/30 font-bold' : 'bg-white/[0.01] text-white/40 border-white/5 hover:text-white hover:bg-white/[0.04]'}`}
          >
            Debut
          </button>

          {peakIndex > 1 && peakIndex < points.length - 1 && (
            <button 
              onClick={() => { setSelectedIndex(peakIndex); setHoveredIndex(null); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border shrink-0 flex items-center gap-1 ${activeIndex === peakIndex ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold' : 'bg-white/[0.01] text-white/40 border-white/5 hover:text-white hover:bg-white/[0.04]'}`}
            >
              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Peak
            </button>
          )}

          <button 
            onClick={() => { setSelectedIndex(points.length - 1); setHoveredIndex(null); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border shrink-0 ${activeIndex === points.length - 1 ? 'bg-red-500/10 text-white border-red-500/30 font-bold' : 'bg-white/[0.01] text-white/40 border-white/5 hover:text-white hover:bg-white/[0.04]'}`}
          >
            Latest
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.1] transition-all cursor-pointer shrink-0"
          title="Next Bout"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Static Selected/Peak Bout Details Panel */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-inner">
        {activePoint ? (
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {activeIndex === peakIndex ? (
                <span className="font-mono text-[9px] uppercase bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25 font-black flex items-center gap-1 shrink-0 animate-pulse">
                  <Crown className="w-2.5 h-2.5 fill-amber-500/30" /> Prime Career Peak
                </span>
              ) : activeIndex === 1 ? (
                <span className="font-mono text-[9px] uppercase bg-red-500/15 text-red-400 px-2 py-0.5 rounded border border-red-500/25 font-bold shrink-0">
                  UFC Octagon Debut
                </span>
              ) : (
                <span className="font-mono text-[9px] uppercase bg-white/5 text-white/50 px-2 py-0.5 rounded border border-white/10 font-bold shrink-0">
                  Bout #{activeIndex} Milestone
                </span>
              )}
              {activePoint.eventDate && (
                <span className="text-white/30 font-mono text-[10px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-white/30" />
                  {new Date(activePoint.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            <div className="truncate">
              <span className="font-bold text-white text-sm uppercase">
                {activeIndex === 0 ? "Career Start" : activePoint.opponentName}
              </span>
            </div>

            <div className="text-white/60 font-mono text-[10px] uppercase tracking-tight flex flex-wrap items-center gap-1.5 leading-relaxed">
              <span>Outcome:</span>
              <span className={`font-black italic px-1.5 py-0.5 rounded text-[9px] ${
                activePoint.outcome.toLowerCase() === 'win' 
                  ? 'bg-win-color/10 text-win-color border border-win-color/20' 
                  : activePoint.outcome.toLowerCase() === 'loss' 
                  ? 'bg-loss-color/10 text-loss-color border border-loss-color/20' 
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}>
                {activePoint.outcome}
              </span>
              {activePoint.method !== 'N/A' && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-white/70">{activePoint.method}</span>
                </>
              )}
              {activePoint.endingRound && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-white/50">Round {activePoint.endingRound} {activePoint.endingTime && `(${activePoint.endingTime})`}</span>
                </>
              )}
            </div>

            <div className="text-[10px] font-mono text-white/35 uppercase truncate pt-0.5">
              Event: {activePoint.eventName}
            </div>
          </div>
        ) : peakPoint ? (
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[9px] uppercase bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25 font-black flex items-center gap-1 shrink-0">
                <Trophy className="w-2.5 h-2.5" /> Career Peak Landmark
              </span>
              {peakPoint.eventDate && (
                <span className="text-white/30 font-mono text-[10px]">
                  ({new Date(peakPoint.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })})
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-white text-sm uppercase">
                Peak Reached at Bout #{peakIndex}
              </span>
            </div>
            <div className="text-white/50 text-[10px] font-mono uppercase">
              Reached against <span className="font-bold text-white/70">{peakPoint.opponentName}</span> via {peakPoint.method}
            </div>
          </div>
        ) : null}

        {/* Score metrics & CTA Link button */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-5 shrink-0">
          <div className="flex items-center gap-4 font-mono">
            <div className="text-left md:text-right">
              <span className="text-[8px] text-white/40 block uppercase tracking-wider">Score Value</span>
              <span className={`text-sm font-black italic ${activePoint ? (activePoint.score > 0 ? 'text-win-color' : activePoint.score < 0 ? 'text-loss-color' : 'text-white') : 'text-amber-400'}`}>
                {formatScore(activePoint ? activePoint.score : peakPoint.score)}
              </span>
            </div>
            <div className="text-left md:text-right border-l border-white/10 pl-4">
              <span className="text-[8px] text-white/40 block uppercase tracking-wider">Record Then</span>
              <span className="text-xs font-bold text-white/80">
                {activePoint ? activePoint.recordString : peakPoint.recordString}
              </span>
            </div>
          </div>

          {/* Jump to Event action link */}
          {onSelectEvent && activePoint && activePoint.eventId > 0 && (
            <button
              onClick={() => onSelectEvent(activePoint.eventId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-550 active:bg-red-700 text-white font-mono text-[9px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-lg hover:shadow-red-900/10"
            >
              Go to Event
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
