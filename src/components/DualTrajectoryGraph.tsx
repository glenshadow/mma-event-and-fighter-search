import React, { useState, useEffect, useRef } from 'react';
import { FighterProfile } from '../types';
import { TrendingUp, Calendar, ArrowRight, ChevronRight, Star, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeConfig {
  primaryClass: string;
  textClass: string;
  bgClass: string;
  bg5Class: string;
  bg500Class: string;
  borderClass: string;
  glowId: string;
  hex: string;
}

interface DualTrajectoryGraphProps {
  fightsA: NonNullable<FighterProfile['fightsParticipated']>;
  fightsB: NonNullable<FighterProfile['fightsParticipated']>;
  nameA: string;
  nameB: string;
  onSelectEvent?: (id: number) => void;
  colorThemeA?: ThemeConfig;
  colorThemeB?: ThemeConfig;
}

interface TrajectoryPoint {
  time: number;
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

export default function DualTrajectoryGraph({ 
  fightsA, 
  fightsB, 
  nameA, 
  nameB, 
  onSelectEvent,
  colorThemeA,
  colorThemeB
}: DualTrajectoryGraphProps) {
  const themeA = colorThemeA || {
    primaryClass: 'fuchsia',
    textClass: 'text-fuchsia-400',
    bgClass: 'bg-fuchsia-500/10',
    bg5Class: 'bg-fuchsia-500/5',
    bg500Class: 'bg-fuchsia-500',
    borderClass: 'border-fuchsia-500/20',
    glowId: 'glowFuchsia',
    hex: '#d946ef'
  };

  const themeB = colorThemeB || {
    primaryClass: 'sky',
    textClass: 'text-sky-400',
    bgClass: 'bg-sky-500/10',
    bg5Class: 'bg-sky-500/5',
    bg500Class: 'bg-sky-500',
    borderClass: 'border-sky-500/20',
    glowId: 'glowSky',
    hex: '#38bdf8'
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [selectedX, setSelectedX] = useState<number | null>(null);

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const height = width < 480 ? 200 : 250;
        setDimensions({ width: Math.max(280, width), height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const processFights = (fights: any[]): TrajectoryPoint[] => {
    const sorted = [...fights]
      .map((fight, idx) => ({ fight, originalIdx: idx }))
      .sort((a, b) => {
        const timeA = a.fight.eventDate ? new Date(a.fight.eventDate).getTime() : 0;
        const timeB = b.fight.eventDate ? new Date(b.fight.eventDate).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        return b.originalIdx - a.originalIdx;
      })
      .map(x => x.fight);

    let currentScore = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let nc = 0;

    const points: TrajectoryPoint[] = [];

    if (sorted.length > 0) {
      const firstDate = sorted[0].eventDate;
      const baseTime = firstDate 
        ? new Date(new Date(firstDate).getTime() - 45 * 24 * 60 * 60 * 1000).getTime()
        : new Date().getTime() - 45 * 24 * 60 * 60 * 1000;
      
      points.push({
        time: baseTime,
        score: 0,
        outcome: 'Debut Prep',
        opponentName: 'Debut Preparation',
        opponentId: 0,
        eventName: 'Debut Prep',
        eventDate: firstDate 
          ? new Date(new Date(firstDate).getTime() - 45 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        method: 'N/A',
        endingRound: null,
        endingTime: null,
        fightId: -1,
        eventId: 0,
        recordString: '0-0-0',
      });
    }

    sorted.forEach((fight) => {
      const outcomeLower = (fight.outcome || '').toLowerCase().trim();
      if (outcomeLower === 'win' || outcomeLower === 'w') {
        currentScore += 1;
        wins += 1;
      } else if (outcomeLower === 'loss' || outcomeLower === 'l') {
        currentScore -= 1;
        losses += 1;
      } else if (outcomeLower === 'draw' || outcomeLower === 'd') {
        draws += 1;
      } else if (outcomeLower === 'no contest' || outcomeLower === 'nc') {
        nc += 1;
      }

      const fightTime = fight.eventDate ? new Date(fight.eventDate).getTime() : new Date().getTime();

      points.push({
        time: fightTime,
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

    return points;
  };

  const pointsA = processFights(fightsA || []);
  const pointsB = processFights(fightsB || []);

  if (pointsA.length === 0 && pointsB.length === 0) {
    return (
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
        No matches recorded to calculate career trajectories.
      </div>
    );
  }

  // Find Chronological Bounds
  const allTimes = [...pointsA.map(p => p.time), ...pointsB.map(p => p.time)];
  const minTime = allTimes.length > 0 ? Math.min(...allTimes) : Date.now() - 365 * 24 * 60 * 60 * 1000;
  const maxTime = allTimes.length > 0 ? Math.max(...allTimes) : Date.now();
  const timeRange = maxTime - minTime === 0 ? 1 : maxTime - minTime;

  // Find ELO/Score Bounds
  const allScores = [...pointsA.map(p => p.score), ...pointsB.map(p => p.score)];
  const maxScore = allScores.length > 0 ? Math.max(...allScores) : 5;
  const minScore = allScores.length > 0 ? Math.min(...allScores) : -5;
  
  const yBuffer = 1;
  const yMin = minScore - yBuffer;
  const yMax = maxScore + yBuffer;
  const yRange = yMax - yMin === 0 ? 2 : yMax - yMin;

  const isMobileSize = dimensions.width < 500;
  const paddingLeft = isMobileSize ? 24 : 40;
  const paddingRight = isMobileSize ? 16 : 40;
  const paddingTop = isMobileSize ? 25 : 30;
  const paddingBottom = isMobileSize ? 25 : 30;

  const chartWidth = dimensions.width - paddingLeft - paddingRight;
  const chartHeight = dimensions.height - paddingTop - paddingBottom;

  const getCoords = (time: number, score: number) => {
    const x = paddingLeft + ((time - minTime) / timeRange) * chartWidth;
    const y = paddingTop + (1 - (score - yMin) / yRange) * chartHeight;
    return { x, y };
  };

  // Build grid lines
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

  // Generate paths for Red corner (Fighter A)
  const pathDataA = pointsA.map((p, idx) => {
    const { x, y } = getCoords(p.time, p.score);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate paths for Blue corner (Fighter B)
  const pathDataB = pointsB.map((p, idx) => {
    const { x, y } = getCoords(p.time, p.score);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Build glow area under paths if points are available
  const areaA = pointsA.length > 0 ? `
    ${pathDataA}
    L ${getCoords(pointsA[pointsA.length - 1].time, pointsA[pointsA.length - 1].score).x} ${paddingTop + chartHeight}
    L ${getCoords(pointsA[0].time, pointsA[0].score).x} ${paddingTop + chartHeight}
    Z
  ` : '';

  const areaB = pointsB.length > 0 ? `
    ${pathDataB}
    L ${getCoords(pointsB[pointsB.length - 1].time, pointsB[pointsB.length - 1].score).x} ${paddingTop + chartHeight}
    L ${getCoords(pointsB[0].time, pointsB[0].score).x} ${paddingTop + chartHeight}
    Z
  ` : '';

  // Snapping function
  const getClosestPoints = (clientX: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;

    let closestA = pointsA[0] || null;
    let minDiffA = Infinity;
    let indexA = 0;
    pointsA.forEach((pt, idx) => {
      const { x } = getCoords(pt.time, pt.score);
      const diff = Math.abs(x - mouseX);
      if (diff < minDiffA) {
        minDiffA = diff;
        closestA = pt;
        indexA = idx;
      }
    });

    let closestB = pointsB[0] || null;
    let minDiffB = Infinity;
    let indexB = 0;
    pointsB.forEach((pt, idx) => {
      const { x } = getCoords(pt.time, pt.score);
      const diff = Math.abs(x - mouseX);
      if (diff < minDiffB) {
        minDiffB = diff;
        closestB = pt;
        indexB = idx;
      }
    });

    return {
      a: closestA ? { point: closestA, index: indexA } : null,
      b: closestB ? { point: closestB, index: indexB } : null,
      x: mouseX
    };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const res = getClosestPoints(e.clientX);
    if (res) {
      setHoveredX(res.x);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 0) return;
    const res = getClosestPoints(e.touches[0].clientX);
    if (res) {
      setHoveredX(res.x);
      setSelectedX(res.x);
    }
  };

  const handleMouseLeave = () => {
    setHoveredX(null);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const res = getClosestPoints(e.clientX);
    if (res) {
      setSelectedX(res.x);
    }
  };

  const activeX = hoveredX !== null ? hoveredX : selectedX;
  
  // Calculate active snap points
  const activeData = activeX !== null ? (() => {
    let closestA = pointsA[0] || null;
    let minDiffA = Infinity;
    let indexA = 0;
    pointsA.forEach((pt, idx) => {
      const { x } = getCoords(pt.time, pt.score);
      const diff = Math.abs(x - activeX);
      if (diff < minDiffA) {
        minDiffA = diff;
        closestA = pt;
        indexA = idx;
      }
    });

    let closestB = pointsB[0] || null;
    let minDiffB = Infinity;
    let indexB = 0;
    pointsB.forEach((pt, idx) => {
      const { x } = getCoords(pt.time, pt.score);
      const diff = Math.abs(x - activeX);
      if (diff < minDiffB) {
        minDiffB = diff;
        closestB = pt;
        indexB = idx;
      }
    });

    return {
      a: closestA ? { point: closestA, index: indexA } : null,
      b: closestB ? { point: closestB, index: indexB } : null
    };
  })() : null;

  const formatScore = (val: number) => {
    if (val > 0) return `+${val}`;
    return val.toString();
  };

  const formatYear = (time: number) => {
    return new Date(time).getFullYear();
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
      {/* Background radial glows */}
      <div className={`absolute top-0 left-0 w-44 h-44 ${themeA.bg5Class} rounded-full blur-3xl pointer-events-none`} />
      <div className={`absolute bottom-0 right-0 w-44 h-44 ${themeB.bg5Class} rounded-full blur-3xl pointer-events-none`} />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-black italic text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Dual Career Trajectories
          </h3>
          <p className="text-[11px] text-white/40 font-mono uppercase tracking-tight mt-0.5">
            Compare cumulative career score timelines (Wins +1, Losses -1)
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 self-start sm:self-auto text-[10px] font-mono uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-1 ${themeA.bg500Class} rounded`} />
            <span className={`${themeA.textClass} font-bold`}>{nameA.split(' ').slice(-1)[0]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-1 ${themeB.bg500Class} rounded`} />
            <span className={`${themeB.textClass} font-bold`}>{nameB.split(' ').slice(-1)[0]}</span>
          </div>
        </div>
      </div>

      {/* Graphical Area */}
      <div 
        ref={containerRef}
        className="relative w-full border border-white/5 bg-black/40 rounded-xl overflow-hidden cursor-crosshair select-none touch-none"
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
            <linearGradient id={themeA.glowId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeA.hex} stopOpacity="0.15" />
              <stop offset="100%" stopColor={themeA.hex} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={themeB.glowId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeB.hex} stopOpacity="0.15" />
              <stop offset="100%" stopColor={themeB.hex} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridValues.map((val) => {
            const tempCoords = getCoords(minTime, val);
            const isBaseline = val === 0;

            return (
              <g key={`dual-grid-${val}`}>
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
                  x={paddingLeft - 8}
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

          {/* Glowing area under path */}
          {areaA && <path d={areaA} fill={`url(#${themeA.glowId})`} />}
          {areaB && <path d={areaB} fill={`url(#${themeB.glowId})`} />}

          {/* Dynamic line A (Fighter A) */}
          {pathDataA && (
            <path
              d={pathDataA}
              fill="none"
              stroke={themeA.hex}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0px 0px 4px ${themeA.hex}66)` }}
            />
          )}

          {/* Dynamic line B (Fighter B) */}
          {pathDataB && (
            <path
              d={pathDataB}
              fill="none"
              stroke={themeB.hex}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0px 0px 4px ${themeB.hex}66)` }}
            />
          )}

          {/* Active snap tracking line & marker dots */}
          {activeX !== null && activeData && (
            <g>
              <line
                x1={activeX}
                y1={paddingTop}
                x2={activeX}
                y2={paddingTop + chartHeight}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeDasharray="2, 2"
                strokeWidth={1}
              />
              
              {/* snap point A dot (Amber) */}
              {activeData.a && (
                <g>
                  <circle
                    cx={getCoords(activeData.a.point.time, activeData.a.point.score).x}
                    cy={getCoords(activeData.a.point.time, activeData.a.point.score).y}
                    r={6}
                    fill={themeA.hex}
                    stroke="#121212"
                    strokeWidth={1.5}
                  />
                </g>
              )}

              {/* snap point B dot (Blue) */}
              {activeData.b && (
                <g>
                  <circle
                    cx={getCoords(activeData.b.point.time, activeData.b.point.score).x}
                    cy={getCoords(activeData.b.point.time, activeData.b.point.score).y}
                    r={6}
                    fill={themeB.hex}
                    stroke="#121212"
                    strokeWidth={1.5}
                  />
                </g>
              )}
            </g>
          )}
        </svg>


      </div>

      {/* Axis labels */}
      <div className="flex items-center justify-between font-mono text-[9px] text-white/30 uppercase tracking-widest mt-[-6px] px-1 select-none">
        <span>Debut ({formatYear(minTime)})</span>
        <span className="hidden sm:flex items-center gap-1">
          Career Timeline Comparison
          <ChevronRight className="w-2.5 h-2.5" />
        </span>
        <span>Latest ({formatYear(maxTime)})</span>
      </div>

      {/* Dynamic Detail Snap Panel */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 sm:p-4 text-xs">
        {activeData && (activeData.a || activeData.b) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
            
            {/* Fighter A Snap Detail */}
            {activeData.a && activeData.a.index > 0 ? (
              <div className="space-y-1 md:pr-4">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] uppercase ${themeA.bgClass} ${themeA.textClass} px-1.5 py-0.5 rounded border ${themeA.borderClass} font-bold`}>
                    {nameA} (Bout #{activeData.a.index})
                  </span>
                  <span className="text-white/30 text-[9px] font-mono">
                    {activeData.a.point.eventDate ? new Date(activeData.a.point.eventDate).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="font-bold text-white uppercase text-xs sm:text-sm">
                  {activeData.a.point.outcome} vs {activeData.a.point.opponentName}
                </div>
                <div className="text-white/50 text-[10px] font-mono uppercase tracking-tight flex flex-wrap items-center gap-1.5">
                  <span>Method: {activeData.a.point.method}</span>
                  {activeData.a.point.endingRound && (
                    <>
                      <span>•</span>
                      <span>R{activeData.a.point.endingRound} ({activeData.a.point.endingTime || '0:00'})</span>
                    </>
                  )}
                </div>
                <div className="text-[9px] text-white/30 truncate">
                  Event: {activeData.a.point.eventName}
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-white/30 font-mono text-[10px] uppercase py-2 md:pr-4 flex items-center justify-center">
                Debut Preparation / Not Active yet
              </div>
            )}

            {/* Fighter B Snap Detail */}
            {activeData.b && activeData.b.index > 0 ? (
              <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] uppercase ${themeB.bgClass} ${themeB.textClass} px-1.5 py-0.5 rounded border ${themeB.borderClass} font-bold`}>
                    {nameB} (Bout #{activeData.b.index})
                  </span>
                  <span className="text-white/30 text-[9px] font-mono">
                    {activeData.b.point.eventDate ? new Date(activeData.b.point.eventDate).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="font-bold text-white uppercase text-xs sm:text-sm">
                  {activeData.b.point.outcome} vs {activeData.b.point.opponentName}
                </div>
                <div className="text-white/50 text-[10px] font-mono uppercase tracking-tight flex flex-wrap items-center gap-1.5">
                  <span>Method: {activeData.b.point.method}</span>
                  {activeData.b.point.endingRound && (
                    <>
                      <span>•</span>
                      <span>R{activeData.b.point.endingRound} ({activeData.b.point.endingTime || '0:00'})</span>
                    </>
                  )}
                </div>
                <div className="text-[9px] text-white/30 truncate">
                  Event: {activeData.b.point.eventName}
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-white/30 font-mono text-[10px] uppercase py-2 pt-3 md:pt-0 md:pl-4 flex items-center justify-center">
                Debut Preparation / Not Active yet
              </div>
            )}

          </div>
        ) : (
          <div className="text-center text-white/30 font-mono text-[10px] py-4 uppercase tracking-widest flex items-center justify-center gap-2">
            <Target className="w-4 h-4 text-white/20 animate-pulse" />
            Hover or slide over the graph timeline above to trace and compare individual career moments side-by-side
          </div>
        )}
      </div>
    </div>
  );
}
