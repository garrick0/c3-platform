# C3 Platform Architecture Diagram

## Layer View

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Layer 4: Applications                        │
├─────────────────┬─────────────────────┬───────────────────────────┐ │
│                 │                     │                           │ │
│   ┌─────────┐   │   ┌─────────┐      │    ┌─────────┐            │ │
│   │ c3-cli  │   │   │ c3-bff  │◄─────┼───►│ c3-web  │            │ │
│   │  (CLI)  │   │   │ (API)   │      │    │  (SPA)  │            │ │
│   └────┬────┘   │   └────┬────┘      │    └─────────┘            │ │
│        │        │        │           │         │ HTTP             │ │
│        │ uses   │        │ uses      │         └──────────────┐   │ │
└────────┼────────┴────────┼───────────┴────────────────────────┼───┘ │
         │                 │                                     │     │
         └─────────────────┼─────────────────────────────────────┘     │
                           │                                           │
┌──────────────────────────┼───────────────────────────────────────────┤
│                  Layer 3: Integration                                │
│                          │                                           │
│                    ┌─────▼─────┐                                     │
│                    │ c3-wiring │                                     │
│                    │  (DI)     │                                     │
│                    └─────┬─────┘                                     │
│                          │                                           │
│                    wires together                                    │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────────┐
│           Layer 2: Advanced Contexts                                 │
│                          │                                           │
│  ┌────────────┬──────────┼──────────┬──────────────┐                │
│  │            │          │          │              │                │
│  │  ┌─────────▼────┐  ┌──▼──────────▼──┐  ┌───────▼────────┐       │
│  │  │c3-compliance │  │ c3-projection  │  │ c3-discovery   │       │
│  │  │   (Rules)    │  │   (Views)      │  │   (AI/ML)      │       │
│  │  └──────┬───────┘  └────────┬───────┘  └────────┬───────┘       │
│  │         │                   │                   │                │
│  │         └───────────────────┼───────────────────┘                │
└──┴─────────────────────────────┼────────────────────────────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────────┐
│                    Layer 1: Domain Context                           │
│                                │                                     │
│                        ┌───────▼────────┐                            │
│                        │  c3-parsing    │                            │
│                        │ (Code Analysis)│                            │
│                        └───────┬────────┘                            │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────────┐
│                    Layer 0: Foundation                               │
│                                │                                     │
│                        ┌───────▼────────┐                            │
│                        │   c3-shared    │                            │
│                        │  (Core/Infra)  │                            │
│                        └────────────────┘                            │
└──────────────────────────────────────────────────────────────────────┘
```

## Dependency Graph (Detailed)

```
c3-shared
    │
    ├──► c3-parsing
    │       │
    │       ├──► c3-compliance
    │       │       │
    │       │       └──► c3-discovery
    │       │
    │       └──► c3-projection
    │
    └──► (all packages depend on c3-shared)

c3-wiring
    ├──► c3-shared
    ├──► c3-parsing
    ├──► c3-compliance
    ├──► c3-projection
    └──► c3-discovery

c3-cli
    ├──► c3-wiring
    └──► (all contexts via wiring)

c3-bff
    ├──► c3-wiring
    └──► (all contexts via wiring)

c3-web
    └──► c3-bff (HTTP at runtime, no NPM dependency)
```

## Build Order

```
1. c3-shared          (foundation - no dependencies)
    ↓
2. c3-parsing         (depends on: c3-shared)
    ↓
3. c3-compliance      (depends on: c3-shared, c3-parsing)
   c3-projection      (depends on: c3-shared, c3-parsing)
   ↓                  ↓
4. c3-discovery       (depends on: c3-shared, c3-parsing, c3-compliance)
    ↓
5. c3-wiring          (depends on: ALL contexts)
    ↓
6. c3-cli             (depends on: c3-wiring + contexts)
   c3-bff             (depends on: c3-wiring + contexts)
    ↓
