# C3 Platform Polyrepo Analysis

## Executive Summary

The C3 platform is a **polyrepo architecture** consisting of 10 separate Git repositories organized as NPM packages with manual orchestration. This analysis examines the current state, identifies strengths and weaknesses, and proposes potential improvements including schema-based configuration.

---

## Current Architecture

### Repository Structure

```
~/dev/
├── c3-platform/        # Orchestration (scripts, docs, docker-compose)
├── c3-shared/          # Core domain abstractions & infrastructure
├── c3-parsing/         # Code parsing & property graph generation
├── c3-compliance/      # Rules evaluation & remediation
├── c3-projection/      # Graph transformations & visualizations
├── c3-discovery/       # AI-powered pattern detection
├── c3-wiring/          # Dependency injection container
├── c3-cli/             # Command-line interface (consumer)
├── c3-bff/             # Backend-for-frontend API (consumer)
└── c3-web/             # React frontend (consumer)
```

### Dependency Graph

```
Layer 0: Foundation
  c3-shared (no dependencies)
    ↓
Layer 1: Domain Contexts
  c3-parsing (depends on: c3-shared)
    ↓
Layer 2: Advanced Contexts
  c3-compliance (depends on: c3-shared, c3-parsing)
  c3-projection (depends on: c3-shared, c3-parsing)
    ↓
Layer 3: Discovery & Integration
  c3-discovery (depends on: c3-shared, c3-parsing, c3-compliance)
  c3-wiring (depends on: ALL contexts)
    ↓
Layer 4: Applications
  c3-cli (depends on: c3-shared, c3-wiring, all contexts)
  c3-bff (depends on: c3-shared, c3-wiring, all contexts)
  c3-web (runtime HTTP calls to c3-bff)
```

### How It Fits Together

#### 1. **Domain Layer** (`c3-shared`)
- Provides **domain primitives**: Entity, ValueObject, AggregateRoot
- Provides **infrastructure abstractions**: Logger, Cache, Metrics
- Provides **configuration system**: ConfigSchema, ConfigurationService
- Published to NPM, consumed by all other packages

#### 2. **Context Packages** (parsing, compliance, projection, discovery)
- Each implements **Bounded Context** from Domain-Driven Design
- **Domain-Driven Design structure**:
  - `domain/` - entities, value objects, services, ports
  - `application/` - use cases, DTOs
  - `infrastructure/` - adapters, persistence
- Export public API through `index.ts`
- Published to NPM independently

#### 3. **Integration Layer** (`c3-wiring`)
- **Manual dependency injection container**
- Wires together all contexts with their dependencies
- Module-based registration (`parsing.module.ts`, `compliance.module.ts`, etc.)
- Bootstrap function creates fully-wired container
- Published to NPM

#### 4. **Application Layer** (`c3-cli`, `c3-bff`, `c3-web`)

**CLI Application**:
- Commander-based CLI
- Imports `c3-wiring` to get container
- Resolves use cases from container
- Provides terminal UI

**BFF (Backend for Frontend)**:
- Express.js API server
- Imports `c3-wiring` to bootstrap container
- Controllers resolve use cases from container
- REST API with OpenAPI spec
- Runs on port 3001

**Web Frontend**:
- React SPA with Vite
- Makes HTTP calls to BFF API
- D3.js for graph visualization
- Zustand for state management
- Runs on port 5173

#### 5. **Orchestration** (`c3-platform`)
- Not published to NPM
- Contains:
  - **Scripts**: `setup-dev.sh`, `link-all.sh`, `build-all.sh`, `test-all.sh`
  - **Docker Compose**: orchestrates BFF + Web
  - **VS Code Workspace**: multi-root workspace for all repos
  - **Documentation**: developer guides, troubleshooting

### Development Workflow

1. **Setup**: `./scripts/setup-dev.sh` clones all repos and installs dependencies
2. **Linking**: `./scripts/link-all.sh` uses `npm link` to wire local packages
3. **Building**: `./scripts/build-all.sh` builds in dependency order
4. **Development**: Changes in one package automatically available to consumers (via npm link)
5. **Publishing**: Each package publishes to NPM independently

---

## Current State Analysis

### ✅ Strengths

#### 1. **Clear Separation of Concerns**
- Each context is truly independent
- Domain boundaries are well-defined
- Follows Bounded Context pattern from DDD

#### 2. **Independent Versioning**
- Each package has own version (e.g., `c3-parsing@2.0.0`, `c3-compliance@0.1.0`)
- Can evolve contexts at different speeds
- Breaking changes isolated to one context

