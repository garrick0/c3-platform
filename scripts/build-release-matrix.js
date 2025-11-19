#!/usr/bin/env node

/**
 * Build release matrix for orchestrated releases
 * Determines which repos to release and in what order
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/repos.json');
const RELEASE_DIR = path.join(__dirname, '../releases/upcoming');

const RELEASE_TYPE = process.env.RELEASE_TYPE;
const REPOS = process.env.REPOS;
const DRY_RUN = process.env.DRY_RUN === 'true';

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function selectRepositories(reposInput, config) {
  if (reposInput === 'all') {
    return config.repositories.filter(r => r.type === 'library');
  }

  if (reposInput === 'libraries') {
    return config.repositories.filter(r => r.type === 'library');
  }

  if (reposInput === 'applications') {
    return config.repositories.filter(r => r.type === 'application');
  }

  // Comma-separated list
  const selectedNames = reposInput.split(',').map(s => s.trim());
  return config.repositories.filter(r => selectedNames.includes(r.name));
}

function buildMatrix(repos, config) {
  // Sort by layer to ensure proper dependency order
  const sorted = [...repos].sort((a, b) => a.layer - b.layer);

  // Build matrix for GitHub Actions
  return {
    include: sorted.map(repo => ({
      repo: repo.name,
      layer: repo.layer,
      type: repo.type,
      workflow: repo.workflow
    }))
  };
}

function generateReleaseId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `release-${timestamp}`;
}

function createReleasePlan(repos, releaseType, releaseId) {
  const plan = {
    releaseId,
    timestamp: new Date().toISOString(),
    releaseType,
    dryRun: DRY_RUN,
    repositories: repos.map(r => ({
      name: r.name,
      layer: r.layer,
      type: r.type,
      dependencies: r.dependencies || []
    })),
    releaseOrder: repos.map(r => r.name)
  };

  // Ensure release directory exists
  const releaseDir = path.join(RELEASE_DIR, releaseId);
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }

  // Save plan
  fs.writeFileSync(
    path.join(releaseDir, 'plan.json'),
    JSON.stringify(plan, null, 2)
  );

  // Create summary
  const summary = [
    `# Release Plan: ${releaseId}`,
    '',
    `**Type:** ${releaseType}`,
    `**Mode:** ${DRY_RUN ? 'DRY RUN' : 'PRODUCTION'}`,
    `**Repositories:** ${repos.length}`,
    '',
    '## Release Order',
    '',
    ...repos.map((r, i) => `${i + 1}. **${r.name}** (Layer ${r.layer}, ${r.type})`)
  ].join('\n');

  fs.writeFileSync(
    path.join(releaseDir, 'summary.md'),
    summary
  );

  return plan;
}

function main() {
  if (!RELEASE_TYPE || !REPOS) {
    console.error('Error: RELEASE_TYPE and REPOS environment variables required');
    process.exit(1);
  }

  try {
    const config = loadConfig();
    const selectedRepos = selectRepositories(REPOS, config);

    if (selectedRepos.length === 0) {
      console.error('Error: No repositories selected');
      process.exit(1);
    }

    const matrix = buildMatrix(selectedRepos, config);
    const releaseId = generateReleaseId();

    console.log(`\n📋 Release Plan`);
    console.log(`   Release ID: ${releaseId}`);
    console.log(`   Type: ${RELEASE_TYPE}`);
    console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'PRODUCTION'}`);
    console.log(`   Repositories: ${selectedRepos.length}\n`);

    selectedRepos.forEach((repo, i) => {
      console.log(`   ${i + 1}. ${repo.name} (Layer ${repo.layer})`);
    });

    const plan = createReleasePlan(selectedRepos, RELEASE_TYPE, releaseId);

    // Output for GitHub Actions
    const output = `matrix=${JSON.stringify(matrix)}`;
    const releaseOutput = `release_id=${releaseId}`;

    // Write to GITHUB_OUTPUT if available
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');
      fs.appendFileSync(process.env.GITHUB_OUTPUT, releaseOutput + '\n');
    }

    console.log(`\n✅ Release matrix generated`);
    console.log(`   Matrix: ${matrix.include.length} repositories`);
    console.log(`   Plan saved: releases/upcoming/${releaseId}/plan.json`);
  } catch (error) {
    console.error('Error building release matrix:', error);
    process.exit(1);
  }
}

main();
