# C3 Development Guide

## Initial Setup

### Prerequisites

- Node.js 18+
- npm 9+
- GitHub CLI (`gh`)
- Git configured with SSH

### Setup Steps

1. **Clone the platform repository:**

   ```bash
   cd ~/dev
   git clone https://github.com/garrick0/c3-platform
   cd c3-platform
   ```

2. **Run setup script:**

   ```bash
   ./scripts/setup-dev.sh
   ```

   This will:
   - Clone all 9 C3 repositories
   - Install dependencies in each
   - Take ~5-10 minutes depending on network speed

3. **Link packages for local development:**

   ```bash
   ./scripts/link-all.sh
   ```

   This creates symlinks so you can develop across packages seamlessly.

## Repository Structure

All repositories are siblings in `~/dev/`:

```
~/dev/
├── c3-shared/          # Foundation library
├── c3-parsing/         # Parsing context
├── c3-compliance/      # Compliance context
├── c3-projection/      # Projection context
├── c3-discovery/       # Discovery context
├── c3-wiring/          # DI container
├── c3-cli/             # CLI app
├── c3-bff/             # BFF API
├── c3-web/             # Web UI
└── c3-platform/        # This repo
```

## Working on a Package

### Build a Single Package

```bash
cd ~/dev/c3-parsing
npm run build
```

### Test a Single Package

```bash
cd ~/dev/c3-parsing
npm test
```

### Development Mode (Watch)

```bash
cd ~/dev/c3-parsing
npm run dev  # Watches and rebuilds on changes
```

### Add Dependencies

```bash
cd ~/dev/c3-parsing
npm install lodash
npm install -D @types/lodash
```

## Working Across Packages

When working on features that span multiple packages:

1. **Create feature branch in each affected repo:**

   ```bash
   cd ~/dev/c3-parsing
   git checkout -b feature/new-node-type

   cd ~/dev/c3-compliance
   git checkout -b feature/new-node-type
   ```

2. **Make changes and build:**

   ```bash
   cd ~/dev/c3-parsing
   # ... edit files ...
   npm run build
   ```

3. **Test in dependent packages:**

   ```bash
   cd ~/dev/c3-compliance
   npm test  # Uses linked c3-parsing
   ```

4. **Commit and push each repo:**

   ```bash
   cd ~/dev/c3-parsing
   git add .
   git commit -m "feat: add new node type"
   git push origin feature/new-node-type

   cd ~/dev/c3-compliance
   git add .
   git commit -m "feat: support new node type"
   git push origin feature/new-node-type
   ```

5. **Create PRs that reference each other:**

   ```bash
   cd ~/dev/c3-parsing
   gh pr create --title "feat: Add new node type" \
     --body "Part of multi-repo feature. See also: garrick0/c3-compliance#XX"
   ```

## Building Everything

### Build All Packages

```bash
cd ~/dev/c3-platform
./scripts/build-all.sh
```

Builds in dependency order:
1. c3-shared
2. c3-parsing
3. c3-compliance, c3-projection, c3-discovery (parallel)
4. c3-wiring
5. c3-cli, c3-bff
6. c3-web

### Rebuild After Pulling Changes

```bash
cd ~/dev/c3-platform
./scripts/build-all.sh
```

## Testing Everything

### Run All Tests

```bash
cd ~/dev/c3-platform
./scripts/test-all.sh
```

### Run Tests for Specific Packages

```bash
cd ~/dev/c3-parsing
npm test

cd ~/dev/c3-compliance
npm test
```

## Dependency Management

### Package Dependencies

```
c3-shared (no deps)
  ↓
c3-parsing → c3-shared
  ↓
c3-compliance → c3-parsing, c3-shared
c3-projection → c3-parsing, c3-shared
c3-discovery → c3-compliance, c3-parsing, c3-shared
  ↓
c3-wiring → all contexts
  ↓
c3-cli → c3-wiring
c3-bff → c3-wiring
c3-web (no C3 deps, calls BFF API)
```

### Import Examples

```typescript
// In c3-parsing
import { Result, Logger } from 'c3-shared';

// In c3-compliance
import { PropertyGraph } from 'c3-parsing';
import { Logger } from 'c3-shared';

// In c3-cli
import { bootstrap } from 'c3-wiring';
```

## Common Tasks

### Update Dependencies

```bash
cd ~/dev/c3-parsing
npm update
npm install
```

### Add New Package

If creating a new context or package:

1. Create GitHub repo
2. Clone to `~/dev/`
3. Add to scripts in `c3-platform/scripts/`
4. Update `link-all.sh` if it has dependencies

### Check Link Status

```bash
npm ls -g --depth=0 --link=true
```

### Unlink All Packages

```bash
cd ~/dev/c3-shared
npm unlink

cd ~/dev/c3-parsing
npm unlink

# ... repeat for all packages
```

Or use NPM registry packages instead:

```bash
cd ~/dev/c3-cli
npm unlink c3-shared
npm install c3-shared
```

## Troubleshooting

### "Module not found" errors

Re-link packages:

```bash
cd ~/dev/c3-platform
./scripts/link-all.sh
```

### Stale builds

Rebuild everything:

```bash
cd ~/dev/c3-platform
./scripts/build-all.sh
```

### TypeScript errors across packages

Ensure all packages are built:

```bash
cd ~/dev/c3-shared
npm run build

cd ~/dev/c3-parsing
npm run build
```

### npm link issues

Clear npm cache and re-link:

```bash
npm cache clean --force
cd ~/dev/c3-platform
./scripts/link-all.sh
```

## Best Practices

### 1. Always build after pulling

```bash
git pull
npm run build
```

### 2. Test before committing

```bash
npm test
npm run build
```

### 3. Keep dependencies synchronized

When updating shared dependencies, update in all packages.

### 4. Use feature branches

Never commit directly to main in any repository.

### 5. Link dependencies for development

Always use `npm link` for local development, not `npm install` with file paths.

## Git Workflow

### Creating a Feature

```bash
# In each affected repo
git checkout main
git pull
git checkout -b feature/my-feature
```

### Committing Changes

```bash
git add .
git commit -m "feat: description"
git push origin feature/my-feature
```

### Creating Pull Requests

```bash
gh pr create --title "feat: Description" \
  --body "Detailed description..."
```

### After PR Merge

```bash
git checkout main
git pull
git branch -d feature/my-feature
```

## Performance Tips

### Parallel Builds

Build contexts in parallel (they don't depend on each other):

```bash
# Terminal 1
cd ~/dev/c3-compliance && npm run build

# Terminal 2
cd ~/dev/c3-projection && npm run build

# Terminal 3
cd ~/dev/c3-discovery && npm run build
```

### Watch Mode for Active Development

```bash
# Terminal 1: Watch shared
cd ~/dev/c3-shared && npm run dev

# Terminal 2: Watch parsing
cd ~/dev/c3-parsing && npm run dev

# Terminal 3: Run CLI
cd ~/dev/c3-cli && npm run dev
```

## Next Steps

- See `PUBLISHING.md` for publishing guide
- See `TROUBLESHOOTING.md` for common issues
- See platform README for quick reference
