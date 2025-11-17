# Web UI Implementation Plan - Module Dependency Analysis

**Date:** 2025-11-16  
**Status:** Planning  
**Target:** c3-web (React Frontend)  
**API:** c3-bff Module Analysis Endpoints

---

## 📋 Executive Summary

This document outlines the plan to build a modern, interactive web UI in c3-web to expose the Module Dependency Analysis functionality from the c3-bff API.

### What We're Building:
- **Module Analysis Dashboard** - Upload/analyze codebases
- **Interactive Dependency Graph** - D3.js visualization
- **Architecture Validation Dashboard** - Clean Architecture scoring
- **Analysis History** - Browse past analyses
- **Export Tools** - Download in multiple formats
- **Real-time Analysis** - Progress tracking

---

## 🎯 User Stories

### As a Developer, I want to...
1. Upload a codebase path and analyze its module dependencies
2. See an interactive visualization of module relationships
3. Identify hotspots (most-used modules)
4. Detect circular dependencies visually
5. Get architecture health scores with explanations
6. Export graphs in multiple formats (SVG, JSON, GraphML)
7. Browse my analysis history
8. Compare analyses over time

### As a Tech Lead, I want to...
1. Validate Clean Architecture compliance
2. See coupling metrics and trends
3. Get actionable recommendations
4. Share analysis results with the team
5. Track architectural improvements over time

### As an Architect, I want to...
1. Enforce architectural rules
2. Monitor architecture health scores
3. Identify architectural violations
4. Document architectural decisions with evidence

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        c3-web (React)                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Pages                                                 │ │
│  │  • ModuleAnalysisPage (NEW)                          │ │
│  │  • AnalysisHistoryPage (NEW)                         │ │
│  │  • ArchitectureValidationPage (NEW)                  │ │
│  │  • ProjectionPage (Enhanced)                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                         ↓                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Features                                              │ │
│  │  • module-analysis/                                   │ │
│  │    - api/analysis.api.ts                             │ │
│  │    - hooks/useAnalysis.ts                            │ │
│  │    - ui/AnalysisForm.tsx                             │ │
│  │    - ui/AnalysisResults.tsx                          │ │
│  │    - ui/ModuleList.tsx                               │ │
│  │    - ui/DependencyTable.tsx                          │ │
│  │  • graph-visualization/                              │ │
│  │    - ui/InteractiveGraph.tsx                         │ │
│  │    - ui/GraphControls.tsx                            │ │
│  │    - ui/GraphLegend.tsx                              │ │
│  │    - hooks/useGraphData.ts                           │ │
│  │  • architecture-validation/                          │ │
│  │    - ui/ValidationDashboard.tsx                      │ │
│  │    - ui/ScoreCard.tsx                                │ │
│  │    - ui/ViolationList.tsx                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                         ↓                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Widgets                                               │ │
│  │  • module-graph-viewer/ (NEW)                        │ │
│  │  • architecture-score-card/ (NEW)                    │ │
│  │  • hotspot-detector/ (NEW)                           │ │
│  │  • cycle-detector/ (NEW)                             │ │
│  │  • export-menu/ (NEW)                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                         ↓                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Shared                                                │ │
│  │  • api/client.ts (Enhanced)                          │ │
│  │  • hooks/useApi.ts (NEW)                             │ │
│  │  • utils/graphLayout.ts (NEW)                        │ │
│  │  • types/analysis.types.ts (NEW)                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST
                      ↓
              ┌───────────────┐
              │   c3-bff API  │
              │  Port: 3001   │
              └───────────────┘
