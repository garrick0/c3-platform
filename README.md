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

---

## What was the polyrepo architecture?

The C3 Platform originally consisted of 9 separate repositories:

**Libraries (6):**
- c3-shared, c3-parsing, c3-compliance, c3-projection, c3-discovery, c3-wiring

**Applications (3):**
- c3-bff (API server), c3-web (React UI), c3-cli (Command-line tool)

**Published to:** GitHub Packages as `@garrick0/*` scoped packages
**Deprecated:** November 19, 2025
**Reason for migration:** See [docs/ARCHITECTURE-DECISIONS.md](./docs/ARCHITECTURE-DECISIONS.md)

---

## What happened to the polyrepos?

Each of the 9 repositories now has a `DEPRECATED.md` file and is archived:
- ❌ No new development
- ❌ No new releases
- ✅ All code migrated to monorepo
- ✅ Git history preserved

---

## Repository Structure

```
c3-platform/
├── README.md                    # This file
├── MIGRATION-HISTORY.md         # Migration timeline and story
├── docs/                        # Key reference docs (2-3 files)
├── archive/                     # All historical docs (48+ files)
├── scripts/                     # Legacy polyrepo scripts
└── examples/                    # Config examples (reference)
```

---

## For Researchers / Historical Interest

If you're interested in:
- **Why we chose monorepo over polyrepo** → [docs/ARCHITECTURE-DECISIONS.md](./docs/ARCHITECTURE-DECISIONS.md)
- **How the migration was executed** → [docs/POLYREPO-TO-MONOREPO.md](./docs/POLYREPO-TO-MONOREPO.md)
- **Phase-by-phase migration details** → [archive/phase-reports/](./archive/phase-reports/)
- **Polyrepo CI/CD architecture** → [archive/research/CI-CD-ORCHESTRATION-ANALYSIS.md](./archive/research/)

---

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
