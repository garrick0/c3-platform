# C3 Platform Documentation Cleanup Plan

**Created:** 2025-11-20-0903
**Updated:** 2025-11-20-0910 (Revised for monorepo reality)
**Status:** Ready for Implementation
**Author:** Claude Code

---

## Executive Summary

**Critical Finding:** The c3-platform documentation is almost entirely obsolete.

**The Reality:**
- ✅ **Monorepo (c3-monorepo):** Production system, fully operational, well-documented
- ❌ **Polyrepo (9 repos):** Fully deprecated as of Nov 19, 2025, archived
- ⚠️ **c3-platform:** Historical/coordination repo with 52+ obsolete markdown files

**The Problem:**
- 90% of c3-platform docs describe the deprecated polyrepo + GitHub Packages architecture
- README.md and QUICKSTART.md guide users to a dead system
- New developers will waste time following obsolete instructions
- 52 files in docs/ describe workflows that no longer exist

**The Solution:**
c3-platform should be a **thin redirect layer** pointing to c3-monorepo, with minimal historical context preserved.

---

## Current State Reality Check

### What Actually Exists

**1. c3-monorepo (Production System) ✅**
- Location: `/Users/samuelgleeson/dev/c3-monorepo/`
- Tech: Nx workspace + pnpm
- Status: **Production ready** (migration complete Nov 19, 2025)
- Documentation: 19 files, current and comprehensive
  - README.md, QUICK-START.md, DEVELOPER-GUIDE.md
  - MIGRATION-GUIDE-FOR-DEVELOPERS.md
  - docs/API.md, DEPLOYMENT.md, RELEASES.md, ENVIRONMENT-VARIABLES.md, TYPESCRIPT.md
  - 10 PHASE-X-COMPLETE.md files (migration history)

**2. Polyrepo (9 repositories) ❌**
- Repos: c3-shared, c3-parsing, c3-compliance, c3-projection, c3-discovery, c3-wiring, c3-bff, c3-cli, c3-web
- Status: **Fully deprecated** (each has DEPRECATED.md)
- Deprecated Date: Nov 19, 2025
- Published to: GitHub Packages as `@garrick0/*` (legacy)
- Current State: Archived, no new development

**3. c3-platform (This Repository) ⚠️**
- Location: `/Users/samuelgleeson/dev/c3-platform/`
- Purpose: Was polyrepo coordination hub, now historical archive
- Status: **Historical documentation only**
- Documentation: 52+ markdown files (90%+ obsolete)
- Scripts: Polyrepo automation (build-all.sh, link-all.sh, etc.) - legacy only

### Documentation Counts

```
c3-platform/docs/:     52 files (90%+ about deprecated polyrepo)
c3-monorepo/:          19 files (100% current and relevant)
```

### Polyrepo Deprecation Evidence

From c3-shared/DEPRECATED.md:
```markdown
# ⚠️ REPOSITORY DEPRECATED

This repository has been migrated to the C3 Platform monorepo.

**Deprecated on:** 2025-11-19

## Why the Migration?

1. **Eliminate version conflicts** - Single lockfile ensures consistency
2. **Fix architectural issues** - PropertyGraph moved to correct layer
3. **Improve developer experience** - One install, instant cross-library changes
4. **Simplify CI/CD** - Single pipeline instead of 9 separate ones
5. **Enable faster builds** - 99% faster with Nx caching
```

All 9 polyrepos have identical DEPRECATED.md files.

---

## Critical Issues with Current c3-platform Docs

### Issue 1: Entry Points Point to Dead System ⚠️ CRITICAL

**README.md (root):**
- Describes polyrepo + GitHub Packages as primary workflow
- Installation instructions for GitHub Packages authentication
- Links to QUICKSTART.md which teaches polyrepo development
- "🎉 Now with automated CI/CD and GitHub Packages integration!" - **This system is deprecated**

**QUICKSTART.md (root):**
- Complete guide to setting up polyrepo development
- GitHub Packages authentication
- Working with 9 separate repositories
- npm linking strategies
- **Entirely obsolete**

**Impact:** HIGH - New developers will follow these instructions and set up a deprecated system

### Issue 2: 52+ Obsolete Documentation Files

**c3-platform/docs/ breakdown:**

**Phase Completion Reports (15+ files)** - Historical noise
- IMPLEMENTATION-COMPLETE-PHASE1.md
- PHASE-1-2-COMPLETE.md
- PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md (valuable debugging story)
- PHASE-1-3-STATUS.md
- PHASE-2-COMPLETE.md
- PROJECT-COMPLETE.md
- ALL-SYSTEMS-GO.md
- FINAL-FIX-COMPLETE.md
- CICD-VERIFICATION-COMPLETE.md
- And more...

**Implementation Summaries (10+ files)** - Historical status
- API-INTEGRATION-IMPLEMENTATION-SUMMARY.md
- API-IMPLEMENTATION-COMPLETE.md
- WEB-UI-IMPLEMENTATION-SUMMARY.md
- WEB-UI-VERIFICATION-REPORT.md
- TESTING-IMPLEMENTATION-SUMMARY.md
- CI-CD-IMPLEMENTATION-SUMMARY.md
- And more...