#### 3. **Flexible Dependency Management**
- Contexts can be consumed independently
- Third parties could use just `c3-parsing` without other contexts
- Clear dependency graph (no circular dependencies)

#### 4. **Development Experience**
- VS Code multi-root workspace provides unified view
- `npm link` enables live changes across packages
- Scripts abstract away complexity

#### 5. **Clean Architecture**
- Domain-Driven Design structure
- Hexagonal architecture (ports & adapters)
- Use case-driven API

### ❌ Weaknesses

#### 1. **No Schema or Formal Configuration**
- **Each repo is configured ad-hoc**
- Package.json is only source of truth
- No validation of dependency versions
- No enforcement of conventions

#### 2. **Manual Orchestration**
- Scripts are bash-based and fragile
- Dependency order hardcoded in multiple places
- No automated validation of repo structure

#### 3. **Inconsistent Tooling**
- Some use `vitest`, others don't
- Different build configurations (tsup vs tsc)
- No shared ESLint/Prettier config

#### 4. **Version Synchronization Pain**
- Manually updating versions across repos
- No automated versioning strategy
- Easy to have version mismatches in development

#### 5. **Local Development Friction**
- `npm link` is fragile (easily broken)
- Must rebuild after changes
- No hot reloading across packages

#### 6. **Testing Complexity**
- Hard to run integration tests across contexts
- Mock boundaries unclear
- No contract testing between contexts

#### 7. **Documentation Drift**
- Documentation scattered across repos
- No single source of truth for architecture
- Easy to get out of sync

---

## Alternative Approaches

### Option 1: **Monorepo** (with Nx, Turborepo, or Lerna)

#### Structure
```
c3-platform/
  packages/
    shared/
    parsing/
    compliance/
    projection/
    discovery/
    wiring/
    cli/
    bff/
    web/
  nx.json or turbo.json
  package.json (root)
```

#### Pros
- **Unified tooling**: Single ESLint, Prettier, TypeScript config
- **Atomic commits**: Change multiple packages in one commit
- **Better dependency management**: Yarn/PNPM workspaces
- **Automated task orchestration**: Nx/Turbo can detect affected packages
- **Built-in caching**: Faster builds and tests
- **Easier refactoring**: IDE can refactor across packages

#### Cons
- **Larger repository**: Slower git operations
- **All-or-nothing versioning** (unless using Nx independent versioning)
- **More complex CI/CD**: Need to detect changed packages
- **Potential coupling**: Easier to create dependencies

#### Best Tools
- **Nx**: Most powerful, great for complex dependencies, built-in generators
- **Turborepo**: Simpler, focuses on caching and task orchestration
- **Lerna**: Mature but less active development

---

### Option 2: **Schema-Based Polyrepo** (Current + Schema)

Keep polyrepo but add formal schema for configuration and validation.

#### Schema Structure

```yaml
# c3-repo.schema.json
{
  "type": "object",
  "required": ["name", "type", "dependencies"],
  "properties": {
    "name": { "type": "string" },
    "type": { "enum": ["foundation", "context", "integration", "application", "orchestration"] },
    "layer": { "type": "number" },
    "dependencies": {
      "type": "array",
      "items": { "type": "string" }
    },
    "exports": {
      "type": "array",
      "items": { "type": "string" }
    },
    "tooling": {
      "type": "object",
      "properties": {
        "buildCommand": { "type": "string" },
        "testCommand": { "type": "string" },
        "lintCommand": { "type": "string" }
      }
    }
  }
}
```

#### Each Repo Has c3-repo.yaml

```yaml
# c3-parsing/c3-repo.yaml
name: c3-parsing
type: context
layer: 1
dependencies:
  - c3-shared@^0.1.0
exports:
  - ParsingService
  - PropertyGraph
  - ParseCodebase
tooling:
  buildCommand: npm run build
  testCommand: npm test
  lintCommand: npm run lint
contracts:
  - name: ParsingService
    version: 1.0.0
    methods:
      - parseFile
      - parseCodebase
```

#### Benefits
- **Validation**: CLI tool validates all repos against schema
- **Documentation**: Schema is living documentation
- **Tooling**: Generate scripts from schema
- **Contract Testing**: Define contracts in schema
- **Automated Checks**: CI validates schema compliance

#### Implementation
```bash
# New CLI tool
c3-platform validate          # Validate all repos
c3-platform build --affected  # Build only affected
c3-platform link              # Smart linking based on schema
c3-platform generate scripts  # Generate bash scripts from schema
```

---

### Option 3: **Hybrid - Monorepo for Contexts + Separate Apps**

