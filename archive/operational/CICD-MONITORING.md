# CI/CD Monitoring & Observability

**Phase:** 1 of 3
**Status:** ✅ Implemented
**Date:** 2025-11-19

---

## Overview

Phase 1 adds central monitoring and observability to the C3 platform's CI/CD infrastructure. This provides a single pane of glass view of all repository statuses, metrics collection, and automated dashboard generation.

## Components

### 1. Central Configuration

**File:** `config/repos.json`

Single source of truth for all repository configuration:
- Repository names and types
- Dependency relationships
- Build order (topological sort)
- Workflow names
- Parallel build groups

### 2. GitHub Actions Workflows

#### Status Dashboard (`github/workflows/status-dashboard.yml`)
- **Trigger:** Every 15 minutes (cron) + manual dispatch
- **Function:** Collects current status of all repos
- **Output:** HTML dashboard on `status` branch

#### Metrics Collection (`.github/workflows/collect-metrics.yml`)
- **Trigger:** Every 6 hours + manual dispatch + repository events
- **Function:** Collects detailed historical metrics
- **Output:** JSON metrics + markdown reports

### 3. Scripts

#### `scripts/collect-status.js`
```bash
node scripts/collect-status.js
```
- Fetches latest workflow run status from GitHub API
- Generates `metrics/latest.json`
- Calculates pass rates and average durations

#### `scripts/generate-dashboard.js`
```bash
node scripts/generate-dashboard.js
```
- Creates HTML dashboard from metrics
- Auto-refreshes every 5 minutes
- Mobile-responsive design

#### `scripts/collect-metrics.js`
```bash
GITHUB_TOKEN=xxx node scripts/collect-metrics.js
```
- Analyzes last 30 workflow runs per repo
- Calculates trends and success rates
- Identifies performance issues

#### `scripts/generate-metrics-report.js`
```bash
node scripts/generate-metrics-report.js
```
- Creates markdown report from metrics
- Provides recommendations
- Highlights issues needing attention

### 4. Updated Build Scripts

All build scripts now use `config/repos.json`:
- `scripts/build-all.sh` - Dynamic repository list
- `scripts/test-all.sh` - Dynamic repository list
- `scripts/link-all.sh` - Dynamic dependency linking

## Setup

### Prerequisites

1. **Install jq** (for shell scripts):
   ```bash
   # macOS
   brew install jq

   # Ubuntu
   apt-get install jq
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install -g @octokit/rest
   ```

3. **GitHub Token**:
   - Workflows use `secrets.GITHUB_TOKEN` (automatic)
   - Local runs need `GITHUB_TOKEN` environment variable

### Local Testing

```bash
# Test status collection
GITHUB_TOKEN=your_token node scripts/collect-status.js

# Generate dashboard locally
node scripts/generate-dashboard.js

# View dashboard
open metrics/dashboard.html

# Collect detailed metrics
GITHUB_TOKEN=your_token node scripts/collect-metrics.js

# Generate report
node scripts/generate-metrics-report.js
cat metrics/report.md
```

### Enable Workflows

1. Commit Phase 1 changes
2. Push to GitHub
3. Workflows will automatically start on schedule
4. Trigger manually: `gh workflow run status-dashboard.yml`

## Dashboard Access

Once workflows run, access the dashboard at:
- **GitHub:** `https://github.com/yourorg/c3-platform/tree/status/dashboard`
- **Raw HTML:** `https://raw.githubusercontent.com/yourorg/c3-platform/status/dashboard/index.html`

## Metrics

### Collected Metrics

- **Repository Status**: Current workflow status (passing/failing)
- **Build Duration**: Min, max, average build times
- **Success Rate**: Percentage of successful builds (last 30 runs)
- **Failure Rate**: Percentage of failed builds
- **Last Success/Failure**: Timestamps of last successful/failed runs

### Reports Include

- Overall statistics (average success rate, build times)
- Per-repository breakdown
- Performance insights (fastest/slowest/most reliable)
- Recommendations for repos needing attention

## Filesystem Structure

```
c3-platform/
├── .github/
│   └── workflows/
│       ├── status-dashboard.yml      ✅ NEW
│       └── collect-metrics.yml        ✅ NEW
├── config/
│   └── repos.json                     ✅ NEW
├── docs/
│   └── CICD-MONITORING.md            ✅ NEW
├── metrics/
│   ├── latest.json                    (generated)
│   ├── dashboard.html                 (generated)
│   ├── report.md                      (generated)
│   └── history/                       (timestamped metrics)
├── logs/
│   └── events/                        (for Phase 2)
└── scripts/
    ├── collect-status.js              ✅ NEW
    ├── generate-dashboard.js          ✅ NEW
    ├── collect-metrics.js             ✅ NEW
    ├── generate-metrics-report.js     ✅ NEW
    ├── build-all.sh                   ✅ UPDATED
    ├── test-all.sh                    ✅ UPDATED
    └── link-all.sh                    ✅ UPDATED
```

## Troubleshooting

### "jq: command not found"
```bash
# Install jq
brew install jq  # macOS
apt-get install jq  # Ubuntu
```

### "Cannot find module '@octokit/rest'"
```bash
npm install -g @octokit/rest
```

### "API rate limit exceeded"
- Use authenticated requests with `GITHUB_TOKEN`
- GitHub Actions have higher rate limits
- Wait for rate limit to reset (shown in error message)

### Workflows not appearing
- Check `.github/workflows/` exists in main branch
- Verify YAML syntax: `yamllint .github/workflows/*.yml`
- Check Actions tab for errors

## Next Steps (Phase 2)

Phase 2 will add:
- Repository dispatch events
- Cross-repo communication
- Event-driven workflow triggers
- Dependency update notifications

See: `C3-CICD-ORCHESTRATION-IMPLEMENTATION-PLAN-2025-11-19.md`

---

## Acceptance Criteria

- [x] Central configuration file created (repos.json)
- [x] Status dashboard workflow implemented
- [x] Metrics collection workflow implemented
- [x] Supporting scripts created and tested
- [x] Build scripts updated to use repos.json
- [ ] Dashboard accessible (after first workflow run)
- [ ] Metrics collected successfully
- [ ] No disruption to existing workflows

---

**Document Location:** `/Users/samuelgleeson/dev/c3-platform/docs/CICD-MONITORING.md`
