import { useState, useMemo, useEffect } from 'react';
import { FighterProfile } from '../types';
import { Search, SlidersHorizontal, Trophy, Award, Trash2, ChevronDown, X } from 'lucide-react';
import { motion } from 'motion/react';

interface FighterListProps {
  fighters: FighterProfile[];
  selectedId: number | null;
  onSelectFighter: (id: number) => void;
}

const STANCES = ['Orthodox', 'Southpaw', 'Switch', 'Open Stance'];

// Standard UFC Weight division approximations
const WEIGHT_DIVISIONS = [
  { name: 'Strawweight (≤115)', min: 0, max: 115 },
  { name: 'Flyweight (116–125)', min: 116, max: 125 },
  { name: 'Bantamweight (126–135)', min: 126, max: 135 },
  { name: 'Featherweight (136–145)', min: 136, max: 145 },
  { name: 'Lightweight (146–155)', min: 146, max: 155 },
  { name: 'Welterweight (156–170)', min: 156, max: 170 },
  { name: 'Middleweight (171–185)', min: 171, max: 185 },
  { name: 'Light Heavyweight (186–205)', min: 186, max: 205 },
  { name: 'Heavyweight (>205)', min: 206, max: 999 }
];

function FighterHeadshot({ fighter, className = "w-9 h-9" }: { fighter: FighterProfile; className?: string }) {
  const [error, setError] = useState(false);
  const initials = `${fighter.firstName?.[0] || ""}${fighter.lastName?.[0] || ""}`.toUpperCase();

  if (fighter.headshot && !error) {
    return (
      <img
        src={fighter.headshot}
        alt={fighter.fullName}
        className={`${className} rounded-full object-cover border border-white/10 bg-black/40`}
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

export default function FighterList({ fighters, selectedId, onSelectFighter }: FighterListProps) {
  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('f_q');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('f_q');
      }
    }
    return val || '';
  });

  const [selectedStance, setSelectedStance] = useState<string | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('f_stance');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('f_stance');
      }
    }
    return val || null;
  });

  const [selectedWeight, setSelectedWeight] = useState<{ min: number; max: number } | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('f_weight');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('f_weight');
      }
    }
    if (val) {
      const found = WEIGHT_DIVISIONS.find(w => w.name.toLowerCase().includes(val!.toLowerCase()));
      return found || null;
    }
    return null;
  });

  const [sortBy, setSortBy] = useState<'wins' | 'losses' | 'draws' | 'fights' | 'name' | 'winrate' | 'age' | 'weight' | 'height' | 'stance' | 'default'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('f_sort');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('f_sort');
      }
    }
    return (val as any) || 'default';
  });

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('f_dir');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('f_dir');
      }
    }
    return (val as any) || 'default';
  });

  const [showFilters, setShowFilters] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasFilters = searchParams.has('f_q') || searchParams.has('f_stance') || searchParams.has('f_weight');
    if (hasFilters) return true;
    
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(qIndex));
      return hashParams.has('f_q') || hashParams.has('f_stance') || hashParams.has('f_weight');
    }
    return false;
  });

  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    
    // Clean up any query parameters in hash to migrate them to standard query parameters
    let cleanHash = url.hash;
    const qIndex = cleanHash.indexOf('?');
    if (qIndex !== -1) {
      cleanHash = cleanHash.substring(0, qIndex);
    }

    if (sortBy !== 'default' && sortDirection !== 'default') {
      url.searchParams.set('f_sort', sortBy);
      url.searchParams.set('f_dir', sortDirection);
    } else {
      url.searchParams.delete('f_sort');
      url.searchParams.delete('f_dir');
    }

    if (searchQuery.trim()) {
      url.searchParams.set('f_q', searchQuery.trim());
    } else {
      url.searchParams.delete('f_q');
    }

    if (selectedStance) {
      url.searchParams.set('f_stance', selectedStance);
    } else {
      url.searchParams.delete('f_stance');
    }

    if (selectedWeight) {
      const divName = selectedWeight.name.split(' ')[0];
      url.searchParams.set('f_weight', divName);
    } else {
      url.searchParams.delete('f_weight');
    }
    
    window.history.replaceState(null, '', url.pathname + url.search + cleanHash);
  }, [sortBy, sortDirection, searchQuery, selectedStance, selectedWeight]);

  const [visibleCount, setVisibleCount] = useState(40);

  // Clear all filters easily
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStance(null);
    setSelectedWeight(null);
    setSortBy('default');
    setSortDirection('default');
    setVisibleCount(40);
  };

  const handleHeaderClick = (field: 'wins' | 'losses' | 'draws' | 'fights' | 'name' | 'winrate' | 'age' | 'weight' | 'height' | 'stance') => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDirection('asc');
    } else {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortBy('default');
        setSortDirection('default');
      } else {
        setSortBy(field);
        setSortDirection('asc');
      }
    }
  };

  // Main filter/sort block memoized for high-performance
  const filteredFighters = useMemo(() => {
    let result = [...fighters];

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        f => 
          f.fullName.toLowerCase().includes(q) || 
          (f.nickName && f.nickName.toLowerCase().includes(q))
      );
    }

    // Filter by stance
    if (selectedStance) {
      result = result.filter(f => f.stance && f.stance.trim().toLowerCase() === selectedStance.toLowerCase());
    }

    // Filter by weight limits
    if (selectedWeight) {
      result = result.filter(f => f.weight && f.weight >= selectedWeight.min && f.weight <= selectedWeight.max);
    }

    // Sorting block
    if (sortBy !== 'default' && sortDirection !== 'default') {
      result.sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortBy) {
          case 'wins':
            valA = a.record.wins;
            valB = b.record.wins;
            break;

          case 'losses':
            valA = a.record.losses;
            valB = b.record.losses;
            break;

          case 'draws':
            valA = a.record.draws;
            valB = b.record.draws;
            break;
          
          case 'fights':
            valA = a.fightsCount ?? a.fightsParticipated?.length ?? 0;
            valB = b.fightsCount ?? b.fightsParticipated?.length ?? 0;
            break;
          
          case 'winrate': {
            const totalA = a.record.wins + a.record.losses;
            const totalB = b.record.wins + b.record.losses;
            valA = totalA > 0 ? (a.record.wins / totalA) : 0;
            valB = totalB > 0 ? (b.record.wins / totalB) : 0;
            break;
          }

          case 'age':
            valA = a.age ?? 0;
            valB = b.age ?? 0;
            break;

          case 'weight':
            valA = a.weight ?? 0;
            valB = b.weight ?? 0;
            break;

          case 'height':
            valA = a.height ?? 0;
            valB = b.height ?? 0;
            break;

          case 'stance':
            valA = a.stance || 'Orthodox';
            valB = b.stance || 'Orthodox';
            break;

          case 'name':
          default:
            valA = a.fullName;
            valB = b.fullName;
            break;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        } else {
          return sortDirection === 'asc' 
            ? valA - valB 
            : valB - valA;
        }
      });
    }

    return result;
  }, [fighters, searchQuery, selectedStance, selectedWeight, sortBy, sortDirection]);

  // Reset the list length when query/filters update to prevent hidden loads
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    setVisibleCount(40);
  };

  const handleStanceToggle = (stance: string) => {
    setSelectedStance(selectedStance === stance ? null : stance);
    setVisibleCount(40);
  };

  const handleWeightToggle = (w: { min: number; max: number } | null) => {
    setSelectedWeight(selectedWeight === w ? null : w);
    setVisibleCount(40);
  };

  const visibleFighters = filteredFighters.slice(0, visibleCount);

  return (
    <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md" id="fighter-list-container">
      {/* Search Header */}
      <div className="p-4 border-b border-white/10 bg-black/20 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search fighters..." 
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-red-500 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-white/40 outline-none transition-all font-mono"
            id="fighter-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono transition-colors cursor-pointer ${showFilters ? 'bg-red-600/10 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/25 hover:text-white'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> 
              FILTERS
            </button>

            {(searchQuery || selectedStance || selectedWeight) && (
              <button 
                onClick={handleClearFilters}
                className="text-red-500 hover:text-red-400 transition-colors font-mono cursor-pointer flex items-center gap-1 font-bold uppercase text-[10px]"
              >
                <Trash2 className="w-3.5 h-3.5" /> reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 relative sm:self-auto self-start">
            <span className="text-white/40 font-mono">Sort:</span>
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between gap-1.5 bg-black/40 border border-white/10 hover:border-white/20 hover:text-white text-white/80 font-mono rounded-lg pl-3 pr-8 py-1.5 outline-none text-xs cursor-pointer focus:border-red-500 transition-all font-bold min-w-[125px] text-left relative"
              >
                <span>
                  {(() => {
                    const found = [
                      { value: 'default', label: 'Default' },
                      { value: 'wins', label: 'Most Wins' },
                      { value: 'losses', label: 'Most Losses' },
                      { value: 'draws', label: 'Most Draws' },
                      { value: 'fights', label: 'Most Experienced' },
                      { value: 'winrate', label: 'Win Rate' },
                      { value: 'stance', label: 'Stance' },
                      { value: 'name', label: 'Alphabetical' },
                      { value: 'age', label: 'Age' },
                      { value: 'weight', label: 'Weight' },
                      { value: 'height', label: 'Height' }
                    ].find(o => o.value === sortBy);
                    return found ? found.label : 'Default';
                  })()}
                </span>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 font-mono text-[11px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {[
                      { value: 'default', label: 'Default' },
                      { value: 'wins', label: 'Most Wins' },
                      { value: 'losses', label: 'Most Losses' },
                      { value: 'draws', label: 'Most Draws' },
                      { value: 'fights', label: 'Most Experienced' },
                      { value: 'winrate', label: 'Win Rate' },
                      { value: 'stance', label: 'Stance' },
                      { value: 'name', label: 'Alphabetical' },
                      { value: 'age', label: 'Age' },
                      { value: 'weight', label: 'Weight' },
                      { value: 'height', label: 'Height' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value as any);
                          if (opt.value === 'default') {
                            setSortDirection('default');
                          } else {
                            setSortDirection('desc');
                          }
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer flex items-center justify-between ${sortBy === opt.value ? 'bg-red-500/5 text-red-500 font-bold' : 'text-white/70'}`}
                      >
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown Filters Panel */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-3 border-t border-white/10 space-y-3"
          >
            {/* Stances */}
            <div>
              <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block mb-1.5 font-bold">Combat Footwork Stance</span>
              <div className="flex flex-wrap gap-1.5">
                {STANCES.map((stance) => (
                  <button
                    key={stance}
                    onClick={() => handleStanceToggle(stance)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg border transition-colors cursor-pointer ${selectedStance === stance ? 'bg-red-600/10 border-red-500/40 text-red-550' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white'}`}
                  >
                    {stance}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Classes */}
            <div>
              <span className="text-[9px] uppercase tracking-wider font-mono text-white/40 block mb-1.5 font-bold">Weight Class Division</span>
              <div className="grid grid-cols-2 gap-1.5">
                {WEIGHT_DIVISIONS.map((w) => {
                  const active = selectedWeight?.min === w.min && selectedWeight?.max === w.max;
                  return (
                    <button
                      key={w.name}
                      onClick={() => handleWeightToggle(active ? null : w)}
                      className={`text-left px-2 py-1.5 text-[10px] font-mono rounded-lg border truncate transition-all cursor-pointer ${active ? 'bg-red-600/20 border-red-500/40 text-red-400 font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                      {w.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fighter list view */}
      <div className="flex-1 bg-black/10 overflow-x-auto">
        {visibleFighters.length === 0 ? (
          <div className="text-center py-10 text-white/40 font-mono text-xs">
            No matching athletes found.
          </div>
        ) : (
          <>
            {/* Desktop Datagrid */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono text-white/40 uppercase tracking-widest select-none">
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('name')}>
                      Athlete Name {sortBy === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('wins')}>
                      Wins {sortBy === 'wins' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('losses')}>
                      Losses {sortBy === 'losses' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('draws')}>
                      Draws {sortBy === 'draws' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('winrate')}>
                      Win Rate {sortBy === 'winrate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('stance')}>
                      Stance {sortBy === 'stance' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('age')}>
                      Age {sortBy === 'age' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('weight')}>
                      Weight {sortBy === 'weight' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('height')}>
                      Height {sortBy === 'height' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleHeaderClick('fights')}>
                      Historic Bouts {sortBy === 'fights' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleFighters.map((fighter) => {
                    const total = fighter.record.wins + fighter.record.losses;
                    const winrate = total > 0 ? Math.round((fighter.record.wins / total) * 100) : 0;
                    const active = fighter.id === selectedId;
                    return (
                      <tr 
                        key={fighter.id}
                        onClick={() => onSelectFighter(fighter.id)}
                        className={`hover:bg-white/[0.04] transition-all cursor-pointer text-xs ${active ? 'bg-red-650/10' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <FighterHeadshot fighter={fighter} className="w-9 h-9" />
                            <div>
                              <div className="text-white font-sans text-sm font-semibold hover:text-red-400 transition-colors">{fighter.fullName}</div>
                              {fighter.nickName && <div className="text-white/40 italic font-sans text-xs">"{fighter.nickName}"</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-win-color">
                          {fighter.record.wins}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-loss-color">
                          {fighter.record.losses}
                        </td>
                        <td className="py-3 px-4 font-mono text-white/50">
                          {fighter.record.draws}
                        </td>
                        <td className="py-3 px-4 font-mono text-white/80">
                          {winrate}%
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider italic">
                            {fighter.stance || 'Orthodox'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-white/60">
                          {fighter.age ?? 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono text-white/60">
                          {fighter.weight ? `${fighter.weight} LBS` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono text-white/60">
                          {fighter.height ? `${fighter.height} IN` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono text-red-550 font-bold text-right">
                          {fighter.fightsCount ?? fighter.fightsParticipated?.length ?? 0} bouts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="block md:hidden divide-y divide-white/5">
              {visibleFighters.map((fighter) => {
                const active = fighter.id === selectedId;
                return (
                  <div 
                    key={fighter.id}
                    onClick={() => onSelectFighter(fighter.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${active ? 'bg-red-650/10 border-l-4 border-red-550' : 'hover:bg-white/[0.04] border-l-4 border-transparent'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <FighterHeadshot fighter={fighter} className="w-9 h-9" />
                      <div className="min-w-0">
                        <div className={`font-semibold truncate text-[14px] ${active ? 'text-white font-black italic' : 'text-white/80 hover:text-white'}`}>
                          {fighter.fullName}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-white/40">
                          <span className="text-red-550 font-bold uppercase tracking-wider italic text-[10px]">{fighter.stance || 'Orthodox'}</span>
                          <span>•</span>
                          <span>{fighter.weight ? `${fighter.weight} LBS` : 'Welterweight'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black font-mono text-white tracking-widest">
                        {fighter.record.wins} - {fighter.record.losses} - {fighter.record.draws}
                      </div>
                      <div className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-tighter">
                        {fighter.fightsCount ?? fighter.fightsParticipated?.length ?? 0} historic bouts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Load More Trigger */}
        {filteredFighters.length > visibleCount && (
          <div className="p-4 text-center border-t border-white/5">
            <button 
              onClick={() => setVisibleCount(p => p + 40)}
              className="text-xs font-mono py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 cursor-pointer transition-colors font-bold uppercase tracking-wider"
            >
              Load More Fighters (+40)
            </button>
            <div className="text-[9px] text-white/40 font-mono mt-2">
              Viewing {visibleCount} of {filteredFighters.length} matched athletes
            </div>
          </div>
        )}
      </div>

      {/* Metadata status bar of the specific list view */}
      <div className="bg-black/30 border-t border-white/15 py-2.5 px-4 flex items-center justify-between text-[10px] text-white/40 font-mono uppercase tracking-widest">
        <span>Filtered: {filteredFighters.length} / {fighters.length} ATHLETES</span>
      </div>
    </div>
  );
}
