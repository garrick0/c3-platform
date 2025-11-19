#!/usr/bin/env node

/**
 * Update dependency graph when a package is published
 * Tracks version changes and dependency relationships
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/repos.json');
const GRAPH_PATH = path.join(__dirname, '../config/dependency-graph.json');

const REPO = process.env.REPO;
const VERSION = process.env.VERSION;

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function loadGraph() {
  if (fs.existsSync(GRAPH_PATH)) {
    return JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf8'));
  }

  // Initialize empty graph
  return {
    lastUpdated: new Date().toISOString(),
    versions: {},
    updates: []
  };
}

function saveGraph(graph) {
  fs.writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2));
}

function extractRepoName(fullRepo) {
  // Handle "owner/repo" format
  if (fullRepo.includes('/')) {
    return fullRepo.split('/')[1];
  }
  return fullRepo;
}

function updateGraph(repoFullName, version) {
  const config = loadConfig();
  const graph = loadGraph();
  const repoName = extractRepoName(repoFullName);

  // Find repo in config
  const repoConfig = config.repositories.find(r => r.name === repoName);
  if (!repoConfig) {
    console.error(`Repository ${repoName} not found in config`);
    return null;
  }

  // Update version
  graph.versions[repoName] = {
    version,
    updated: new Date().toISOString(),
    layer: repoConfig.layer,
    type: repoConfig.type
  };

  // Log update
  graph.updates.push({
    timestamp: new Date().toISOString(),
    repo: repoName,
    version,
    layer: repoConfig.layer
  });

  // Keep only last 100 updates
  if (graph.updates.length > 100) {
    graph.updates = graph.updates.slice(-100);
  }

  graph.lastUpdated = new Date().toISOString();

  return { graph, repoConfig };
}

function findDownstreamRepos(repoName, config) {
  // Find repos that depend on this one
  return config.repositories.filter(r =>
    r.dependencies && r.dependencies.includes(repoName)
  );
}

function main() {
  if (!REPO || !VERSION) {
    console.error('Error: REPO and VERSION environment variables required');
    process.exit(1);
  }

  try {
    const repoName = extractRepoName(REPO);
    console.log(`Updating dependency graph for ${repoName} → ${VERSION}`);

    const result = updateGraph(REPO, VERSION);
    if (!result) {
      process.exit(1);
    }

    const { graph, repoConfig } = result;

    // Save updated graph
    saveGraph(graph);

    console.log(`\n✅ Dependency graph updated`);
    console.log(`   Repository: ${repoName}`);
    console.log(`   Version: ${VERSION}`);
    console.log(`   Layer: ${repoConfig.layer}`);
    console.log(`   Type: ${repoConfig.type}`);

    // Find downstream dependencies
    const config = loadConfig();
    const downstream = findDownstreamRepos(repoName, config);

    if (downstream.length > 0) {
      console.log(`\n📦 Downstream repositories (${downstream.length}):`);
      downstream.forEach(repo => {
        console.log(`   - ${repo.name} (Layer ${repo.layer})`);
      });

      // Export for next step
      fs.writeFileSync(
        path.join(__dirname, '../logs/events/downstream.json'),
        JSON.stringify(downstream.map(r => r.name), null, 2)
      );
    } else {
      console.log('\n📦 No downstream repositories');
    }
  } catch (error) {
    console.error('Error updating dependency graph:', error);
    process.exit(1);
  }
}

main();
