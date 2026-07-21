import { useState, useMemo, useEffect } from 'react';
import { EventSummary, EventDetailed } from '../../types';
import { Search, SlidersHorizontal, CalendarDays, FilterX, Clock, ChevronDown, X, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react';
import { motion } from 'motion/react';

interface EventListProps {
  events: EventSummary[];
  selectedId: number | null;
  onSelectEvent: (id: number) => void;
}

const ERAS = [
  { name: 'Pioneer Era (1993-2000)', startYear: 1993, endYear: 2000 },
  { name: 'Zuffa Boom Era (2001-2010)', startYear: 2001, endYear: 2010 },
  { name: 'Fox Network Era (2011-2018)', startYear: 2011, endYear: 2018 },
  { name: 'ESPN & Modern Era (2019-Present)', startYear: 2019, endYear: 2027 }
];

export default function EventList({ events, selectedId, onSelectEvent }: EventListProps) {
  const [searchQuery, setSearchQuery] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('e_q');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('e_q');
      }
    }
    return val || '';
  });

  const [selectedStatus, setSelectedStatus] = useState<string | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('e_status');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('e_status');
      }
    }
    return val || null;
  });

  const [selectedEra, setSelectedEra] = useState<{ startYear: number; endYear: number } | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('e_era');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('e_era');
      }
    }
    if (val) {
      const year = Number(val);
      const found = ERAS.find(e => e.startYear === year);
      return found || null;
    }
    return null;
  });

  const [sortBy, setSortBy] = useState<'name' | 'date' | 'venue' | 'location' | 'fights' | 'id' | 'status' | 'default'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('e_sort');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('e_sort');
      }
    }
    return (val as any) || 'date';
  });

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let val = searchParams.get('e_dir');
    if (!val) {
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(hash.substring(qIndex));
        val = hashParams.get('e_dir');
      }
    }
    return (val as any) || 'desc';
  });

  const [showFilters, setShowFilters] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasFilters = searchParams.has('e_q') || searchParams.has('e_status') || searchParams.has('e_era');
    if (hasFilters) return true;
    
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(qIndex));
      return hashParams.has('e_q') || hashParams.has('e_status') || hashParams.has('e_era');
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

    if (sortBy !== 'date' || sortDirection !== 'desc') {
      url.searchParams.set('e_sort', sortBy);
      url.searchParams.set('e_dir', sortDirection);
    } else {
      url.searchParams.delete('e_sort');
      url.searchParams.delete('e_dir');
    }

    if (searchQuery.trim()) {
      url.searchParams.set('e_q', searchQuery.trim());
    } else {
      url.searchParams.delete('e_q');
    }

    if (selectedStatus) {
      url.searchParams.set('e_status', selectedStatus);
    } else {
      url.searchParams.delete('e_status');
    }

    if (selectedEra) {
      url.searchParams.set('e_era', String(selectedEra.startYear));
    } else {
      url.searchParams.delete('e_era');
    }
    
    window.history.replaceState(null, '', url.pathname + url.search + cleanHash);
  }, [sortBy, sortDirection, searchQuery, selectedStatus, selectedEra]);

  const [visibleCount, setVisibleCount] = useState(40);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus(null);
    setSelectedEra(null);
    setSortBy('date');
    setSortDirection('desc');
    setVisibleCount(40);
  };

  const handleHeaderClick = (field: 'name' | 'date' | 'venue' | 'location' | 'fights' | 'id' | 'status') => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDirection('asc');
    } else {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortBy('date');
        setSortDirection('desc');
      }
    }
  };

  const getSelectValue = () => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' ? 'chronological' : 'reverse-chronological';
    }
    return sortBy;
  };

  const handleSelectChange = (val: string) => {
    if (val === 'chronological') {
      setSortBy('date');
      setSortDirection('asc');
    } else if (val === 'reverse-chronological' || val === 'default') {
      setSortBy('date');
      setSortDirection('desc');
    } else {
      setSortBy(val as any);
      setSortDirection('desc');
    }
  };

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Substring Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        e => 
          e.name.toLowerCase().includes(q) || 
          e.location.toLowerCase().includes(q)
      );
    }

    // Filter by live/historical status
    if (selectedStatus) {
      result = result.filter(e => e.status.trim().toLowerCase() === selectedStatus.toLowerCase());
    }

    // Filter by chronological era groups
    if (selectedEra) {
      result = result.filter(e => {
        if (!e.date) return false;
        const year = new Date(e.date).getFullYear();
        return year >= selectedEra.startYear && year <= selectedEra.endYear;
      });
    }

    // Sort order limits
    const effectiveSortBy = sortBy === 'default' ? 'date' : sortBy;
    const effectiveSortDir = sortDirection === 'default' ? 'desc' : sortDirection;

    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (effectiveSortBy) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;

        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;

        case 'date':
          valA = a.date ? new Date(a.date).getTime() : 0;
          valB = b.date ? new Date(b.date).getTime() : 0;
          break;
        
        case 'fights':
          valA = a.fightsCount;
          valB = b.fightsCount;
          break;

        case 'venue':
          valA = a.venue || '';
          valB = b.venue || '';
          break;

        case 'location':
          valA = a.location || '';
          valB = b.location || '';
          break;

        case 'name':
        default:
          valA = a.name;
          valB = b.name;
          break;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return effectiveSortDir === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return effectiveSortDir === 'asc' 
          ? valA - valB 
          : valB - valA;
      }
    });

    return result;
  }, [events, searchQuery, selectedStatus, selectedEra, sortBy, sortDirection]);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    setVisibleCount(40);
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus(selectedStatus === status ? null : status);
    setVisibleCount(40);
  };

  const handleEraToggle = (era: any) => {
    setSelectedEra(selectedEra === era ? null : era);
    setVisibleCount(40);
  };

  const visibleEvents = filteredEvents.slice(0, visibleCount);

  return (
    <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md" id="event-list-container">
      {/* Search and filter toolbar */}
      <div className="p-4 border-b border-white/10 bg-black/20 space-y-3 nav-controls">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-white/60 outline-none font-mono transition-colors"
            id="event-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono transition-colors cursor-pointer ${showFilters ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/25 hover:text-white'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> 
              FILTERS
            </button>

            {(searchQuery || selectedStatus || selectedEra) && (
              <button 
                onClick={handleClearFilters}
                className="text-amber-500 hover:text-amber-400 transition-colors font-mono cursor-pointer flex items-center gap-1 font-bold uppercase text-[10px]"
              >
                <FilterX className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 relative sm:self-auto self-start">
            <span className="text-white/65 font-mono">Order:</span>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center justify-between gap-1.5 bg-black/40 border border-white/10 hover:border-white/20 hover:text-white text-white/80 font-mono rounded-lg pl-3 pr-8 py-1.5 outline-none text-xs cursor-pointer focus:border-amber-500 transition-all font-bold min-w-[130px] text-left relative"
                >
                  <span>
                    {(() => {
                      const found = [
                        { value: 'default', label: 'Default' },
                        { value: 'reverse-chronological', label: 'Newest First' },
                        { value: 'chronological', label: 'Oldest First' },
                        { value: 'fights', label: 'Bout Count' },
                        { value: 'name', label: 'Card Name (A-Z)' },
                        { value: 'venue', label: 'Venue' },
                        { value: 'location', label: 'Location' },
                        { value: 'status', label: 'Status' }
                      ].find(o => o.value === getSelectValue());
                      return found ? found.label : 'Default';
                    })()}
                  </span>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60 pointer-events-none" />
                </button>

                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsSortOpen(false)} />
                    <div className="absolute right-0 mt-1 w-44 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 font-mono text-[11px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {[
                        { value: 'default', label: 'Default' },
                        { value: 'reverse-chronological', label: 'Newest First' },
                        { value: 'chronological', label: 'Oldest First' },
                        { value: 'fights', label: 'Bout Count' },
                        { value: 'name', label: 'Card Name (A-Z)' },
                        { value: 'venue', label: 'Venue' },
                        { value: 'location', label: 'Location' },
                        { value: 'status', label: 'Status' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            handleSelectChange(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-amber-500/10 hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-between ${getSelectValue() === opt.value ? 'bg-amber-500/5 text-amber-500 font-bold' : 'text-white/70'}`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-black/40 border border-white/10 hover:border-white/20 text-white/80 hover:text-white rounded-lg cursor-pointer focus:outline-none focus:border-amber-500 transition-all flex items-center justify-center h-[28px] w-[28px] sm:h-[30px] sm:w-[30px]"
                title={sortDirection === 'asc' ? "Ascending Order" : "Descending Order"}
                aria-label={sortDirection === 'asc' ? "Sort ascending" : "Sort descending"}
              >
                {sortDirection === 'asc' ? (
                  <ArrowUpNarrowWide className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <ArrowDownNarrowWide className="w-3.5 h-3.5 text-amber-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Expansion */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-3 border-t border-white/10 space-y-3"
          >
            {/* Live/Final status toggle */}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-white/65 block mb-1.5 font-bold">Event Status</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusToggle('Final')}
                  className={`px-3 py-1 text-[10px] font-mono rounded-lg border transition-colors cursor-pointer ${selectedStatus === 'Final' ? 'bg-white/10 border-white/15 text-white font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}
                >
                  Completed (Final)
                </button>
                <button
                  onClick={() => handleStatusToggle('Upcoming')}
                  className={`px-3 py-1 text-[10px] font-mono rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${selectedStatus === 'Upcoming' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-amber-400'}`}
                >
                  <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Upcoming / Live
                </button>
              </div>
            </div>

            {/* Eras list selector */}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-white/65 block mb-1.5 font-bold">Historical Era Arcs</span>
              <div className="grid grid-cols-1 gap-1.5">
                {ERAS.map((era) => {
                  const active = selectedEra?.startYear === era.startYear && selectedEra?.endYear === era.endYear;
                  return (
                    <button
                      key={era.name}
                      onClick={() => handleEraToggle(active ? null : era)}
                      className={`text-left px-3 py-1.5 text-[10px] font-mono rounded-lg border transition-colors truncate cursor-pointer ${active ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                    >
                      {era.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Events list context */}
      <div className="flex-1 bg-black/10 overflow-x-auto">
        {visibleEvents.length === 0 ? (
          <div className="text-center py-10 text-white/65 font-mono text-xs uppercase tracking-widest">
            No matching events found.
          </div>
        ) : (
          <>
            {/* Desktop Datagrid */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono text-white/65 uppercase tracking-widest select-none whitespace-nowrap">
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('name')}>
                      Event Card Name {sortBy === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('date')}>
                      Date {sortBy === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('venue')}>
                      Venue {sortBy === 'venue' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('location')}>
                      Location {sortBy === 'location' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => handleHeaderClick('status')}>
                      Status {sortBy === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-3 px-4 font-bold cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleHeaderClick('fights')}>
                      Bouts {sortBy === 'fights' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleEvents.map((e) => {
                    const active = e.id === selectedId;
                    const formattedDate = e.date ? new Date(e.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'TBA';
                    const venueName = e.venue;
                    return (
                      <tr 
                        key={e.id}
                        onClick={() => onSelectEvent(e.id)}
                        className={`hover:bg-white/[0.04] transition-all cursor-pointer text-xs ${active ? 'bg-amber-500/10' : ''}`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-white text-[13px] hover:text-amber-400 transition-colors">
                          {e.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-white/80">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4 text-white/90 font-medium">
                          {venueName && venueName !== 'Venue TBA' && venueName !== 'N/A' ? (
                            venueName
                          ) : (
                            <span className="text-white/60 italic">Venue TBA</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-white/60">
                          {e.location || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${e.status.trim().toLowerCase() === 'final' ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse'}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white text-right">
                          <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                            {e.fightsCount}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="block md:hidden divide-y divide-white/5">
              {visibleEvents.map((e) => {
                const active = e.id === selectedId;
                const formattedDate = e.date ? new Date(e.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'TBA';
                const venueName = e.venue;
                
                return (
                  <div 
                    key={e.id}
                    onClick={() => onSelectEvent(e.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${active ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'hover:bg-white/[0.04] border-l-4 border-transparent'}`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className={`font-semibold text-[14px] truncate ${active ? 'text-white font-black italic text-[15px]' : 'text-white/80 hover:text-white'}`}>
                        {e.name}
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-1.5 text-[11px] font-mono text-white/65 uppercase tracking-tight">
                        <div className="flex items-center gap-2">
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold truncate max-w-[150px]">
                            {venueName && venueName !== 'Venue TBA' && venueName !== 'N/A' ? venueName : 'Venue TBA'}
                          </span>
                        </div>
                        <span className="truncate text-[10px] text-white/60 lowercase first-letter:uppercase">{e.location || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold bg-white/10 text-white border border-white/15 px-2.5 py-1 rounded-md">
                        {e.fightsCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Load More events option */}
        {filteredEvents.length > visibleCount && (
          <div className="p-4 text-center border-t border-white/5">
            <button 
              onClick={() => setVisibleCount(p => p + 40)}
              className="text-xs font-mono py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 cursor-pointer transition-colors font-bold uppercase tracking-wider"
            >
              Load More Cards (+45)
            </button>
            <div className="text-[10px] text-white/65 font-mono mt-2">
              Viewing {visibleCount} of {filteredEvents.length} matched event cards
            </div>
          </div>
        )}
      </div>

      {/* Metadata status bar of the specific list view */}
      <div className="bg-black/30 border-t border-white/15 py-2.5 px-4 flex items-center justify-between text-[10px] text-white/65 font-mono uppercase tracking-widest">
        <span>Filtered: {filteredEvents.length} / {events.length} EVENTS</span>
      </div>
    </div>
  );
}
