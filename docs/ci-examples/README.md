# CI/CD Example Workflows

This directory contains example GitHub Actions workflows for implementing the **Hybrid Approach with Artifact Registry** (Option 4) from the CI/CD Orchestration Analysis.

## Files

### 1. `publish-package.yml`
**Purpose:** Publish core library packages to GitHub Packages  
**Use in:** c3-shared, c3-parsing, c3-compliance, c3-projection, c3-discovery, c3-wiring

**Features:**
- Automatic dev version publishing on push to main
- Manual release publishing (patch, minor, major, canary)
- Triggers downstream builds after publishing
- Creates GitHub releases for stable versions

**Usage:**
```bash
# Copy to your repo
cp publish-package.yml ../c3-shared/.github/workflows/publish.yml

# Customize:
# 1. Replace @yourorg with your GitHub org
# 2. Update PAT_TOKEN secret name if different
```

### 2. `simplified-app-ci.yml`
**Purpose:** Simple CI for applications that consume published packages  
**Use in:** c3-bff, c3-cli, c3-web

**Features:**
- Installs packages from GitHub Packages registry
- Fast builds (30-60 seconds)
- Matrix testing across Node versions
- Responds to upstream dependency updates

**Usage:**
```bash
# Copy to your repo
cp simplified-app-ci.yml ../c3-bff/.github/workflows/ci.yml

# Customize:
# 1. Replace @yourorg with your GitHub org
# 2. Add deployment steps if needed
```

### 3. `orchestrate-release.yml`
**Purpose:** Coordinate builds across multiple repositories  
**Use in:** c3-platform (central coordination repo)

**Features:**
- Automatic dependency graph traversal
- Triggers downstream builds in correct order
- Waits for builds to complete
- Creates release summaries

**Usage:**
```bash
# Copy to platform repo
cp orchestrate-release.yml ../c3-platform/.github/workflows/orchestrate-release.yml

# Prerequisites:
# 1. Create PAT_TOKEN secret with repo and workflow permissions
# 2. Update dependency graph in the workflow
```

### 4. `version-bump.yml`
**Purpose:** Automate version bumping and dependency updates  
**Use in:** All repositories

**Features:**
- Semantic version bumping
- Automatic changelog generation
- Creates PRs to update dependents
- Supports prerelease versions

**Usage:**
```bash
# Copy to your repo
cp version-bump.yml ../c3-shared/.github/workflows/version-bump.yml

# Customize:
# 1. Update list of dependent repos
# 2. Configure changelog format
```

## Setup Instructions

### Step 1: Enable GitHub Packages

In each repository:

