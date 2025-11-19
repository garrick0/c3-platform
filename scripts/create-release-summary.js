#!/usr/bin/env node

/**
 * Create release summary after orchestrated release completes
 * Summarizes what was released, versions, and status
 */

const fs = require('fs');
const path = require('path');

const RELEASE_DIR = path.join(__dirname, '../releases');
const RELEASE_ID = process.env.RELEASE_ID;
const DRY_RUN = process.env.DRY_RUN === 'true';

function loadReleasePlan(releaseId) {
  const planPath = path.join(RELEASE_DIR, 'upcoming', releaseId, 'plan.json');
  if (!fs.existsSync(planPath)) {
    throw new Error(`Release plan not found: ${planPath}`);
  }
  return JSON.parse(fs.readFileSync(planPath, 'utf8'));
}

function loadChangelog(releaseId) {
  const changelogPath = path.join(RELEASE_DIR, 'upcoming', releaseId, 'CHANGELOG.md');
  if (fs.existsSync(changelogPath)) {
    return fs.readFileSync(changelogPath, 'utf8');
  }
  return null;
}

function createSummary(plan, changelog) {
  const lines = [];

  lines.push(`# Release Summary: ${plan.releaseId}`);
  lines.push('');
  lines.push(`**Date:** ${new Date().toISOString().split('T')[0]}`);
  lines.push(`**Type:** ${plan.releaseType}`);
  lines.push(`**Mode:** ${plan.dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  lines.push(`**Status:** ${DRY_RUN ? 'Simulated' : 'Completed'}`);
  lines.push('');

  lines.push('## Released Repositories');
  lines.push('');

  plan.repositories.forEach((repo, i) => {
    const status = DRY_RUN ? '🔍' : '✅';
    lines.push(`${i + 1}. ${status} **${repo.name}** (Layer ${repo.layer})`);
    if (repo.dependencies && repo.dependencies.length > 0) {
      lines.push(`   - Dependencies: ${repo.dependencies.join(', ')}`);
    }
  });

  lines.push('');
  lines.push('## Release Order');
  lines.push('');
  lines.push('Repositories were released in dependency order:');
  lines.push('');
  lines.push('```');
  plan.releaseOrder.forEach((repo, i) => {
    lines.push(`${i + 1}. ${repo}`);
  });
  lines.push('```');
  lines.push('');

  if (changelog) {
    lines.push('## Changes');
    lines.push('');
    lines.push('See CHANGELOG.md for detailed changes.');
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  if (DRY_RUN) {
    lines.push('**Note:** This was a dry run. No actual releases were created.');
  } else {
    lines.push('**Status:** Release completed successfully!');
  }

  return lines.join('\n');
}

function main() {
  if (!RELEASE_ID) {
    console.error('Error: RELEASE_ID required');
    process.exit(1);
  }

  try {
    console.log('\n📝 Creating Release Summary');
    console.log(`   Release ID: ${RELEASE_ID}`);
    console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'PRODUCTION'}\n`);

    const plan = loadReleasePlan(RELEASE_ID);
    const changelog = loadChangelog(RELEASE_ID);

    const summary = createSummary(plan, changelog);

    // Save summary
    const summaryPath = path.join(
      RELEASE_DIR,
      'upcoming',
      RELEASE_ID,
      'SUMMARY.md'
    );
    fs.writeFileSync(summaryPath, summary);

    console.log(`✅ Release summary created`);
    console.log(`   Repositories: ${plan.repositories.length}`);
    console.log(`   Saved to: ${summaryPath}`);
    console.log(`\n${summary}`);
  } catch (error) {
    console.error('Error creating release summary:', error);
    process.exit(1);
  }
}

main();
