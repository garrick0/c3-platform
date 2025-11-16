# C3 Platform - Troubleshooting Guide

**Having issues?** This guide covers common problems and solutions.

---

## 📋 Table of Contents

1. [GitHub Packages Authentication](#github-packages-authentication)
2. [Package Installation Issues](#package-installation-issues)
3. [Build Failures](#build-failures)
4. [CI/CD Issues](#cicd-issues)
5. [Type Declaration Problems](#type-declaration-problems)
6. [Dependency Conflicts](#dependency-conflicts)
7. [Local Development Issues](#local-development-issues)
8. [Rollback Procedures](#rollback-procedures)

---

## 🔐 GitHub Packages Authentication

### Issue: `401 Unauthorized - GET https://npm.pkg.github.com/@garrick0%2fc3-shared`

**Symptoms:**
```bash
npm error code E401
npm error 401 Unauthorized - GET https://npm.pkg.github.com/@garrick0%2fc3-shared
npm error A complete log of this run can be found in: /Users/.../.npm/_logs/...
```

**Causes:**
- Missing or invalid GitHub Personal Access Token (PAT)
- `.npmrc` not configured correctly
- Token lacks `read:packages` scope

**Solutions:**

1. **Check if .npmrc exists:**
   ```bash
   cat ~/.npmrc | grep npm.pkg.github.com
   ```

2. **Create/update .npmrc:**
   ```bash
   echo "@garrick0:registry=https://npm.pkg.github.com" >> ~/.npmrc
   echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT" >> ~/.npmrc
   ```

3. **Create a new PAT:**
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Select scope: `read:packages` (and `write:packages` if you're publishing)
   - Copy token and update `.npmrc`

4. **Test authentication:**
   ```bash
   npm whoami --registry=https://npm.pkg.github.com
   # Should output your GitHub username
   ```

5. **For CI/CD:**
   - GitHub Actions automatically provides `GITHUB_TOKEN`
   - Ensure workflow has `packages: read` permission
   ```yaml
   permissions:
     contents: read
     packages: read
   ```

---

## 📦 Package Installation Issues

### Issue: `Cannot find module '@garrick0/c3-shared'`

**Symptoms:**
```bash
Error: Cannot find module '@garrick0/c3-shared'
```

**Causes:**
- Package not published
- Using wrong version/tag
- npm cache issues

**Solutions:**

1. **Check if package exists:**
   ```bash
   npm view @garrick0/c3-shared
   ```

2. **Check available versions:**
   ```bash
   npm view @garrick0/c3-shared versions
   npm view @garrick0/c3-shared dist-tags
   ```

3. **Install specific version:**
   ```bash
   npm install @garrick0/c3-shared@dev
   # or
   npm install @garrick0/c3-shared@0.1.0-dev.b50f4a8.0
   ```

4. **Clear cache and reinstall:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Check if library needs to be published:**
   ```bash
   cd /path/to/c3-shared
   git push  # Triggers CI to publish
   # Wait for CI (~50 seconds), then retry install
   ```

---

### Issue: `ERESOLVE could not resolve` dependency conflicts

**Symptoms:**
```bash
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error While resolving: @garrick0/c3-projection@0.1.0-dev.0
npm error Found: vitest@1.6.1
```

**Causes:**
- Peer dependency version mismatches
- Conflicting package versions

**Solutions:**

1. **Use legacy peer deps (quick fix):**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Force installation:**
   ```bash
   npm install --force
   ```

3. **Update conflicting packages:**
   ```bash
   # Check what's conflicting
   npm list vitest
   
   # Update to compatible version
   npm install vitest@^1.6.1 --save-dev
   ```

4. **Clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 🏗️ Build Failures

### Issue: `error TS2307: Cannot find module '@garrick0/c3-shared' or its corresponding type declarations`

**Symptoms:**
```bash
src/index.ts(1,24): error TS2307: Cannot find module '@garrick0/c3-shared' 
  or its corresponding type declarations.
```

**Causes:**
- Package missing .d.ts files
- Package not installed
- TypeScript can't find type declarations

**Solutions:**

1. **Verify package is installed:**
   ```bash
   ls -la node_modules/@garrick0/c3-shared/
   # Should see dist/ folder with .d.ts files
   ```

2. **Check dist/ folder contents:**
   ```bash
   ls -la node_modules/@garrick0/c3-shared/dist/
   # Should see index.d.ts, index.js, etc.
   ```

3. **Reinstall package:**
   ```bash
   npm install @garrick0/c3-shared@dev --force
   ```

4. **Check package.json has correct types field:**
   ```bash
   cat node_modules/@garrick0/c3-shared/package.json | grep types
   # Should see: "types": "./dist/index.d.ts"
   ```

5. **If .d.ts files are missing (library maintainer issue):**
   - Check if library's `src/index.ts` has `export {};` statement
   - Verify library's tsconfig has `"declaration": true`
   - Check library's `.npmignore` doesn't exclude `dist/`
   - Republish the library

---

### Issue: TypeScript build succeeds but .d.ts files not generated

**Symptoms:**
- `tsc` runs without errors
- `dist/` folder created
- BUT `dist/index.d.ts` is missing

**Causes:**
- Pure re-export modules don't emit declaration files (TypeScript optimization)

**Solution:**

Add `export {};` to force TypeScript to emit the file:

```typescript
// src/index.ts
/**
 * Package documentation
 * @packageDocumentation
 */

// Force TypeScript to emit index.d.ts
export {};

// Your re-exports
export * from './module.js';
```

**Why this works:** The `export {}` statement tells TypeScript this is a module with explicit exports, forcing it to generate a corresponding declaration file.

---

## ⚙️ CI/CD Issues

### Issue: CI fails with `npm error Missing: @garrick0/c3-shared@...`

**Symptoms:**
```bash
npm error code EINTEGRITY
npm error Missing: @garrick0/c3-shared@0.1.0-dev.b50f4a8.0 from lock file
```

**Causes:**
- package-lock.json out of sync
- Package version changed but lock file not updated

**Solutions:**

1. **Delete package-lock.json:**
   ```bash
   rm package-lock.json
   git add package-lock.json
   git commit -m "chore: regenerate package-lock.json"
   git push
   ```

2. **Regenerate lock file locally:**
   ```bash
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "chore: update package-lock.json"
   git push
   ```

3. **Use `npm install` instead of `npm ci` in CI:**
   ```yaml
   # .github/workflows/ci.yml
   - name: Install dependencies
     run: npm install  # More flexible than npm ci
   ```

---

### Issue: CI fails with integrity checksum mismatch

**Symptoms:**
```bash
npm error code EINTEGRITY
npm error Integrity checksum failed when using sha512
```

**Causes:**
- Corrupted package-lock.json
- Package republished with same version but different content

**Solutions:**

1. **Clear package-lock.json:**
   ```bash
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "fix: regenerate package-lock with correct integrity"
   git push
   ```

2. **Clear npm cache in CI:**
   ```yaml
   # Add to workflow
   - name: Clear npm cache
     run: npm cache clean --force
   ```

3. **Force reinstall in CI:**
   ```yaml
   - name: Install dependencies
     run: |
       rm -rf node_modules package-lock.json
       npm install
   ```

---

### Issue: Workflow dispatch not triggering

**Symptoms:**
- Manual workflow trigger doesn't run
- No runs appear in Actions tab

**Causes:**
- Workflow file not on default branch
- Incorrect workflow syntax
- Permissions issues

**Solutions:**

1. **Verify workflow is on main branch:**
   ```bash
   git checkout main
   ls -la .github/workflows/
   ```

2. **Check workflow syntax:**
   ```yaml
   on:
     workflow_dispatch:  # Enable manual triggering
     push:
       branches: [main]
   ```

3. **Test workflow:**
   ```bash
   gh workflow run publish.yml
   gh run list --limit 5
   ```

---

## 🔍 Type Declaration Problems

### Issue: `.d.ts.map` files generated but no `.d.ts` files

**Symptoms:**
```bash
ls dist/
# Shows: index.d.ts.map, index.js, index.js.map
# Missing: index.d.ts
```

**Causes:**
- TypeScript optimization for pure re-export modules
- Missing `export` statement

**Solution:**

Add explicit export to `src/index.ts`:

```typescript
// Force emission
export {};

// Rest of re-exports
export * from './moduleA.js';
export * from './moduleB.js';
```

**Why this happens:**
TypeScript's compiler optimizes away "empty" module declarations when:
- File only contains `export *` statements
- `declaration: true` is set
- Using ES modules

See `PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md` for full investigation.

---

## 🔗 Dependency Conflicts

### Issue: Multiple versions of same package

**Symptoms:**
```bash
npm list @garrick0/c3-shared
# Shows multiple versions installed
```

**Causes:**
- Different packages depend on different versions
- Peer dependency issues

**Solutions:**

1. **Use resolutions (package.json):**
   ```json
   {
     "overrides": {
       "@garrick0/c3-shared": "dev"
     }
   }
   ```

2. **Deduplicate:**
   ```bash
   npm dedupe
   ```

3. **Clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 💻 Local Development Issues

### Issue: Changes to library not reflected in application

**Symptoms:**
- Modified c3-shared
- Application still uses old version

**Causes:**
- npm cache
- Need to republish library

**Solutions:**

1. **Publish library changes:**
   ```bash
   cd /path/to/c3-shared
   git add .
   git commit -m "feat: my changes"
   git push  # CI publishes new version
   ```

2. **Wait for CI (~50 seconds), then update app:**
   ```bash
   cd /path/to/c3-bff
   npm install @garrick0/c3-shared@dev --force
   ```

3. **Verify new version installed:**
   ```bash
   npm list @garrick0/c3-shared
   ```

**Note:** We don't use `npm link` anymore! Use GitHub Packages for consistency.

---

## 🔄 Rollback Procedures

### Rollback a Single Package

**Scenario:** Latest version of c3-shared is broken, need previous version.

```bash
# 1. Find previous working version
npm view @garrick0/c3-shared versions

# 2. Install specific version
npm install @garrick0/c3-shared@0.1.0-dev.abc1234.0

# 3. Update package.json
# Change: "@garrick0/c3-shared": "dev"
# To:     "@garrick0/c3-shared": "0.1.0-dev.abc1234.0"

# 4. Test and commit
npm test
git add package.json package-lock.json
git commit -m "revert: rollback c3-shared to working version"
git push
```

---

### Rollback Application CI

**Scenario:** New simplified CI isn't working, need old multi-repo CI.

```bash
# 1. Find old CI workflow
git log --oneline -- .github/workflows/ci.yml

# 2. Checkout old version
git show COMMIT_HASH:.github/workflows/ci.yml > .github/workflows/ci.yml

# 3. Revert package.json dependencies
# Change: "@garrick0/c3-shared": "dev"
# To:     "c3-shared": "^0.1.0"

# 4. Remove .npmrc
rm .npmrc

# 5. Commit and push
git add .
git commit -m "revert: rollback to multi-repo CI"
git push
```

---

### Emergency: Revert to npm link

**Scenario:** GitHub Packages is down, need to work locally.

```bash
# 1. Clone all libraries locally
cd ~/projects
git clone https://github.com/garrick0/c3-shared
git clone https://github.com/garrick0/c3-parsing
# ... etc

# 2. Link libraries
cd c3-shared && npm link
cd ../c3-parsing && npm link c3-shared && npm link
cd ../c3-wiring && npm link c3-shared c3-parsing ... && npm link

# 3. Link in application
cd /path/to/c3-bff
npm link c3-shared c3-parsing c3-wiring ...

# 4. Update package.json temporarily
# Change: "@garrick0/c3-shared": "dev"
# To:     "c3-shared": "file:../c3-shared"

# DON'T commit these changes!
```

---

## 🆘 Still Stuck?

### Check These First

1. ✅ GitHub Packages authentication working?
   ```bash
   npm whoami --registry=https://npm.pkg.github.com
   ```

2. ✅ Latest versions published?
   ```bash
   npm view @garrick0/c3-shared dist-tags
   ```

3. ✅ CI passing on library repos?
   ```bash
   gh run list --repo garrick0/c3-shared --limit 3
   ```

4. ✅ Node version correct?
   ```bash
   node --version  # Should be 18+
   ```

### Get Help

1. **Search existing issues:**
   - Check GitHub Issues in relevant repo
   - Search for error message

2. **Create detailed issue:**
   ```markdown
   **Environment:**
   - OS: macOS 14.5
   - Node: 18.17.0
   - npm: 9.8.1

   **Steps to reproduce:**
   1. npm install
   2. npm run build
   3. Error occurs

   **Error message:**
   ```
   [paste full error]
   ```

   **What I've tried:**
   - Cleared cache
   - Deleted node_modules
   - ...
   ```

3. **Contact:**
   - GitHub Discussions
   - Slack: #c3-dev
   - Email: [your contact]

---

## 📚 Useful Commands

### Debugging

```bash
# Check npm configuration
npm config list

# Verbose install
npm install --verbose

# Check registry
npm config get registry

# View package info
npm view @garrick0/c3-shared

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated
```

### CI/CD

```bash
# Watch CI run
gh run watch

# View logs
gh run view --log

# Re-run failed jobs
gh run rerun

# List recent runs
gh run list --limit 10

# Cancel running workflow
gh run cancel RUN_ID
```

### Package Management

```bash
# Clear cache
npm cache clean --force

# Verify cache integrity
npm cache verify

# Prune unused packages
npm prune

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🎓 Learn More

- [Quick Start Guide](./QUICKSTART.md)
- [Phase 1-3 Debugging Journey](./docs/PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md)
- [Implementation Status](./docs/IMPLEMENTATION-STATUS.md)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)

---

**Last Updated:** November 16, 2024  
**Maintained By:** C3 Team  
**Version:** 1.0.0

