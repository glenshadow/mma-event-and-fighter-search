import { FighterProfile, FightHistoryItem } from '../../types';
import { Trophy, Crown } from 'lucide-react';

/**
 * BoutOutcomeAnalyticsProps configuration.
 * @property {FightHistoryItem} match - The fight history object describing the date, method, and outcome of the bout.
 * @property {FighterProfile} fighterA - Profile record of fighter in Red corner.
 * @property {FighterProfile} fighterB - Profile record of fighter in Blue corner.
 * @property {(isFighterA: boolean) => string} getFighterOutcome - Callback helper function to safely extract or infer symmetric outcomes for each fighter.
 * @property {(id: number) => void} onSelectFighter - Callback handler triggered when selecting a fighter headshot or details card.
 */
interface BoutOutcomeAnalyticsProps {
  match: FightHistoryItem;
  fighterA: FighterProfile;
  fighterB: FighterProfile;
  getFighterOutcome: (isFighterA: boolean) => string;
  onSelectFighter: (id: number) => void;
}

/**
 * BoutOutcomeAnalytics displays the definitive post-fight results of the bout.
 * Includes visual treatment with customized colors for wins/losses and accolades like championship belts.
 */
export default function BoutOutcomeAnalytics({
  match,
  fighterA,
  fighterB,
  getFighterOutcome,
  onSelectFighter,
}: BoutOutcomeAnalyticsProps) {
  const outcomeA = getFighterOutcome(true);
  const outcomeB = getFighterOutcome(false);

  return (
    <div className="bg-[#121212] border-b border-white/10 p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2 text-amber-500 font-bold italic uppercase tracking-wider text-xs border-b border-white/5 pb-2">
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
            outcomeA.toLowerCase() === 'win' 
              ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/25 text-emerald-400 hover:border-emerald-500/40' 
              : outcomeA.toLowerCase() === 'loss'
                ? 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20 text-red-400 hover:border-red-500/35'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:border-white/20'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/65 block mb-1 truncate max-w-full group-hover:text-white/85">
            {fighterA.fullName}
          </span>
          <span className="text-lg font-black italic uppercase">
            {outcomeA}
          </span>
        </button>

        {/* Method / Round detail */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center items-center order-3 md:order-2">
          <span className="text-xs font-black italic text-amber-500 uppercase tracking-tight mb-1">
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
            outcomeB.toLowerCase() === 'win' 
              ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/25 text-emerald-400 hover:border-emerald-500/40' 
              : outcomeB.toLowerCase() === 'loss'
                ? 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20 text-red-400 hover:border-red-500/35'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:border-white/20'
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/65 block mb-1 truncate max-w-full group-hover:text-white/85">
            {fighterB.fullName}
          </span>
          <span className="text-lg font-black italic uppercase">
            {outcomeB}
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
  );
}