7. c3-web             (no build dependencies, runtime HTTP to c3-bff)
```

## Runtime Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        User's Browser                         │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              c3-web (React SPA)                        │  │
│  │  - Vite Dev Server (port 5173)                         │  │
│  │  - D3.js for visualization                             │  │
│  │  - Zustand for state management                        │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                         │ HTTP /api/*                        │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ (Vite proxy in dev,
                          │  reverse proxy in prod)
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   Node.js Server                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           c3-bff (Express.js API)                      │  │
│  │  - Port 3001                                           │  │
│  │  - REST API endpoints                                  │  │
│  │  - CORS enabled                                        │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │         c3-wiring (DI Container)                 │ │  │
│  │  │  - Bootstrap on startup                          │ │  │
│  │  │  - Wire all contexts                             │ │  │
│  │  │                                                   │ │  │
│  │  │  ┌────────────────────────────────────────────┐  │ │  │
│  │  │  │  Domain Contexts (Business Logic)          │  │ │  │
│  │  │  │                                             │  │ │  │
│  │  │  │  • ParsingService (c3-parsing)             │  │ │  │
│  │  │  │  • EvaluationEngine (c3-compliance)        │  │ │  │
│  │  │  │  • ProjectionEngine (c3-projection)        │  │ │  │
│  │  │  │  • PatternDetector (c3-discovery)          │  │ │  │
│  │  │  │                                             │  │ │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │ │  │
│  │  │  │  │  Infrastructure (c3-shared)          │  │  │ │  │
│  │  │  │  │  • Logger                            │  │  │ │  │
│  │  │  │  │  • Cache                             │  │  │ │  │
│  │  │  │  │  • Metrics                           │  │  │ │  │
│  │  │  │  │  • ConfigurationService              │  │  │ │  │
│  │  │  │  └──────────────────────────────────────┘  │  │ │  │
│  │  │  └────────────────────────────────────────────┘  │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Local Development Setup

```
~/dev/
├── c3-platform/         # Orchestration repo
│   ├── scripts/
│   │   ├── setup-dev.sh    # Clone all repos
│   │   ├── link-all.sh     # npm link everything
│   │   ├── build-all.sh    # Build in order
│   │   └── test-all.sh     # Test all
│   ├── docker-compose.yml  # Run BFF + Web
│   └── c3.code-workspace   # VS Code multi-root
│
├── c3-shared/           # All repos are siblings
├── c3-parsing/
├── c3-compliance/
├── c3-projection/
├── c3-discovery/
├── c3-wiring/
├── c3-cli/
├── c3-bff/
└── c3-web/
```

## Package Publishing Flow

```
                    ┌─────────────────────────────┐
                    │  Developer makes changes    │
                    │  in c3-parsing              │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  npm version patch/minor    │
                    │  Updates package.json       │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  npm publish                │
                    │  → NPM Registry             │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼────────┐     ┌───────────▼────────┐     ┌──────────▼─────────┐
│ c3-compliance  │     │  c3-projection     │     │  c3-discovery      │
│ npm update     │     │  npm update        │     │  npm update        │
│ c3-parsing     │     │  c3-parsing        │     │  c3-parsing        │
└───────┬────────┘     └───────────┬────────┘     └──────────┬─────────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  c3-wiring                  │
                    │  npm update all contexts    │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼─────┐   ┌────▼─────┐
            │  c3-cli     │   │ c3-bff   │
            │  npm update │   │ npm      │
            │  c3-wiring  │   │ update   │
            └─────────────┘   └──────────┘
```

## Docker Compose Setup (Development)

```
docker-compose.yml (in c3-platform)
    │
    ├──► Service: bff
    │    ├── Build: ../c3-bff/Dockerfile
    │    ├── Port: 3001 → 3001
    │    ├── Volume: ../c3-bff:/app (live reload)
    │    └── Command: npm run dev
    │
    └──► Service: web
         ├── Build: ../c3-web/Dockerfile
         ├── Port: 5173 → 5173
         ├── Volume: ../c3-web:/app (live reload)
         ├── Env: VITE_API_URL=http://localhost:3001
         ├── Depends: bff
         └── Command: npm run dev
```

## Key Integration Points

### 1. NPM Package Dependencies
- All packages published to NPM (except c3-platform, c3-web)
- Semantic versioning (semver)
- Development uses `npm link` for local changes
- Production uses published versions

### 2. Dependency Injection (c3-wiring)
- Container wires all contexts
- Singleton pattern for infrastructure
- Factory pattern for use cases
- Token-based resolution

### 3. HTTP API (c3-bff ↔ c3-web)
- REST API with OpenAPI spec
- JSON payloads
- CORS enabled
- Vite proxy in development

### 4. VS Code Workspace
- Multi-root workspace shows all repos
- Shared settings (ESLint, TypeScript)
- Single IDE for entire platform

## Comparison: Current vs Proposed (with Schema)

```
┌──────────────────────┬─────────────────────┬──────────────────────┐
│      Aspect          │   Current State     │  With Schema         │
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Configuration        │ Ad-hoc, package.json│ Formal schema +      │
│                      │ only                │ validation           │
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Orchestration        │ Bash scripts        │ Generated from schema│
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Dependency Graph     │ Implicit            │ Explicit + validated │
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Build Order          │ Hardcoded in script │ Computed from schema │
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Contract Testing     │ None                │ Generated from schema│
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Documentation        │ Manual, scattered   │ Generated from schema│
├──────────────────────┼─────────────────────┼──────────────────────┤
│ Version Management   │ Manual updates      │ Automated validation │
└──────────────────────┴─────────────────────┴──────────────────────┘
```

---

**Legend:**
- `─►` : NPM dependency
- `◄─►` : HTTP communication
- `↓`  : Depends on / Built after
- `│`  : Vertical connection
- `┌─┐` : Box boundaries

