import { useState } from 'react';
import { FighterProfile } from '../../types';
import { Sparkles } from 'lucide-react';
import ImageWithLoader from '../ImageWithLoader';

/**
 * MatchupSimulationCardProps defines the complex layout inputs for computed athletic predictions.
 * @property {FighterProfile} fighterA - Profile of the red-corner fighter.
 * @property {FighterProfile} fighterB - Profile of the blue-corner fighter.
 * @property {string | null} headshotA - Image path or URL for fighter A.
 * @property {string | null} headshotB - Image path or URL for fighter B.
 * @property {any} themeA - Accent and background colors representing fighter A's corner.
 * @property {any} themeB - Accent and background colors representing fighter B's corner.
 * @property {object} prediction - Algorithmic prediction outcomes.
 * @property {number} prediction.probA - Simulated win probability for Fighter A (0-100).
 * @property {number} prediction.probB - Simulated win probability for Fighter B (0-100).
 * @property {Array} prediction.breakdown - Evaluated physical, physical reach, youth, form, stance, and record statistics.
 * @property {(id: number) => void} onSelectFighter - Callback when a fighter is selected from the matchup panel.
 */
interface MatchupSimulationCardProps {
  fighterA: FighterProfile;
  fighterB: FighterProfile;
  headshotA: string | null;
  headshotB: string | null;
  themeA: any;
  themeB: any;
  prediction: {
    probA: number;
    probB: number;
    breakdown: Array<{
      label: string;
      desc: string;
      valA: string;
      valB: string;
      scoreA: number;
      scoreB: number;
    }>;
  };
  onSelectFighter: (id: number) => void;
}

/**
 * MatchupSimulationCard component renders the predictive head-to-head matchup model.
 * It provides interactive controls to expand or collapse the point-based breakdown for each factor.
 */
