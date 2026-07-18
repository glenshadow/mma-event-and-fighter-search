import { motion } from 'motion/react';
import { 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  Globe, 
  FileJson, 
  Network, 
  Terminal, 
  Activity, 
  PieChart, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Fingerprint,
  Github
} from 'lucide-react';

export default function AboutPage() {
  const techStack = [
    {
      name: 'React 18 + TypeScript',
      role: 'Platform Engine',
      desc: 'Robust type-safe component state orchestration. Fully synchronous hydration and custom routing systems.',
      icon: Cpu,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    },
    {
      name: 'Tailwind CSS',
      role: 'Interface Architecture',
      desc: 'High-contrast, responsive layout utility styling. Customized dark combat-intel dashboard aesthetics.',
      icon: Layers,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    {
      name: 'Vite',
      role: 'Asset Compiler & Bundler',
      desc: 'Fast production bundling with custom build-step hooks for hot-loading static resources.',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      name: 'Recharts & D3',
      role: 'Data Visualization',
      desc: 'Custom dual-trajectory athlete projection graphs, probability scales, and factor analysis charts.',
      icon: PieChart,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
    },
    {
      name: 'Framer Motion',
      role: 'Orchestrations & Micro-flows',
      desc: 'Fluid transitional animations, contextual panel slide-overs, and continuous active data stream glows.',
      icon: Activity,
      color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
    },
    {
      name: 'Static JSON Feed Database',
      role: 'Local Hydration Cache',
      desc: 'Indexed pre-linking database of 1,319 event cards and 4,330 fighters for immediate offline-capable navigation.',
      icon: FileJson,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  const features = [
    {
      title: 'Synchronous Hash Routing',
      desc: 'Instant profile deep-linking, automatic back-track history state cache, and smart layout scroll-restoration to guarantee responsive explorer navigation.'
    },
    {
      title: 'Predictive Matchup Simulator',
      desc: 'Custom-built client-side probability modeling engine. Real-time factor weights assess physical specifications, cage-age at bout, and style matchup dynamics.'
    },
    {
      title: 'Bi-directional Trajectory Modeling',
      desc: 'D3/Recharts-powered dual career metrics projecting fighter peaks, record momentum, and competitive levels through history.'
    },
    {
      title: 'Optimized Image Fallbacks',
      desc: 'Pre-flight URL validation mapped directly with fighter headshots and full-body athlete sheets, falling back gracefully to name initials or vector silhouettes.'
    }
  ];

  return (
    <div className="space-y-12 pb-16 animate-fade-in" id="about-page-container">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c0d12] via-zinc-950 to-[#07080a] border border-white/10 p-8 sm:p-12">
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest rounded uppercase inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20">
              SYSTEM MANIFEST
            </span>
            <a 
              href="https://github.com/glenshadow/mma-event-and-fighter-search"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest rounded uppercase flex items-center gap-1.5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GITHUB SOURCE</span>
            </a>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">
            ABOUT StandardMMA <span className="text-amber-500">INTEL</span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            StandardMMA is an advanced combat sports analytics portal designed to compile, parse, index, and visualize the entirety of professional MMA history. Operating with extreme data density and military-inspired dashboard styling, the platform maps comprehensive career progressions, event histories, and real-time matchup predictions.
          </p>
        </div>
      </div>

      {/* System Architecture Visualization Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-white/10 pb-3">
          <h3 className="text-lg font-black italic uppercase tracking-wider text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-amber-500" /> SYSTEM ARCHITECTURE & DATA PIPELINE
          </h3>
          <span className="text-xs font-mono text-zinc-500">Data-driven compile, render, and prediction lifecycle</span>
        </div>

        {/* High-fidelity Interactive Pipeline Graphic */}
        <div className="bg-[#090a0f] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            
            {/* Visual Graph Architecture Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              
              {/* Node 1 */}
              <div className="bg-zinc-950 border border-white/5 p-5 rounded-xl flex flex-col justify-between relative hover:border-white/10 transition-colors">
                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-zinc-900 border border-white/10 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  STAGE 01
                </div>
                <div className="space-y-3 pt-2">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">MMA Raw Repositories</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                    Official combat metrics, athlete biographical profile records, and card event bout datasets.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-red-400">
                  <span>UNSTRUCTURED DATA</span>
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                </div>
              </div>

              {/* Node 2 */}
              <div className="bg-zinc-950 border border-white/5 p-5 rounded-xl flex flex-col justify-between relative hover:border-white/10 transition-colors">
                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-zinc-900 border border-white/10 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  STAGE 02
                </div>
                <div className="space-y-3 pt-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">Intel Compiler</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                    `compiler.ts` aggregates historical timelines, computes fighter stats, maps images, and validates schema trees.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-amber-400">
                  <span>STATIC COMPILER</span>
                  <Cpu className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Node 3 */}
              <div className="bg-zinc-950 border border-white/5 p-5 rounded-xl flex flex-col justify-between relative hover:border-white/10 transition-colors">
                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-zinc-900 border border-white/10 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  STAGE 03
                </div>
                <div className="space-y-3 pt-2">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">Optimized Cache</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                    Compiled, cross-linked static JSON collections hydrated instantaneously to the browser for robust client rendering.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-violet-400">
                  <span>COMPACT COLLECTS</span>
                  <Fingerprint className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Node 4 */}
              <div className="bg-zinc-950 border border-white/5 p-5 rounded-xl flex flex-col justify-between relative hover:border-white/10 transition-colors">
                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-zinc-900 border border-white/10 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  STAGE 04
                </div>
                <div className="space-y-3 pt-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">Hydrated Viewport</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                    Dynamic dashboards, seamless hash routers, interactive trajectory charts, and outcome simulators.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span>HYDRATED CLIENT</span>
                  <Zap className="w-3.5 h-3.5 animate-bounce" />
                </div>
              </div>

            </div>

            {/* Connecting Visual Flow Details */}
            <div className="hidden md:block relative h-1.5 bg-zinc-900/80 rounded-full border border-white/5 overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute top-0 bottom-0 w-36 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent blur-sm"
              />
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: 'linear', delay: 1.5 }}
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent blur-xs"
              />
            </div>

            {/* Details Box */}
            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <div className="text-xs font-mono text-zinc-400">
                  <span className="text-white font-bold font-sans">Pipeline Status:</span> 100% Client-Side Hydration (No Cold Starts, No Database Bottlenecks).
                </div>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>INTEL-SPEED</span>
                <span className="text-amber-500 font-bold">&lt; 15ms LATENCY</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black italic uppercase tracking-wider text-white border-b border-white/10 pb-3">
          SYSTEM TECH STACK & ENGINE MODULES
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => {
            const IconComponent = tech.icon;
            return (
              <div 
                key={tech.name} 
                className="bg-zinc-950/40 border border-white/10 hover:border-white/20 p-5 rounded-xl flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${tech.color} transition-all group-hover:scale-105`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-wide text-white font-mono">{tech.name}</h4>
                    <span className="text-[10px] font-mono text-amber-500 uppercase font-semibold">{tech.role}</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-black italic uppercase tracking-wider text-white border-b border-white/10 pb-3">
            CORE PLATFORM CAPABILITIES
          </h3>
          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">{feature.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black italic uppercase tracking-wider text-white border-b border-white/10 pb-3">
            COMPILER ARCHIVE DETAILS
          </h3>
          <div className="bg-[#0b0c10]/80 border border-white/10 p-6 rounded-2xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">ATHLETE HISTORIES</span>
                <span className="text-2xl font-black italic tracking-tight font-mono text-white mt-1 block">4,330</span>
                <span className="text-[9px] font-mono text-zinc-600 uppercase block mt-1">Pre-linked bios</span>
              </div>
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">EVENT CARDS</span>
                <span className="text-2xl font-black italic tracking-tight font-mono text-white mt-1 block">1,319</span>
                <span className="text-[9px] font-mono text-zinc-600 uppercase block mt-1">Official MMA list</span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Dataset Mapping Method</span>
                <span className="text-zinc-300 font-bold uppercase">Dynamic Key Joining</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">Image Asset Layering</span>
                <span className="text-zinc-300 font-bold uppercase">Preloaded Referrer Filters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Platform Deployment</span>
                <span className="text-amber-500 font-bold uppercase">Cloud Run CDN Static</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  window.location.hash = '';
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-black uppercase text-xs rounded-xl tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
              >
                <span>Initialize Simulation Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
