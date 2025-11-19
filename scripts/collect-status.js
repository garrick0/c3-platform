#!/usr/bin/env node

/**
 * Collect CI/CD status for all C3 repositories
 * Uses GitHub API to fetch latest workflow runs
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const CONFIG_PATH = path.join(__dirname, '../config/repos.json');
const OUTPUT_PATH = path.join(__dirname, '../metrics/latest.json');

// Load configuration
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getWorkflowStatus(owner, repo, workflowFile) {
  try {
    // Get latest workflow runs
    const { data } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowFile,
      per_page: 1,
      status: 'completed'
    });

    if (data.workflow_runs.length === 0) {
      return {
        status: 'unknown',
        conclusion: 'none',
        lastRun: null,
        duration: 0,
        url: null
      };
    }

    const run = data.workflow_runs[0];
    const duration = new Date(run.updated_at) - new Date(run.created_at);

    return {
      status: run.status,
      conclusion: run.conclusion,
      lastRun: run.updated_at,
      duration: Math.round(duration / 1000), // seconds
      url: run.html_url,
      runId: run.id
    };
  } catch (error) {
    console.error(`Error fetching workflow status for ${repo}:`, error.message);
    return {
      status: 'error',
      conclusion: 'error',
      lastRun: null,
      duration: 0,
      url: null,
      error: error.message
    };
  }
}

async function collectAllStatus() {
  const owner = config.github.org;
  const results = {
    timestamp: new Date().toISOString(),
    repositories: []
  };

  console.log(`Collecting status for ${config.repositories.length} repositories...`);

  for (const repo of config.repositories) {
    console.log(`  Checking ${repo.name}...`);

    const workflowStatus = await getWorkflowStatus(owner, repo.name, repo.workflow);

    results.repositories.push({
      name: repo.name,
      type: repo.type,
      layer: repo.layer,
      workflow: repo.workflow,
      ...workflowStatus
    });

    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Calculate summary statistics
  const passing = results.repositories.filter(r => r.conclusion === 'success').length;
  const failing = results.repositories.filter(r => r.conclusion === 'failure').length;
  const unknown = results.repositories.filter(r => r.conclusion === 'none' || r.status === 'unknown').length;
  const errors = results.repositories.filter(r => r.status === 'error').length;

  results.summary = {
    total: results.repositories.length,
    passing,
    failing,
    unknown,
    errors,
    passRate: ((passing / results.repositories.length) * 100).toFixed(1),
    avgDuration: Math.round(
      results.repositories.reduce((sum, r) => sum + r.duration, 0) / results.repositories.length
    )
  };

  return results;
}

async function main() {
  try {
    // Ensure output directory exists
    const metricsDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    // Collect status
    const results = await collectAllStatus();

    // Write results
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

    console.log('\nStatus Collection Summary:');
    console.log(`  Total Repositories: ${results.summary.total}`);
    console.log(`  Passing: ${results.summary.passing} (${results.summary.passRate}%)`);
    console.log(`  Failing: ${results.summary.failing}`);
    console.log(`  Unknown: ${results.summary.unknown}`);
    console.log(`  Errors: ${results.summary.errors}`);
    console.log(`  Avg Duration: ${results.summary.avgDuration}s`);
    console.log(`\nResults written to: ${OUTPUT_PATH}`);

    // Exit with error if any repos are failing
    if (results.summary.failing > 0 || results.summary.errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
