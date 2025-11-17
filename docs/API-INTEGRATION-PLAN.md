# API Integration Plan - Module Dependency Analysis

**Date:** 2025-11-16  
**Status:** Planning  
**Target:** c3-bff API Endpoints  
**Dependencies:** c3-parsing v2.0.0, c3-projection v0.1.0

---

## 📋 Executive Summary

This document outlines the plan to expose the module dependency analysis functionality (built in `c3-parsing` and `c3-projection`) through REST API endpoints in `c3-bff`.

### What We're Exposing:
- **TypeScript/JavaScript parsing** with ESTree + TypeScript Program
- **Module aggregation** at multiple levels (directory, top-level, package)
- **Dependency analysis** with circular detection and metrics
- **Multiple export formats** (JSON, GraphML, SVG)
- **Clean Architecture validation** for module projections

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         c3-web                              │
│                  (React Frontend - Future)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         c3-bff                              │
│                  (Backend-for-Frontend)                     │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Parsing Routes   │  │ Projection Routes│               │
│  │  POST /parse     │  │  POST /analyze   │               │
│  │  GET  /parse/:id │  │  GET  /view/:id  │               │
│  └──────────────────┘  └──────────────────┘               │
│            │                      │                         │
│            └──────────┬───────────┘                         │
│                       ↓                                     │
│              ┌─────────────────┐                           │
│              │  c3-wiring (DI) │                           │
│              └─────────────────┘                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│   c3-parsing     │              │  c3-projection   │
│                  │              │                  │
│ • ParsingService │              │ • GraphLoader    │
│ • TypeScript Ext │              │ • ModuleAggr.    │
│ • Filesystem Ext │              │ • DepCalculator  │
│ • PropertyGraph  │──────────────▶ • Exporters      │
│                  │              │   (JSON/GraphML/ │
│                  │              │    SVG)          │
└──────────────────┘              └──────────────────┘
```

---

## 🎯 API Endpoints to Implement

### 1. **Parse Codebase** (Already Partially Exists)

**Endpoint:** `POST /api/parse`

**Purpose:** Parse a TypeScript/JavaScript codebase and generate a property graph.

**Request Body:**
```json
{
  "rootPath": "/absolute/path/to/codebase/src",
  "config": {
    "extensions": [
      "typescript",
      "filesystem"
    ],
    "typescript": {
      "includeTests": false,
      "includePrivateMembers": false,
      "excludePatterns": [
        "node_modules/**",
        "dist/**",
        "**/*.test.ts"
      ]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "graphId": "graph-1234567890",
    "rootPath": "/path/to/src",
    "nodeCount": 22655,
    "edgeCount": 2231,
    "extensions": ["typescript@2.0.0", "filesystem@1.0.0"],
    "parseTime": "9631.13ms",
    "cached": false
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (missing rootPath, invalid path)
- `500` - Parsing error

---

### 2. **Get Graph** (Already Partially Exists)

**Endpoint:** `GET /api/parse/:graphId`

**Purpose:** Retrieve metadata about a cached property graph.

**Response:**
```json
{
  "success": true,
  "data": {
    "graphId": "graph-1234567890",
    "rootPath": "/path/to/src",
    "nodeCount": 22655,
    "edgeCount": 2231,
    "extensions": ["typescript@2.0.0"],
    "createdAt": "2025-11-16T04:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Graph not found
- `500` - Internal error

---

### 3. **Analyze Modules** (NEW - Core Feature)

**Endpoint:** `POST /api/projections/modules/analyze`

**Purpose:** Analyze a codebase and generate module dependency view.

**Request Body:**
```json
{
  "rootPath": "/absolute/path/to/codebase/src",
  "config": {
    "aggregationLevel": "top-level",
    "includeTests": false,
    "excludePatterns": ["node_modules", "dist", "tests"],
    "parsingConfig": {
      "includePrivateMembers": false
    }
  }
}
```

**Aggregation Levels:**
- `directory` - Group by immediate directory
- `top-level` - Group by top 2 directory levels (e.g., `src/domain`)
- `package` - Group by nearest `package.json` or `tsconfig.json`

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-1234567890",
    "graphId": "graph-1234567890",
    "summary": {
      "totalModules": 12,
      "totalFiles": 36,
      "totalDependencies": 19,
      "averageCoupling": 1.58,
      "maxDependencies": 4,
      "circularDependencies": 0,
      "architectureScore": 100
    },
    "modules": [
      {
        "id": "module-entities",
        "name": "entities",
        "path": "/path/to/src/domain/entities",
        "fileCount": 8,
        "dependencyCount": 0,
        "dependentCount": 7,
        "metrics": {
          "complexity": "low",
          "cohesion": 0.85
        }
      }
    ],
    "dependencies": [
      {
        "from": "module-strategies",
        "to": "module-entities",
        "strength": 5
      }
    ],
    "hotspots": [
      {
        "moduleId": "module-entities",
        "moduleName": "entities",
        "usedByCount": 7,
        "reason": "Central domain module"
      }
    ],
    "issues": [],
    "recommendations": [
      {
        "type": "info",
        "message": "No circular dependencies detected",
        "severity": "success"
      }
    ],
    "analyzedAt": "2025-11-16T04:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Analysis error

---

### 4. **Get Module View** (NEW)

**Endpoint:** `GET /api/projections/modules/:analysisId`

**Purpose:** Retrieve a cached module analysis.

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-1234567890",
    "summary": { /* ... same as analyze endpoint ... */ },
    "modules": [ /* ... */ ],
    "dependencies": [ /* ... */ ]
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Analysis not found
- `500` - Internal error

---

### 5. **Export Module View** (NEW - Multiple Formats)

**Endpoint:** `GET /api/projections/modules/:analysisId/export`

**Query Parameters:**
- `format` - Export format: `json`, `graphml`, `svg`, `markdown`
- `layout` - (for SVG) Layout direction: `TB` (top-bottom), `LR` (left-right)
- `colorScheme` - (for SVG) Color scheme: `default`, `dependencies`, `complexity`

**Example Requests:**
```
GET /api/projections/modules/analysis-123/export?format=json
GET /api/projections/modules/analysis-123/export?format=graphml
GET /api/projections/modules/analysis-123/export?format=svg&layout=TB&colorScheme=dependencies
GET /api/projections/modules/analysis-123/export?format=markdown
```

**Response (JSON format):**
```json
{
  "success": true,
  "data": {
    "format": "json",
    "content": {
      "version": "1.0.0",
      "type": "module-dependency-graph",
      "nodes": [ /* ... */ ],
      "edges": [ /* ... */ ],
      "metadata": { /* ... */ }
    }
  }
}
```

**Response (GraphML format):**
```json
{
  "success": true,
  "data": {
    "format": "graphml",
    "content": "<?xml version=\"1.0\"?>\n<graphml>...</graphml>",
    "filename": "module-graph-analysis-123.graphml"
  }
}
```

**Response (SVG format):**
```json
{
  "success": true,
  "data": {
    "format": "svg",
    "content": "<svg width=\"1200\" height=\"800\">...</svg>",
    "filename": "module-graph-analysis-123.svg"
  }
}
```

**Response (Markdown format):**
```json
{
  "success": true,
  "data": {
    "format": "markdown",
    "content": "# Module Dependency Analysis\n\n## Summary\n...",
    "filename": "analysis-123-report.md"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid format or parameters
- `404` - Analysis not found
- `500` - Export error

---

### 6. **Validate Architecture** (NEW - Clean Architecture Check)

**Endpoint:** `POST /api/projections/modules/validate`

**Purpose:** Validate Clean Architecture principles for a codebase.

**Request Body:**
```json
{
  "rootPath": "/absolute/path/to/codebase/src",
  "config": {
    "aggregationLevel": "top-level",
    "layers": {
      "domain": ["domain"],
      "application": ["application"],
      "infrastructure": ["infrastructure"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "validationId": "validation-1234567890",
    "score": 100,
    "checks": {
      "domainIndependence": {
        "passed": true,
        "message": "Domain has 0 dependencies on Infrastructure/Application",
        "violations": []
      },
      "applicationLayer": {
        "passed": true,
        "message": "Application properly depends on Domain only",
        "violations": []
      },
      "circularDependencies": {
        "passed": true,
        "message": "No circular dependencies detected",
        "cycles": []
      },
      "dependencyDirection": {
        "passed": true,
        "message": "All dependencies flow inward",
        "violations": []
      }
    },
    "summary": {
      "domainModules": 4,
      "applicationModules": 2,
      "infrastructureModules": 5,
      "totalViolations": 0
    },
    "grade": "A+",
    "validatedAt": "2025-11-16T04:00:00Z"
  }
}
```

**Scoring:**
- `90-100`: A+ (Excellent)
- `75-89`: A (Good)
- `60-74`: B (Acceptable)
- `45-59`: C (Needs attention)
- `0-44`: F (Poor)

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Validation error

---

### 7. **List Analyses** (NEW - History)

**Endpoint:** `GET /api/projections/modules`

**Query Parameters:**
- `limit` - Max results (default: 50, max: 200)
- `offset` - Pagination offset
- `sort` - Sort field: `createdAt`, `moduleCount`, `score`
- `order` - Sort order: `asc`, `desc` (default: `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "analysisId": "analysis-123",
        "rootPath": "/path/to/src",
        "moduleCount": 12,
        "dependencyCount": 19,
        "circularCount": 0,
        "score": 100,
        "createdAt": "2025-11-16T04:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `500` - Internal error

---

### 8. **Delete Analysis** (NEW - Cleanup)

**Endpoint:** `DELETE /api/projections/modules/:analysisId`

**Purpose:** Delete a cached analysis and its associated data.

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-1234567890",
    "deleted": true
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Analysis not found
- `500` - Internal error

---

## 📦 Implementation Plan

### Phase 1: DI Container Setup (Week 1)

**File:** `c3-wiring/src/context-modules/projection.module.ts`

```typescript
import { Container } from '../Container.js';
import { TOKENS } from '../dependencies.js';
import { 
  GraphLoader,
  ModuleProjectionStrategy,
  ModuleAggregator,
  ModuleDependencyCalculator,
  GraphViewBuilder,
  DagreLayoutEngine,
  JSONGraphExporter,
  GraphMLExporter,
  SVGGraphExporter
} from 'c3-projection';
import { TypeScriptExtension, FilesystemExtension } from 'c3-parsing';

export function registerProjectionContext(container: Container): void {
  const logger = container.get(TOKENS.LOGGER);
  
  // Register TypeScript Extension
  container.registerSingleton(TOKENS.TYPESCRIPT_EXTENSION, () => {
    return new TypeScriptExtension({
      includePrivateMembers: false
    });
  });
  
  // Register Filesystem Extension
  container.registerSingleton(TOKENS.FILESYSTEM_EXTENSION, () => {
    return new FilesystemExtension();
  });
  
  // Register GraphLoader
  container.registerSingleton(TOKENS.GRAPH_LOADER, () => {
    const tsExt = container.get(TOKENS.TYPESCRIPT_EXTENSION);
    const fsExt = container.get(TOKENS.FILESYSTEM_EXTENSION);
    
    return new GraphLoader(logger, {
      extensions: [tsExt, fsExt],
      cacheEnabled: true
    });
  });
  
  // Register Module Aggregator
  container.registerSingleton(TOKENS.MODULE_AGGREGATOR, () => {
    return new ModuleAggregator(logger);
  });
  
  // Register Dependency Calculator
  container.registerSingleton(TOKENS.MODULE_DEPENDENCY_CALCULATOR, () => {
    return new ModuleDependencyCalculator(logger);
  });
  
  // Register Projection Strategy
  container.registerSingleton(TOKENS.MODULE_PROJECTION_STRATEGY, () => {
    // Will be instantiated per-request with specific root path
    return ModuleProjectionStrategy;
  });
  
  // Register GraphViewBuilder
  container.registerSingleton(TOKENS.GRAPH_VIEW_BUILDER, () => {
    return new GraphViewBuilder(logger);
  });
  
  // Register Layout Engine
  container.registerSingleton(TOKENS.LAYOUT_ENGINE, () => {
    return new DagreLayoutEngine({
      rankdir: 'TB',
      nodesep: 80,
      ranksep: 100
    }, logger);
  });
  
  // Register Exporters
  container.registerSingleton(TOKENS.JSON_EXPORTER, () => {
    return new JSONGraphExporter(logger);
  });
  
  container.registerSingleton(TOKENS.GRAPHML_EXPORTER, () => {
    return new GraphMLExporter(logger);
  });
  
  container.registerSingleton(TOKENS.SVG_EXPORTER, () => {
    return new SVGGraphExporter(logger);
  });
  
  console.log('✅ Projection context registered');
}
```

**New Tokens to Add:**
```typescript
// In c3-wiring/src/dependencies.ts
export const TOKENS = {
  // ... existing tokens ...
  
  // Extensions
  TYPESCRIPT_EXTENSION: 'TypeScriptExtension',
  FILESYSTEM_EXTENSION: 'FilesystemExtension',
  
  // Projection Services
  GRAPH_LOADER: 'GraphLoader',
  MODULE_AGGREGATOR: 'ModuleAggregator',
  MODULE_DEPENDENCY_CALCULATOR: 'ModuleDependencyCalculator',
  MODULE_PROJECTION_STRATEGY: 'ModuleProjectionStrategy',
  GRAPH_VIEW_BUILDER: 'GraphViewBuilder',
  LAYOUT_ENGINE: 'LayoutEngine',
  
  // Exporters
  JSON_EXPORTER: 'JSONExporter',
  GRAPHML_EXPORTER: 'GraphMLExporter',
  SVG_EXPORTER: 'SVGExporter',
} as const;
```

---

### Phase 2: Route Implementation (Week 1-2)

**File:** `c3-bff/src/routes/projection.routes.ts`

```typescript
import { Router } from 'express';
import { Container } from 'c3-wiring';
import { TOKENS } from 'c3-wiring';
import { createSuccessResponse, createErrorResponse } from 'c3-shared';
import {
  analyzeModules,
  getModuleView,
  exportModuleView,
  validateArchitecture,
  listAnalyses,
  deleteAnalysis
} from '../controllers/projection.controller.js';

export function createProjectionRoutes(container: Container): Router {
  const router = Router();

  // Module analysis endpoints
  router.post('/modules/analyze', analyzeModules(container));
  router.get('/modules/:analysisId', getModuleView(container));
  router.get('/modules/:analysisId/export', exportModuleView(container));
  router.post('/modules/validate', validateArchitecture(container));
  router.get('/modules', listAnalyses(container));
  router.delete('/modules/:analysisId', deleteAnalysis(container));

  return router;
}
```

---

### Phase 3: Controller Implementation (Week 2)

**File:** `c3-bff/src/controllers/projection.controller.ts`

```typescript
import { Request, Response } from 'express';
import { Container } from 'c3-wiring';
import { TOKENS } from 'c3-wiring';
import { createSuccessResponse, createErrorResponse } from 'c3-shared';
import {
  GraphLoader,
  ModuleProjectionStrategy,
  GraphViewBuilder,
  AggregationLevel,
  ViewConfiguration,
  ProjectionType
} from 'c3-projection';

/**
 * Analyze modules endpoint
 */
export function analyzeModules(container: Container) {
  return async (req: Request, res: Response) => {
    try {
      const { rootPath, config = {} } = req.body;

      if (!rootPath) {
        res.status(400).json(createErrorResponse(
          'VALIDATION_ERROR',
          'rootPath is required'
        ));
        return;
      }

      const logger = container.get(TOKENS.LOGGER);
      const graphLoader = container.get(TOKENS.GRAPH_LOADER) as GraphLoader;
      const aggregator = container.get(TOKENS.MODULE_AGGREGATOR);
      const depCalculator = container.get(TOKENS.MODULE_DEPENDENCY_CALCULATOR);

      // Load graph
      const graph = await graphLoader.loadGraph(rootPath);
      
      // Create projection
      const strategy = new ModuleProjectionStrategy(logger, rootPath);
      const viewConfig = ViewConfiguration.create({
        projectionType: ProjectionType.MODULE,
        aggregationLevel: config.aggregationLevel || AggregationLevel.TOP_LEVEL,
        options: {
          includeTests: config.includeTests ?? false,
          excludePatterns: config.excludePatterns || []
        }
      });
      
      const projection = await strategy.project(graph, viewConfig);
      const metrics = projection.getMetrics();
      
      // Calculate architecture score
      const score = calculateArchitectureScore(projection);
      
      // Generate analysis ID
      const analysisId = `analysis-${Date.now()}`;
      
      // Cache the result
      // TODO: Implement caching layer
      
      // Build response
      const modules = projection.getModules().map(m => ({
        id: m.id,
        name: m.name,
        path: m.path,
        fileCount: m.files.length,
        dependencyCount: m.getDependencyCount(),
        dependentCount: m.getDependentCount(),
        metrics: m.metrics
      }));
      
      const dependencies = [];
      for (const module of projection.getModules()) {
        for (const depId of module.dependencies) {
          const targetModule = projection.getModules().find(m => m.id === depId);
          if (targetModule) {
            dependencies.push({
              from: module.id,
              to: targetModule.id,
              strength: 1 // Could be enhanced with actual import count
            });
          }
        }
      }
      
      const hotspots = projection.getModules()
        .filter(m => m.getDependentCount() > 3)
        .sort((a, b) => b.getDependentCount() - a.getDependentCount())
        .slice(0, 5)
        .map(m => ({
          moduleId: m.id,
          moduleName: m.name,
          usedByCount: m.getDependentCount(),
          reason: 'High usage module'
        }));
      
      const recommendations = [];
      if (metrics.cyclicDependencies === 0) {
        recommendations.push({
          type: 'info',
          message: 'No circular dependencies detected',
          severity: 'success'
        });
      } else {
        recommendations.push({
          type: 'warning',
          message: `${metrics.cyclicDependencies} circular ${metrics.cyclicDependencies === 1 ? 'dependency' : 'dependencies'} detected`,
          severity: 'warning'
        });
      }

      res.json(createSuccessResponse({
        analysisId,
        graphId: graph.id,
        summary: {
          totalModules: metrics.totalModules,
          totalFiles: metrics.totalFiles,
          totalDependencies: metrics.totalDependencies,
          averageCoupling: metrics.averageDependenciesPerModule,
          maxDependencies: metrics.maxDependencies,
          circularDependencies: metrics.cyclicDependencies,
          architectureScore: score
        },
        modules,
        dependencies,
        hotspots,
        issues: [],
        recommendations,
        analyzedAt: new Date().toISOString()
      }));
    } catch (error) {
      logger.error('Analysis failed', error as Error);
      res.status(500).json(createErrorResponse(
        'ANALYSIS_ERROR',
        (error as Error).message
      ));
    }
  };
}

function calculateArchitectureScore(projection: any): number {
  // Simplified scoring logic
  let score = 100;
  const metrics = projection.getMetrics();
  
  // Deduct for circular dependencies
  score -= Math.min(metrics.cyclicDependencies * 20, 40);
  
  // Deduct for high coupling
  const highlyCoupled = projection.getModules()
    .filter((m: any) => m.getDependencyCount() > 7).length;
  score -= Math.min(highlyCoupled * 5, 20);
  
  return Math.max(0, Math.min(100, score));
}

// ... other controller functions ...
```

---

### Phase 4: Testing (Week 3)

#### Unit Tests
- Test each controller function
- Test DI container registration
- Test error handling

#### Integration Tests
- Test full request/response cycle
- Test with real codebases
- Test all export formats
- Test error scenarios

#### API Tests (Postman/Newman)
- Create Postman collection
- Test all endpoints
- Test edge cases
- Performance testing

---

### Phase 5: Documentation (Week 3)

#### OpenAPI/Swagger Spec
```yaml
openapi: 3.0.0
info:
  title: C3 Module Analysis API
  version: 2.0.0
  description: API for analyzing TypeScript/JavaScript module dependencies

paths:
  /api/projections/modules/analyze:
    post:
      summary: Analyze modules in a codebase
      # ... full spec ...
```

#### API Documentation
- Endpoint descriptions
- Request/response examples
- Error codes and handling
- Rate limiting (if applicable)
- Authentication (future)

---

## 🚀 Deployment Strategy

### Development
```bash
cd ~/dev/c3-bff
npm run dev
# Server runs on http://localhost:3001
```

### Production (Docker)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Environment Variables
```env
# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# CORS
CORS_ORIGIN=https://app.c3platform.com

# Caching
CACHE_TTL=3600
CACHE_MAX_SIZE=100

# Logging
LOG_LEVEL=info
```

---

## 📊 Success Metrics

### Performance Targets
- **Parse Time**: < 30s for 10K files
- **Analysis Time**: < 5s for 100 modules
- **Export Time**: < 2s for all formats
- **API Response**: < 100ms (excluding analysis)

### Reliability Targets
- **Uptime**: 99.9%
- **Error Rate**: < 0.1%
- **Timeout Rate**: < 0.01%

---

## 🔒 Security Considerations

### Input Validation
- Validate all paths (prevent directory traversal)
- Sanitize file paths
- Limit request body size
- Rate limiting per IP

### File Access
- Restrict to allowed directories only
- No access to system files
- Sandbox file operations

### Authentication (Future)
- API keys for production
- OAuth2 for user accounts
- Role-based access control

---

## 🎯 Future Enhancements

### Phase 2 Features
- **Real-time Analysis**: WebSocket for progress updates
- **Comparison API**: Compare two analyses
- **Trend Analysis**: Track metrics over time
- **Custom Rules**: User-defined architecture rules
- **Team Collaboration**: Share analyses

### Phase 3 Features
- **GitHub Integration**: Direct repo analysis
- **CI/CD Integration**: GitHub Actions, GitLab CI
- **Scheduled Analysis**: Periodic checks
- **Notifications**: Slack, email alerts
- **Advanced Visualization**: Interactive D3.js graphs

---

## 📚 References

### Internal Documentation
- [Module Dependency View Design](/Users/samuelgleeson/dev/c3-projection/docs/module-dependency-view-design.md)
- [Implementation Plan v2](/Users/samuelgleeson/dev/c3-projection/docs/module-dependency-implementation-plan-v2.md)
- [Demo Plan](/Users/samuelgleeson/dev/c3-projection/docs/demo-and-example-plan.md)

### Dependencies
- **c3-parsing**: v2.0.0 (TypeScript Extension architecture)
- **c3-projection**: v0.1.0 (Module analysis)
- **c3-wiring**: v0.1.0 (DI container)
- **c3-shared**: v0.1.0 (Utilities)

---

## ✅ Implementation Checklist

### Week 1
- [ ] Update c3-wiring tokens
- [ ] Implement projection.module.ts
- [ ] Update parsing.module.ts
- [ ] Test DI container setup
- [ ] Create projection.controller.ts skeleton
- [ ] Implement analyzeModules controller
- [ ] Implement getModuleView controller

### Week 2
- [ ] Implement exportModuleView controller
- [ ] Implement validateArchitecture controller
- [ ] Implement listAnalyses controller
- [ ] Implement deleteAnalysis controller
- [ ] Add caching layer
- [ ] Add input validation
- [ ] Update projection.routes.ts

### Week 3
- [ ] Write unit tests (controllers)
- [ ] Write integration tests (full flow)
- [ ] Create Postman collection
- [ ] Write OpenAPI spec
- [ ] Update API documentation
- [ ] Performance testing
- [ ] Security audit

### Week 4
- [ ] Deploy to staging
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Deploy to production
- [ ] Monitor and iterate

---

**Status:** Ready for Implementation 🚀  
**Estimated Effort:** 3-4 weeks  
**Priority:** High  
**Owner:** Development Team

---

*Plan created: 2025-11-16*  
*Version: 1.0.0*


