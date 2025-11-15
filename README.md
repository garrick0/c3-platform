# C3 Platform

> Orchestration repository for the C3 Code Standards Management System

This repository contains scripts, documentation, and CI/CD configurations for managing the C3 polyrepo development workflow.

## Quick Start

```bash
# 1. Clone platform (or cd to it if you already have it)
cd ~/dev
gh repo clone garrick0/c3-platform
cd c3-platform

# 2. Setup environment (smart: clones if needed, otherwise just installs)
./scripts/setup-dev.sh

# 3. Link packages for local development
./scripts/link-all.sh

# 4. Build everything
./scripts/build-all.sh

# 5. Start developing!
code c3.code-workspace
```

**Note:** `setup-dev.sh` automatically detects if repos already exist and prompts you to skip cloning.

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

- **`./scripts/setup-dev.sh`** - Complete setup (clone + install with smart detection)
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
