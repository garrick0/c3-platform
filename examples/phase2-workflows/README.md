# Phase 2: Repository Dispatch Setup

This directory contains example workflow modifications for Phase 2 implementation.

## Overview

Phase 2 adds event-driven communication between repositories using GitHub's `repository_dispatch` feature. When a package is published or a build completes, it notifies the c3-platform orchestrator.

## Prerequisites

### 1. Create Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `C3_PLATFORM_ORCHESTRATION`
4. Expiration: 90 days (or custom)
5. Select scopes:
   - [x] `repo` (Full control of private repositories)
   - [x] `workflow` (Update GitHub Action workflows)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### 2. Add PAT_TOKEN to Repository Secrets

Add the PAT token to **each of the 9 repositories**:

```bash
# For each repo: c3-shared, c3-parsing, c3-compliance, c3-projection,
# c3-discovery, c3-wiring, c3-cli, c3-bff, c3-web

# Method 1: Using GitHub CLI
gh secret set PAT_TOKEN --repo garrick0/c3-shared
# Paste token when prompted

# Method 2: Via GitHub UI
# 1. Go to repo → Settings → Secrets and variables → Actions
# 2. Click "New repository secret"
# 3. Name: PAT_TOKEN
# 4. Value: [paste your PAT]
# 5. Click "Add secret"
```

## Implementation Steps

### Step 1: Update Library Workflows (6 repos)

For each library repository:
- c3-shared
- c3-parsing
- c3-compliance
- c3-projection
- c3-discovery
- c3-wiring

Add the notification step from `library-publish-with-dispatch.yml` to their `publish.yml` workflow.

**Key Points:**
- Add notification step after successful publish
- Uses `peter-evans/repository-dispatch@v2` action
- Sends `dependency_updated` event
- Includes: repo, version, SHA, run ID

### Step 2: Update Application Workflows (3 repos)

For each application repository:
- c3-bff
- c3-web
- c3-cli

Add the notification steps from `application-ci-with-dispatch.yml` to their `ci.yml` workflow.

**Key Points:**
- Add success notification (build completed)
- Add failure notification (build failed)
- Only notify on push to main (not PRs)

### Step 3: Verify c3-platform Receives Events

The c3-platform repository already has (from Phase 2 implementation):
- `.github/workflows/handle-events.yml` - Event handler
- `scripts/process-event.js` - Event processor
- `scripts/update-dependency-graph.js` - Dependency tracker
- `scripts/trigger-downstream.js` - Downstream trigger (dry-run)

## Testing Phase 2

### Test Event Dispatch

```bash
# Test sending an event manually
curl -X POST \
  -H "Authorization: token YOUR_PAT_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/garrick0/c3-platform/dispatches \
  -d '{
    "event_type": "dependency_updated",
    "client_payload": {
      "repo": "garrick0/c3-shared",
      "version": "1.0.0-test",
      "sha": "abc123",
      "workflow_run_id": "12345"
    }
  }'
```

### Verify Event Handling

1. Check workflow runs:
   ```bash
   gh run list --workflow=handle-events.yml
   ```

2. View event logs:
   ```bash
   cat logs/events/latest.json
   cat logs/events/events-$(date +%Y-%m-%d).log
   ```

3. Check dependency graph:
   ```bash
   cat config/dependency-graph.json
   ```

## Event Flow

```
┌─────────────┐
│  c3-shared  │  Publishes v1.0.0
└──────┬──────┘
       │ repository_dispatch
       │ event: dependency_updated
       ▼
┌──────────────────┐
│  c3-platform     │  Receives event
│  handle-events   │
└──────┬───────────┘
       │
       ├─► process-event.js (logs event)
       ├─► update-dependency-graph.js (tracks version)
       └─► trigger-downstream.js (identifies c3-parsing)
```

## Dry-Run Mode

Phase 2 implements downstream triggering in **dry-run mode**:
- Logs what would be triggered
- Doesn't actually send triggers
- Safe to test without affecting repos

To enable actual triggering:
1. Update `trigger-downstream.js`
2. Uncomment the Octokit code
3. Set `ENABLE_TRIGGERS=true` in workflow

## Security Best Practices

### PAT Token Management

✅ **DO:**
- Use a dedicated bot account if possible
- Set token expiration (90 days recommended)
- Rotate tokens regularly
- Audit token usage monthly

❌ **DON'T:**
- Commit tokens to git
- Share tokens between projects
- Use personal tokens for production
- Set "no expiration"

### Alternative: GitHub App

For production, consider using a GitHub App instead of PAT:
- Better security model
- Fine-grained permissions
- Automatic token rotation
- Audit logging

## Troubleshooting

### "Bad credentials" error
- Verify PAT_TOKEN is set in repo secrets
- Check token hasn't expired
- Ensure token has `repo` and `workflow` scopes

### Events not received
- Check c3-platform workflow runs
- Verify repository name in dispatch call
- Ensure PAT_TOKEN belongs to account with repo access

### Workflow not triggering
- Check `repository_dispatch` types match
- Verify event handler workflow is on main branch
- Look for syntax errors in handle-events.yml

## Files in This Directory

- `library-publish-with-dispatch.yml` - Example for library repos
- `application-ci-with-dispatch.yml` - Example for app repos
- `README.md` - This file

## Next Steps

After implementing Phase 2:
1. Monitor event logs for first week
2. Verify dependency graph updates correctly
3. Test downstream identification
4. Plan Phase 3: Orchestrated releases

## Resources

- [GitHub repository_dispatch docs](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch)
- [peter-evans/repository-dispatch action](https://github.com/peter-evans/repository-dispatch)
- [Creating a PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
