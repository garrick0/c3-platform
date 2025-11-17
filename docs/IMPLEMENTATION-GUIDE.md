# Implementation Guide: Hybrid Approach (Option 4)

**Status:** 🚧 Phase 1 Started  
**Last Updated:** November 16, 2024  
**Estimated Completion:** 2 weeks

---

## 🎯 What Has Been Done

### ✅ Phase 1.1: Registry Infrastructure (40% Complete)

**Completed:**
1. **c3-shared** - Fully configured ✅
   - Package name: `@garrick0/c3-shared`
   - Version: `0.1.0-dev.0`
   - GitHub Packages configuration ready
   - Publish workflow created
   - Auto-publish on push to main

2. **c3-parsing** - Fully configured ✅
   - Package name: `@garrick0/c3-parsing`
   - Version: `2.0.0-dev.0`
   - Updated dependency: `@garrick0/c3-shared`
   - GitHub Packages configuration ready
   - Publish workflow created

**Files Created:**
```
c3-shared/
├── .npmrc                          [NEW]
├── package.json                    [MODIFIED]
└── .github/workflows/publish.yml   [NEW]

c3-parsing/
├── .npmrc                          [NEW]
├── package.json                    [MODIFIED]
└── .github/workflows/publish.yml   [NEW]

c3-platform/
├── docs/
│   ├── IMPLEMENTATION-STATUS.md    [NEW]
│   └── IMPLEMENTATION-GUIDE.md     [NEW]
└── scripts/
    └── setup-package-registry.sh   [NEW]
```

---

## 🚀 How to Continue Implementation

### Option A: Automated Setup (Recommended)

Use the helper script to configure remaining packages:

```bash
cd /Users/samuelgleeson/dev/c3-platform

# Configure c3-compliance
./scripts/setup-package-registry.sh ../c3-compliance c3-compliance

# Configure c3-projection
./scripts/setup-package-registry.sh ../c3-projection c3-projection

# Configure c3-discovery
./scripts/setup-package-registry.sh ../c3-discovery c3-discovery

# Configure c3-wiring
./scripts/setup-package-registry.sh ../c3-wiring c3-wiring
```

### Option B: Manual Setup

For each package (c3-compliance, c3-projection, c3-discovery):

**1. Create `.npmrc`:**
```bash
cd /Users/samuelgleeson/dev/c3-compliance

cat > .npmrc << 'EOF'
@garrick0:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
registry=https://registry.npmjs.org
EOF
```

**2. Update `package.json`:**
```json
{
  "name": "@garrick0/c3-compliance",
  "version": "0.1.0-dev.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/garrick0/c3-compliance"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  },
  "scripts": {
    "version:dev": "npm version prerelease --preid=dev.$(git rev-parse --short HEAD) --no-git-tag-version",
    "version:canary": "npm version prerelease --preid=canary --no-git-tag-version"
  },
  "dependencies": {
    "@garrick0/c3-shared": "^0.1.0-dev.0",
    "@garrick0/c3-parsing": "^2.0.0-dev.0"
  }
}
```

**3. Copy workflow:**
```bash
mkdir -p .github/workflows
cp ../c3-shared/.github/workflows/publish.yml .github/workflows/
# Update package name in the workflow file
```

---

## 📋 Complete Implementation Checklist

### Week 1: Infrastructure & Core Libraries

#### Day 1-2: Registry Setup (CURRENT)
- [x] Configure c3-shared
- [x] Configure c3-parsing
- [x] Create helper script
- [x] Create documentation

#### Day 3-4: Core Libraries
- [ ] Configure c3-compliance
  ```bash
  cd /Users/samuelgleeson/dev/c3-platform
  ./scripts/setup-package-registry.sh ../c3-compliance c3-compliance
  cd ../c3-compliance && npm run build && npm test
  ```

- [ ] Configure c3-projection
  ```bash
  cd /Users/samuelgleeson/dev/c3-platform
  ./scripts/setup-package-registry.sh ../c3-projection c3-projection
  cd ../c3-projection && npm run build && npm test
  ```

