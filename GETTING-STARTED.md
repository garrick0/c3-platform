# Getting Started with C3 Polyrepo

## Quick Start (5 minutes)

### 1. Clone Platform

```bash
cd ~/dev
git clone https://github.com/garrick0/c3-platform
cd c3-platform
```

### 2. Setup Everything

```bash
./scripts/setup-dev.sh
```

This will:
- Clone all 9 C3 repositories
- Install dependencies in each
- Take ~5 minutes

### 3. Link Packages

```bash
./scripts/link-all.sh
```

Links all packages for local development.

### 4. Build Everything

```bash
./scripts/build-all.sh
```

Builds all 9 packages in dependency order (~2 minutes).

### 5. You're Ready!

```bash
# Open in VS Code
code c3.code-workspace

# Or start working
cd ~/dev/c3-parsing
# Make changes...
```

## Repository Structure

After setup, you'll have:

```
~/dev/
├── c3-shared/          # Core domain abstractions
├── c3-parsing/         # Parsing context
├── c3-compliance/      # Compliance context
├── c3-projection/      # Projection context
├── c3-discovery/       # Discovery context
├── c3-wiring/          # DI container
├── c3-cli/             # CLI app
├── c3-bff/             # BFF API
├── c3-web/             # Web UI
└── c3-platform/        # This repo (orchestration)
```

## What Can You Do Now?

### Work on a Package

```bash
cd ~/dev/c3-parsing
npm run dev  # Watch mode
# Edit files...
# Changes auto-compile
```

### Test Changes in CLI

```bash
cd ~/dev/c3-parsing
# Make changes...
npm run build

cd ~/dev/c3-cli
npm test  # Uses your local c3-parsing
```

### Run Full Stack

```bash
# Terminal 1: BFF
cd ~/dev/c3-bff
npm start

# Terminal 2: Web
cd ~/dev/c3-web
npm run dev

# Browser: http://localhost:5173
```

### Or Use Docker

```bash
cd ~/dev/c3-platform
docker-compose up
```

## Next Steps

- Read `docs/DEVELOPMENT.md` for detailed workflow
- Read `docs/TROUBLESHOOTING.md` if you hit issues
- Open `c3.code-workspace` in VS Code for best experience

## Common Commands

```bash
# Build everything
cd ~/dev/c3-platform && ./scripts/build-all.sh

# Test everything
cd ~/dev/c3-platform && ./scripts/test-all.sh

# Rebuild after pulling changes
cd ~/dev/c3-platform && ./scripts/build-all.sh
```

## Need Help?

See `docs/TROUBLESHOOTING.md` for solutions to common issues.
