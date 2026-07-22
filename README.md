# StandardMMA 🥋

**Live Demo:** [https://examplesofmywork.com/standard-mma/](https://examplesofmywork.com/standard-mma/)

StandardMMA is an interactive, professional-grade tracker and analytics platform for Mixed Martial Arts. Designed as a high-performance Combat Sports Intelligence System, it processes and visualizes fight statistics, fighter profiles, and event details to deliver an elegant, data-driven experience.

---

## 🌟 Key Features

### 📊 1. Interactive Combat Sports Dashboard
- **Executive Insights**: Access a global birds-eye-view of fight datasets (4,330 fighters, 11,701 bouts, and 1,319 events), including active champions, total events tracked, and general fight trends.
- **Adaptive Multi-Viewport Hero**: Features a high-density split layout on desktop screens and a stacked full-width combat schematic on tablet/mobile views for maximum readability.
- **Dynamic Demographics**: Visual breakdowns of weight classes, stance distributions (Orthodox, Southpaw, Switch), and win-method distributions.
- **Champions Showcase**: Interactive display of reigning division champions across weight brackets.

### 👤 2. Fighter Profiles & Deep Stats
- **High-Signal Filtering & Sorting**: Search fighters by name or nickname, filter by status and weight, and sort by high-impact statistics (Wins, Losses, Total Fights/Experience, Win Rate, Alphabetical, Age, Weight, Height).
- **Physical Profiles**: View exact measurements for reach, height, age, and weight.
- **Division Champions Tracking**: Chronological analysis of championship bouts to compile active divisional titleholders and historical records.
- **Fight Histograms & Metrics**: Deep breakdown of a fighter's career, including detailed win/loss histories, visual streaks, and physical advantages.
- **Adaptive Visualizations**: Comparative stat cards that highlight matchup discrepancies with pristine text legibility.
- **Interactive Matchup Previews**: Profile headshots within fight predictive simulations are fully interactive, enabling seamless deep-linking navigation straight to fighter profiles.

### 📅 3. Comprehensive Event & Card Logs
- **Dynamic Card Discovery**: Look up events by city, venue, or card name with a streamlined search system.
- **Deep Fight Details**: Browse the complete fight order (Main Card, Prelims, Early Prelims) with live results, fight durations, and referee details.
- **Round-by-Round Breakdown**: Explore striking metrics, takedown statistics, and method details for individual bouts.

### ♿ 4. Accessibility (a11y) & Inclusivity
- **Keyboard Navigation**: Native focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500`) and keyboard triggers (Enter/Space) across all interactive cards, filters, tables, headshots, and back controls.
- **ARIA Semantic Landmarks**: Rich ARIA labeling (`role="banner"`, `role="main"`, `role="meter"`, `role="log"`, `role="region"`, `aria-expanded`, `aria-live`, `sr-only` descriptions) for assistive screen reader technology.
- **WCAG High Contrast**: Enhanced text contrast ratios across dark and light themes for seamless data readability.

### 🔗 5. Persistent URL Routing & Deeplinking
- **State-Synchronized Routing**: Built on a solid URL-hash navigation engine (`#dashboard`, `#fighters/:id`, `#events/:id`, `#fights/:id`, `#about`) for native back/forward button behavior and easy link sharing.
- **Top-Scroll Restoration**: Clicking the active navigation tab smoothly scroll-restores the viewport to the top of the current page.
- **Responsive Header Controls**: Clean navigation bar with responsive theme toggle (`Dark Mode` / `Light Mode` text on desktop, compact icon button on tablet) and header-mounted About portal.

### 🎨 6. Adaptive Aesthetics, Theme Switcher & System Information
- **High-Contrast Combat Theme**: Premium dark canvas with high-visibility amber accents, accompanied by an instant Light/Dark mode switcher.
- **Responsive Architecture Diagram**: A 4-stage system architecture and data pipeline diagram that gracefully adapts across mobile, tablet (`sm:grid-cols-2`), and desktop (`lg:grid-cols-4`) viewports.
- **Technical Blueprint Screen**: A dedicated custom information sub-screen (`AboutPage`) detailing system tech stack, compiler latency (< 15ms), dataset cache totals, and data pipeline stages.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/) for sub-millisecond hot development reload.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom dark/light combat intelligence aesthetic and high-contrast amber accents.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid page transitions, layout-aware modal animations, and interactive flow glow bars.
- **Icons**: [Lucide React](https://lucide.dev/) for a consistent, crisp vector design icon language.
- **Typography**: Space Grotesk/Inter and JetBrains Mono for data-dense telemetry.

---

## 📂 Project Structure

```bash
├── src/
│   ├── App.tsx                 # Core application controller and routing orchestrator
│   ├── types.ts                # TypeScript interfaces, enums, and shared data schemas
│   ├── main.tsx                # Client-side mounting entry point
│   ├── index.css               # Global styling, Tailwind imports, and custom scrollbar rules
│   │
│   ├── components/             # Reusable UI components
│   │   ├── DashboardInsights.tsx  # Dynamic dashboard visualizations and champion lists
│   │   ├── FighterList.tsx        # Search, filter controls, and list of all fighters
│   │   ├── FighterDetail.tsx      # Comprehensive physical, historical, and stats detail views
│   │   ├── EventList.tsx          # Card/Event listing, filtering, and venue index
│   │   ├── EventDetail.tsx        # Card-specific details, match card grids, and match statuses
│   │   ├── FightDetail.tsx        # Round-by-round analytics and strike telemetry
│   │   └── AboutPage.tsx          # Technical specifications, stack details, and pipeline blueprint
│   │
│   ├── data/                   # Dynamic sports datasets (JSON)
│   │   ├── raw/                # Extracted individual raw bout and fighter cards (excluded from VCS)
│   │   ├── events-summary.json # Compiled events list
│   │   └── fighters.json       # Compiled fighter records
│   └── compiler.ts             # Sports dataset compilation and parsing tool
│
├── public/                     # Static media assets and custom icons
├── package.json                # Project dependencies and deployment tasks
└── vite.config.ts              # Bundler configuration
```

---

## ⚠️ Proprietary Data & Local Execution Notice

> [!IMPORTANT]
> **This repository is a frontend presentation tier and analytics showcase.** The underlying Combat Sports Intelligence dataset (including detailed bout-by-bout telemetry, career history catalogs, and processed event logs) is **proprietary** and is excluded from this public version.
> 
> As a result, **this project is not to be run locally**, as the raw and processed database JSON records are missing. This repository is published strictly for code-style inspection, architectural evaluation, and design reference.

---

## 🎨 System Architecture & Data Flow

StandardMMA uses an offline-first static data model to achieve instantaneous layout changes and sub-millisecond query responses. The diagram below illustrates how raw statistics are processed and how client state routing maps to individual analytics panels.

### Visual Architecture Diagram

```mermaid
graph TD
    subgraph "Data Processing Layer (Proprietary / Offline)"
        R[Raw JSON Bout Scrapes /src/data/raw/*] -->|Parsed by compiler.ts| C[Optimized fighters.json & events-summary.json]
    end

    subgraph "Client Application Engine (StandardMMA React Tier)"
        C -->|Static Compilation Import| App[App.tsx State Orchestrator]
        
        H[URL Hash Router] -->|#dashboard| D[DashboardInsights Component]
        H -->|#fighters| FL[FighterList Component]
        H -->|#events| EL[EventList Component]
        H -->|#about| AB[AboutPage Component]

        FL -->|Fighter Selected| FD[FighterDetail Panel]
        EL -->|Event Selected| ED[EventDetail Card]
        ED -->|Bout Clicked| FiD[FightDetail Drawer]

        App -->|Reactive Prop Distribution| D
        App -->|Reactive Prop Distribution| FL
        App -->|Reactive Prop Distribution| EL
        App -->|Reactive Prop Distribution| AB
    end

    classDef default fill:#151d2a,stroke:#3b4252,stroke-width:1px,color:#e5e9f0;
    classDef router fill:#bf616a,stroke:#bf616a,stroke-width:1px,color:#ffffff;
    classDef data fill:#2e3440,stroke:#4c566a,stroke-width:1px,color:#d8dee9;
    class H router;
    class R,C data;
```

### Static Data Flow Layout

```text
                     +---------------------------------------+
                     |        PROPRIETARY DATA ENGINE        |
                     |  (Excluded from Public Repository)    |
                     +---------------------------------------+
                                         |
                                         | Processed & Compiled
                                         v
                     +---------------------------------------+
                     |  OPTIMIZED DATA CATALOGS (.json)      |
                     |  - fighters.json                      |
                     |  - events-summary.json                |
                     +---------------------------------------+
                                         |
                        Loads statically | into State Engine
                                         v
                     +---------------------------------------+
                     |    App.tsx - REACT STATE CONTROLLER   |
                     +---------------------------------------+
                                         |
       +---------------------------------+---------------------------------+
       | Hash Router (#dashboard)        | Hash Router (#fighters/:id)     | Hash Router (#events/:id)
       v                                 v                                 v
+-----------------------+       +-----------------------+       +-----------------------+
|  DashboardInsights    |       |     FighterList       |       |       EventList       |
|  - Demographic Charts |       |  - Search & Filters   |       |  - Venue Index        |
|  - Active Champions   |       +-----------------------+       +-----------------------+
+-----------------------+                   |                               |
                                            v Select Fighter                v Select Event
                                +-----------------------+       +-----------------------+
                                |     FighterDetail     |       |      EventDetail      |
                                |  - Advantage Radar    |       |  - Main Card Matchups |
                                |  - Fight Chronology   |       +-----------------------+
                                +-----------------------+                   |
                                                                            v Select Bout
                                                                +-----------------------+
                                                                |      FightDetail      |
                                                                |  - Round-by-Round     |
                                                                |  - Strike Telemetry   |
                                                                +-----------------------+
```

---

## 🔒 Optimized Repository Configuration

To keep the codebase lightweight and prevent bloated commits, standard raw scraping JSON sources (including raw individual fight data in `/src/data/raw/`) are excluded from Git commits as per `.gitignore` rules, keeping configuration files like `package.json` intact while excluding gigabytes of raw sources.