- [ ] Configure c3-discovery
  ```bash
  cd /Users/samuelgleeson/dev/c3-platform
  ./scripts/setup-package-registry.sh ../c3-discovery c3-discovery
  cd ../c3-discovery && npm run build && npm test
  ```

#### Day 5-7: Integration Layer
- [ ] Configure c3-wiring
  ```bash
  cd /Users/samuelgleeson/dev/c3-platform
  ./scripts/setup-package-registry.sh ../c3-wiring c3-wiring
  cd ../c3-wiring && npm run build && npm test
  ```

- [ ] Create orchestrator (c3-platform)
  ```bash
  # Copy from examples
  cp docs/ci-examples/orchestrate-release.yml .github/workflows/
  # Update repository names
  # Set up PAT token secret
  ```

### Week 2: Applications & Testing

#### Day 1-3: Application CIs
- [ ] Update c3-bff
  ```bash
  cd /Users/samuelgleeson/dev/c3-bff
  # Update package.json dependencies
  # Replace ci.yml with simplified version
  npm install  # Will use GitHub Packages
  npm test
  npm run build
  ```

- [ ] Update c3-web
- [ ] Update c3-cli

#### Day 4-5: Testing & Documentation
- [ ] Test full pipeline
- [ ] Measure CI times
- [ ] Document new workflows
- [ ] Train team

---

## 🧪 Testing Guide

### Test Each Package After Configuration

```bash
# Navigate to package
cd /Users/samuelgleeson/dev/c3-compliance

# 1. Verify configuration
cat .npmrc
cat package.json | grep -A5 publishConfig

# 2. Test build
npm run build

# 3. Test dry-run publish (doesn't actually publish)
npm publish --dry-run

# 4. Check what will be published
npm pack --dry-run
```

### Test Publishing to GitHub Packages

**First Time Setup:**
1. Generate GitHub Personal Access Token (PAT)
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Create new token with `write:packages` and `read:packages` scopes
   - Save it securely

2. Configure npm authentication
   ```bash
   npm login --scope=@garrick0 --registry=https://npm.pkg.github.com
   # Username: your-github-username
   # Password: your-PAT-token
   # Email: your-email
   ```

**Test Publishing c3-shared:**
```bash
cd /Users/samuelgleeson/dev/c3-shared

# Test dry run first
npm publish --dry-run

# Publish dev version
npm run version:dev
npm run build
npm publish --tag dev

# Verify it worked
npm view @garrick0/c3-shared versions
```

**Test Installing:**
```bash
# In a test directory
mkdir /tmp/test-install && cd /tmp/test-install
npm init -y
npm install @garrick0/c3-shared@dev
```

---

## 🔄 Workflow After Implementation

### Daily Development Workflow

**For Core Library Developers:**
```bash
# 1. Make changes
git checkout -b feature/my-feature
# ... make changes ...

# 2. Test locally
npm run build
npm test

# 3. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 4. Create PR
# GitHub Actions will run tests

# 5. After PR merge to main
# - Dev version automatically published
# - Downstream repos notified
```

**For Application Developers:**
```bash
# Update to latest dev version
npm update @garrick0/c3-shared@dev

# Or specific version
npm install @garrick0/c3-shared@0.1.0-dev.abc123

# Test your changes
npm test
npm run build
```

### Release Workflow

**Creating a Stable Release:**
```bash
# 1. Go to repository on GitHub
# 2. Actions → Publish Package → Run workflow
# 3. Select release type: patch/minor/major
# 4. Wait for workflow to complete
# 5. Check GitHub Packages for new version
```

**Creating a Canary Release:**
```bash
# For pre-release testing
# 1. Actions → Publish Package → Run workflow
# 2. Select release type: canary
# 3. Install in apps: npm install @garrick0/c3-shared@canary
```

---

## 📊 Expected Results

### Before vs After

| Metric | Before (Current) | After (Target) | Improvement |
|--------|-----------------|----------------|-------------|
| c3-bff CI | 5 min | 45s | **-85%** |
| c3-web CI | 1 min | 30s | **-50%** |
| c3-cli CI | 5 min | 45s | **-85%** |
| **Total per push** | **11 min** | **2 min** | **-82%** |
| Maintenance | High | Low | **-60%** |

