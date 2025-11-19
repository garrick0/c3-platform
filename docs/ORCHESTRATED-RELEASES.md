# Orchestrated Releases - User Guide

**Phase:** 3 of 3
**Status:** ✅ Implemented
**Date:** 2025-11-19

---

## Overview

The orchestrated release system coordinates multi-repository releases across the C3 platform. It manages version bumps, dependency ordering, changelog generation, and release tracking automatically.

## Quick Start

### Dry-Run Release (Recommended First)

```bash
# Test release of all libraries
gh workflow run orchestrate-release.yml \
  --repo garrick0/c3-platform \
  -f release_type=patch \
  -f repos=all \
  -f dry_run=true

# Watch progress
gh run watch --repo garrick0/c3-platform
```

### Production Release

```bash
# Release all libraries (patch version)
gh workflow run orchestrate-release.yml \
  --repo garrick0/c3-platform \
  -f release_type=patch \
  -f repos=all \
  -f dry_run=false
```

---

## How It Works

### 1. Planning Phase

The workflow:
1. Loads `config/repos.json`
2. Selects repositories based on input
3. Sorts by dependency order (Layer 0 → Layer 3)
4. Validates all repos are ready (tests passing)
5. Creates release plan with unique ID

### 2. Release Phase

For each repository in order:
1. **Dry-Run Mode:** Logs what would be released
2. **Production Mode:** Triggers `publish.yml` workflow
3. Waits for completion
4. Continues to next repo

### 3. Finalization Phase

After all releases:
1. Fetches commits from each repo
2. Generates unified changelog
3. Creates release summary
4. Archives everything to `releases/history/`

---

## Input Parameters

### release_type (Required)

| Type | Version Change | Use Case |
|------|---------------|----------|
| `patch` | 0.1.0 → 0.1.1 | Bug fixes, minor updates |
| `minor` | 0.1.0 → 0.2.0 | New features (backward compatible) |
| `major` | 0.1.0 → 1.0.0 | Breaking changes |
| `canary` | 0.1.0-canary.X | Test releases, preview builds |

### repos (Required)

| Value | Effect |
|-------|--------|
| `all` | Release all 6 libraries |
| `libraries` | Same as "all" |
| `c3-shared` | Single repository |
| `c3-shared,c3-parsing,c3-wiring` | Multiple specific repos |

**Note:** Applications (c3-cli, c3-bff, c3-web) are not included in "all" since they don't publish packages.

### dry_run (Optional)

| Value | Effect |
|-------|--------|
| `true` | **Default** - Simulates release without executing |
| `false` | Executes actual releases |

**Safety:** Always defaults to dry-run to prevent accidents.

---

## Release Order

Repositories are always released in dependency order:

```
Layer 0: c3-shared
  ↓
Layer 1: c3-parsing
  ↓
Layer 2: c3-compliance, c3-projection (parallel)
  ↓
Layer 2: c3-discovery (waits for c3-compliance)
  ↓
Layer 3: c3-wiring (waits for all)
```

Sequential execution ensures:
- Dependencies published before dependents
- Consumers can install immediately
- No version conflicts
- Clean dependency graph

---

## Validation Checks

Before releasing, the system validates:

### Required Checks
- ✅ Latest workflow run passed
- ✅ All tests passing
- ✅ Build successful

### Warnings
- ⚠️  No recent workflow runs
- ⚠️  Dependencies not yet released

### Blocking Errors
- ❌ Latest workflow failed
- ❌ Tests failing

**Behavior:**
- Dry-run: Reports issues but continues
- Production: Blocks release if issues found

---

## Generated Artifacts

### Release Plan (`plan.json`)

Created during planning:
```json
{
  "releaseId": "release-2025-11-19T21-35-49-156Z",
  "timestamp": "2025-11-19T21:35:49.161Z",
  "releaseType": "patch",
  "dryRun": true,
  "repositories": [
    {
      "name": "c3-shared",
      "layer": 0,
      "type": "library",
      "dependencies": []
    }
  ],
  "releaseOrder": ["c3-shared", "c3-parsing", ...]
}
```

### Changelog (`CHANGELOG.md`)

Generated after releases:
```markdown
# Release release-2025-11-19T21-35-49-156Z

**Type:** patch
**Date:** 2025-11-19
**Repositories:** 6
**Total Changes:** 47 commits

## c3-shared

**Previous Version:** v0.1.0
**Commits:** 12

### ✨ Features
- Add repository dispatch notification ([744eedb](URL))

### 🐛 Bug Fixes
- Fix build script configuration ([abc123](URL))

---

## c3-parsing

**Previous Version:** v0.1.1
**Commits:** 8

### ✨ Features
- Add TypeScript 5.3 support ([4289c29](URL))
```

### Release Summary (`SUMMARY.md`)

Final summary after completion:
```markdown
# Release Summary: release-2025-11-19T21-35-49-156Z

**Date:** 2025-11-19
**Type:** patch
**Mode:** DRY RUN
**Status:** Simulated

## Released Repositories

1. 🔍 **c3-shared** (Layer 0)
2. 🔍 **c3-parsing** (Layer 1)
   - Dependencies: c3-shared
...

## Release Order

1. c3-shared
2. c3-parsing
...

**Note:** This was a dry run. No actual releases were created.
```

---

## Common Workflows

### Scenario 1: Bug Fix Release

```bash
# 1. Fix bugs in various repos
# 2. Ensure all tests pass
# 3. Create patch release

gh workflow run orchestrate-release.yml \
  --repo garrick0/c3-platform \
  -f release_type=patch \
  -f repos=all \
  -f dry_run=false
```

