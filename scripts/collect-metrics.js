#!/usr/bin/env node

/**
 * Collect detailed CI/CD metrics over time
 * Tracks trends, success rates, build times, etc.
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const CONFIG_PATH = path.join(__dirname, '../config/repos.json');
const METRICS_PATH = path.join(__dirname, '../metrics/latest.json');
const HISTORY_DIR = path.join(__dirname, '../metrics/history');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getDetailedMetrics(owner, repo, workflowFile) {
  try {
    // Get recent workflow runs (last 30)
    const { data } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowFile,
      per_page: 30
    });

    if (data.workflow_runs.length === 0) {
      return null;
    }

    const runs = data.workflow_runs;

    // Calculate metrics
    const successful = runs.filter(r => r.conclusion === 'success').length;
    const failed = runs.filter(r => r.conclusion === 'failure').length;
    const durations = runs.map(r => {
      const duration = new Date(r.updated_at) - new Date(r.created_at);
      return Math.round(duration / 1000);
    });

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      totalRuns: runs.length,
      successRate: ((successful / runs.length) * 100).toFixed(1),
      failureRate: ((failed / runs.length) * 100).toFixed(1),
      avgDuration: Math.round(avgDuration),
      minDuration,
      maxDuration,
      lastSuccess: runs.find(r => r.conclusion === 'success')?.updated_at || null,
      lastFailure: runs.find(r => r.conclusion === 'failure')?.updated_at || null
    };
  } catch (error) {
    console.error(`Error collecting metrics for ${repo}:`, error.message);
    return null;
  }
}

async function collectMetrics() {
  const owner = config.github.org;
  const results = {
    timestamp: new Date().toISOString(),
    period: '30 days',
    repositories: []
  };

  console.log('Collecting detailed metrics...');

  for (const repo of config.repositories) {
    console.log(`  Analyzing ${repo.name}...`);

    const metrics = await getDetailedMetrics(owner, repo.name, repo.workflow);

    if (metrics) {
      results.repositories.push({
        name: repo.name,
        type: repo.type,
        layer: repo.layer,
        ...metrics
      });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

async function main() {
  try {
    // Ensure directories exist
    if (!fs.existsSync(HISTORY_DIR)) {
      fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }

    // Collect metrics
    const metrics = await collectMetrics();

    // Write to latest.json
    fs.writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2));

    console.log(`\nMetrics collected for ${metrics.repositories.length} repositories`);
    console.log(`Results written to: ${METRICS_PATH}`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
