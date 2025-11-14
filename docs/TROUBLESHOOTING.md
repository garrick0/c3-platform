# Troubleshooting Guide

## Common Issues

### "Module not found" Errors

**Symptom:** `Cannot find module 'c3-shared'`

**Cause:** Package not linked

**Solution:**
```bash
cd ~/dev/c3-platform
./scripts/link-all.sh
```

---

### Build Fails with TypeScript Errors

**Symptom:** `error TS2307: Cannot find module`

**Cause:** Packages not built in dependency order

**Solution:**
```bash
cd ~/dev/c3-platform
./scripts/build-all.sh
```

---

### npm link Not Working

**Symptom:** Changes in one package not reflected in dependent packages

**Cause:** Stale links or cached builds

**Solution:**
```bash
# Clear all links
cd ~/dev/c3-shared && npm unlink
cd ~/dev/c3-parsing && npm unlink
# ... repeat for all packages

# Re-link
cd ~/dev/c3-platform
./scripts/link-all.sh

# Rebuild
./scripts/build-all.sh
```

---

### Package Version Conflicts

**Symptom:** Different packages using different versions

**Cause:** Manual version updates got out of sync

**Solution:**
```bash
# Check all versions
cd ~/dev
for dir in c3-*/; do
  version=$(node -p "require('./$dir/package.json').version" 2>/dev/null || echo "N/A")
  echo "$dir: $version"
done

# Update all to same version manually
```

---

### TypeScript Can't Find Types

**Symptom:** `Property 'id' does not exist on type 'Entity'`

**Cause:** TypeScript declaration files not generated

**Solution:**
```bash
# Rebuild shared package
cd ~/dev/c3-shared
npm run clean
npm run build

# Check dist/index.d.ts exists
ls -la dist/index.d.ts
```

---

### Scripts Fail with "Not Found"

**Symptom:** `./scripts/build-all.sh: line 10: ../c3-shared: No such file`

**Cause:** Repositories not cloned

**Solution:**
```bash
cd ~/dev/c3-platform
./scripts/clone-all.sh
```

---

### BFF Won't Start

**Symptom:** `Error: Cannot find module 'c3-wiring'`

**Cause:** Dependencies not installed or linked

**Solution:**
```bash
cd ~/dev/c3-bff
npm install
npm link c3-shared c3-wiring c3-parsing c3-compliance c3-projection c3-discovery
npm run build
npm start
```

---

### Web App Build Fails

**Symptom:** Vite build errors

**Cause:** Node modules corrupted

**Solution:**
```bash
cd ~/dev/c3-web
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### GitHub Push Rejected

**Symptom:** `error: failed to push`

**Cause:** Not authenticated or no permissions

**Solution:**
```bash
# Check auth
gh auth status

# Re-authenticate if needed
gh auth login
```

---

### NPM Publish Fails

**Symptom:** `npm ERR! 403 Forbidden`

**Cause:** Not logged in or package name taken

**Solution:**
```bash
# Login
npm login

# Check if name available
npm view c3-shared

# If taken, use scoped package
# Update package.json: "name": "@garrick0/c3-shared"
```

---

## Performance Issues

### Slow npm install

**Solution:** Use npm ci instead:
```bash
npm ci  # Uses package-lock.json exactly
```

### Slow builds

**Solution:** Build only changed packages:
```bash
cd ~/dev/c3-parsing
npm run build

# Don't rebuild everything
```

### Slow link-all.sh

**Solution:** Only link what you need:
```bash
cd ~/dev/c3-parsing
npm link c3-shared
```

---

## Development Issues

### Changes Not Reflected

**Symptom:** Made changes but dependent package doesn't see them

**Cause:** Forgot to rebuild

**Solution:**
```bash
cd ~/dev/c3-parsing
# Make changes...
npm run build  # Don't forget this!

cd ~/dev/c3-cli
npm test  # Now sees changes
```

---

### Can't Find Recently Added Export

**Symptom:** `Module has no exported member 'NewClass'`

**Cause:** Export not added to index.ts

**Solution:**
```bash
# In c3-shared/src/index.ts
export * from './domain/NewClass.js';

# Rebuild
npm run build
```

---

### TypeScript Errors After Updating Shared

**Symptom:** Lots of type errors after changing c3-shared

**Cause:** Breaking change in shared package

**Solution:**
```bash
# Update all dependent packages
cd ~/dev/c3-parsing && npm run build
cd ~/dev/c3-compliance && npm run build
cd ~/dev/c3-projection && npm run build
cd ~/dev/c3-discovery && npm run build
cd ~/dev/c3-wiring && npm run build
cd ~/dev/c3-cli && npm run build
cd ~/dev/c3-bff && npm run build

# Or use script
cd ~/dev/c3-platform
./scripts/build-all.sh
```

---

## Clean Slate

### Start Fresh

If everything is broken, start over:

```bash
# 1. Remove all repos except platform
cd ~/dev
rm -rf c3-shared c3-parsing c3-compliance c3-projection c3-discovery c3-wiring c3-cli c3-bff c3-web

# 2. Unlink all packages
npm uninstall -g c3-shared c3-parsing c3-compliance c3-projection c3-discovery c3-wiring

# 3. Clone and setup fresh
cd c3-platform
./scripts/setup-dev.sh
./scripts/link-all.sh
./scripts/build-all.sh
```

---

## Getting Help

### Check Package Status

```bash
# See what's linked globally
npm list -g --link=true --depth=0

# See package dependencies
cd ~/dev/c3-cli
npm list

# See where package is installed from
npm list c3-shared
```

### Debug Build Issues

```bash
# Verbose build
cd ~/dev/c3-parsing
npx tsc --listFiles | head -20

# Check TypeScript config
cat tsconfig.json
```

### Check Git Status All Repos

```bash
cd ~/dev
for dir in c3-*/; do
  echo "=== $dir ==="
  cd $dir
  git status --short
  cd ..
done
```

---

## Pro Tips

### Watch Mode

For active development, use watch mode:

```bash
# Terminal 1: Watch shared
cd ~/dev/c3-shared && npm run dev

# Terminal 2: Watch parsing
cd ~/dev/c3-parsing && npm run dev

# Terminal 3: Run CLI
cd ~/dev/c3-cli && npm run dev parse /path/to/code
```

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

### Quick Package Switch

```bash
# Add alias to your shell
alias cdp='cd ~/dev/c3-parsing'
alias cdc='cd ~/dev/c3-compliance'
alias cdcli='cd ~/dev/c3-cli'
```

---

## Still Having Issues?

1. Check `/Users/samuelgleeson/dev/c3-platform/docs/DEVELOPMENT.md`
2. Review `/Users/samuelgleeson/dev/c3-platform/docs/PUBLISHING.md`
3. Check the migration plan: `.working/polyrepo-implementation-plan.md`
4. Check repository README files
