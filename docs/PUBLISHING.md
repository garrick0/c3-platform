# Publishing Guide

## Prerequisites

### 1. NPM Account

Create an account at https://www.npmjs.com/ if you don't have one.

### 2. NPM Authentication

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- 2FA code (if enabled)

Verify:

```bash
npm whoami
```

### 3. Package Name Availability

Check if package names are available:

```bash
npm view c3-shared
npm view c3-parsing
# ... etc
```

If not available, you'll need to use scoped packages (@garrick0/c3-shared) instead.

## Publishing Process

### Manual Publishing (Single Package)

```bash
cd ~/dev/c3-shared

# 1. Ensure everything is committed
git status

# 2. Update version in package.json
npm version patch  # or minor, or major

# 3. Build
npm run build

# 4. Test
npm test

# 5. Publish
npm publish

# 6. Push tags
git push --tags
```

### Automated Publishing (All Packages)

```bash
cd ~/dev/c3-platform
./scripts/publish-all.sh
```

This will:
1. Prompt for confirmation
2. Verify NPM authentication
3. Build all packages
4. Test all packages
5. Publish in dependency order
6. Skip already-published versions

## Publishing Order

**Critical:** Packages must be published in dependency order:

1. c3-shared (no dependencies)
2. c3-parsing
3. c3-compliance
4. c3-projection
5. c3-discovery
6. c3-wiring
7. c3-cli
8. c3-bff

## Versioning Strategy

### Semantic Versioning

All packages follow semver: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes

### Version Synchronization

**Recommended:** Keep all packages at the same version for simplicity.

**Example:**

```
c3-shared@0.2.0
c3-parsing@0.2.0
c3-compliance@0.2.0
...
```

### Updating Versions

Use a script to update all at once:

```bash
# In each repo
npm version minor
```

Or create a helper script in c3-platform:

```bash
#!/bin/bash
version=$1
for repo in c3-*; do
  cd ../$repo
  npm version $version --no-git-tag-version
  cd ../c3-platform
done
```

## Pre-Publish Checklist

Before publishing any package:

- [ ] All tests pass
- [ ] Code is committed
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md is current
- [ ] Dependencies are correct
- [ ] Build succeeds
- [ ] No sensitive files in package (check .npmignore)

## NPM Package Configuration

### package.json Settings

```json
{
  "name": "c3-shared",
  "version": "0.1.0",
  "description": "Core domain abstractions for C3",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist/",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

### .npmignore

Create in each package:

```
# Source files
src/
*.test.ts
*.spec.ts

# Config files
tsconfig.json
vitest.config.ts

# Development files
.vscode/
.github/
node_modules/
coverage/
*.log
```

## Post-Publish Steps

### 1. Verify Package

```bash
npm view c3-shared
```

### 2. Test Installation

```bash
mkdir ~/test-c3
cd ~/test-c3
npm init -y
npm install c3-shared
```

### 3. Tag Git

```bash
cd ~/dev/c3-shared
git tag v0.1.0
git push origin v0.1.0
```

### 4. Create GitHub Release

```bash
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes "Initial release"
```

### 5. Update Dependent Packages

```bash
cd ~/dev/c3-parsing
npm install c3-shared@latest
```

## CI/CD Publishing

### Setup NPM Token

1. Generate token at https://www.npmjs.com/settings/tokens
2. Create "Automation" token
3. Add to GitHub secrets as `NPM_TOKEN`

```bash
gh secret set NPM_TOKEN
# Paste token when prompted
```

### Auto-Publish on Main

The `lib-ci.yml` workflow will auto-publish when:
- Push to main branch
- All tests pass
- Build succeeds

## Unpublishing (Emergency)

**Warning:** Only use within 72 hours of publish!

```bash
npm unpublish c3-shared@0.1.0
```

After 72 hours, you can only deprecate:

```bash
npm deprecate c3-shared@0.1.0 "Critical bug, use 0.1.1"
```

## Troubleshooting

### "403 Forbidden" Error

You don't have permission. Ensure:
- Logged in: `npm whoami`
- Package name available
- If scoped: have access to scope

### "402 Payment Required"

Package name is reserved. Use scoped package:

```json
{
  "name": "@garrick0/c3-shared"
}
```

### Version Already Published

Cannot re-publish same version. Bump version:

```bash
npm version patch
```

### Build Files Missing

Ensure `dist/` is built before publishing:

```bash
npm run build
```

Check `files` in package.json includes dist/.

## Best Practices

### 1. Never Publish from Feature Branch

Always publish from `main` after PR merge.

### 2. Test Installation

After publishing, test in a fresh project:

```bash
npm install c3-shared@latest
```

### 3. Coordinate Updates

When updating shared, update all dependent packages.

### 4. Use Tags

Always tag releases:

```bash
git tag v0.1.0
git push --tags
```

### 5. Automate

Use `publish-all.sh` for consistency.

## Beta Releases

For pre-releases:

```bash
npm version prerelease
# 0.1.0 → 0.1.1-0

npm publish --tag beta

# Users install with:
npm install c3-shared@beta
```

## Scoped Packages

If unscoped names unavailable, use scoped:

```json
{
  "name": "@garrick0/c3-shared"
}
```

Then update all imports:

```typescript
import { Result } from '@garrick0/c3-shared';
```

## Next Steps

- See DEVELOPMENT.md for development workflow
- See TROUBLESHOOTING.md for common issues