### Scenario 2: New Feature Release

```bash
# 1. Develop new features
# 2. Update version in docs
# 3. Create minor release

gh workflow run orchestrate-release.yml \
  --repo garrick0/c3-platform \
  -f release_type=minor \
  -f repos=all \
  -f dry_run=false
```

### Scenario 3: Single Package Update

```bash
# Only release c3-shared
gh workflow run orchestrate-release.yml \
  --repo garrick0/c3-platform \
  -f release_type=patch \
  -f repos=c3-shared \
  -f dry_run=false
```

### Scenario 4: Coordinated Feature Release

```bash
# Release shared and parsing together
gh workflow run orchestrate-release.yml \
  --repo garrick0/c3-platform \
  -f release_type=minor \
  -f repos="c3-shared,c3-parsing,c3-wiring" \
  -f dry_run=false
```

---

## Monitoring Releases

### During Release

```bash
# Watch live
gh run watch --repo garrick0/c3-platform

# Check individual repos
gh run list --repo garrick0/c3-shared --limit 3
```

### After Release

```bash
# View release summary
cat releases/history/release-*/SUMMARY.md

# View changelog
cat releases/history/release-*/CHANGELOG.md

# Check dependency graph
cat config/dependency-graph.json

# View published packages
npm view @garrick0/c3-shared versions
npm view @garrick0/c3-parsing versions
```

---

## Best Practices

### 1. Always Start with Dry-Run

```bash
# Test first
gh workflow run orchestrate-release.yml \
  -f release_type=patch \
  -f repos=all \
  -f dry_run=true

# Review results
# Then run production
```

### 2. Release in Batches

```bash
# Day 1: Core libraries
gh workflow run orchestrate-release.yml \
  -f repos="c3-shared,c3-parsing" \
  -f dry_run=false

# Day 2: Layer 2 libraries
gh workflow run orchestrate-release.yml \
  -f repos="c3-compliance,c3-projection,c3-discovery" \
  -f dry_run=false

# Day 3: Integration layer
gh workflow run orchestrate-release.yml \
  -f repos="c3-wiring" \
  -f dry_run=false
```

### 3. Validate Before Releasing

```bash
# Manual validation
GH_TOKEN="..." DRY_RUN="true" node scripts/validate-release.js

# Check all tests passing
./scripts/test-all.sh

# Check all builds clean
./scripts/build-all.sh
```

### 4. Review Changelogs

```bash
# After dry-run, review changelog
cat releases/upcoming/release-*/CHANGELOG.md

# Edit if needed
# Then run production release
```

---

## Configuration

### Customizing Release Behavior

Edit `config/release-config.json`:

```json
{
  "release": {
    "defaultType": "patch",
    "dryRunByDefault": true,        // Safety first
    "parallelReleases": false       // Sequential only
  },
  "validation": {
    "requireAllTestsPassing": true, // Block if tests fail
    "checkDependencies": true       // Verify deps published
  },
  "changelog": {
    "groupByType": true,            // Features, fixes, etc.
    "showBreakingChanges": true,    // Highlight breaking
    "linkToCommits": true           // GitHub URLs
  }
}
```

---

## Rollback Procedure

If a release goes wrong:

### 1. Stop the Release

```bash
# Cancel running workflow
gh run cancel <RUN_ID> --repo garrick0/c3-platform
```

### 2. Revert Individual Repos

```bash
# For each released repo
cd ../c3-shared
git revert <COMMIT_SHA>
git push origin main

# Or use GitHub UI to revert commits
```

### 3. Unpublish Packages (if necessary)

```bash
# Contact GitHub support or deprecate
npm deprecate @garrick0/c3-shared@X.Y.Z "Reverted - use previous version"
```

### 4. Document in Release History

```bash
# Add note to release summary
echo "**Status:** REVERTED" >> releases/history/release-*/SUMMARY.md
```

---

## Filesystem Structure

After Phase 3 deployment:

```
c3-platform/
├── .github/workflows/
│   ├── status-dashboard.yml
│   ├── collect-metrics.yml
│   ├── handle-events.yml
│   └── orchestrate-release.yml      ✅ NEW
├── config/
│   ├── repos.json
│   ├── dependency-graph.json
│   └── release-config.json           ✅ NEW
├── releases/
│   ├── upcoming/                     ✅ NEW
│   │   └── release-YYYY-MM-DD.../
│   │       ├── plan.json
│   │       ├── summary.md
│   │       ├── CHANGELOG.md
│   │       └── SUMMARY.md
│   └── history/                      ✅ NEW
│       └── release-YYYY-MM-DD.../
│           └── (same structure)
└── scripts/
    ├── build-release-matrix.js      ✅ NEW
    ├── generate-changelog.js         ✅ NEW
    ├── validate-release.js           ✅ NEW
    └── create-release-summary.js     ✅ NEW
```

---

## Support

For issues:
1. Check this guide
2. Review implementation plan
3. Check workflow logs in GitHub Actions
4. Review release history in `releases/`

---

## Next Steps (Future Enhancements)

Potential additions:
1. GitHub App integration (instead of PAT)
2. Automatic PR creation for version bumps
3. Release approval workflow
4. Slack/email notifications
5. Automatic rollback on failure
6. Canary deployment coordination
7. Performance gates before release

---

**Document Location:** `/Users/samuelgleeson/dev/c3-platform/docs/ORCHESTRATED-RELEASES.md`
