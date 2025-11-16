# C3 Platform - Quick Start Guide

**Welcome to C3!** This guide will get you up and running in 5 minutes.

---

## 🚀 For Developers: Getting Started

### Prerequisites

- **Node.js** 18+ (with npm)
- **Git**
- **GitHub Account** with access to the repositories
- **GitHub Personal Access Token** (PAT) with `read:packages` scope

---

## 📦 Setup GitHub Packages Authentication

**One-time setup** - authenticate with GitHub Packages:

```bash
# Create .npmrc in your home directory
echo "@garrick0:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT" >> ~/.npmrc
```

**To create a PAT:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scope: `read:packages`
4. Copy the token and replace `YOUR_GITHUB_PAT` above

---

## 🏗️ Architecture Overview

```
Core Libraries (Published to GitHub Packages):
├── @garrick0/c3-shared       - Core domain abstractions
├── @garrick0/c3-parsing       - Multi-source code parsing
├── @garrick0/c3-compliance    - Rules evaluation
├── @garrick0/c3-projection    - Graph transformations
├── @garrick0/c3-discovery     - AI-powered pattern detection
└── @garrick0/c3-wiring        - Dependency injection

Applications:
├── c3-bff                     - Backend API
├── c3-web                     - React frontend
└── c3-cli                     - Command-line tool
```

---

## 🎯 Quick Start: Run the BFF (Backend)

```bash
# Clone the repository
git clone https://github.com/garrick0/c3-bff
cd c3-bff

# Install dependencies (pulls from GitHub Packages)
npm install

# Run in development mode
npm run dev

# Or build and run production
npm run build
npm start
```

**That's it!** The BFF will automatically install all C3 libraries from GitHub Packages.

**Test it:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## 🎨 Quick Start: Run the Web UI

```bash
# Clone the repository
git clone https://github.com/garrick0/c3-web
cd c3-web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm run preview
```

**Access it:** http://localhost:5173

---

## 🔧 Quick Start: Use the CLI

```bash
# Clone the repository
git clone https://github.com/garrick0/c3-cli
cd c3-cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Run it
npm start -- --help

# Or install globally
npm link
c3 --help
```

**Example usage:**
```bash
c3 analyze ./my-project --format json
c3 validate ./my-project --rules strict
c3 discover ./my-project --patterns
```

---

## 🧪 Development Workflow

### Working on Applications (c3-bff, c3-cli)

**Scenario:** You're building features in the applications.

```bash
cd c3-bff

# Install latest dev packages
npm install

# Make changes to your code
# Edit src/...

# Test
npm test

# Run locally
npm run dev
```

**The applications automatically use the latest published library versions from GitHub Packages!**

### Working on Core Libraries

**Scenario:** You need to modify a core library (e.g., c3-shared).

```bash
# 1. Make changes to the library
cd /path/to/c3-shared
# Edit src/...

# 2. Commit and push to main
git add .
git commit -m "feat: add new feature"
git push

# 3. CI automatically publishes to GitHub Packages
# Wait ~50 seconds for CI to complete

# 4. Update your application
cd /path/to/c3-bff
npm install  # Gets the new version
npm run dev  # Test your changes
```

**No manual linking required!**

---

## 📚 Common Tasks

### Update All Dependencies

```bash
# Get latest dev versions of all @garrick0 packages
npm install

# Or update a specific package
npm install @garrick0/c3-shared@latest
```

### Check Installed Versions

```bash
# List all @garrick0 packages
npm list @garrick0/c3-shared
npm list @garrick0/c3-wiring
# etc.

# Or check in package-lock.json
cat package-lock.json | grep "@garrick0"
```

### Use Specific Versions (Production)

```bash
# Instead of "dev" tag, use specific versions
npm install @garrick0/c3-shared@0.1.0-dev.b50f4a8.0
```

**Update package.json:**
```json
{
  "dependencies": {
    "@garrick0/c3-shared": "0.1.0-dev.b50f4a8.0"
  }
}
```

### Clear npm Cache

