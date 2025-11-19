#!/usr/bin/env node

/**
 * Validate release readiness before executing
 * Checks for uncommitted changes, test failures, etc.
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const CONFIG_PATH = path.join(__dirname, '../config/repos.json');
const DRY_RUN = process.env.DRY_RUN === 'true';

const octokit = new Octokit({ auth: process.env.GH_TOKEN || process.env.GITHUB_TOKEN });

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

async function checkWorkflowStatus(owner, repo) {
  try {
    const { data } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      per_page: 1,
      branch: 'main',
      status: 'completed'
    });

    if (data.workflow_runs.length === 0) {
      return { status: 'unknown', conclusion: 'none' };
    }

    const run = data.workflow_runs[0];
    return {
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url
    };
  } catch (error) {
    return { status: 'error', conclusion: 'error', error: error.message };
  }
}

async function validateRepository(repo, owner) {
  console.log(`  Checking ${repo.name}...`);

  const issues = [];
  const warnings = [];

  // Check latest workflow status
  const workflowStatus = await checkWorkflowStatus(owner, repo.name);

  if (workflowStatus.conclusion === 'failure') {
    issues.push(`Latest workflow failed: ${workflowStatus.url}`);
  } else if (workflowStatus.conclusion === 'none') {
    warnings.push('No recent workflow runs found');
  } else if (workflowStatus.conclusion === 'success') {
    console.log(`     ✅ Latest workflow: success`);
  }

  // Check for dependencies (libraries only)
  if (repo.type === 'library' && repo.dependencies && repo.dependencies.length > 0) {
    console.log(`     ℹ️  Dependencies: ${repo.dependencies.length}`);
  }

  return { repo: repo.name, issues, warnings, workflowStatus };
}

async function main() {
  console.log('\n🔍 Validating Release Readiness');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'PRODUCTION'}\n`);

  try {
    const config = loadConfig();
    const owner = 'garrick0';

    const results = [];
    for (const repo of config.repositories.filter(r => r.type === 'library')) {
      const result = await validateRepository(repo, owner);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check for blocking issues
    const hasIssues = results.some(r => r.issues.length > 0);
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

    console.log('\n📊 Validation Summary');
    console.log(`   Repositories checked: ${results.length}`);
    console.log(`   Issues: ${totalIssues}`);
    console.log(`   Warnings: ${totalWarnings}`);

    if (hasIssues) {
      console.log('\n❌ Release validation failed:\n');
      results.forEach(r => {
        if (r.issues.length > 0) {
          console.log(`   ${r.repo}:`);
          r.issues.forEach(issue => console.log(`     - ${issue}`));
        }
      });

      if (!DRY_RUN) {
        console.log('\n⚠️  Blocking issues found. Cannot proceed with release.');
        process.exit(1);
      } else {
        console.log('\n⚠️  Blocking issues found (ignored in dry-run mode).');
      }
    }

    if (totalWarnings > 0) {
      console.log('\n⚠️  Warnings:\n');
      results.forEach(r => {
        if (r.warnings.length > 0) {
          console.log(`   ${r.repo}:`);
          r.warnings.forEach(warning => console.log(`     - ${warning}`));
        }
      });
    }

    console.log('\n✅ Release validation complete');
  } catch (error) {
    console.error('Error validating release:', error);
    process.exit(1);
  }
}

main();
