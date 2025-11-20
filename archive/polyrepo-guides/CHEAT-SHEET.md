# C3 Platform Cheat Sheet

**One-page quick reference for running and validating c3-bff and c3-web**

---

## 🚀 Quick Start (Copy & Paste)

### Terminal 1: Backend
```bash
cd /Users/samuelgleeson/dev/c3-bff && npm run build && npm start
```

### Terminal 2: Frontend
```bash
cd /Users/samuelgleeson/dev/c3-web && npm run dev
```

### Terminal 3: Open Browser
```bash
open http://localhost:5173
```

---

## 📊 URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend** | http://localhost:3001 |
| **Health** | http://localhost:3001/health |

---

## ✅ Validation Commands

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Analyze Code
```bash
curl -X POST http://localhost:3001/api/projections/modules/analyze \
  -H "Content-Type: application/json" \
  -d '{"rootPath":"/Users/samuelgleeson/dev/c3-projection/src","config":{"aggregationLevel":"top-level"}}'
```

### 3. List Analyses
```bash
curl http://localhost:3001/api/projections/modules | jq '.data.analyses | length'
```

### 4. Validate Architecture
```bash
curl -X POST http://localhost:3001/api/projections/modules/validate \
  -H "Content-Type: application/json" \
  -d '{"rootPath":"/Users/samuelgleeson/dev/c3-projection/src"}' \
  | jq '{score: .data.score, grade: .data.grade}'
```

---

## 🔧 Common Commands

### Backend (c3-bff)
```bash
cd /Users/samuelgleeson/dev/c3-bff

npm install              # Install dependencies
npm run build            # Build TypeScript
npm start                # Start server
npm test                 # Run tests
npm run typecheck        # Check types
```

### Frontend (c3-web)
```bash
cd /Users/samuelgleeson/dev/c3-web

npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## 🛠️ Troubleshooting

### Kill Stuck Processes
```bash
lsof -ti:3001,5173 | xargs kill -9
```

### Rebuild Everything
```bash
# Backend
cd /Users/samuelgleeson/dev/c3-bff
rm -rf dist/ node_modules/ && npm install && npm run build

# Frontend
cd /Users/samuelgleeson/dev/c3-web
rm -rf dist/ node_modules/ && npm install
```

### Check What's Running
```bash
ps aux | grep -E "node.*(c3-bff|c3-web)" | grep -v grep
```

---

## 📦 Main Functionality

| Feature | What It Does | Page/API |
|---------|-------------|----------|
| **Module Analysis** | Parse codebase, detect dependencies | `/analysis` or POST `/api/projections/modules/analyze` |
| **Graph Viz** | Interactive D3.js dependency graph | `/projection` |
| **Validation** | Architecture quality scoring (A+ to F) | `/architecture` or POST `/api/projections/modules/validate` |
| **Export** | Download as JSON/GraphML/SVG/Markdown | GET `/api/projections/modules/{id}/export` |
| **History** | View past analyses | `/analysis/history` or GET `/api/projections/modules` |

---

## 🎯 Expected Results

### Health Check
```json
{"status":"ok","timestamp":"2025-11-16T..."}
```

### Analysis Response
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-...",
    "summary": {
      "totalModules": 12,
      "totalFiles": 36,
      "architectureScore": 100
    }
  }
}
```

### Validation Response
```json
{
  "score": 100,
  "grade": "A+"
}
```

---

## 📚 Full Documentation

See [QUICKSTART-GUIDE.md](./QUICKSTART-GUIDE.md) for detailed instructions, troubleshooting, and examples.

---

**Quick Tip:** Bookmark this page for instant access to commands! ⭐