```bash
# If you have issues with stale packages
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 Troubleshooting

### Error: `401 Unauthorized` when installing packages

**Problem:** GitHub Packages authentication failed.

**Solution:**
```bash
# Check your .npmrc has the auth token
cat ~/.npmrc | grep npm.pkg.github.com

# If missing, add it:
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT" >> ~/.npmrc

# Test authentication
npm whoami --registry=https://npm.pkg.github.com
```

### Error: `Cannot find module '@garrick0/c3-shared'`

**Problem:** Package not published or wrong version.

**Solution:**
```bash
# Check if package exists
npm view @garrick0/c3-shared

# If it doesn't exist, publish the library:
cd /path/to/c3-shared
git push  # Triggers CI to publish

# Wait for CI to complete, then retry
npm install
```

### Error: `ERESOLVE could not resolve`

**Problem:** Dependency conflicts.

**Solution:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or force resolution
npm install --force

# Or delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CI Failing: `EINTEGRITY` checksum mismatch

**Problem:** Corrupted package-lock.json.

**Solution:**
```bash
# Delete package-lock.json and let CI regenerate
rm package-lock.json
git add package-lock.json
git commit -m "chore: regenerate package-lock.json"
git push
```

---

## 🏆 Best Practices

### For Library Development

✅ **DO:**
- Push to `main` to trigger auto-publish
- Use semantic commit messages (`feat:`, `fix:`, `docs:`)
- Add `export {};` to pure re-export index files
- Include .d.ts files in published packages
- Test locally before pushing

❌ **DON'T:**
- Manually publish packages (CI does this)
- Skip tests before committing
- Use `npm link` (use GitHub Packages instead)
- Commit package-lock.json with local file:// dependencies

### For Application Development

✅ **DO:**
- Use `"dev"` tag for dependencies during development
- Pin specific versions for production deployments
- Run tests before pushing
- Keep dependencies up to date

❌ **DON'T:**
- Mix local linking with GitHub Packages
- Commit node_modules
- Use outdated dependency versions in production

---

## 🎓 Learn More

### Documentation

- **[Architecture Analysis](./docs/CI-CD-ORCHESTRATION-ANALYSIS.md)** - Deep dive into the CI/CD strategy
- **[Phase 1-3 Debugging Journey](./docs/PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md)** - How we solved the TypeScript mystery
- **[Implementation Status](./docs/IMPLEMENTATION-STATUS.md)** - Current progress and metrics
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Detailed problem-solving

### Key Concepts

- **GitHub Packages:** npm registry hosted by GitHub
- **Scoped Packages:** `@garrick0/*` namespace for organization
- **Dev Tags:** `"dev"` always gets the latest development version
- **Semantic Versioning:** `0.1.0-dev.{sha}.0` format for dev versions

---

## 🔗 Quick Links

### Repositories

- [c3-platform](https://github.com/garrick0/c3-platform) - Documentation & orchestration
- [c3-shared](https://github.com/garrick0/c3-shared) - Core library
- [c3-parsing](https://github.com/garrick0/c3-parsing) - Parser library
- [c3-bff](https://github.com/garrick0/c3-bff) - Backend API
- [c3-web](https://github.com/garrick0/c3-web) - Frontend
- [c3-cli](https://github.com/garrick0/c3-cli) - CLI tool

### GitHub Packages

View published packages:
```
https://github.com/garrick0?tab=packages
```

### CI/CD Status

Check workflow status:
```bash
# In any repository
gh run list --limit 5

# Watch a specific run
gh run watch

# View logs
gh run view --log
```

---

## 💬 Getting Help

### Issues

If you encounter problems:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search existing GitHub Issues
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version)

### Questions

- GitHub Discussions: Ask questions and share ideas
- Slack: #c3-dev channel (if applicable)
- Email: [Your contact]

---

## 🎉 You're Ready!

You now know how to:
- ✅ Authenticate with GitHub Packages
- ✅ Install and run all C3 applications
- ✅ Develop with automatic package updates
- ✅ Troubleshoot common issues
- ✅ Follow best practices

**Happy coding!** 🚀

---

**Last Updated:** November 16, 2024  
**Version:** 1.0.0  
**Maintained By:** C3 Team

