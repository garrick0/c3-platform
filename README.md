# C3 Platform

> Orchestration repository for the C3 Code Standards Management System

This repository contains scripts, documentation, and CI/CD configurations for managing the C3 polyrepo development workflow.

## Quick Start

### 1. Clone Platform

```bash
cd ~/dev
gh repo clone garrick0/c3-platform
cd c3-platform
```

### 2. Setup Development Environment

```bash
./scripts/setup-dev.sh
```

This will:
- Clone all C3 repositories
- Install dependencies in each repo

### 3. Link Packages for Local Development

```bash
./scripts/link-all.sh
```

This creates symlinks so changes in one package are immediately available to dependent packages.

### 4. Build Everything

```bash
./scripts/build-all.sh
```

### 5. Test Everything

```bash
./scripts/test-all.sh
```

## Repository Structure

All C3 repositories are siblings in `~/dev/`:

```
~/dev/
├── c3-shared/          # Core domain abstractions
├── c3-parsing/         # Code parsing & property graphs
├── c3-compliance/      # Rules evaluation & remediation
├── c3-projection/      # Graph transformations & views
├── c3-discovery/       # AI-powered pattern detection
├── c3-wiring/          # Dependency injection
├── c3-cli/             # Command-line interface
├── c3-bff/             # Backend-for-frontend API
├── c3-web/             # React frontend
└── c3-platform/        # This repo (orchestration)
```

## Available Scripts

### Development

- **`./scripts/clone-all.sh`** - Clone all C3 repositories
- **`./scripts/setup-dev.sh`** - Setup complete dev environment
- **`./scripts/link-all.sh`** - Link packages for local development
- **`./scripts/build-all.sh`** - Build all packages
- **`./scripts/test-all.sh`** - Test all packages

### Publishing

- **`./scripts/publish-all.sh`** - Publish all packages to NPM

## Local Development Workflow

### Working on a Single Package

```bash
cd ~/dev/c3-parsing
# Make changes...
npm run build

# Changes automatically available to linked packages
cd ~/dev/c3-cli
npm test  # Uses your local c3-parsing
```

### Working Across Multiple Packages

```bash
# Feature spanning parsing + compliance
cd ~/dev/c3-parsing
git checkout -b feature/new-api
# Make changes...
npm run build

cd ~/dev/c3-compliance
git checkout -b feature/new-api
# Make changes...
npm test  # Uses linked c3-parsing
```

## NPM Packages

All packages are published to NPM as unscoped packages:

- `c3-shared` - Core domain abstractions
- `c3-parsing` - Parsing context
- `c3-compliance` - Compliance context
- `c3-projection` - Projection context
- `c3-discovery` - Discovery context
- `c3-wiring` - DI container
- `c3-cli` - CLI application
- `c3-bff` - BFF API server

## GitHub Repositories

All repositories are under `github.com/garrick0/`:

- https://github.com/garrick0/c3-platform
- https://github.com/garrick0/c3-shared
- https://github.com/garrick0/c3-parsing
- https://github.com/garrick0/c3-compliance
- https://github.com/garrick0/c3-projection
- https://github.com/garrick0/c3-discovery
- https://github.com/garrick0/c3-wiring
- https://github.com/garrick0/c3-cli
- https://github.com/garrick0/c3-bff
- https://github.com/garrick0/c3-web

## CI/CD Templates

This repository contains GitHub Actions workflow templates:

- **`lib-ci.yml`** - For library packages (contexts, shared, wiring)
- **`app-ci.yml`** - For application packages (CLI, BFF, Web)

Copy these to `.github/workflows/` in each repository.

## Documentation

See `docs/` directory for:

- Development guide
- Publishing guide
- Troubleshooting guide

## Requirements

- Node.js 18+
- npm 9+
- GitHub CLI (`gh`)
- Git

## License

MIT
