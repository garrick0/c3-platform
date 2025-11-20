# Configuration Examples

⚠️ **These examples are for the deprecated polyrepo architecture.**

**For current configuration:** See [c3-monorepo workspace config](../../c3-monorepo/nx.json)

---

## What's Here

This directory contains example configuration files that were used to define each of the 9 polyrepos:

### c3-repo-configs/

YAML configuration files for each repository:

- `c3-shared.yaml` - Foundation library config
- `c3-parsing.yaml` - Parsing library config
- `c3-compliance.yaml` - Compliance library config
- `c3-projection.yaml` - Projection library config
- `c3-discovery.yaml` - Discovery library config
- `c3-wiring.yaml` - Wiring library config
- `c3-bff.yaml` - BFF application config
- `c3-cli.yaml` - CLI application config
- `c3-web.yaml` - Web application config

These configurations defined:
- Repository name and layer
- Dependencies on other repos
- Build order
- Publishing settings
- CI/CD triggers

### Schema

The configuration format was defined in `c3-repo.schema.json` at the root.

---

## Usage (Historical)

**Before (Polyrepo):**

```bash
# Validate repository configurations
node tools/validate-repos.js

# Generate build order from config
node scripts/generate-build-order.js

# These configs drove the orchestration scripts
```

**After (Monorepo):**

```bash
# Configuration is in nx.json
cat nx.json

# Nx automatically handles:
# - Dependency graph
# - Build order
# - Task orchestration

# No manual configuration files needed
```

---

## Value

These examples show:
1. The complexity of managing 9 repositories
2. The need for explicit dependency configuration
3. Why we needed orchestration tooling

In the monorepo, Nx handles all of this automatically by analyzing the codebase.

---

**Last Updated:** 2025-11-20
**Status:** Historical reference only
**For Current Configuration:** See [c3-monorepo/nx.json](../../c3-monorepo/nx.json)