```

---

## 🎨 UI Design & Wireframes

### 1. Module Analysis Page

```
┌────────────────────────────────────────────────────────────┐
│  C3 Platform              [Dashboard] [Analysis] [History]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📊 Module Dependency Analysis                             │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Analyze Codebase                                     │ │
│  │                                                      │ │
│  │  Codebase Path *                                     │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ /Users/user/dev/my-project/src                 │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │  Aggregation Level                                   │ │
│  │  ○ Directory  ● Top-Level  ○ Package               │ │
│  │                                                      │ │
│  │  ☐ Include test files                               │ │
│  │  ☐ Include private members                          │ │
│  │                                                      │ │
│  │  Exclude Patterns (optional)                         │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ node_modules, dist, **/*.test.ts               │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │         [Analyze Codebase] [Advanced Settings]      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 📈 Analysis Results                                  │ │
│  │                                                      │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │ │
│  │  │   12   │ │   36   │ │   19   │ │  100   │       │ │
│  │  │Modules │ │ Files  │ │  Deps  │ │ Score  │       │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘       │ │
│  │                                                      │ │
│  │  [View Graph] [Validate Architecture] [Export ▼]    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🎯 Key Insights                                      │ │
│  │                                                      │ │
│  │  Hotspots (Most Used)                                │ │
│  │  1. entities (used by 7 modules)                     │ │
│  │  2. value-objects (used by 5 modules)                │ │
│  │  3. ports (used by 5 modules)                        │ │
│  │                                                      │ │
│  │  ✅ No circular dependencies detected                │ │
│  │  ⚠️  2 modules with high coupling (>5 dependencies) │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 2. Interactive Dependency Graph

```
┌────────────────────────────────────────────────────────────┐
│  Module Dependency Graph            [🔍] [⛶] [↻] [Export]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐    ┌─────────────────────────────────┐  │
│  │ Controls     │    │                                 │  │
│  │              │    │        entities ●───────┐       │  │
│  │ Layout:      │    │            │            │       │  │
│  │ ● Hierarchical│   │            ↓            ↓       │  │
│  │ ○ Force      │    │      value-objects  services   │  │
│  │ ○ Circular   │    │            │            │       │  │
│  │              │    │            ↓            ↓       │  │
│  │ Color By:    │    │     infrastructure  ports      │  │
│  │ ● Dependencies│   │                                 │  │
│  │ ○ Complexity │    │                                 │  │
│  │ ○ Layer      │    │                                 │  │
│  │              │    │                                 │  │
│  │ Show:        │    │  ● Large = More files          │  │
│  │ ☑ Labels     │    │  🔴 Red = High coupling        │  │
│  │ ☑ Metrics    │    │  🟢 Green = Low coupling       │  │
│  │ ☐ Paths      │    │                                 │  │
│  │              │    │  [Click to view module details] │  │
│  └──────────────┘    └─────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Module Details: entities                             │ │
│  │                                                      │ │
│  │  Files: 8  │  Dependencies: 0  │  Dependents: 7     │ │
│  │                                                      │ │
│  │  Contained Files:                                    │ │
│  │  • Node.ts                                           │ │
│  │  • Edge.ts                                           │ │
│  │  • PropertyGraph.ts                                  │ │
│  │  • Module.ts                                         │ │
│  │  ...                                                 │ │
│  │                                                      │ │
│  │  Used By: services, strategies, infrastructure...    │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 3. Architecture Validation Dashboard

```
┌────────────────────────────────────────────────────────────┐
│  Architecture Validation                    Grade: A+ 🏆    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Overall Score                                        │ │
│  │                                                      │ │
│  │       ┌─────────────────────────────┐               │ │
│  │       │                             │               │ │
│  │       │           100               │               │ │
│  │       │         ───────             │               │ │
│  │       │          100                │               │ │
│  │       │                             │               │ │
│  │       │    Excellent! ✨            │               │ │
│  │       └─────────────────────────────┘               │ │
│  │                                                      │ │
│  │  Your architecture follows Clean Architecture       │ │
│  │  principles perfectly!                               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Validation Checks                                    │ │
│  │                                                      │ │
│  │  ✅ Domain Independence          PASS                │ │
│  │     Domain has 0 outward dependencies                │ │
│  │                                                      │ │
│  │  ✅ Application Layer             PASS                │ │
│  │     Application properly depends on Domain only      │ │
│  │                                                      │ │
│  │  ✅ Circular Dependencies         PASS                │ │
│  │     No circular dependencies detected                │ │
│  │                                                      │ │
│  │  ✅ Dependency Direction          PASS                │ │
│  │     All dependencies flow inward                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Layer Summary                                        │ │
│  │                                                      │ │
│  │  🟣 Domain         4 modules  │  Core business logic │ │
│  │  🔵 Application    2 modules  │  Use cases          │ │
│  │  🟢 Infrastructure 5 modules  │  External adapters  │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 4. Analysis History Page

```
┌────────────────────────────────────────────────────────────┐
│  Analysis History                          [New Analysis]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Filters: [All Projects ▼] [Last 30 Days ▼] [Search...]   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Date       │ Project          │ Modules │ Score │    │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 2025-11-16 │ c3-projection    │   12    │ 100   │ 👁️ │ │
│  │ 10:45 AM   │ /dev/c3-.../src  │         │       │    │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 2025-11-15 │ c3-parsing       │   15    │  95   │ 👁️ │ │
│  │ 03:22 PM   │ /dev/c3-.../src  │         │       │    │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 2025-11-14 │ my-app           │   24    │  78   │ 👁️ │ │
│  │ 11:15 AM   │ /projects/.../src│         │  ⚠️    │    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Showing 3 of 25                    [← Previous] [Next →] │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Stack

### Current Stack (c3-web)
- React 18.2.0
- React Router DOM 6.20.1
- TypeScript 5.3.3
- Vite 5.0.8

### New Dependencies to Add
```json
{
  "dependencies": {
    "d3": "^7.8.5",
    "@types/d3": "^7.4.3",
    "react-query": "^3.39.3",
    "zustand": "^4.4.7",
    "recharts": "^2.10.3",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwindcss": "^3.3.6",
    "@headlessui/react": "^1.7.17",
    "framer-motion": "^10.16.16"
  }
}
```

### Libraries Explained
- **d3**: Interactive graph visualization
- **react-query**: API data fetching & caching
- **zustand**: Lightweight state management
- **recharts**: Chart components for metrics
- **react-hot-toast**: Toast notifications
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS
- **@headlessui/react**: Accessible UI components
- **framer-motion**: Smooth animations

---

## 📂 File Structure

```
c3-web/
├── src/
│   ├── features/
│   │   ├── module-analysis/              # NEW
│   │   │   ├── api/
│   │   │   │   └── analysis.api.ts       # API client
│   │   │   ├── hooks/
│   │   │   │   ├── useAnalysis.ts        # Analysis hook
│   │   │   │   ├── useAnalysisHistory.ts # History hook
│   │   │   │   └── useExport.ts          # Export hook
│   │   │   ├── types/
│   │   │   │   └── analysis.types.ts     # TypeScript types
│   │   │   ├── ui/
│   │   │   │   ├── AnalysisForm.tsx      # Input form
│   │   │   │   ├── AnalysisResults.tsx   # Results display
│   │   │   │   ├── ModuleList.tsx        # Module table
│   │   │   │   ├── DependencyTable.tsx   # Dependency table
│   │   │   │   ├── HotspotList.tsx       # Hotspot display
│   │   │   │   └── MetricsCards.tsx      # Summary cards
│   │   │   └── utils/
│   │   │       └── analysis.utils.ts     # Helper functions
│   │   │
│   │   ├── graph-visualization/          # NEW
│   │   │   ├── hooks/
│   │   │   │   ├── useGraphData.ts       # Graph data hook
│   │   │   │   ├── useGraphLayout.ts     # Layout hook
│   │   │   │   └── useGraphInteraction.ts# Interaction hook
│   │   │   ├── ui/
│   │   │   │   ├── InteractiveGraph.tsx  # Main graph component
│   │   │   │   ├── GraphControls.tsx     # Control panel
│   │   │   │   ├── GraphLegend.tsx       # Legend
│   │   │   │   ├── GraphToolbar.tsx      # Toolbar
│   │   │   │   ├── NodeDetails.tsx       # Node detail panel
│   │   │   │   └── MiniMap.tsx           # Navigation minimap
│   │   │   └── utils/
│   │   │       ├── graphLayout.ts        # D3 layout logic
│   │   │       ├── graphRenderer.ts      # D3 rendering
│   │   │       └── graphInteractions.ts  # Zoom, pan, etc.
│   │   │
│   │   ├── architecture-validation/      # NEW
│   │   │   ├── api/
│   │   │   │   └── validation.api.ts     # Validation API
│   │   │   ├── hooks/
│   │   │   │   └── useValidation.ts      # Validation hook
│   │   │   ├── ui/
│   │   │   │   ├── ValidationDashboard.tsx # Main dashboard
│   │   │   │   ├── ScoreCard.tsx         # Score display
│   │   │   │   ├── CheckList.tsx         # Validation checks
│   │   │   │   ├── LayerSummary.tsx      # Layer summary
│   │   │   │   └── ViolationDetails.tsx  # Violation details
│   │   │   └── utils/
│   │   │       └── scoring.utils.ts      # Score calculation
│   │   │
│   │   ├── compliance/                   # EXISTING
│   │   └── discovery/                    # EXISTING
│   │
│   ├── pages/
│   │   ├── module-analysis/              # NEW
│   │   │   ├── ModuleAnalysisPage.tsx    # Main analysis page
│   │   │   ├── AnalysisDetailPage.tsx    # Analysis detail view
│   │   │   └── AnalysisHistoryPage.tsx   # History page
│   │   ├── architecture/                 # NEW
│   │   │   └── ArchitectureValidationPage.tsx
│   │   ├── compliance/                   # EXISTING
│   │   ├── dashboard/                    # EXISTING
│   │   ├── discovery/                    # EXISTING
│   │   └── projection/                   # EXISTING (enhance)
│   │
│   ├── widgets/
│   │   ├── module-graph-viewer/          # NEW
│   │   │   └── ModuleGraphViewer.tsx
│   │   ├── architecture-score-card/      # NEW
│   │   │   └── ArchitectureScoreCard.tsx
│   │   ├── hotspot-detector/             # NEW
│   │   │   └── HotspotDetector.tsx
│   │   ├── cycle-detector/               # NEW
│   │   │   └── CycleDetector.tsx
│   │   ├── export-menu/                  # NEW
│   │   │   └── ExportMenu.tsx
│   │   ├── compliance-summary/           # EXISTING
│   │   └── graph-viewer/                 # EXISTING
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   ├── client.ts                 # ENHANCED
│   │   │   └── endpoints.ts              # NEW - API endpoints
│   │   ├── hooks/
│   │   │   ├── useApi.ts                 # NEW - Generic API hook
│   │   │   ├── useDebounce.ts            # NEW - Debounce hook
│   │   │   └── useLocalStorage.ts        # NEW - Local storage
│   │   ├── types/
│   │   │   ├── api.types.ts              # NEW - API response types
│   │   │   └── common.types.ts           # NEW - Common types
│   │   ├── utils/
│   │   │   ├── format.ts                 # NEW - Formatting utils
│   │   │   ├── download.ts               # NEW - Download utils
│   │   │   └── colors.ts                 # NEW - Color schemes
│   │   ├── ui/
│   │   │   ├── Button/                   # NEW
│   │   │   ├── Card/                     # NEW
│   │   │   ├── Badge/                    # NEW
│   │   │   ├── Spinner/                  # NEW
│   │   │   ├── ErrorBoundary/            # NEW
│   │   │   └── Layout/                   # EXISTING
│   │   └── store/
│   │       └── analysisStore.ts          # NEW - Zustand store
│   │
│   ├── app/
│   │   ├── App.tsx                       # ENHANCED - Add routes
│   │   └── styles/
│   │       ├── globals.css               # ENHANCED - Add Tailwind
│   │       └── graph.css                 # NEW - Graph styles
│   │
│   └── main.tsx                          # EXISTING
│
├── public/
│   └── examples/                         # NEW
│       └── sample-analysis.json          # Sample data
│
├── tailwind.config.js                    # NEW
├── postcss.config.js                     # NEW
└── package.json                          # ENHANCED
```

---

## 🔌 API Integration

### API Client Enhancement

**File:** `src/shared/api/client.ts`

```typescript
// Enhanced API client with better error handling and types
export class ApiClient {
  private baseURL = 'http://localhost:3001/api';

  async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.code, data.error?.message);
    }

    return data;
  }

  // Module Analysis
  async analyzeModules(config: AnalysisConfig): Promise<ApiResponse<Analysis>> {
    return this.request('/projections/modules/analyze', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async getAnalysis(id: string): Promise<ApiResponse<Analysis>> {
    return this.request(`/projections/modules/${id}`);
  }

  async exportAnalysis(id: string, format: ExportFormat): Promise<ApiResponse<Export>> {
    return this.request(`/projections/modules/${id}/export?format=${format}`);
  }

  async validateArchitecture(config: ValidationConfig): Promise<ApiResponse<Validation>> {
    return this.request('/projections/modules/validate', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async listAnalyses(params?: ListParams): Promise<ApiResponse<AnalysisList>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/projections/modules?${query}`);
  }

  async deleteAnalysis(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/projections/modules/${id}`, {
      method: 'DELETE'
    });
  }
}

export const apiClient = new ApiClient();
```

---

## 📊 State Management

### Zustand Store

**File:** `src/shared/store/analysisStore.ts`

```typescript
import create from 'zustand';

interface AnalysisState {
  // Current analysis
  currentAnalysis: Analysis | null;
  setCurrentAnalysis: (analysis: Analysis | null) => void;

  // Analysis history
  history: AnalysisHistoryItem[];
  addToHistory: (item: AnalysisHistoryItem) => void;

  // Graph state
  selectedNode: string | null;
  setSelectedNode: (nodeId: string | null) => void;

  // UI state
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;

  // Graph layout preferences
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;

  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;

  // Filters
  filters: GraphFilters;
  setFilters: (filters: GraphFilters) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  history: [],
  addToHistory: (item) => set((state) => ({
    history: [item, ...state.history]
  })),

  selectedNode: null,
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),

  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  layout: 'hierarchical',
  setLayout: (layout) => set({ layout }),

  colorScheme: 'dependencies',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),

  filters: {},
  setFilters: (filters) => set({ filters })
}));
```

---

## 🎨 Component Examples

### 1. Analysis Form Component

**File:** `src/features/module-analysis/ui/AnalysisForm.tsx`

```typescript
export function AnalysisForm({ onAnalyze }: AnalysisFormProps) {
  const [rootPath, setRootPath] = useState('');
  const [aggregationLevel, setAggregationLevel] = useState<AggregationLevel>('top-level');
  const [includeTests, setIncludeTests] = useState(false);
  const [excludePatterns, setExcludePatterns] = useState('node_modules, dist, **/*.test.ts');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAnalyze({
      rootPath,
      config: {
        aggregationLevel,
        includeTests,
        excludePatterns: excludePatterns.split(',').map(s => s.trim())
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="rootPath" className="block text-sm font-medium">
          Codebase Path *
        </label>
        <input
          id="rootPath"
          type="text"
          value={rootPath}
          onChange={(e) => setRootPath(e.target.value)}
          placeholder="/Users/user/dev/my-project/src"
          className="mt-1 block w-full rounded-md border-gray-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Aggregation Level
        </label>
        <div className="space-x-4">
          <RadioButton
            checked={aggregationLevel === 'directory'}
            onChange={() => setAggregationLevel('directory')}
            label="Directory"
          />
          <RadioButton
            checked={aggregationLevel === 'top-level'}
            onChange={() => setAggregationLevel('top-level')}
            label="Top-Level"
          />
          <RadioButton
            checked={aggregationLevel === 'package'}
            onChange={() => setAggregationLevel('package')}
            label="Package"
          />
        </div>
      </div>

      <Checkbox
        checked={includeTests}
        onChange={setIncludeTests}
        label="Include test files"
      />

      <div>
        <label htmlFor="excludePatterns" className="block text-sm font-medium">
          Exclude Patterns (comma-separated)
        </label>
        <input
          id="excludePatterns"
          type="text"
          value={excludePatterns}
          onChange={(e) => setExcludePatterns(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <Button type="submit">
        Analyze Codebase
      </Button>
    </form>
  );
}
```

### 2. Interactive Graph Component

**File:** `src/features/graph-visualization/ui/InteractiveGraph.tsx`

```typescript
export function InteractiveGraph({ analysis }: InteractiveGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { selectedNode, setSelectedNode } = useAnalysisStore();
  const { layout, colorScheme } = useAnalysisStore();

  useEffect(() => {
    if (!svgRef.current || !analysis) return;

    // Initialize D3 graph
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create graph data
    const graphData = transformToGraphData(analysis, layout, colorScheme);

    // Apply layout
    const simulation = applyForceLayout(graphData, width, height);

    // Render nodes
    const nodes = renderNodes(svg, graphData.nodes, {
      onClick: setSelectedNode,
      colorScheme
    });

    // Render edges
    const edges = renderEdges(svg, graphData.edges);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });

    svg.call(zoom as any);

    return () => {
      simulation.stop();
    };
  }, [analysis, layout, colorScheme]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      {selectedNode && (
        <NodeDetails
          nodeId={selectedNode}
          analysis={analysis}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
```

### 3. Architecture Score Card

**File:** `src/features/architecture-validation/ui/ScoreCard.tsx`

```typescript
export function ScoreCard({ validation }: ScoreCardProps) {
  const { score, grade, checks } = validation;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeEmoji = (grade: string) => {
    if (grade === 'A+') return '🏆';
    if (grade === 'A') return '✨';
    if (grade === 'B') return '👍';
    if (grade === 'C') return '⚠️';
    return '❌';
  };

  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="text-6xl mb-2">{getGradeEmoji(grade)}</div>
        <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="text-gray-500 text-sm">out of 100</div>
        <div className="mt-4">
          <Badge variant={score >= 90 ? 'success' : 'warning'}>
            Grade: {grade}
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {Object.entries(checks).map(([key, check]) => (
          <CheckItem key={key} check={check} />
        ))}
      </div>
    </Card>
  );
}
```

---

## 📅 Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Set up infrastructure and basic UI

#### Tasks:
- [x] Install dependencies (Tailwind, D3, React Query, Zustand)
- [ ] Configure Tailwind CSS
- [ ] Create shared UI components (Button, Card, Badge, etc.)
- [ ] Set up API client with TypeScript types
- [ ] Create Zustand store for state management
- [ ] Add new routes to App.tsx
- [ ] Create basic page layouts

**Deliverables:**
- Tailwind configured
- Shared UI component library
- API client ready
- Basic routing in place

---

### Phase 2: Analysis Form & Results (Week 2)
**Goal:** Allow users to analyze codebases and view results

#### Tasks:
- [ ] Create AnalysisForm component
- [ ] Create AnalysisResults component
- [ ] Create MetricsCards component
- [ ] Implement useAnalysis hook with React Query
- [ ] Create ModuleList component
- [ ] Create DependencyTable component
- [ ] Create HotspotList component
- [ ] Add loading states and error handling
- [ ] Add toast notifications

**Deliverables:**
- Working analysis form
- Results display with metrics
- Error handling

---

### Phase 3: Graph Visualization (Week 3-4)
**Goal:** Interactive D3.js graph visualization

#### Tasks:
- [ ] Create InteractiveGraph component
- [ ] Implement D3 force-directed layout
- [ ] Implement D3 hierarchical layout
- [ ] Create GraphControls component
- [ ] Create GraphLegend component
- [ ] Add zoom and pan interactions
- [ ] Create NodeDetails panel
- [ ] Add node selection and highlighting
- [ ] Implement color schemes (dependencies, complexity, layer)
- [ ] Add minimap for navigation
- [ ] Create GraphToolbar with export button

**Deliverables:**
- Fully interactive graph visualization
- Multiple layout options
- Node interaction and details
- Export functionality

---

### Phase 4: Architecture Validation (Week 5)
**Goal:** Clean Architecture validation dashboard

#### Tasks:
- [ ] Create ValidationDashboard component
- [ ] Create ScoreCard component
- [ ] Create CheckList component
- [ ] Create LayerSummary component
- [ ] Create ViolationDetails component
- [ ] Implement useValidation hook
- [ ] Add validation API integration
- [ ] Create architecture scoring logic
- [ ] Add recommendations display

**Deliverables:**
- Architecture validation dashboard
- Score visualization
- Violation reporting

---

### Phase 5: History & Export (Week 6)
**Goal:** Analysis history and export functionality

#### Tasks:
- [ ] Create AnalysisHistoryPage
- [ ] Create history list component
- [ ] Implement pagination
- [ ] Add search and filters
- [ ] Create ExportMenu component
- [ ] Implement download functionality (JSON, GraphML, SVG, Markdown)
- [ ] Add local storage for recent analyses
- [ ] Create comparison view (optional)

**Deliverables:**
- Analysis history page
- Export functionality
- Search and filtering

---

### Phase 6: Polish & Testing (Week 7)
**Goal:** Polish UI, add animations, and test

#### Tasks:
- [ ] Add Framer Motion animations
- [ ] Improve responsive design
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Create loading skeletons
- [ ] Add empty states
- [ ] Write component tests
- [ ] Create Storybook stories (optional)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

**Deliverables:**
- Polished, production-ready UI
- Responsive design
- Accessibility compliance

---

## 🎯 Success Metrics

### User Experience
- [ ] Analysis completes in < 15 seconds for medium codebases
- [ ] Graph renders in < 2 seconds
- [ ] Smooth 60fps interactions (zoom, pan, drag)
- [ ] Mobile-responsive design
- [ ] Accessibility score > 90 (Lighthouse)

### Functionality
- [ ] All API endpoints integrated
- [ ] All export formats working
- [ ] Graph visualization interactive
- [ ] Architecture validation accurate
- [ ] History with search/filter working

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] Zero console errors/warnings
- [ ] Component test coverage > 70%
- [ ] Lighthouse performance score > 85

---

## 🔐 Security Considerations

### Frontend Security
- [ ] Input sanitization for file paths
- [ ] XSS prevention in rendered data
- [ ] CSRF protection
- [ ] Secure API communication (HTTPS in production)
- [ ] No sensitive data in localStorage
- [ ] Content Security Policy headers

---

## 📚 Documentation

### Developer Documentation
- [ ] Component API documentation
- [ ] State management guide
- [ ] D3 graph customization guide
- [ ] API integration guide
- [ ] Deployment guide

### User Documentation
- [ ] User guide with screenshots
- [ ] Video tutorials
- [ ] FAQ section
- [ ] Troubleshooting guide

---

## 🚀 Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:5173
# Proxies API to http://localhost:3001
```

### Production Build
```bash
npm run build
# Outputs to dist/
# Deploy to Vercel/Netlify/AWS S3
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## 🎨 Design System

### Colors
```css
/* Primary */
--primary-50: #f0f9ff;
--primary-500: #3b82f6;
--primary-700: #1d4ed8;

/* Success */
--success-50: #f0fdf4;
--success-500: #22c55e;

/* Warning */
--warning-50: #fefce8;
--warning-500: #eab308;

/* Error */
--error-50: #fef2f2;
--error-500: #ef4444;

/* Graph Colors */
--graph-node-low: #10b981;
--graph-node-medium: #f59e0b;
--graph-node-high: #ef4444;
```

### Typography
```css
/* Headers */
h1: 2.5rem / 600
h2: 2rem / 600
h3: 1.5rem / 600

/* Body */
body: 1rem / 400
small: 0.875rem / 400
```

---

## ✅ Acceptance Criteria

### Must Have (MVP)
- [x] User can input codebase path and analyze
- [ ] User can view analysis results (metrics)
- [ ] User can see interactive graph visualization
- [ ] User can export graph (JSON, SVG, GraphML)
- [ ] User can validate architecture
- [ ] User can view analysis history
- [ ] Responsive design (desktop & tablet)
- [ ] Error handling with user-friendly messages

### Should Have (V1.1)
- [ ] Real-time progress during analysis
- [ ] Compare two analyses
- [ ] Save favorite analyses
- [ ] Share analysis via URL
- [ ] Dark mode
- [ ] Advanced graph filters
- [ ] Mobile support

### Could Have (V2.0)
- [ ] Collaborative features (comments, annotations)
- [ ] GitHub integration (analyze repos directly)
- [ ] Trend analysis over time
- [ ] Custom architecture rules
- [ ] AI-powered recommendations
- [ ] Scheduled analysis

---

## 📞 Support & Resources

### Design Resources
- Figma mockups (to be created)
- Design system documentation
- Component library (Tailwind UI / Headless UI)

### Development Resources
- D3.js documentation: https://d3js.org
- React Query documentation: https://tanstack.com/query
- Zustand documentation: https://zustand-demo.pmnd.rs
- Tailwind CSS documentation: https://tailwindcss.com

---

## 🎉 Summary

This plan outlines a comprehensive, modern web UI for the Module Dependency Analysis functionality, including:

✅ **7-week implementation timeline**  
✅ **6 implementation phases**  
✅ **Complete component architecture**  
✅ **Interactive D3.js visualizations**  
✅ **State management with Zustand**  
✅ **API integration with React Query**  
✅ **Responsive, accessible design**  
✅ **Export functionality**  
✅ **Architecture validation dashboard**  

The UI will provide an intuitive, powerful interface for developers and architects to analyze, visualize, and validate their codebase architecture.

---

**Plan Status:** Ready for Implementation 🚀  
**Estimated Effort:** 6-7 weeks  
**Priority:** High  
**Dependencies:** c3-bff API (✅ Complete)

---

*Plan created: 2025-11-16*  
*Version: 1.0.0*