**Verification/Testing (6+ files)** - Historical test results
- VERIFICATION-REPORT.md
- VERIFICATION-ACTIONS-TAKEN.md
- FINAL-VERIFICATION-STATUS.md
- QUICKSTART-VERIFICATION.md
- WEB-UI-MANUAL-TESTING-RESULTS.md
- WEB-UI-LIVE-TESTING-RESULTS.md

**User Guides (3 files)** - For deprecated system
- DEVELOPMENT.md (polyrepo workflows)
- PUBLISHING.md (GitHub Packages publishing)
- TROUBLESHOOTING.md (polyrepo issues)

**Research/Analysis (8 files)** - Some valuable, but about deprecated architecture
- CI-CD-ORCHESTRATION-ANALYSIS.md
- CI-CD-RESEARCH-DOCUMENT.md
- POLYREPO-ANALYSIS.md
- POLYREPO-INDUSTRY-RESEARCH.md
- ARCHITECTURE-OPTIONS-COMPARISON.md (valuable!)
- C3-PLATFORM-COMPREHENSIVE-ANALYSIS.md
- C3-ANALYSIS-EXECUTIVE-SUMMARY.md

**Polyrepo-Specific (4+ files)** - Redundant analysis
- POLYREPO-ANALYSIS.md
- POLYREPO-ANALYSIS-README.md
- POLYREPO-INDEX.md
- POLYREPO-SUMMARY.md

**Status:** ~48 files are purely historical, ~4 files have lasting value (architecture analysis, debugging stories)

### Issue 3: Misleading Repository Purpose

**Current README.md presents c3-platform as:**
- "C3 Platform - Code Compliance Curator"
- "Modular platform for architectural analysis"
- Instructions for running applications
- Package architecture diagrams

**Reality: c3-platform is:**
- A meta-repository that **was** used to coordinate 9 polyrepos
- Now a historical archive of that migration
- Scripts for legacy polyrepo automation
- **NOT the actual C3 Platform codebase**

**Actual C3 Platform is:** `/Users/samuelgleeson/dev/c3-monorepo/`

### Issue 4: Confusing Git History

Recent c3-platform commits (Nov 19-20):
```
1a6534c Migration final status: Complete and production ready
ced7810 Phase 5 complete: Final cleanup and documentation
e65683a Migration complete: Full summary and status
```

These suggest migration TO monorepo is complete, but docs still describe polyrepo system.

### Issue 5: No Clear Migration Path

Current docs don't clearly explain:
- Migration is complete (not in progress)
- Polyrepos are deprecated (not "alternative approach")
- Where to go for current development (c3-monorepo)
- What c3-platform is for now (historical reference only)

---

## Recommended Solution: Radical Simplification

### Philosophy

c3-platform should be a **lightweight historical archive** that immediately redirects developers to c3-monorepo.

**Goals:**
1. ✅ New developers find c3-monorepo in < 10 seconds
2. ✅ Clear that polyrepo is deprecated, not alternative
3. ✅ Historical context preserved but out of the way
4. ✅ Minimize maintenance burden (< 5 active docs)

### Proposed Structure

```
c3-platform/
├── README.md                          # REWRITE: "See c3-monorepo"
├── MIGRATION-HISTORY.md               # NEW: High-level migration story
├── docs/
│   ├── ARCHITECTURE-DECISIONS.md     # NEW: Why monorepo? (consolidate research)
│   └── POLYREPO-TO-MONOREPO.md       # NEW: Technical migration details
├── archive/                           # NEW: Historical docs
│   ├── README.md                      # Index of archived docs
│   ├── polyrepo-guides/               # Old QUICKSTART, DEVELOPMENT, etc.
│   ├── phase-reports/                 # All PHASE-X-COMPLETE docs
│   ├── verification/                  # All verification reports
│   ├── implementation/                # All implementation summaries
│   └── research/                      # Research docs (may keep some)
├── scripts/                           # KEEP: Legacy polyrepo scripts
│   └── README.md                      # Document these are for legacy system
└── examples/                          # KEEP: Config examples (reference)
```

**Active Docs:** 3-5 files (down from 52+)
**Archived Docs:** 48+ files (preserved but clearly historical)

---

## Detailed Cleanup Plan

### Phase 1: Create New Entry Points (Day 1)

#### 1.1 Rewrite README.md

**New README.md:**

