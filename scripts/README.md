# Legacy Polyrepo Scripts

⚠️ **These scripts are for the deprecated polyrepo architecture.**

**For current development:** See [c3-monorepo](../../c3-monorepo/)

---

## What's Here

These scripts were used to coordinate the 9-repository polyrepo architecture:

- `build-all.sh` - Build all 9 repositories in dependency order
- `link-all.sh` - Set up npm linking between packages
- `test-all.sh` - Run tests across all repos
- `status-all.sh` - Git status for all repos
- `pull-all.sh` - Pull latest from all repos
- `generate-dashboard.js` - CI/CD metrics dashboard
- `collect-metrics.js` - Gather build statistics
- `trigger-downstream.js` - Orchestrate dependency updates
- `validate-repos.js` - Check schema compliance
- And more...

---

## Status

**Deprecated:** These scripts work with the old polyrepo structure.
**Replacement:** Nx commands in c3-monorepo

**Polyrepo commands:**
```bash
./scripts/build-all.sh      # Build 9 repos in order
./scripts/test-all.sh       # Test all repos
./scripts/status-all.sh     # Git status across repos
```

**Monorepo equivalent:**
```bash
pnpm build                  # Build all (Nx handles order)
pnpm test                   # Test all
git status                  # Single repo
```

---

## Historical Value

These scripts demonstrate the complexity of polyrepo coordination - one of the main reasons we migrated to a monorepo.

**Complexity comparison:**
- Polyrepo: 2,313 lines of bash/JS orchestration scripts
- Monorepo: 0 lines (Nx handles everything)

---

**Last Updated:** 2025-11-20
**Status:** Historical reference only
**For Current Development:** See [c3-monorepo](../../c3-monorepo/)
