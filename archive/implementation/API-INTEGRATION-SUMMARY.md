# API Integration Summary

**Quick Reference for Module Dependency Analysis API**

---

## 🎯 What We're Building

Expose the module dependency analysis functionality (from c3-parsing + c3-projection) through REST API endpoints in c3-bff.

---

## 📊 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/parse` | POST | Parse codebase → PropertyGraph |
| `/api/projections/modules/analyze` | POST | Analyze modules → Full analysis |
| `/api/projections/modules/:id` | GET | Get cached analysis |
| `/api/projections/modules/:id/export` | GET | Export (JSON/GraphML/SVG/MD) |
| `/api/projections/modules/validate` | POST | Validate Clean Architecture |
| `/api/projections/modules` | GET | List all analyses |
| `/api/projections/modules/:id` | DELETE | Delete analysis |

---

## 🔄 Quick Example Flow

```bash
# 1. Analyze a codebase
curl -X POST http://localhost:3001/api/projections/modules/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "rootPath": "/path/to/src",
    "config": {
      "aggregationLevel": "top-level",
      "includeTests": false
    }
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "analysisId": "analysis-123",
#     "summary": {
#       "totalModules": 12,
#       "totalDependencies": 19,
#       "circularDependencies": 0,
#       "architectureScore": 100
#     }
#   }
# }

# 2. Export as SVG
curl -X GET "http://localhost:3001/api/projections/modules/analysis-123/export?format=svg"

# 3. Get analysis details
curl -X GET http://localhost:3001/api/projections/modules/analysis-123
```

---

## 📦 Implementation Phases

### Phase 1: DI Setup (Week 1)
- Register services in c3-wiring
- Add new tokens
- Wire up c3-projection + c3-parsing

### Phase 2: Routes (Week 1-2)
- Implement all 7 endpoints
- Add validation
- Error handling

### Phase 3: Testing (Week 3)
- Unit tests
- Integration tests
- API tests (Postman)

### Phase 4: Deploy (Week 4)
- Documentation
- Docker setup
- Production deploy

---

## 🎨 Response Format

All endpoints return:

```json
{
  "success": true|false,
  "data": { /* ... */ },
  "error": { /* optional */ }
}
```

---

## 📈 Key Metrics Returned

- **totalModules**: Number of modules found
- **totalFiles**: Files analyzed
- **totalDependencies**: Module-to-module dependencies
- **averageCoupling**: Avg dependencies per module
- **circularDependencies**: Count of cycles
- **architectureScore**: 0-100 health score

---

## 🚀 Getting Started

```bash
cd ~/dev/c3-bff
npm install
npm run dev
# Server: http://localhost:3001
```

---

See [API-INTEGRATION-PLAN.md](./API-INTEGRATION-PLAN.md) for full details.

*Created: 2025-11-16*