```markdown
# C3 Platform - Polyrepo Historical Archive

⚠️ **This repository is a historical archive of the C3 Platform polyrepo architecture.**

## Looking for C3 Platform?

**👉 Go to [c3-monorepo](../c3-monorepo/) for the production system.**

---

## What is this repository?

This repository (`c3-platform`) was the coordination hub for the C3 Platform when it used a polyrepo architecture (9 separate repositories).

**Migration completed:** November 19, 2025
**Status:** Historical archive only
**Active development:** All moved to [c3-monorepo](../c3-monorepo/)

## Why was this kept?

- **Historical context:** Documentation of architecture decisions and migration
- **Legacy scripts:** Tools for polyrepo coordination (now obsolete)
- **Migration reference:** Complete history of polyrepo → monorepo transition

## Quick Links

- **🚀 Start Here:** [c3-monorepo README](../c3-monorepo/README.md)
- **📚 Documentation:** [c3-monorepo/docs/](../c3-monorepo/docs/)
- **🔄 Migration History:** [MIGRATION-HISTORY.md](./MIGRATION-HISTORY.md)
- **🏛️ Architecture Decisions:** [docs/ARCHITECTURE-DECISIONS.md](./docs/ARCHITECTURE-DECISIONS.md)
- **📦 Archived Docs:** [archive/README.md](./archive/README.md)

## What was the polyrepo architecture?

The C3 Platform originally consisted of 9 separate repositories:

**Libraries (6):**
- c3-shared, c3-parsing, c3-compliance, c3-projection, c3-discovery, c3-wiring

**Applications (3):**
- c3-bff (API server), c3-web (React UI), c3-cli (Command-line tool)

**Published to:** GitHub Packages as `@garrick0/*` scoped packages
**Deprecated:** November 19, 2025
**Reason for migration:** See [docs/ARCHITECTURE-DECISIONS.md](./docs/ARCHITECTURE-DECISIONS.md)

## What happened to the polyrepos?

Each of the 9 repositories now has a `DEPRECATED.md` file and is archived:
- No new development
- No new releases
- All code migrated to monorepo
- Git history preserved

## Repository Structure

```
c3-platform/
├── README.md                    # This file
├── MIGRATION-HISTORY.md         # Migration timeline and story
├── docs/                        # Key reference docs (3 files)
├── archive/                     # All historical docs (48+ files)
├── scripts/                     # Legacy polyrepo scripts
└── examples/                    # Config examples (reference)
```

## For Researchers / Historical Interest

If you're interested in:
- Why we chose monorepo over polyrepo → [docs/ARCHITECTURE-DECISIONS.md](./docs/ARCHITECTURE-DECISIONS.md)
- How the migration was executed → [docs/POLYREPO-TO-MONOREPO.md](./docs/POLYREPO-TO-MONOREPO.md)
- Phase-by-phase migration details → [archive/phase-reports/](./archive/phase-reports/)
- Polyrepo CI/CD architecture → [archive/research/CI-CD-ORCHESTRATION-ANALYSIS.md](./archive/research/)

## FAQ

**Q: Can I still use the polyrepo system?**
A: No, it's deprecated. All polyrepos have DEPRECATED.md files and are archived.

**Q: Where do I develop C3 Platform features?**
A: In [c3-monorepo](../c3-monorepo/) - that's the production system.

**Q: What about GitHub Packages with @garrick0/* scope?**
A: Those are legacy packages from the polyrepo era. New packages are built/published from the monorepo.

**Q: Why keep this repository?**
A: Historical context, architecture decisions, and migration documentation are valuable for future reference.

**Q: I found a bug in the polyrepo docs!**
A: These docs are archived and won't be updated. Check c3-monorepo docs instead.

---

**Last Updated:** 2025-11-20
**Maintained By:** Historical archive (no active maintenance)
**For Current Documentation:** See [c3-monorepo](../c3-monorepo/)
```

#### 1.2 Create MIGRATION-HISTORY.md

**New file:** Consolidate high-level migration story

**Content:**
- Timeline (dates, milestones)
- Why migration happened
- What changed for developers
- Phases 0-10 executive summary
- Links to detailed phase reports in archive/
- Success metrics (build time, developer experience)
- Lessons learned

**Length:** ~300 lines (concise, high-level)

#### 1.3 Delete Obsolete Root Files

**Delete:**
- QUICKSTART.md (polyrepo setup guide)
- TROUBLESHOOTING.md (polyrepo troubleshooting)
- GETTING-STARTED.md (duplicate)
- POLYREPO-REVIEW-COMPLETE.md (status report)
- QUICK-REFERENCE.md (polyrepo links)

**Keep:**
- README.md (rewritten)
- MIGRATION-HISTORY.md (new)

---

### Phase 2: Consolidate Key Reference Docs (Day 2)

#### 2.1 Create docs/ARCHITECTURE-DECISIONS.md

**Purpose:** Answer "Why monorepo?" with lasting value

**Consolidate from:**
- ARCHITECTURE-OPTIONS-COMPARISON.md
- C3-PLATFORM-COMPREHENSIVE-ANALYSIS.md
- C3-ANALYSIS-EXECUTIVE-SUMMARY.md
- Relevant sections from polyrepo research docs

**Sections:**
1. **Problem Statement** (why we needed to change)
2. **Options Considered** (polyrepo, monorepo, hybrid)
3. **Decision Matrix** (comparison table)
4. **Why Monorepo Won** (specific reasons)
5. **Architecture Before/After** (diagrams)
6. **Technical Benefits** (build speed, dev experience)
7. **Architectural Fixes** (PropertyGraph layer issue)
8. **Lessons Learned**

**Length:** ~500-700 lines (comprehensive reference)

#### 2.2 Create docs/POLYREPO-TO-MONOREPO.md

**Purpose:** Technical migration details for reference

**Consolidate from:**
- POLYREPO-ANALYSIS.md (+ 3 other polyrepo docs)
- CI-CD-ORCHESTRATION-ANALYSIS.md
- High-level summaries from phase reports

**Sections:**
1. **Migration Overview**
2. **Polyrepo Architecture** (what it was)
3. **Monorepo Architecture** (what it became)
4. **Migration Strategy** (Nx, pnpm, structure)
5. **Phase-by-Phase Summary** (Phases 0-10 condensed)
6. **Technical Challenges** (PropertyGraph, dependencies)
7. **Tooling Changes** (GitHub Packages → Nx, npm → pnpm)
8. **Developer Experience Changes** (before/after workflows)
9. **CI/CD Changes** (9 pipelines → 1)
10. **Success Metrics** (build time: 10min → 6s)

**Length:** ~600-800 lines (technical deep dive)

#### 2.3 Consolidate Research (if valuable)

**Option A:** Keep in archive/research/ (recommended)
**Option B:** Create docs/RESEARCH.md with highlights

**Valuable docs:**
- PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md (TypeScript mystery - great story!)
- CI-CD-RESEARCH-DOCUMENT.md (polyrepo CI/CD patterns)
- POLYREPO-INDUSTRY-RESEARCH.md (industry research)

**Recommendation:** Move to archive/research/ but keep them intact

---

### Phase 3: Create Archive Structure (Day 3)

#### 3.1 Create archive/README.md

**Purpose:** Index of what's archived and why

```markdown
# C3 Platform Historical Archive

This directory contains documentation from the polyrepo era of C3 Platform (deprecated Nov 19, 2025).

## Why Archive?

These documents describe the deprecated polyrepo + GitHub Packages architecture. They're preserved for:
- Historical context
- Architecture research
- Migration reference
- Learning from decisions

**For current documentation:** See [c3-monorepo](../../c3-monorepo/)

## Archive Organization

### polyrepo-guides/ (5 files)
User guides for the deprecated polyrepo system:
- QUICKSTART.md - Setup and installation
- DEVELOPMENT.md - Development workflows
- PUBLISHING.md - GitHub Packages publishing
- TROUBLESHOOTING.md - Common issues
- CHEAT-SHEET.md - Quick reference

### phase-reports/ (15+ files)
Phase-by-phase migration status reports:
- PHASE-1-2-COMPLETE.md through PHASE-2-COMPLETE.md
- IMPLEMENTATION-COMPLETE-PHASE1.md
- PROJECT-COMPLETE.md
- ALL-SYSTEMS-GO.md
- And more...

**Summary available:** [MIGRATION-HISTORY.md](../MIGRATION-HISTORY.md)

### verification/ (6 files)
Test and verification reports:
- VERIFICATION-REPORT.md
- FINAL-VERIFICATION-STATUS.md
- QUICKSTART-VERIFICATION.md
- WEB-UI-MANUAL-TESTING-RESULTS.md
- WEB-UI-LIVE-TESTING-RESULTS.md
- And more...

### implementation/ (10+ files)
Implementation summaries for various features:
- API-INTEGRATION-IMPLEMENTATION-SUMMARY.md
- WEB-UI-IMPLEMENTATION-SUMMARY.md
- TESTING-IMPLEMENTATION-SUMMARY.md
- CI-CD-IMPLEMENTATION-SUMMARY.md
- And more...

### research/ (8 files)
Architecture research and analysis:
- CI-CD-ORCHESTRATION-ANALYSIS.md
- CI-CD-RESEARCH-DOCUMENT.md
- POLYREPO-ANALYSIS.md
- POLYREPO-INDUSTRY-RESEARCH.md
- ARCHITECTURE-OPTIONS-COMPARISON.md ⭐
- PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md ⭐ (excellent debugging story)

⭐ = Particularly valuable for learning

### planning/ (6 files)
Implementation plans (now completed):
- API-INTEGRATION-PLAN.md
- WEB-UI-IMPLEMENTATION-PLAN.md
- IMPLEMENTATION-GUIDE.md
- TESTING-STRATEGY.md

### operational/ (4 files)
Operational docs for polyrepo system:
- CICD-MONITORING.md
- ORCHESTRATED-RELEASES.md
- CICD-COMPLETE-ARCHITECTURE-GUIDE.md

## Most Valuable Archived Docs

If you're researching the migration, start with:

1. **[research/PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md](./research/PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md)**
   - Excellent debugging story about TypeScript .d.ts generation
   - Great learning material

2. **[research/ARCHITECTURE-OPTIONS-COMPARISON.md](./research/ARCHITECTURE-OPTIONS-COMPARISON.md)**
   - Comprehensive comparison of monorepo vs polyrepo
   - Decision matrix

3. **[research/CI-CD-ORCHESTRATION-ANALYSIS.md](./research/CI-CD-ORCHESTRATION-ANALYSIS.md)**
   - Deep dive into polyrepo CI/CD challenges
   - Why we needed orchestration

4. **[phase-reports/PROJECT-COMPLETE.md](./phase-reports/PROJECT-COMPLETE.md)**
   - Final status of polyrepo implementation
   - Before migration to monorepo

## Archive Date

**Archived:** 2025-11-20
**Polyrepo deprecated:** 2025-11-19
**Migration completed:** 2025-11-19

---

**These docs are historical only. For current docs, see [c3-monorepo](../../c3-monorepo/).**
```

#### 3.2 Move Files to Archive

**Create directories:**
```bash
mkdir -p archive/{polyrepo-guides,phase-reports,verification,implementation,research,planning,operational}
```

**Move files:**

```bash
# Polyrepo guides
git mv QUICKSTART.md archive/polyrepo-guides/
git mv docs/DEVELOPMENT.md archive/polyrepo-guides/
git mv docs/PUBLISHING.md archive/polyrepo-guides/
git mv docs/TROUBLESHOOTING.md archive/polyrepo-guides/
git mv docs/CHEAT-SHEET.md archive/polyrepo-guides/

# Phase reports
git mv docs/PHASE-*.md archive/phase-reports/
git mv docs/IMPLEMENTATION-COMPLETE-PHASE1.md archive/phase-reports/
git mv docs/PROJECT-COMPLETE.md archive/phase-reports/
git mv docs/ALL-SYSTEMS-GO.md archive/phase-reports/
git mv docs/FINAL-*.md archive/phase-reports/
git mv docs/CICD-VERIFICATION-COMPLETE.md archive/phase-reports/
# ... (all phase/completion docs)

# Verification
git mv docs/VERIFICATION-*.md archive/verification/
git mv docs/QUICKSTART-VERIFICATION.md archive/verification/
git mv docs/WEB-UI-*-TESTING-RESULTS.md archive/verification/

# Implementation
git mv docs/*-IMPLEMENTATION-SUMMARY.md archive/implementation/
git mv docs/API-IMPLEMENTATION-COMPLETE.md archive/implementation/
git mv docs/SESSION-SUMMARY.md archive/implementation/

# Research
git mv docs/CI-CD-ORCHESTRATION-ANALYSIS.md archive/research/
git mv docs/CI-CD-RESEARCH-DOCUMENT.md archive/research/
git mv docs/POLYREPO-*.md archive/research/
git mv docs/ARCHITECTURE-OPTIONS-COMPARISON.md archive/research/
git mv docs/C3-PLATFORM-COMPREHENSIVE-ANALYSIS.md archive/research/
git mv docs/C3-ANALYSIS-EXECUTIVE-SUMMARY.md archive/research/
git mv docs/PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md archive/research/ # Keep this, valuable!

# Planning
git mv docs/*-PLAN.md archive/planning/
git mv docs/IMPLEMENTATION-GUIDE.md archive/planning/
git mv docs/TESTING-STRATEGY.md archive/planning/

# Operational
git mv docs/CICD-MONITORING.md archive/operational/
git mv docs/ORCHESTRATED-RELEASES.md archive/operational/
git mv docs/CICD-COMPLETE-ARCHITECTURE-GUIDE.md archive/operational/
```

**Result:**
- docs/ directory: Nearly empty (new files only)
- archive/ directory: 48+ historical files organized by category

---

### Phase 4: Update Scripts and Examples (Day 4)

#### 4.1 Add scripts/README.md

```markdown
# Legacy Polyrepo Scripts

⚠️ **These scripts are for the deprecated polyrepo architecture.**

**For current development:** See [c3-monorepo](../../c3-monorepo/)

## What's Here

These scripts were used to coordinate the 9-repository polyrepo architecture:

- `build-all.sh` - Build all 9 repositories in dependency order
- `link-all.sh` - Set up npm linking between packages
- `test-all.sh` - Run tests across all repos
- `status-all.sh` - Git status for all repos
- `pull-all.sh` - Pull latest from all repos
- And more...

## Status

**Deprecated:** These scripts work with the old polyrepo structure.
**Replacement:** Nx commands in c3-monorepo (e.g., `nx run-many --target=build`)

## Historical Value

These scripts demonstrate the complexity of polyrepo coordination - one of the reasons we migrated to a monorepo.

---

**Last Updated:** 2025-11-20
**Status:** Historical reference only
```

#### 4.2 Update examples/README.md

Add deprecation notice at top:

```markdown
# Configuration Examples

⚠️ **These examples are for the deprecated polyrepo architecture.**

These YAML files show the configuration format for each of the 9 polyrepos.

**For current configuration:** See [c3-monorepo workspace config](../../c3-monorepo/nx.json)

---

[rest of existing README]
```

---

### Phase 5: Final Validation (Day 5)

#### 5.1 Checklist

**README.md:**
- [ ] Clearly states "historical archive"
- [ ] Links to c3-monorepo prominently
- [ ] Explains what c3-platform was
- [ ] Links to key docs (MIGRATION-HISTORY, ARCHITECTURE-DECISIONS)

**docs/ directory:**
- [ ] Contains only 2-3 reference files
- [ ] ARCHITECTURE-DECISIONS.md (why monorepo)
- [ ] POLYREPO-TO-MONOREPO.md (technical migration)
- [ ] All other docs moved to archive/

**archive/ directory:**
- [ ] README.md index exists
- [ ] All historical docs organized by category
- [ ] Links work
- [ ] Clear what's archived and why

**Root files:**
- [ ] Only README.md and MIGRATION-HISTORY.md
- [ ] QUICKSTART.md deleted (obsolete)
- [ ] TROUBLESHOOTING.md deleted (obsolete)

**Navigation test:**
- [ ] New developer can find c3-monorepo in < 10 seconds
- [ ] Clear that polyrepo is deprecated
- [ ] Historical docs accessible but not prominent

#### 5.2 Link Validation

```bash
# Check all markdown links
find . -name "*.md" -not -path "./node_modules/*" -exec grep -l "](.*\.md)" {} \; | \
  xargs -I {} sh -c 'echo "Checking {}" && markdown-link-check {}'
```

---

## Implementation Timeline

### Week 1: Core Transformation

**Day 1: New Entry Points**
- Rewrite README.md
- Create MIGRATION-HISTORY.md
- Delete obsolete root files
- **Deliverable:** Clear redirect to c3-monorepo

**Day 2: Reference Docs**
- Create docs/ARCHITECTURE-DECISIONS.md
- Create docs/POLYREPO-TO-MONOREPO.md
- **Deliverable:** Lasting reference material

**Day 3: Archive Creation**
- Create archive/ structure
- Create archive/README.md
- Move 48+ files to archive/
- **Deliverable:** Organized historical archive

**Day 4: Cleanup**
- Update scripts/README.md
- Update examples/README.md
- Fix any broken links
- **Deliverable:** Consistent deprecation notices

**Day 5: Validation**
- Test all navigation paths
- Validate links
- User testing (new developer perspective)
- **Deliverable:** Production-ready documentation

---

## File-by-File Action Matrix

| File | Current | Action | Destination |
|------|---------|--------|-------------|
| **Root Level** |
| README.md | Polyrepo guide | **REWRITE** | / (new version) |
| QUICKSTART.md | Polyrepo setup | **MOVE** | archive/polyrepo-guides/ |
| TROUBLESHOOTING.md | Polyrepo issues | **MOVE** | archive/polyrepo-guides/ |
| GETTING-STARTED.md | Duplicate | **DELETE** | - |
| QUICK-REFERENCE.md | Polyrepo links | **DELETE** | - |
| POLYREPO-REVIEW-COMPLETE.md | Status | **MOVE** | archive/phase-reports/ |
| MIGRATION-HISTORY.md | N/A | **CREATE** | / (new) |
| **docs/ - Core** |
| DEVELOPMENT.md | Polyrepo guide | **MOVE** | archive/polyrepo-guides/ |
| PUBLISHING.md | GitHub Packages | **MOVE** | archive/polyrepo-guides/ |
| TROUBLESHOOTING.md | Polyrepo issues | **MOVE** | archive/polyrepo-guides/ |
| CHEAT-SHEET.md | Quick ref | **MOVE** | archive/polyrepo-guides/ |
| ARCHITECTURE-DECISIONS.md | N/A | **CREATE** | docs/ (new) |
| POLYREPO-TO-MONOREPO.md | N/A | **CREATE** | docs/ (new) |
| **docs/ - Phase Reports (15+ files)** |
| PHASE-1-2-COMPLETE.md | Status | **MOVE** | archive/phase-reports/ |
| PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md | Debugging story ⭐ | **MOVE** | archive/research/ |
| PHASE-1-3-STATUS.md | Status | **MOVE** | archive/phase-reports/ |
| PHASE-2-COMPLETE.md | Status | **MOVE** | archive/phase-reports/ |
| PROJECT-COMPLETE.md | Status | **MOVE** | archive/phase-reports/ |
| IMPLEMENTATION-COMPLETE-PHASE1.md | Status | **MOVE** | archive/phase-reports/ |
| ALL-SYSTEMS-GO.md | Status | **MOVE** | archive/phase-reports/ |
| FINAL-FIX-COMPLETE.md | Status | **MOVE** | archive/phase-reports/ |
| FINAL-VERIFICATION-STATUS.md | Status | **MOVE** | archive/phase-reports/ |
| CICD-VERIFICATION-COMPLETE.md | Status | **MOVE** | archive/phase-reports/ |
| *(~10 more phase docs)* | Status | **MOVE** | archive/phase-reports/ |
| **docs/ - Verification (6 files)** |
| VERIFICATION-REPORT.md | Test results | **MOVE** | archive/verification/ |
| VERIFICATION-ACTIONS-TAKEN.md | Test results | **MOVE** | archive/verification/ |
| QUICKSTART-VERIFICATION.md | Test results | **MOVE** | archive/verification/ |
| WEB-UI-VERIFICATION-REPORT.md | Test results | **MOVE** | archive/verification/ |
| WEB-UI-MANUAL-TESTING-RESULTS.md | Test results | **MOVE** | archive/verification/ |
| WEB-UI-LIVE-TESTING-RESULTS.md | Test results | **MOVE** | archive/verification/ |
| **docs/ - Implementation (10+ files)** |
| API-INTEGRATION-IMPLEMENTATION-SUMMARY.md | Summary | **MOVE** | archive/implementation/ |
| API-IMPLEMENTATION-COMPLETE.md | Summary | **MOVE** | archive/implementation/ |
| WEB-UI-IMPLEMENTATION-SUMMARY.md | Summary | **MOVE** | archive/implementation/ |
| TESTING-IMPLEMENTATION-SUMMARY.md | Summary | **MOVE** | archive/implementation/ |
| CI-CD-IMPLEMENTATION-SUMMARY.md | Summary | **MOVE** | archive/implementation/ |
| FIXING-REMAINING-ISSUES-SUMMARY.md | Summary | **MOVE** | archive/implementation/ |
| SESSION-SUMMARY.md | Summary | **MOVE** | archive/implementation/ |
| IMPLEMENTATION-STATUS.md | Status | **MOVE** | archive/phase-reports/ |
| RESEARCH-SUMMARY.md | Summary | **MOVE** | archive/implementation/ |
| *(more summaries)* | Summary | **MOVE** | archive/implementation/ |
| **docs/ - Research (8 files)** |
| CI-CD-ORCHESTRATION-ANALYSIS.md | Analysis ⭐ | **MOVE** | archive/research/ |
| CI-CD-RESEARCH-DOCUMENT.md | Research | **MOVE** | archive/research/ |
| POLYREPO-ANALYSIS.md | Analysis | **MOVE** | archive/research/ |
| POLYREPO-ANALYSIS-README.md | Duplicate | **MOVE** | archive/research/ |
| POLYREPO-INDEX.md | Duplicate | **MOVE** | archive/research/ |
| POLYREPO-SUMMARY.md | Duplicate | **MOVE** | archive/research/ |
| POLYREPO-INDUSTRY-RESEARCH.md | Research | **MOVE** | archive/research/ |
| ARCHITECTURE-OPTIONS-COMPARISON.md | Analysis ⭐ | **MOVE** | archive/research/ |
| C3-PLATFORM-COMPREHENSIVE-ANALYSIS.md | Analysis | **MOVE** | archive/research/ |
| C3-ANALYSIS-EXECUTIVE-SUMMARY.md | Summary | **MOVE** | archive/research/ |
| **docs/ - Planning (6 files)** |
| API-INTEGRATION-PLAN.md | Plan | **MOVE** | archive/planning/ |
| WEB-UI-IMPLEMENTATION-PLAN.md | Plan | **MOVE** | archive/planning/ |
| IMPLEMENTATION-GUIDE.md | Guide | **MOVE** | archive/planning/ |
| TESTING-STRATEGY.md | Strategy | **MOVE** | archive/planning/ |
| *(more plans)* | Plan | **MOVE** | archive/planning/ |
| **docs/ - Operational (4 files)** |
| CICD-MONITORING.md | Ops guide | **MOVE** | archive/operational/ |
| ORCHESTRATED-RELEASES.md | Ops guide | **MOVE** | archive/operational/ |
| CICD-COMPLETE-ARCHITECTURE-GUIDE.md | Architecture | **MOVE** | archive/operational/ |
| **docs/ - Success Reports** |
| C3-PARSING-CI-SUCCESS.md | Status | **MOVE** | archive/phase-reports/ |
| GITHUB-PACKAGES-SUCCESS.md | Status | **MOVE** | archive/phase-reports/ |

⭐ = Particularly valuable for learning

**Summary:**
- **DELETE:** 2 files (duplicates)
- **MOVE to archive/:** 48+ files (organized by category)
- **CREATE new:** 2 files (MIGRATION-HISTORY.md, docs/ARCHITECTURE-DECISIONS.md, docs/POLYREPO-TO-MONOREPO.md)
- **REWRITE:** 1 file (README.md)
- **KEEP:** scripts/, examples/ (with deprecation notices added)

**Result:**
- Active docs: 3 files (README, MIGRATION-HISTORY, docs/*)
- Archived: 48+ files (organized and indexed)

---

## Success Metrics

### Primary Goals

✅ **Navigation Speed**
- New developer finds c3-monorepo in < 10 seconds
- Clear "go here instead" messaging
- No ambiguity about which system is current

✅ **Clarity**
- 100% clear polyrepo is deprecated
- 100% clear c3-platform is historical
- 100% clear where to develop (c3-monorepo)

✅ **Historical Preservation**
- All docs preserved in organized archive
- Index explains what's where
- Valuable content (debugging stories, architecture analysis) highlighted

✅ **Maintenance Burden**
- Reduce from 52+ active docs to 3
- Clear deprecation notices (no updates needed)
- Archive is "set and forget"

### Validation Tests

**New Developer Test:**
1. Clone c3-platform
2. Read README.md
3. Can they find c3-monorepo? (should be < 30 seconds)
4. Do they understand polyrepo is deprecated? (should be obvious)

**Researcher Test:**
1. Looking for architecture decisions
2. Can they find ARCHITECTURE-DECISIONS.md? (should be easy)
3. Can they find phase reports if needed? (should be in archive/)

**Maintainer Test:**
1. How many docs need regular updates? (should be 0-1)
2. Are deprecation notices clear? (should be unambiguous)

---

## Risk Mitigation

### Risk 1: Lost Context

**Problem:** Historical completion reports contain valuable context

**Mitigation:**
- Don't delete, archive with clear index
- Highlight valuable docs (⭐ marking)
- Create high-level MIGRATION-HISTORY.md with key points
- Keep debugging journey doc intact (excellent learning material)

**Likelihood:** LOW
**Impact:** LOW (all preserved)

### Risk 2: Broken External Links

**Problem:** External systems may link to c3-platform docs

**Mitigation:**
- Files don't disappear, they move to archive/
- README.md provides redirect guidance
- Use `git mv` to preserve history
- Consider adding link redirects if needed

**Likelihood:** MEDIUM
**Impact:** LOW (archive paths stable)

### Risk 3: Confusion During Transition

**Problem:** Team may be confused by sudden change

**Mitigation:**
- Communication plan before changes
- Clear "MOVED TO" notices in commits
- Staged rollout (backup branch first)
- Team review before merging

**Likelihood:** MEDIUM
**Impact:** LOW (clear messaging)

---

## Alternative: If c3-platform Should Be Deleted

**Extreme option:** Delete c3-platform entirely since monorepo is production.

**Process:**
1. Create c3-monorepo/docs/migration/ directory
2. Move ARCHITECTURE-DECISIONS.md there
3. Move POLYREPO-TO-MONOREPO.md there
4. Move phase reports there (condensed)
5. Archive c3-platform repository on GitHub
6. Add notice pointing to monorepo

**Pros:**
- Ultimate simplification
- Single source of truth
- No ambiguity whatsoever

**Cons:**
- Loses coordination scripts (may still be useful)
- Loses organized archive structure
- Requires buy-in from team

**Recommendation:** Start with archival approach, consider deletion later if c3-platform sees zero use.

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review plan with team
- [ ] Get consensus on approach
- [ ] Create backup branch: `backup/pre-cleanup-2025-11-20`
- [ ] Identify any must-keep docs not in plan

### Day 1: Entry Points
- [ ] Backup current README.md
- [ ] Write new README.md (redirect to monorepo)
- [ ] Create MIGRATION-HISTORY.md (high-level story)
- [ ] Delete QUICKSTART.md, TROUBLESHOOTING.md, etc.
- [ ] Test navigation: Can I find monorepo quickly?

### Day 2: Reference Docs
- [ ] Create docs/ARCHITECTURE-DECISIONS.md
- [ ] Create docs/POLYREPO-TO-MONOREPO.md
- [ ] Consolidate research docs into above
- [ ] Review for accuracy

### Day 3: Archive Structure
- [ ] Create archive/ directories
- [ ] Create archive/README.md
- [ ] Move 48+ files to archive/ (organized)
- [ ] Test: Can I find historical docs?

### Day 4: Cleanup
- [ ] Add scripts/README.md (deprecation notice)
- [ ] Update examples/README.md (deprecation notice)
- [ ] Fix any broken links
- [ ] Remove .working/ directory or add deprecation notice

### Day 5: Validation
- [ ] Run link checker
- [ ] New developer test (find monorepo quickly?)
- [ ] Researcher test (find architecture decisions?)
- [ ] Team review
- [ ] Final adjustments

### Deploy
- [ ] Commit all changes
- [ ] Push to main
- [ ] Communicate to team
- [ ] Update any external references

---

## Recommended Commit Messages

```bash
# Day 1
git commit -m "docs: rewrite README to redirect to c3-monorepo (polyrepo deprecated)"

# Day 2
git commit -m "docs: add architecture decisions and migration reference docs"

# Day 3
git commit -m "docs: archive 48+ historical polyrepo documents"

# Day 4
git commit -m "docs: add deprecation notices to scripts and examples"

# Day 5
git commit -m "docs: finalize documentation cleanup and validation"
```

---

## Final Structure Preview

```
c3-platform/
├── README.md                               # ✨ NEW: Redirect to c3-monorepo
├── MIGRATION-HISTORY.md                    # ✨ NEW: High-level migration story
│
├── docs/
│   ├── ARCHITECTURE-DECISIONS.md           # ✨ NEW: Why monorepo? (400 lines)
│   └── POLYREPO-TO-MONOREPO.md            # ✨ NEW: Technical migration (600 lines)
│
├── archive/
│   ├── README.md                           # ✨ NEW: Index of archived docs
│   ├── polyrepo-guides/                    # 5 files
│   │   ├── QUICKSTART.md
│   │   ├── DEVELOPMENT.md
│   │   ├── PUBLISHING.md
│   │   ├── TROUBLESHOOTING.md
│   │   └── CHEAT-SHEET.md
│   ├── phase-reports/                      # 15+ files
│   │   ├── PHASE-1-2-COMPLETE.md
│   │   ├── PROJECT-COMPLETE.md
│   │   └── ...
│   ├── verification/                       # 6 files
│   ├── implementation/                     # 10+ files
│   ├── research/                           # 8 files ⭐
│   │   ├── ARCHITECTURE-OPTIONS-COMPARISON.md
│   │   ├── PHASE-1-3-COMPLETE-DEBUGGING-JOURNEY.md ⭐
│   │   └── ...
│   ├── planning/                           # 6 files
│   └── operational/                        # 4 files
│
├── scripts/                                # KEEP (with deprecation notice)
│   ├── README.md                           # ✨ NEW: Legacy scripts notice
│   ├── build-all.sh
│   └── ...
│
└── examples/                               # KEEP (with deprecation notice)
    └── README.md                           # UPDATED: Deprecation notice
```

**Active Files:** 3-4 markdown files (down from 52+)
**Archived Files:** 48+ files (organized, indexed, preserved)
**Scripts/Examples:** Kept with deprecation notices

---

## Conclusion

The c3-platform documentation needs radical simplification because:

1. **Polyrepo is fully deprecated** (Nov 19, 2025) - not "alternative approach"
2. **Monorepo is production** - all active development there
3. **52+ docs describe obsolete system** - will confuse new developers
4. **c3-platform is now historical** - not a development repository

**Recommended Action:**
- **Rewrite README.md** to redirect to c3-monorepo
- **Create 2 reference docs** (architecture decisions, technical migration)
- **Archive 48+ historical docs** in organized structure
- **Add deprecation notices** to scripts/examples

**Timeline:** 5 days
**Result:** Clear redirect, preserved history, minimal maintenance
**Risk:** Low (all docs preserved, clear communication)

**Next Step:** Get team consensus and execute Day 1 (rewrite README.md).

---

**Document Location:** `/Users/samuelgleeson/dev/c3-platform/.working/2025-11-20-0903-documentation-cleanup-plan.md`

**Created:** 2025-11-20-0903
**Updated:** 2025-11-20-0910 (Revised for monorepo reality)
**Status:** Ready for Implementation
**Author:** Claude Code
