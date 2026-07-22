import { useState, useEffect, useRef } from 'react';
import { EventSummary, EventDetailed, FighterProfile, StatsSummary } from './types';
import DashboardInsights from './components/DashboardInsights';
import FighterList from './components/FighterList';
import FighterDetail from './components/FighterDetail';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import FightDetail from './components/FightDetail';
import AboutPage from './components/AboutPage';
import { Trophy, CalendarDays, Users, HandFist, Info, AlertTriangle, Menu, X, ArrowLeft, ArrowUp, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function parseHash(hash: string) {
  const cleanHash = hash.replace(/^#\/?/, ''); // remove leading # and / if any
  if (!cleanHash || cleanHash === 'dashboard') {
    return { tab: 'dashboard' as const, id: null };
  }

  if (cleanHash === 'about') {
    return { tab: 'about' as const, id: null };
  }
  
  if (cleanHash.startsWith('fighters')) {
    const parts = cleanHash.split('/');
    const id = parts[1] ? parseInt(parts[1], 10) : null;
    return { tab: 'fighters' as const, id: (id === null || isNaN(id)) ? null : id };
  }
  
  if (cleanHash.startsWith('events')) {
    const parts = cleanHash.split('/');
    const id = parts[1] ? parseInt(parts[1], 10) : null;
    return { tab: 'events' as const, id: (id === null || isNaN(id)) ? null : id };
  }

  if (cleanHash.startsWith('fights')) {
    const parts = cleanHash.split('/');
    const fA = parts[1] ? parseInt(parts[1], 10) : null;
    const fB = parts[2] ? parseInt(parts[2], 10) : null;
    const fId = parts[3] ? parseInt(parts[3], 10) : null;
    return {
      tab: 'fights' as const,
      id: null,
      fighterAId: (fA === null || isNaN(fA)) ? null : fA,
      fighterBId: (fB === null || isNaN(fB)) ? null : fB,
      fightId: (fId === null || isNaN(fId)) ? null : fId
    };
  }
  
  return { tab: 'dashboard' as const, id: null };
}

function slugify(text: string): string {
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
}

function getFighterSlug(fighter: FighterProfile): string {
  return slugify(fighter.fullName);
}

function getEventSlug(event: EventSummary): string {
  return slugify(event.name);
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorStr, setErrorStr] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('mma-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('mma-theme', theme);
  }, [theme]);

  // Core compiled collections state loaded from static public json
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [fighters, setFighters] = useState<FighterProfile[]>([]);
  const [statsSummary, setStatsSummary] = useState<StatsSummary | null>(null);
  const [champions, setChampions] = useState<any[] | null>(null);

  // Orchestrating navigation states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fighters' | 'events' | 'fights' | 'about'>(() => {
    return parseHash(window.location.hash).tab;
  });
  const [selectedFighterId, setSelectedFighterId] = useState<number | null>(() => {
    const parsed = parseHash(window.location.hash);
    return parsed.tab === 'fighters' ? parsed.id : null;
  });
  const [selectedEventId, setSelectedEventId] = useState<number | null>(() => {
    const parsed = parseHash(window.location.hash);
    return parsed.tab === 'events' ? parsed.id : null;
  });
  const [selectedFightInfo, setSelectedFightInfo] = useState<{
    fighterAId: number;
    fighterBId: number;
    fightId: number | null;
  } | null>(() => {
    const parsed = parseHash(window.location.hash);
    if (parsed.tab === 'fights' && parsed.fighterAId && parsed.fighterBId) {
      return {
        fighterAId: parsed.fighterAId,
        fighterBId: parsed.fighterBId,
        fightId: parsed.fightId || null
      };
    }
    return null;
  });

  const [showFighterDetail, setShowFighterDetail] = useState(() => {
    const parsed = parseHash(window.location.hash);
    return parsed.tab === 'fighters' && parsed.id !== null;
  });
  const [showEventDetail, setShowEventDetail] = useState(() => {
    const parsed = parseHash(window.location.hash);
    return parsed.tab === 'events' && parsed.id !== null;
  });

  // Mobile drawer panel for detail views
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(() => {
    const parsed = parseHash(window.location.hash);
    return (parsed.tab === 'fighters' || parsed.tab === 'events' || parsed.tab === 'fights');
  });

  // History tracking refs
  const previousHashRef = useRef<string | null>(null);
  const currentHashRef = useRef<string>(window.location.hash);
  
  // Scroll restoration positions cache
  const scrollPositionsRef = useRef<Record<string, number>>({});

  // Floating scroll-to-top tracking
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (tab: 'dashboard' | 'fighters' | 'events' | 'about') => {
    const currentHash = window.location.hash;
    
    if (tab === 'dashboard') {
      if (!currentHash || currentHash === '#' || currentHash === '#dashboard') {
        scrollToTop();
      } else {
        window.location.hash = '';
      }
    } else if (tab === 'fighters') {
      if (currentHash === '#fighters') {
        scrollToTop();
      } else {
        if (currentHash.startsWith('#fighters/')) {
          scrollPositionsRef.current['#fighters'] = 0;
        }
        window.location.hash = 'fighters';
      }
    } else if (tab === 'events') {
      if (currentHash === '#events') {
        scrollToTop();
      } else {
        if (currentHash.startsWith('#events/')) {
          scrollPositionsRef.current['#events'] = 0;
        }
        window.location.hash = 'events';
      }
    } else if (tab === 'about') {
      if (currentHash === '#about') {
        scrollToTop();
      } else {
        window.location.hash = 'about';
      }
    }
  };

  // Bulk loading on bootstrap
  useEffect(() => {
    async function loadDatabase() {
      // Helper function to resolve resource paths dynamically under different host/port or local file setups
      async function robustFetch(filename: string) {
        // Build candidate relative and absolute paths
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
        
        // Filter candidates to unique paths
        const uniquePaths = Array.from(new Set(candidates)).map(p => {
          if (p.includes('://')) {
            const [proto, rest] = p.split('://');
            return proto + '://' + rest.replace(/\/+/g, '/');
          }
          return p.replace(/\/+/g, '/');
        });
        
        const errors: string[] = [];
        for (const path of uniquePaths) {
          try {
            const res = await fetch(path);
            if (res.ok) {
              const data = await res.json();
              if (data) return data;
            } else {
              errors.push(`${path} -> Status: ${res.status} ${res.statusText}`);
            }
          } catch (err: any) {
            errors.push(`${path} -> Error: ${err.message || err}`);
          }
        }
        
        throw new Error(`Failed to load static dataset "${filename}" from any candidate path. Tried:\n` + errors.join('\n'));
      }

      try {
        setIsLoading(true);
        // Load in parallel using our robust fetch system to avoid waterfalls
        const [eventsSummaryData, fightersData, statsSummaryData, championsData] = await Promise.all([
          robustFetch('events-summary.json'),
          robustFetch('fighters.json'),
          robustFetch('stats-summary.json').catch(err => {
            console.warn('Could not load stats-summary.json, falling back to empty', err);
            return null;
          }),
          robustFetch('champions.json').catch(err => {
            console.warn('Could not load champions.json, falling back to empty', err);
            return null;
          })
        ]);

        setEvents(eventsSummaryData);
        setFighters(fightersData);
        setStatsSummary(statsSummaryData);
        setChampions(championsData);

        // Pre-select first items as defaults unless overridden by the hash route
        const initialParsed = parseHash(window.location.hash);
        if (initialParsed.tab === 'fighters' && initialParsed.id !== null) {
          setSelectedFighterId(initialParsed.id);
        } else if (fightersData.length > 0) {
          setSelectedFighterId(fightersData[0].id);
        }

        if (initialParsed.tab === 'events' && initialParsed.id !== null) {
          setSelectedEventId(initialParsed.id);
        } else if (eventsSummaryData.length > 0) {
          setSelectedEventId(eventsSummaryData[eventsSummaryData.length - 1].id); // Select most recent card
        }
      } catch (err: any) {
        console.error(err);
        setErrorStr(err.message || 'Fatal error initializing sports stats engine.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDatabase();
  }, []);

  // Synchronize state with URL hash
  useEffect(() => {
    function handleHashChange() {
      // Save scroll position for the page/hash we are transitioning AWAY from
      const prevHashKey = currentHashRef.current || '#dashboard';
      scrollPositionsRef.current[prevHashKey] = window.scrollY;

      const newHash = window.location.hash;
      const parsed = parseHash(newHash);
      
      // Update history tracking if navigating to a fight detail
      if (newHash.startsWith('#fights/') && !currentHashRef.current.startsWith('#fights/')) {
        previousHashRef.current = currentHashRef.current;
      }
      currentHashRef.current = newHash;
      
      setActiveTab(parsed.tab);
      if (parsed.tab === 'fighters') {
        if (parsed.id !== null) {
          setSelectedFighterId(parsed.id);
          setShowFighterDetail(true);
          setIsMobileDetailOpen(true);
        } else {
          setShowFighterDetail(false);
          setIsMobileDetailOpen(false);
        }
      } else if (parsed.tab === 'events') {
        if (parsed.id !== null) {
          setSelectedEventId(parsed.id);
          setShowEventDetail(true);
          setIsMobileDetailOpen(true);
        } else {
          setShowEventDetail(false);
          setIsMobileDetailOpen(false);
        }
      } else if (parsed.tab === 'fights') {
        if (parsed.fighterAId && parsed.fighterBId) {
          setSelectedFightInfo({
            fighterAId: parsed.fighterAId,
            fighterBId: parsed.fighterBId,
            fightId: parsed.fightId || null
          });
          setIsMobileDetailOpen(true);
        } else {
          setSelectedFightInfo(null);
          setIsMobileDetailOpen(false);
        }
      } else {
        // dashboard
        setIsMobileDetailOpen(false);
      }
    }

    window.addEventListener('hashchange', handleHashChange);
    // Sync hash state on initial render if it already exists
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Restore scroll position or default to top on navigation or detail view changes
  useEffect(() => {
    const currentHash = window.location.hash || '#dashboard';
    const saved = scrollPositionsRef.current[currentHash] || 0;
    
    // Attempt instant scroll
    window.scrollTo({ top: saved, behavior: 'instant' as any });
    
    // Also schedule secondary scrolls in case of rendering/layout delay
    const timer1 = setTimeout(() => {
      window.scrollTo({ top: saved, behavior: 'instant' as any });
    }, 20);

    const timer2 = setTimeout(() => {
      window.scrollTo({ top: saved, behavior: 'instant' as any });
    }, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeTab, selectedFighterId, selectedEventId, showFighterDetail, showEventDetail]);

  // Connected cross-linking helper: Select a fighter from anywhere
  const handleSelectFighterFromAnywhere = (id: number) => {
    const f = fighters.find(item => item.id === id);
    if (f) {
      window.location.hash = `fighters/${id}/${getFighterSlug(f)}`;
    } else {
      window.location.hash = `fighters/${id}`;
    }
  };

  // Connected cross-linking helper: Select an event from anywhere
  const handleSelectEventFromAnywhere = (id: number) => {
    const e = events.find(item => item.id === id);
    if (e) {
      window.location.hash = `events/${id}/${getEventSlug(e)}`;
    } else {
      window.location.hash = `events/${id}`;
    }
  };

  // Find active profiles based on selections, or generate a fallback/loading skeleton if selected but not in standard summary list
  const activeFighter = selectedFighterId !== null 
    ? (fighters.find(f => f.id === selectedFighterId) || {
        id: selectedFighterId,
        firstName: '',
        lastName: '',
        fullName: 'Loading Profile...',
        nickName: null,
        record: { wins: 0, losses: 0, draws: 0, noContests: 0 },
        age: null,
        stance: null,
        height: null,
        weight: null,
        headshot: null,
        fightsParticipated: []
      } as FighterProfile)
    : null;
  const activeEventSummary = events.find(e => e.id === selectedEventId) || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-mono p-6 gap-4" id="applet-loading">
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 1.5 }}
          className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-amber-500"
        />
        <div className="space-y-1 text-center">
          <h1 className="text-sm font-bold uppercase tracking-widest text-slate-100">Syncing StandardMMA Archives</h1>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Consuming compiled JSON datasets. Indexing 1,319 event cards and 4,330 fighters...
          </p>
        </div>
      </div>
    );
  }

  if (errorStr) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-mono p-6 gap-4" id="applet-error">
        <div className="bg-red-500/10 border border-red-550/20 p-6 rounded-xl max-w-md space-y-3 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="font-bold text-sm uppercase tracking-wide text-slate-100">Dataset Initialization Error</h2>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">{errorStr}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative" id="standard-mma-application">

      {/* Top Banner Header */}
      <header role="banner" className="border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-3 md:px-4 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo, title, and Mobile About trigger */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 select-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
              title="Go to Dashboard"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNavClick('dashboard');
                }
              }}
              role="button"
              aria-label="StandardMMA Data Home Dashboard"
            >
              <div className="relative flex items-center justify-center shrink-0">
                {/* Perfectly centered ambient amber glow */}
                <div className="absolute w-6 h-6 bg-amber-500/30 rounded-full blur-md animate-pulse pointer-events-none" aria-hidden="true"></div>
                <div className="relative w-9 h-9 bg-black/60 border border-white/15 flex items-center justify-center rounded-md text-sm font-black text-white shrink-0">
                  <HandFist className="w-5 h-5 text-white animate-pulse" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter italic text-white flex items-center gap-1">
                  StandardMMA <span className="not-italic text-[10px] font-mono font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded ml-2">DATA</span>
                </h1>
                <p className="text-[9px] text-zinc-300 dark:text-white/40 font-mono tracking-widest uppercase">
                  COMBAT SPORTS INTEL SYSTEM
                </p>
              </div>
            </div>

            {/* Mobile About Link & Theme Toggle in the Header */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center p-2 border border-white/10 bg-white/5 text-zinc-200 hover:text-white rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                id="theme-toggle-mobile"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${activeTab === 'about' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 font-black' : 'border-white/10 bg-white/5 text-zinc-200 hover:text-white'}`}
                title="About Site"
                aria-label="About system specifications"
                aria-current={activeTab === 'about' ? 'page' : undefined}
                id="mobile-about-button"
              >
                <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Desktop Tab Selector and Indicators */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
            <nav aria-label="Primary Navigation" className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl flex-1 md:flex-initial justify-between md:justify-start">
              <button
                onClick={() => handleNavClick('dashboard')}
                aria-current={activeTab === 'dashboard' ? 'page' : undefined}
                className={`flex-1 md:flex-initial justify-center px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${activeTab === 'dashboard' ? 'bg-amber-500 text-zinc-950 font-black' : 'text-zinc-200 hover:text-white hover:bg-white/5'}`}
              >
                <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> Dashboard
              </button>
              <button
                onClick={() => handleNavClick('fighters')}
                aria-current={(activeTab === 'fighters' || activeTab === 'fights') ? 'page' : undefined}
                className={`flex-1 md:flex-initial justify-center px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${(activeTab === 'fighters' || activeTab === 'fights') ? 'bg-amber-500 text-zinc-950 font-black' : 'text-zinc-200 hover:text-white hover:bg-white/5'}`}
              >
                <Users className="w-3.5 h-3.5" aria-hidden="true" /> Fighters
              </button>
              <button
                onClick={() => handleNavClick('events')}
                aria-current={activeTab === 'events' ? 'page' : undefined}
                className={`flex-1 md:flex-initial justify-center px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${activeTab === 'events' ? 'bg-amber-500 text-zinc-950 font-black' : 'text-zinc-200 hover:text-white hover:bg-white/5'}`}
              >
                <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" /> Events
              </button>
            </nav>

            {/* Desktop Live Feed, Theme toggle & About controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Theme Toggle Button for desktop/tablet */}
              <button
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="hidden md:flex items-center justify-center gap-1.5 h-[34px] px-2 lg:px-3 border border-white/10 bg-white/5 text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer text-xs font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                id="theme-toggle-desktop"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                    <span className="hidden lg:inline uppercase tracking-wider">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                    <span className="hidden lg:inline uppercase tracking-wider">Dark Mode</span>
                  </>
                )}
              </button>

              {/* About Button (icon-only on tablet, full label on desktop, right-most) */}
              <button
                onClick={() => handleNavClick('about')}
                aria-current={activeTab === 'about' ? 'page' : undefined}
                className={`hidden md:flex items-center justify-center gap-1.5 h-[34px] px-2.5 lg:px-4 border rounded-xl text-xs font-mono font-bold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  activeTab === 'about'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                    : 'border-white/10 bg-white/5 text-zinc-200 hover:text-white hover:bg-white/10 hover:border-white/20'
                }`}
                title="About Site"
                aria-label="About system specifications"
              >
                <Info className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden lg:inline uppercase tracking-wider">About</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Viewport Grid */}
      <main role="main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-3 md:px-4 lg:px-8 py-4 md:py-6 z-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardInsights 
                fighters={fighters}
                events={events}
                statsSummary={statsSummary}
                champions={champions}
                onSelectFighter={handleSelectFighterFromAnywhere}
                onSelectEvent={handleSelectEventFromAnywhere}
              />
            </motion.div>
          )}

          {activeTab === 'fighters' && (
            <motion.div 
              key="fighters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-6"
            >
              {showFighterDetail && activeFighter ? (
                /* Full-Width Detailed View */
                <div className="w-full space-y-4">
                  <button 
                    onClick={() => {
                      window.location.hash = 'fighters';
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-amber-400 hover:text-amber-300 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Fighter Directory
                  </button>
                  
                  <FighterDetail 
                    fighter={activeFighter}
                    onSelectFighter={handleSelectFighterFromAnywhere}
                    onSelectEvent={handleSelectEventFromAnywhere}
                  />
                </div>
              ) : (
                /* Full-Width Directory List / Datagrid */
                <div className="w-full">
                  <FighterList 
                    fighters={fighters}
                    selectedId={selectedFighterId}
                    onSelectFighter={(id) => {
                      const f = fighters.find(item => item.id === id);
                      if (f) {
                        window.location.hash = `fighters/${id}/${getFighterSlug(f)}`;
                      } else {
                        window.location.hash = `fighters/${id}`;
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div 
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-6"
            >
              {showEventDetail && activeEventSummary ? (
                /* Full-Width Detailed View */
                <div className="w-full space-y-4">
                  <button 
                    onClick={() => {
                      window.location.hash = 'events';
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-amber-400 hover:text-amber-300 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Events Directory
                  </button>
                  
                  <EventDetail 
                    eventSummary={activeEventSummary}
                    onSelectFighter={handleSelectFighterFromAnywhere}
                  />
                </div>
              ) : (
                /* Full-Width Directory List / Datagrid */
                <div className="w-full">
                  <EventList 
                    events={events}
                    selectedId={selectedEventId}
                    onSelectEvent={(id) => {
                      const e = events.find(item => item.id === id);
                      if (e) {
                        window.location.hash = `events/${id}/${getEventSlug(e)}`;
                      } else {
                        window.location.hash = `events/${id}`;
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'fights' && selectedFightInfo && (
            <motion.div 
              key="fights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <FightDetail 
                fighterAId={selectedFightInfo.fighterAId}
                fighterBId={selectedFightInfo.fighterBId}
                fightId={selectedFightInfo.fightId}
                onBack={() => {
                  if (previousHashRef.current) {
                    window.location.hash = previousHashRef.current;
                  } else {
                    const f = fighters.find(item => item.id === selectedFightInfo.fighterAId);
                    if (f) {
                      window.location.hash = `fighters/${f.id}/${getFighterSlug(f)}`;
                    } else {
                      window.location.hash = `fighters/${selectedFightInfo.fighterAId}`;
                    }
                  }
                }}
                backLabel={
                  previousHashRef.current?.startsWith('#events') 
                    ? 'Back to Event Card' 
                    : previousHashRef.current?.startsWith('#fighters') 
                      ? 'Back to Fighter Profile' 
                      : 'Back to Profile'
                }
                onSelectFighter={handleSelectFighterFromAnywhere}
                onSelectEvent={handleSelectEventFromAnywhere}
              />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <AboutPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Immersive Footer status bar info */}
      <footer className="bg-black/80 backdrop-blur-md border-t border-white/10 z-10 text-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-3 md:px-4 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-white/60 uppercase">DYNAMIC SECURE METRICS LOADED</span>
            </div>
          </div>
          <div className="text-[10px] text-white/60 tracking-wider font-mono text-center md:text-right">
            StandardMMA DATA FEEDS • v4.0.6
          </div>
        </div>
      </footer>

      {/* Floating Scroll-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={scrollToTop}
            id="scroll-to-top-button"
            className="fixed bottom-6 right-6 z-50 p-3 sm:p-3.5 bg-black/80 backdrop-blur-md border border-amber-500/30 hover:border-amber-500 text-amber-500 hover:text-zinc-950 hover:bg-amber-500 rounded-full shadow-2xl shadow-amber-500/5 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 flex items-center justify-center group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