1. Create `.npmrc`:
```bash
@yourorg:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

2. Update `package.json`:
```json
{
  "name": "@yourorg/c3-shared",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### Step 2: Create Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create token with scopes:
   - `repo` (full control)
   - `write:packages`
   - `read:packages`
   - `workflow`
3. Add as secret `PAT_TOKEN` to c3-platform repository

### Step 3: Deploy Workflows

Deploy in this order:

1. **Core libraries first:**
```bash
# c3-shared
cp publish-package.yml ../c3-shared/.github/workflows/publish.yml

# c3-parsing
cp publish-package.yml ../c3-parsing/.github/workflows/publish.yml

# c3-compliance, c3-projection, c3-discovery
# (repeat for each)
```

2. **Integration layer:**
```bash
# c3-wiring
cp publish-package.yml ../c3-wiring/.github/workflows/publish.yml
```

3. **Orchestrator:**
```bash
# c3-platform
cp orchestrate-release.yml ../c3-platform/.github/workflows/orchestrate-release.yml
```

4. **Applications:**
```bash
# c3-bff
cp simplified-app-ci.yml ../c3-bff/.github/workflows/ci.yml

# c3-cli, c3-web
# (repeat for each)
```

### Step 4: Test the Pipeline

1. **Trigger a dev publish:**
```bash
cd c3-shared
git commit --allow-empty -m "test: trigger CI"
git push
```

2. **Check GitHub Packages:**
   - Go to repository → Packages
   - Verify package was published

3. **Test downstream:**
   - Check if orchestrator triggered downstream builds
   - Verify c3-bff can install the new version

### Step 5: Monitor and Iterate

Track metrics:
- Build times per repository
- Success rates
- Time from commit to deployed

Adjust:
- Caching strategies
- Parallel build limits
- Timeout values

## Troubleshooting

### Package not found

**Problem:** `npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@yourorg/c3-shared`

**Solution:**
1. Check `.npmrc` is configured correctly
2. Verify `NODE_AUTH_TOKEN` is set
3. Ensure package was published successfully
4. Check package visibility (private vs public)

### Permission denied

**Problem:** `npm ERR! 403 Forbidden - PUT https://npm.pkg.github.com/@yourorg/c3-shared`

**Solution:**
1. Verify GitHub token has `write:packages` scope
2. Check repository settings → Actions → General → Workflow permissions
3. Ensure "Read and write permissions" is enabled

### Downstream not triggered

**Problem:** Orchestrator doesn't trigger downstream builds

**Solution:**
1. Verify PAT_TOKEN secret exists in c3-platform
2. Check token has `workflow` scope
3. Verify repository dispatch event type matches
4. Check workflow logs for API errors

### Version conflicts

**Problem:** Different versions installed in different repos

**Solution:**
1. Use exact versions in development: `"c3-shared": "1.2.3-dev.abc123"`
2. Use ranges in production: `"c3-shared": "^1.2.3"`
3. Run `npm update` to sync versions
4. Consider using `npm-check-updates` tool

## Advanced Configuration

### Custom Registry

To use npm registry instead of GitHub Packages:

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  }
}
```

### Private Packages

For private packages, ensure:

1. Repository is private
2. Package visibility is private
3. Users have proper permissions

### Canary Releases

For testing before stable release:

```bash
# Trigger canary release
gh workflow run publish.yml -f release_type=canary

# Install canary version
npm install @yourorg/c3-shared@canary
```

### Monorepo Fallback

If you need to revert to monorepo-style builds:

```yaml
- name: Fallback to local build
  run: |
    if ! npm ci; then
      # Clone and build dependencies locally
      git clone https://github.com/yourorg/c3-shared.git ../c3-shared
      cd ../c3-shared && npm ci && npm run build && npm link
      cd $GITHUB_WORKSPACE && npm link @yourorg/c3-shared
    fi
```

## Best Practices

1. **Version Strategy:**
   - Use dev versions for continuous deployment: `1.2.3-dev.abc123`
   - Use canary for pre-release testing: `1.2.3-canary.1`
   - Use stable for production: `1.2.3`

2. **Dependency Ranges:**
   - Libraries: Use `^1.2.3` (minor updates OK)
   - Applications: Use `~1.2.3` (patch updates only)
   - Strict: Use `1.2.3` (exact version)

3. **Changelog:**
   - Keep CHANGELOG.md updated
   - Use conventional commits
   - Automate changelog generation

4. **Testing:**
   - Test with both dev and stable versions
   - Use matrix testing for Node versions
   - Include integration tests

5. **Monitoring:**
   - Track build times
   - Monitor package download stats
   - Alert on build failures

## Migration Checklist

Use this checklist when migrating from current CI to hybrid approach:

- [ ] Create PAT_TOKEN in GitHub
- [ ] Add token to repository secrets
- [ ] Configure `.npmrc` in all repos
- [ ] Update package.json with publishConfig
- [ ] Deploy publish workflows to core libs
- [ ] Test publishing c3-shared
- [ ] Deploy orchestrator to c3-platform
- [ ] Simplify c3-bff CI
- [ ] Simplify c3-cli CI
- [ ] Simplify c3-web CI
- [ ] Test full pipeline end-to-end
- [ ] Monitor build times
- [ ] Document for team
- [ ] Update README files

## Support

For issues or questions:

1. Check workflow logs in Actions tab
2. Verify secrets are configured
3. Test locally with `npm publish --dry-run`
4. Review GitHub Packages documentation

---

**Last Updated:** 2024-11-16  
**Version:** 1.0