#### Structure
```
c3-contexts/        # Monorepo with Nx
  packages/
    shared/
    parsing/
    compliance/
    projection/
    discovery/
    wiring/

c3-cli/            # Separate repo (consumes @c3/packages)
c3-bff/            # Separate repo
c3-web/            # Separate repo
```

#### Pros
- **Best of both worlds**: Tight coupling where needed, loose where beneficial
- **Context isolation**: Contexts evolve together
- **App independence**: Apps can be deployed/versioned independently

#### Cons
- **Complexity**: Mix of monorepo and polyrepo
- **Tooling overhead**: Need to support both approaches

---

## Recommended Approach

### **Short Term: Schema-Based Polyrepo**

For the C3 platform, I recommend **keeping the polyrepo** but adding **schema-based configuration** and **better tooling**.

#### Why?
1. **Bounded contexts ARE independent domains** - they should be in separate repos
2. **Apps consume contexts differently** - CLI is local, BFF is server, Web is browser
3. **Third-party consumption** - external projects might want just `c3-parsing`
4. **Team scaling** - different teams could own different contexts
5. **Incremental improvement** - doesn't require massive refactoring

#### Implementation Plan

##### Phase 1: Add Schema (1-2 weeks)

1. **Define schema** (`c3-repo.schema.json`)
2. **Add `c3-repo.yaml` to each repo**
3. **Create validation tool** (`@c3/repo-tools`)
4. **Update CI to validate schemas**

##### Phase 2: Automated Tooling (2-3 weeks)

1. **Generate scripts from schemas**
   - `link-all.sh` generated from dependency graph
   - `build-all.sh` respects layer order
2. **Dependency validation**
   - Check version compatibility
   - Detect circular dependencies
3. **Contract testing**
   - Define contracts in schema
   - Generate contract tests

##### Phase 3: Developer Experience (2-3 weeks)

1. **Better local development**
   - Replace `npm link` with Yalc or pnpm workspaces
   - Add watch mode that rebuilds dependencies
2. **Unified tooling**
   - Shared ESLint/Prettier config from `c3-shared`
   - Shared TypeScript config
3. **Documentation generation**
   - Generate architecture diagrams from schemas
   - Generate dependency graph
   - Auto-update documentation

---

### **Long Term: Consider Monorepo** (if team grows)

If the team grows beyond 5-10 people or contexts become tightly coupled, consider migrating to **Nx monorepo**.

#### When to Migrate?
- Coordinating changes across 3+ contexts becomes frequent
- Version synchronization becomes painful
- Need for atomic cross-context changes
- Want advanced features (distributed caching, affected tests)

---

## Schema Design Details

### Complete Schema Example

```yaml
# c3-repo.schema.yaml
version: "1.0"
repositories:
  c3-shared:
    type: foundation
    layer: 0
    dependencies: []
    exports:
      domain:
        - Entity
        - ValueObject
        - AggregateRoot
      infrastructure:
        - Logger
        - Cache
        - Metrics
      configuration:
        - ConfigSchema
        - ConfigurationService
    contracts:
      - name: Logger
        version: 1.0.0
        stability: stable
      - name: ConfigurationService
        version: 1.0.0
        stability: stable

  c3-parsing:
    type: context
    layer: 1
    dependencies:
      - c3-shared: ^0.1.0
    exports:
      - ParsingService
      - PropertyGraph
      - ParseCodebase (use case)
      - ParseFile (use case)
    contracts:
      - name: ParsingService
        version: 2.0.0
        stability: stable
        breaking-changes:
          - 2.0.0: "Switched to async parsing"

  c3-compliance:
    type: context
    layer: 2
    dependencies:
      - c3-shared: ^0.1.0
      - c3-parsing: ^2.0.0
    exports:
      - EvaluationEngine
      - CheckCompliance (use case)
    contracts:
      - name: EvaluationEngine
        version: 1.0.0
        stability: beta

  c3-wiring:
    type: integration
    layer: 3
    dependencies:
      - c3-shared: ^0.1.0
      - c3-parsing: ^2.0.0
      - c3-compliance: ^0.1.0
      - c3-projection: ^0.1.0
      - c3-discovery: ^0.1.0
    exports:
      - Container
      - bootstrap
    contracts:
      - name: Container
        version: 1.0.0
        stability: stable

  c3-bff:
    type: application
    layer: 4
    dependencies:
      - c3-wiring: ^0.1.0
      - c3-shared: ^0.1.0
      - c3-parsing: ^2.0.0
      - c3-compliance: ^0.1.0
      - c3-projection: ^0.1.0
      - c3-discovery: ^0.1.0
    runtime:
      type: server
      port: 3001
      env:
        - NODE_ENV
        - PORT
        - HOST
        - CORS_ORIGIN

  c3-web:
    type: application
    layer: 4
    dependencies: []  # No NPM dependencies on other packages
    runtime:
      type: spa
      port: 5173
      proxies:
        - path: /api
          target: http://localhost:3001

tooling:
  typescript:
    version: ^5.3.3
    config: shared
  eslint:
    config: shared
  prettier:
    config: shared
  testing:
    framework: vitest
    coverage: required
    threshold: 80

workflows:
  build:
    - c3-shared
    - c3-parsing
    - c3-compliance, c3-projection  # Parallel
    - c3-discovery
    - c3-wiring
    - c3-cli, c3-bff  # Parallel
    - c3-web
  
  test:
    parallel: true
    affected-only: true

  publish:
    strategy: independent
    registry: https://registry.npmjs.org
```

