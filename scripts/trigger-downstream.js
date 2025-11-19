#!/usr/bin/env node

/**
 * Trigger downstream repository builds when a dependency is updated
 * (Dry-run mode for now - logs what would be triggered)
 */

const fs = require('fs');
const path = require('path');

const DOWNSTREAM_FILE = path.join(__dirname, '../logs/events/downstream.json');
const REPO = process.env.REPO;

function extractRepoName(fullRepo) {
  if (fullRepo.includes('/')) {
    return fullRepo.split('/')[1];
  }
  return fullRepo;
}

function loadDownstream() {
  if (fs.existsSync(DOWNSTREAM_FILE)) {
    return JSON.parse(fs.readFileSync(DOWNSTREAM_FILE, 'utf8'));
  }
  return [];
}

async function triggerDownstreamBuilds(repoName, downstream) {
  if (downstream.length === 0) {
    console.log('No downstream repositories to trigger');
    return;
  }

  console.log(`\n🔄 Downstream Build Triggers (DRY-RUN)`);
  console.log(`   Source: ${repoName}\n`);

  for (const downstreamRepo of downstream) {
    console.log(`   Would trigger: ${downstreamRepo}`);
    console.log(`   └─ Event: dependency_update_detected`);
    console.log(`   └─ Payload: { updatedDependency: "${repoName}" }\n`);
  }

  console.log(`ℹ️  Dry-run mode: No actual triggers sent`);
  console.log(`   To enable: Set ENABLE_TRIGGERS=true`);
  console.log(`   Requires: PAT_TOKEN with workflow permissions\n`);

  // TODO: In production, use @octokit/rest to send repository_dispatch
  /*
  const { Octokit } = require('@octokit/rest');
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  for (const downstreamRepo of downstream) {
    await octokit.repos.createDispatchEvent({
      owner: 'yourorg',
      repo: downstreamRepo,
      event_type: 'dependency_update_detected',
      client_payload: {
        updatedDependency: repoName,
        timestamp: new Date().toISOString()
      }
    });
    console.log(`✅ Triggered: ${downstreamRepo}`);
  }
  */
}

async function main() {
  if (!REPO) {
    console.error('Error: REPO environment variable required');
    process.exit(1);
  }

  try {
    const repoName = extractRepoName(REPO);
    const downstream = loadDownstream();

    await triggerDownstreamBuilds(repoName, downstream);

    console.log('✅ Downstream trigger processing complete');
  } catch (error) {
    console.error('Error triggering downstream builds:', error);
    process.exit(1);
  }
}

main();
