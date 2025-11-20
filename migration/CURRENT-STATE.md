# C3 Platform Pre-Migration State
**Date:** 2025-11-19
**Purpose:** Document current state before monorepo migration

## Repository Backups

All repositories backed up as git bundles in this directory.

## Repository Details

### c3-shared

- **Package:** @garrick0/c3-shared
- **Version:** 0.1.0-dev.0
- **Branch:** main
- **Commit:** 744eedb

### c3-parsing

- **Package:** @garrick0/c3-parsing
- **Version:** 2.0.0-dev.0
- **Branch:** main
- **Commit:** d06ca95

### c3-compliance

- **Package:** @garrick0/c3-compliance
- **Version:** 0.1.0-dev.0
- **Branch:** main
- **Commit:** 3cba3a2

### c3-projection

- **Package:** @garrick0/c3-projection
- **Version:** 0.1.0-dev.0
- **Branch:** main
- **Commit:** 173c89f

### c3-discovery

- **Package:** @garrick0/c3-discovery
- **Version:** 0.1.0-dev.0
- **Branch:** main
- **Commit:** 31f17b3

### c3-wiring

- **Package:** @garrick0/c3-wiring
- **Version:** 0.1.0-dev.0
- **Branch:** main
- **Commit:** 3cf4449

### c3-cli

- **Package:** c3-cli
- **Version:** 0.1.0
- **Branch:** main
- **Commit:** 6d070b9

### c3-bff

- **Package:** c3-bff
- **Version:** 0.1.0
- **Branch:** main
- **Commit:** 894f447

### c3-web

- **Package:** c3-web
- **Version:** 0.2.0
- **Branch:** main
- **Commit:** fe23d4c


## Dependency Structure (Current)

### Libraries

**c3-shared:**

**c3-parsing:**
-     "@garrick0/c3-shared": "dev",

**c3-compliance:**
-     "@garrick0/c3-shared": "dev",
-     "@garrick0/c3-parsing": "dev"

**c3-projection:**
-     "@garrick0/c3-parsing": "dev",
-     "@garrick0/c3-shared": "dev",

**c3-discovery:**
-     "@garrick0/c3-shared": "dev",
-     "@garrick0/c3-parsing": "dev",
-     "@garrick0/c3-compliance": "dev"

**c3-wiring:**
-     "@garrick0/c3-shared": "dev",
-     "@garrick0/c3-parsing": "dev",
-     "@garrick0/c3-compliance": "dev",
-     "@garrick0/c3-projection": "dev",
-     "@garrick0/c3-discovery": "dev"


### Applications

**c3-cli:**
-     "@garrick0/c3-shared": "dev",
-     "@garrick0/c3-wiring": "dev",
-     "@garrick0/c3-parsing": "dev",
-     "@garrick0/c3-compliance": "dev",
-     "@garrick0/c3-projection": "dev",
-     "@garrick0/c3-discovery": "dev",

**c3-bff:**
-     "@garrick0/c3-compliance": "dev",
-     "@garrick0/c3-discovery": "dev",
-     "@garrick0/c3-parsing": "dev",
-     "@garrick0/c3-projection": "dev",
-     "@garrick0/c3-shared": "dev",
-     "@garrick0/c3-wiring": "dev",

**c3-web:**


## Backup Files

All repositories have been backed up as git bundles. To restore a repository:

```bash
git clone <repo-name>-backup.bundle <repo-name>
```

## Next Steps

Phase 1: Initialize Nx Workspace