### Tooling CLI

```bash
# Install globally or use via npx
npm install -g @c3/platform-tools

# Commands
c3 validate                    # Validate all repos against schema
c3 validate --repo c3-parsing  # Validate single repo
c3 graph                       # Show dependency graph
c3 build                       # Build in correct order
c3 build --affected            # Build only affected by changes
c3 link                        # Smart npm link based on dependencies
c3 test                        # Run tests across repos
c3 test --affected             # Test only affected
c3 doctor                      # Check health of repos
c3 generate docs               # Generate docs from schema
c3 generate scripts            # Generate bash scripts
c3 check-versions              # Validate version compatibility
```

---

## Migration Path

### Phase 1: Add Schema (Week 1-2)

**Day 1-3: Schema Design**
- [ ] Design `c3-repo.schema.json`
- [ ] Review with team
- [ ] Finalize schema v1.0

**Day 4-7: Add to Repos**
- [ ] Add `c3-repo.yaml` to c3-shared
- [ ] Add `c3-repo.yaml` to c3-parsing
- [ ] Add `c3-repo.yaml` to other contexts
- [ ] Add to applications

**Day 8-10: Validation Tool**
- [ ] Create `@c3/platform-tools` package
- [ ] Implement `c3 validate` command
- [ ] Add unit tests
- [ ] Document usage

**Day 11-14: CI Integration**
- [ ] Add validation to each repo's CI
- [ ] Create platform-level validation job
- [ ] Test across all repos

### Phase 2: Automated Tooling (Week 3-5)

**Week 3: Script Generation**
- [ ] Implement `c3 build` command
- [ ] Implement `c3 link` command
- [ ] Implement `c3 graph` command
- [ ] Replace manual scripts

**Week 4: Dependency Management**
- [ ] Implement version checking
- [ ] Add circular dependency detection
- [ ] Create dependency upgrade tool

**Week 5: Contract Testing**
- [ ] Define contract format
- [ ] Generate contract tests
- [ ] Integrate with test pipeline

### Phase 3: DX Improvements (Week 6-8)

**Week 6: Better Local Dev**
- [ ] Evaluate Yalc vs npm link
- [ ] Implement watch mode
- [ ] Add hot reloading

**Week 7: Unified Tooling**
- [ ] Create shared ESLint config
- [ ] Create shared Prettier config
- [ ] Create shared TypeScript config
- [ ] Migrate all repos

**Week 8: Documentation**
- [ ] Generate architecture diagrams
- [ ] Generate API documentation
- [ ] Create migration guide
- [ ] Update all docs

---

## Conclusion

The C3 platform's **polyrepo architecture is fundamentally sound** for a domain-driven, bounded-context-based system. The main issues are **lack of formalization** and **manual orchestration**.

### Recommendation

**Adopt schema-based polyrepo approach:**

1. **Keep separate repos** - respects bounded contexts
2. **Add formal schema** - validate structure and dependencies
3. **Build better tooling** - automate orchestration
4. **Improve DX** - better local development experience

This provides **80% of monorepo benefits** while maintaining **polyrepo flexibility**.

### Future Considerations

**Monitor for signs to migrate to monorepo:**
- Team grows beyond 10 people
- Frequent cross-context changes
- Version management becomes painful
- Need for distributed caching

Until then, **schema-based polyrepo is the sweet spot**.

---

## Next Steps

1. **Review this analysis** with the team
2. **Decide on approach** (schema-based polyrepo recommended)
3. **Prioritize phases** based on pain points
4. **Start with Phase 1** (add schema)
5. **Iterate and improve**

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-16  
**Author**: AI Analysis based on codebase review