export default function MatchupSimulationCard({
  fighterA,
  fighterB,
  headshotA,
  headshotB,
  themeA,
  themeB,
  prediction,
  onSelectFighter,
}: MatchupSimulationCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
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
        <div className="text-[10px] font-mono text-white/65 uppercase bg-black/30 border border-white/5 px-2 py-1 rounded max-w-xs leading-normal">
          🔮 Computed strictly via pre-fight variables. Independent of real outcome.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Fighter A Probability Display */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between relative overflow-hidden gap-4" id="prediction-card-fighter-a">
          <div className={`absolute top-0 right-0 w-24 h-24 ${themeA.bgGlowHalf} rounded-full blur-3xl pointer-events-none`} />
          
          {/* Headshot on the LEFT */}
          <button 
            onClick={() => onSelectFighter(fighterA.id)}
            className="shrink-0 relative z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-full"
            id="prediction-headshot-fighter-a"
            title={`View ${fighterA.fullName} profile`}
          >
            {headshotA ? (
              <ImageWithLoader 
                src={headshotA} 
                alt={fighterA.fullName} 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 hover:border-amber-500/40 overflow-hidden bg-black/40 transition-colors"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 hover:border-amber-500/40 overflow-hidden bg-black/40 flex items-center justify-center font-mono font-black ${themeA.text} text-base sm:text-lg transition-colors`}>
                {fighterA.firstName?.[0]}{fighterA.lastName?.[0]}
              </div>
            )}
          </button>

          {/* Text details on the RIGHT */}
          <div className="flex flex-col items-end text-right relative z-10 flex-1">
            <span className={`text-[10px] font-mono font-bold tracking-widest ${themeA.badgeText} bg-white/5 border border-white/10 px-2 py-0.5 rounded mb-1.5 truncate max-w-full`}>
              {fighterA.fullName}
            </span>
            <span className="text-3xl sm:text-4xl font-black italic font-mono text-white leading-none font-sans">
              {prediction.probA}%
            </span>
            <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider mt-1">
              Predicted Probability
            </span>
          </div>
        </div>

        {/* Fighter B Probability Display */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between relative overflow-hidden gap-4" id="prediction-card-fighter-b">
          <div className={`absolute top-0 left-0 w-24 h-24 ${themeB.bgGlowHalf} rounded-full blur-3xl pointer-events-none`} />
          
          {/* Text details on the LEFT */}
          <div className="flex flex-col items-start text-left relative z-10 flex-1 order-1">
            <span className={`text-[10px] font-mono font-bold tracking-widest ${themeB.badgeText} bg-white/5 border border-white/10 px-2 py-0.5 rounded mb-1.5 truncate max-w-full`}>
              {fighterB.fullName}
            </span>
            <span className="text-3xl sm:text-4xl font-black italic font-mono text-white leading-none font-sans">
              {prediction.probB}%
            </span>
            <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider mt-1">
              Predicted Probability
            </span>
          </div>

          {/* Headshot on the RIGHT */}
          <button 
            onClick={() => onSelectFighter(fighterB.id)}
            className="shrink-0 relative z-10 order-2 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-full"
            id="prediction-headshot-fighter-b"
            title={`View ${fighterB.fullName} profile`}
          >
            {headshotB ? (
              <ImageWithLoader 
                src={headshotB} 
                alt={fighterB.fullName} 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 hover:border-amber-500/40 overflow-hidden bg-black/40 transition-colors"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 hover:border-amber-500/40 overflow-hidden bg-black/40 flex items-center justify-center font-mono font-black ${themeB.text} text-base sm:text-lg transition-colors`}>
                {fighterB.firstName?.[0]}{fighterB.lastName?.[0]}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Probability Split Slider Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden flex">
          <div 
            className={`bg-gradient-to-r ${themeA.gradientRFrom} ${themeA.gradientRTo} h-full transition-all duration-500`} 
            style={{ width: `${prediction.probA}%` }}
          />
          <div 
            className={`bg-gradient-to-r ${themeB.gradientRFrom} ${themeB.gradientRTo} h-full transition-all duration-500`} 
            style={{ width: `${prediction.probB}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-white/65 uppercase tracking-widest">
          <span>{fighterA.lastName || 'FIGHTER A'} ({prediction.probA}%)</span>
          <span>PROBABILITY RATIO</span>
          <span>{fighterB.lastName || 'FIGHTER B'} ({prediction.probB}%)</span>
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
          <div id="factor-analysis-breakdown" className="border border-slate-200 dark:border-white/10 rounded-xl mt-3 overflow-hidden bg-black/45 divide-y divide-slate-300 dark:divide-white/5">
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
                      <span className="text-[10px] text-white/65 block font-mono leading-none mt-1">
                        {b.desc}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      favA 
                        ? `${themeA.bgGlow} ${themeA.badgeText} border ${themeA.borderGlow}` 
                        : favB
                        ? `${themeB.bgGlow} ${themeB.badgeText} border ${themeB.borderGlow}`
                        : 'bg-white/5 text-white/65 border border-white/10'
                    }`}>
                      {favA ? `${(fighterA.lastName || 'Fighter A').toUpperCase()} ADVANTAGE` : favB ? `${(fighterB.lastName || 'Fighter B').toUpperCase()} ADVANTAGE` : 'EVEN'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center text-center font-mono text-[10px]">
                    {/* Redcorner metric */}
                    <div className={`text-right ${favA ? `${themeA.badgeText} font-bold` : 'text-white/60'}`}>
                      {b.valA}
                      <span className="text-[10px] text-white/60 block mt-0.5">
                        {b.scoreA > 0 ? `+${b.scoreA.toFixed(1)} pts` : b.scoreA < 0 ? `${b.scoreA.toFixed(1)} pts` : '0.0 pts'}
                      </span>
                    </div>

                    {/* Mid-label line */}
                    <div className="h-[1px] bg-slate-400 dark:bg-white/20 relative factor-mid-line">
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                        favA ? themeA.bg500 : favB ? themeB.bg500 : 'bg-slate-400 dark:bg-white/35'
                      }`} />
                    </div>

                    {/* Bluecorner metric */}
                    <div className={`text-left ${favB ? `${themeB.badgeText} font-bold` : 'text-white/60'}`}>
                      {b.valB}
                      <span className="text-[10px] text-white/60 block mt-0.5">
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
  );
}
