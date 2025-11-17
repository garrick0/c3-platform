# C3 Platform Quickstart Guide

**Complete guide to running, testing, and understanding the C3 Module Dependency Analysis system**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start (5 Minutes)](#quick-start-5-minutes)
4. [Running the Backend (c3-bff)](#running-the-backend-c3-bff)
5. [Running the Frontend (c3-web)](#running-the-frontend-c3-web)
6. [Testing & Validation](#testing--validation)
7. [Main Functionality](#main-functionality)
8. [Common Commands Reference](#common-commands-reference)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)
- **Terminal**: bash, zsh, or similar

### Check Your Installation
```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show v9.x.x or higher
```

### Repository Structure
```
/Users/samuelgleeson/dev/
├── c3-bff/           # Backend API (Express.js)
├── c3-web/           # Frontend UI (React + Vite)
├── c3-parsing/       # Code parsing library
├── c3-projection/    # Architecture projection library
└── c3-platform/      # Platform docs (you are here)
```

---

## Architecture Overview

### System Components

```
┌─────────────┐      HTTP/REST      ┌─────────────┐
│             │ ◄──────────────────► │             │
│   c3-web    │   http://localhost   │   c3-bff    │
│  (Frontend) │        :3001         │  (Backend)  │
│             │                      │             │
└─────────────┘                      └─────────────┘
      │                                     │
      │                                     │
      ▼                                     ▼
React + Vite                    ┌─────────────────────┐
D3.js Graphs                    │  c3-parsing         │
Zustand State                   │  c3-projection      │
React Query                     │  c3-wiring (DI)     │
                                └─────────────────────┘
```

### What Each Component Does

| Component | Purpose | Technology |
|-----------|---------|------------|
| **c3-web** | User interface for visualizing module dependencies | React 18, Vite, D3.js, Tailwind CSS |
| **c3-bff** | Backend-for-frontend API server | Express.js, TypeScript |
| **c3-parsing** | Parses TypeScript code into property graph | TypeScript AST, ESTree |
| **c3-projection** | Projects graphs into architectural views | Module dependency analysis |

---

## Quick Start (5 Minutes)

### 1. Open Three Terminal Windows

```bash
# Terminal 1: Backend (c3-bff)
cd /Users/samuelgleeson/dev/c3-bff

# Terminal 2: Frontend (c3-web)
cd /Users/samuelgleeson/dev/c3-web

# Terminal 3: Testing/Commands
cd /Users/samuelgleeson/dev
```

### 2. Install Dependencies (First Time Only)

**Terminal 1 (c3-bff):**
```bash
npm install
```

**Terminal 2 (c3-web):**
```bash
npm install
```

### 3. Start the Backend

**Terminal 1 (c3-bff):**
```bash
npm run build && npm start
```

Expected output:
```
✅ Parsing context registered
✅ Projection context registered
Compliance context registered
Discovery context registered
[BFF] INFO: BFF server running { host: 'localhost', port: 3001, env: 'development' }

🚀 C3 BFF Server running at http://localhost:3001
```

### 4. Start the Frontend

**Terminal 2 (c3-web):**
```bash
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 5. Open in Browser

**Terminal 3 (or use your browser):**
```bash
open http://localhost:5173
```

**✅ Success!** You should see the C3 Web UI homepage.

---

## Running the Backend (c3-bff)

### Directory
```bash
cd /Users/samuelgleeson/dev/c3-bff
```

### Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm install` | Install dependencies | First time or after pulling updates |
| `npm run build` | Compile TypeScript to JavaScript | Before running or after code changes |
| `npm start` | Start the production server | Normal operation |
| `npm run dev` | Start with hot reload (if configured) | Development |
| `npm test` | Run tests | Validate functionality |
| `npm run typecheck` | Check TypeScript types | Before committing |

### Start the Backend (Standard)

```bash
# Build and start
npm run build && npm start
```

### Start the Backend (Development with Auto-Restart)

```bash
# If you have nodemon or similar
npm run dev
```

### Check Backend Health

**Terminal 3:**
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T05:30:48.255Z"
}
```

### Backend Port
- **Default:** `http://localhost:3001`
- **Change:** Set `PORT` environment variable
  ```bash
  PORT=4000 npm start
  ```

### Backend Logs

The backend logs all requests and operations:

```
[BFF:HTTP] INFO: HTTP Request {
  method: 'POST',
  path: '/modules/analyze',
  status: 200,
  duration: 11571
}
```

**Log Levels:**
- `INFO` - Normal operations
- `WARN` - Warnings (non-critical)
- `ERROR` - Errors (critical)

---

## Running the Frontend (c3-web)

### Directory
```bash
cd /Users/samuelgleeson/dev/c3-web
```

### Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm install` | Install dependencies | First time or after pulling updates |
| `npm run dev` | Start development server with HMR | Development |
| `npm run build` | Build for production | Before deployment |
| `npm run preview` | Preview production build | Test production build locally |

### Start the Frontend (Development)

```bash
npm run dev
```

**Features:**
- ✅ Hot Module Replacement (HMR)
- ✅ Fast refresh on file changes
- ✅ Instant updates without full reload

### Build for Production

```bash
npm run build
```

**Output:**
```
vite v5.0.8 building for production...
✓ 701 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     21.36 kB │ gzip:  4.76 kB
dist/assets/index-def456.js     324.51 kB │ gzip: 103.13 kB
✓ built in 1.84s
```

### Preview Production Build

```bash
npm run preview
```

Access at: `http://localhost:4173`

### Frontend Port
- **Development:** `http://localhost:5173`
- **Production Preview:** `http://localhost:4173`
- **Change:** Edit `vite.config.ts`

### Frontend Proxy Configuration

The frontend automatically proxies API requests:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

**What this means:**
- `http://localhost:5173/api/...` → `http://localhost:3001/api/...`
- No CORS issues in development

---

## Testing & Validation

### 1. Health Check (Backend)

**Command:**
```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2025-11-16T05:30:48.255Z"}
```

**Status:** ✅ Backend is running

---

### 2. Analyze a Codebase (API Test)

**Command:**
```bash
curl -X POST http://localhost:3001/api/projections/modules/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "rootPath": "/Users/samuelgleeson/dev/c3-projection/src",
    "config": {
      "aggregationLevel": "top-level",
      "includeTests": false
    }
  }' | jq '.'
```

**Expected Response (excerpt):**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-1763271060556",
    "summary": {
      "totalModules": 12,
      "totalFiles": 36,
      "architectureScore": 100
    },
    "modules": [...]
  }
}
```

**Status:** ✅ Analysis is working

---

### 3. List All Analyses

**Command:**
```bash
curl http://localhost:3001/api/projections/modules | jq '.data.analyses | length'
```

**Expected:** Number of analyses (e.g., `4`)

**Status:** ✅ Persistence is working

---

### 4. Validate Architecture

**Command:**
```bash
curl -X POST http://localhost:3001/api/projections/modules/validate \
  -H "Content-Type: application/json" \
  -d '{
    "rootPath": "/Users/samuelgleeson/dev/c3-projection/src"
  }' | jq '{score: .data.score, grade: .data.grade}'
```

**Expected:**
```json
{
  "score": 100,
  "grade": "A+"
}
```

**Status:** ✅ Validation is working

---

### 5. Export Analysis

**Command:**
```bash
# Replace ANALYSIS_ID with actual ID from step 2
curl "http://localhost:3001/api/projections/modules/ANALYSIS_ID/export?format=json" \
  | jq '.data.filename'
```

**Expected:** `"module-graph-analysis-ANALYSIS_ID.json"`

**Status:** ✅ Export is working

---

### 6. Test Frontend UI

**In Browser:** `http://localhost:5173`

**Manual Test Checklist:**

- [ ] **Homepage loads** - Should see "Module Analysis" page
- [ ] **Enter path** - `/Users/samuelgleeson/dev/c3-projection/src`
- [ ] **Click "Run Analysis"** - Should show loading state
- [ ] **Results display** - Should show metrics cards
- [ ] **Module list populates** - Should show 12 modules
- [ ] **Click "View Graph"** - Should navigate to visualization
- [ ] **Graph renders** - Should see D3.js force-directed graph
- [ ] **Click node** - Should show details panel
- [ ] **Zoom/Pan** - Should be able to interact with graph
- [ ] **Switch layouts** - Toggle between force-directed and hierarchical
- [ ] **Navigate to History** - Should show list of past analyses
- [ ] **Navigate to Architecture** - Should show validation page

**Status:** ✅ All UI features working

---

## Main Functionality

### 1. Module Dependency Analysis

**Purpose:** Analyze TypeScript codebases to understand module structure and dependencies

**How it works:**
1. Parse TypeScript files using `c3-parsing`
2. Extract modules based on aggregation level (directory, top-level, package.json)
3. Detect dependencies through imports/exports
4. Calculate metrics (coupling, instability, abstractness, complexity)
5. Identify architectural issues (circular dependencies, etc.)

**API Endpoint:** `POST /api/projections/modules/analyze`

**Configuration Options:**
```typescript
{
  rootPath: string;              // Path to analyze
  includeTests?: boolean;        // Include test files (default: false)
  excludePatterns?: string[];    // Patterns to exclude
  aggregationLevel?: string;     // 'DIRECTORY' | 'TOP_LEVEL' | 'PACKAGE'
}
```

**Example Use Cases:**
- Understand how modules depend on each other
- Find tightly coupled modules
- Identify circular dependencies
- Measure architectural quality

---

### 2. Graph Visualization

**Purpose:** Interactive visualization of module dependencies using D3.js

**Features:**
- **Force-Directed Layout** - Physics-based node positioning
- **Hierarchical Layout** - Layered dependency visualization
- **Node Selection** - Click to see module details
- **Zoom & Pan** - Navigate large graphs
- **Color Schemes** - Color by dependencies, complexity, or type
- **Node Sizing** - Proportional to lines of code or fixed

**Page:** `/projection`

**Tech Stack:**
- D3.js v7 for rendering
- SVG for graphics
- React for UI components
- Zustand for graph state

**Example Use Cases:**
- Visualize overall architecture
- Find heavily connected modules
- Understand dependency flow
- Present architecture to stakeholders

---

### 3. Architecture Validation

**Purpose:** Validate codebase against architectural best practices

**Checks:**
- ✅ Domain independence
- ✅ Layered architecture compliance
- ✅ No circular dependencies
- ✅ Correct dependency direction (dependencies flow inward)
- ✅ Module coupling thresholds
- ✅ Abstraction levels

**Grading System:**
- **A+** (100): Perfect architecture
- **A** (90-99): Excellent architecture
- **B** (80-89): Good architecture with minor issues
- **C** (70-79): Acceptable but needs improvement
- **D** (60-69): Poor architecture
- **F** (<60): Critical architectural issues

**API Endpoint:** `POST /api/projections/modules/validate`

**Example Use Cases:**
- CI/CD quality gates
- Architecture reviews
- Refactoring planning
- Technical debt tracking

---

### 4. Export Functionality

**Purpose:** Export analysis results in multiple formats

**Supported Formats:**
- **JSON** - Machine-readable, for processing
- **GraphML** - Graph visualization tools (Gephi, yEd)
- **SVG** - Scalable Vector Graphics (presentations)
- **Markdown** - Human-readable reports

**API Endpoint:** `GET /api/projections/modules/{id}/export?format={format}`

**Example Use Cases:**
- Generate documentation
- Import into visualization tools
- Create presentations
- Archive analysis results

---

### 5. Analysis History

**Purpose:** Track and compare analyses over time

**Features:**
- List all past analyses
- Search by project path or ID
- View historical analysis details
- Compare changes over time
- Delete old analyses

**Storage:** In-memory (resets on server restart)

**API Endpoint:** `GET /api/projections/modules`

**Example Use Cases:**
- Track architectural evolution
- Compare before/after refactoring
- Audit architectural decisions
- Monitor quality trends

---

## Common Commands Reference

### Backend (c3-bff)

```bash
# Navigate to directory
cd /Users/samuelgleeson/dev/c3-bff

# Install dependencies (first time)
npm install

# Build TypeScript
npm run build

# Start server
npm start

# Build and start (one command)
npm run build && npm start

# Run tests
npm test

# Type check
npm run typecheck

# Clean build
rm -rf dist/ && npm run build

# Check for updates
npm outdated
```

### Frontend (c3-web)

```bash
# Navigate to directory
cd /Users/samuelgleeson/dev/c3-web

# Install dependencies (first time)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Check for updates
npm outdated
```

### Testing Commands

```bash
# Health check
curl http://localhost:3001/health

# Analyze codebase
curl -X POST http://localhost:3001/api/projections/modules/analyze \
  -H "Content-Type: application/json" \
  -d '{"rootPath":"/path/to/code","config":{"aggregationLevel":"top-level"}}'

# List analyses
curl http://localhost:3001/api/projections/modules

# Get specific analysis
curl http://localhost:3001/api/projections/modules/ANALYSIS_ID

# Validate architecture
curl -X POST http://localhost:3001/api/projections/modules/validate \
  -H "Content-Type: application/json" \
  -d '{"rootPath":"/path/to/code"}'

# Export analysis
curl "http://localhost:3001/api/projections/modules/ANALYSIS_ID/export?format=json"

# Open web UI
open http://localhost:5173
```

### Development Commands

```bash
# Kill stuck processes
lsof -ti:3001,5173 | xargs kill -9

# Watch logs (if using PM2 or similar)
tail -f /tmp/c3-bff.log
tail -f /tmp/c3-web.log

# Check running processes
ps aux | grep -E "node.*(c3-bff|c3-web)" | grep -v grep

# Network check
netstat -an | grep -E "3001|5173"
```

---

## Troubleshooting

### Backend Won't Start

**Problem:** `npm start` fails or exits immediately

**Solutions:**

1. **Check if port 3001 is already in use:**
   ```bash
   lsof -i:3001
   ```
   If something is running, kill it:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. **Rebuild from scratch:**
   ```bash
   rm -rf dist/ node_modules/
   npm install
   npm run build
   npm start
   ```

3. **Check for TypeScript errors:**
   ```bash
   npm run typecheck
   ```

4. **Check dependencies:**
   ```bash
   cd /Users/samuelgleeson/dev/c3-parsing && npm run build
   cd /Users/samuelgleeson/dev/c3-projection && npm run build
   cd /Users/samuelgleeson/dev/c3-bff && npm run build
   ```

---

### Frontend Won't Start

**Problem:** `npm run dev` fails

**Solutions:**

1. **Check if port 5173 is already in use:**
   ```bash
   lsof -i:5173
   ```
   If something is running, kill it:
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

2. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite/
   npm run dev
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules/
   npm install
   npm run dev
   ```

---

### API Returns 404

**Problem:** API requests return "Cannot GET /api/..."

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check correct endpoint:**
   - ✅ Correct: `/api/projections/modules/analyze`
   - ❌ Wrong: `/api/modules/analyze`

3. **Check request method:**
   - Some endpoints require POST, not GET

---

### Graph Won't Render

**Problem:** Graph visualization page is blank

**Solutions:**

1. **Check browser console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check network tab for failed requests

2. **Verify analysis data exists:**
   ```bash
   curl http://localhost:3001/api/projections/modules
   ```

3. **Try smaller dataset:**
   - Analyze a smaller codebase first
   - Large graphs (>100 nodes) may take time to render

4. **Check D3.js loaded:**
   - Open browser console
   - Type `d3` and press Enter
   - Should show D3 object, not undefined

---

### ESM Import Errors

**Problem:** "Cannot find module ... imported from ..."

**Solutions:**

1. **Check .js extensions:**
   ESM requires explicit `.js` extensions in imports:
   ```typescript
   // ✅ Correct
   import { foo } from './file.js';
   
   // ❌ Wrong
   import { foo } from './file';
   ```

2. **Rebuild c3-parsing:**
   ```bash
   cd /Users/samuelgleeson/dev/c3-parsing
   npm run build
   ```

3. **Check TypeScript library imports:**
   ```typescript
   // ✅ Correct
   import { server } from 'typescript/lib/tsserverlibrary.js';
   
   // ❌ Wrong
   import { server } from 'typescript/lib/tsserverlibrary';
   ```

---

### Analysis Takes Too Long

**Problem:** Analysis never completes or takes >60 seconds

**Solutions:**

1. **Reduce scope:**
   - Use `excludePatterns` to skip node_modules, test files
   - Analyze smaller directory first

2. **Check file count:**
   ```bash
   find /path/to/analyze -name "*.ts" -o -name "*.tsx" | wc -l
   ```
   - >1000 files may take 30+ seconds
   - >5000 files may timeout

3. **Increase timeout** (if needed):
   Edit the API client to allow longer requests

---

### Memory Issues

**Problem:** "JavaScript heap out of memory"

**Solutions:**

1. **Increase Node.js memory:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

2. **Analyze smaller codebases**

3. **Add excludePatterns:**
   ```json
   {
     "excludePatterns": [
       "node_modules",
       "dist",
       "build",
       "*.test.ts",
       "*.spec.ts"
     ]
   }
   ```

---

## Quick Reference Card

### Start Everything

```bash
# Terminal 1: Backend
cd /Users/samuelgleeson/dev/c3-bff && npm run build && npm start

# Terminal 2: Frontend
cd /Users/samuelgleeson/dev/c3-web && npm run dev

# Terminal 3: Open Browser
open http://localhost:5173
```

### Stop Everything

```bash
# Kill both servers
lsof -ti:3001,5173 | xargs kill -9
```

### URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Web UI |
| Backend | http://localhost:3001 | API |
| Health Check | http://localhost:3001/health | Status |
| API Docs | http://localhost:3001/api | (Future) |

### Key Files

| File | Purpose |
|------|---------|
| `c3-bff/src/index.ts` | Backend entry point |
| `c3-web/src/main.tsx` | Frontend entry point |
| `c3-web/src/app/App.tsx` | Routing configuration |
| `c3-bff/src/routes/*.routes.ts` | API route definitions |

---

## Next Steps

### For Development
1. Read [API-INTEGRATION-PLAN.md](./API-INTEGRATION-PLAN.md)
2. Read [WEB-UI-IMPLEMENTATION-PLAN.md](./WEB-UI-IMPLEMENTATION-PLAN.md)
3. Explore the codebase structure

### For Testing
1. Follow [TEST-GUIDE.md](../c3-web/TEST-GUIDE.md)
2. Run all manual test scenarios
3. Try analyzing your own codebases

### For Production
1. Set up environment variables
2. Configure authentication
3. Set up monitoring
4. Deploy to hosting platform

---

## Additional Resources

### Documentation
- [Architecture Overview](./module-dependency-view-design.md)
- [API Integration Plan](./API-INTEGRATION-PLAN.md)
- [Web UI Plan](./WEB-UI-IMPLEMENTATION-PLAN.md)
- [Testing Results](./WEB-UI-LIVE-TESTING-RESULTS.md)

### GitHub Issues & Support
- Create issues for bugs
- Request features
- Ask questions

### Example Codebases to Analyze
```bash
# Small (fast, good for testing)
/Users/samuelgleeson/dev/c3-shared

# Medium (typical analysis)
/Users/samuelgleeson/dev/c3-projection

# Large (comprehensive test)
/Users/samuelgleeson/dev/c3-platform
```

---

**Last Updated:** 2025-11-16  
**Version:** 1.0  
**Status:** Production Ready ✅