### Cost Savings

**Current CI Cost:**
- 11 minutes × $0.008/min × 50 pushes/week = **$4.40/week**
- **$228/year**

**After Implementation:**
- 2 minutes × $0.008/min × 50 pushes/week = **$0.80/week**
- **$42/year**

**Savings: $186/year** (plus developer time savings)

---

## ⚠️ Common Issues & Solutions

### Issue: "npm ERR! 404 Not Found"

**Cause:** Package not published yet or wrong registry

**Solution:**
```bash
# Check authentication
npm whoami --registry=https://npm.pkg.github.com

# Check package exists
npm view @garrick0/c3-shared

# Re-authenticate if needed
npm login --scope=@garrick0 --registry=https://npm.pkg.github.com
```

### Issue: "npm ERR! 403 Forbidden"

**Cause:** Insufficient permissions

**Solution:**
1. Check GitHub PAT has `write:packages` scope
2. Verify package visibility settings
3. Check organization package permissions

### Issue: "Module not found" after install

**Cause:** Import paths need updating

**Solution:**
```javascript
// Old
import { something } from 'c3-shared';

// New (no change needed - package.json handles it)
import { something } from 'c3-shared';
// Or explicitly
import { something } from '@garrick0/c3-shared';
```

### Issue: Build fails in CI

**Cause:** Missing NODE_AUTH_TOKEN

**Solution:**
```yaml
# In GitHub Actions workflow
- name: Install
  run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📞 Getting Help

### Resources
- **Documentation:** `/Users/samuelgleeson/dev/c3-platform/docs/`
- **Status:** `IMPLEMENTATION-STATUS.md`
- **Examples:** `ci-examples/`

### Troubleshooting Steps
1. Check `IMPLEMENTATION-STATUS.md` for known issues
2. Review GitHub Actions workflow logs
3. Test locally with `npm publish --dry-run`
4. Check GitHub Packages documentation

### Quick Commands
```bash
# Check what's configured
npm config list

# Check authentication
npm whoami --registry=https://npm.pkg.github.com

# Test package
npm pack --dry-run

# See what will be published
npm publish --dry-run
```

---

## 🎓 Training Your Team

### Onboarding Checklist

For each team member:
- [ ] Read this implementation guide
- [ ] Set up GitHub PAT for packages
- [ ] Test installing a package locally
- [ ] Understand dev/canary/stable versions
- [ ] Know how to trigger releases
- [ ] Review troubleshooting section

### Quick Start for Team Members

**1. Install packages:**
```bash
# Use latest dev version
npm install @garrick0/c3-shared@dev

# Use specific version
npm install @garrick0/c3-shared@0.1.0-dev.abc123

# Use stable version (after release)
npm install @garrick0/c3-shared@latest
```

**2. Check for updates:**
```bash
npm outdated @garrick0/c3-shared
npm update @garrick0/c3-shared
```

**3. Publish changes (for library maintainers):**
```bash
# Dev version - automatic on merge to main
# Stable version - use GitHub Actions workflow
```

---

## 🏁 Next Steps

### Immediate Actions (Today)

1. **Test c3-shared publishing:**
   ```bash
   cd /Users/samuelgleeson/dev/c3-shared
   npm publish --dry-run
   ```

2. **Configure remaining core libraries:**
   ```bash
   cd /Users/samuelgleeson/dev/c3-platform
   ./scripts/setup-package-registry.sh ../c3-compliance c3-compliance
   ./scripts/setup-package-registry.sh ../c3-projection c3-projection
   ./scripts/setup-package-registry.sh ../c3-discovery c3-discovery
   ```

3. **Update status document:**
   ```bash
   # Edit IMPLEMENTATION-STATUS.md to reflect progress
   ```

### This Week

1. Complete Week 1 tasks
2. Test end-to-end pipeline
3. Document any issues

### Next Week

1. Update application CIs
2. Run full integration tests
3. Train team
4. Celebrate! 🎉

---

**Good luck with the implementation!**  
**Questions?** Check `IMPLEMENTATION-STATUS.md` or the research documents.

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2024  
**Next Update:** After completing core libraries

