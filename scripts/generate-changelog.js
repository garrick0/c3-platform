#!/usr/bin/env node

/**
 * Generate unified changelog for orchestrated releases
 * Aggregates commits from all released repositories
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const RELEASE_DIR = path.join(__dirname, '../releases');
const RELEASE_ID = process.env.RELEASE_ID;
const RELEASE_TYPE = process.env.RELEASE_TYPE;

const octokit = new Octokit({ auth: process.env.GH_TOKEN || process.env.GITHUB_TOKEN });

async function getCommitsSince(owner, repo, since) {
  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      since,
      per_page: 100
    });

    return data.map(commit => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0],
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));
  } catch (error) {
    console.error(`Error fetching commits for ${repo}:`, error.message);
    return [];
  }
}

async function getLatestRelease(owner, repo) {
  try {
    const { data } = await octokit.repos.getLatestRelease({
      owner,
      repo
    });
    return {
      tag: data.tag_name,
      date: data.published_at
    };
  } catch (error) {
    // No previous release
    return null;
  }
}

function categorizeCommits(commits) {
  const categories = {
    breaking: [],
    features: [],
    fixes: [],
    docs: [],
    chore: [],
    other: []
  };

  commits.forEach(commit => {
    const msg = commit.message.toLowerCase();

    if (msg.includes('breaking') || msg.includes('!:')) {
      categories.breaking.push(commit);
    } else if (msg.startsWith('feat:') || msg.startsWith('feature:')) {
      categories.features.push(commit);
    } else if (msg.startsWith('fix:')) {
      categories.fixes.push(commit);
    } else if (msg.startsWith('docs:')) {
      categories.docs.push(commit);
    } else if (msg.startsWith('chore:')) {
      categories.chore.push(commit);
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

async function generateChangelogForRepo(repoName, owner) {
  console.log(`  Generating changelog for ${repoName}...`);

  // Get latest release
  const latestRelease = await getLatestRelease(owner, repoName);

  // Get commits since last release (or all if no release)
  const since = latestRelease ? latestRelease.date : '2000-01-01';
  const commits = await getCommitsSince(owner, repoName, since);

  if (commits.length === 0) {
    return null;
  }

  const categorized = categorizeCommits(commits);

  return {
    repo: repoName,
    previousVersion: latestRelease?.tag || 'Initial Release',
    commits,
    categorized,
    totalCommits: commits.length
  };
}

function formatChangelog(repoChangelogs, releaseType, releaseId) {
  const lines = [];

  lines.push(`# Release ${releaseId}`);
  lines.push('');
  lines.push(`**Type:** ${releaseType}`);
  lines.push(`**Date:** ${new Date().toISOString().split('T')[0]}`);
  lines.push(`**Repositories:** ${repoChangelogs.length}`);
  lines.push('');

  // Overall statistics
  const totalCommits = repoChangelogs.reduce((sum, r) => sum + r.totalCommits, 0);
  lines.push(`**Total Changes:** ${totalCommits} commits`);
  lines.push('');

  lines.push('---');
  lines.push('');

  // Per repository
  repoChangelogs.forEach(changelog => {
    lines.push(`## ${changelog.repo}`);
    lines.push('');
    lines.push(`**Previous Version:** ${changelog.previousVersion}`);
    lines.push(`**Commits:** ${changelog.totalCommits}`);
    lines.push('');

    const cat = changelog.categorized;

    if (cat.breaking.length > 0) {
      lines.push('### ⚠️  BREAKING CHANGES');
      lines.push('');
      cat.breaking.forEach(c => {
        lines.push(`- ${c.message} ([${c.sha}](${c.url}))`);
      });
      lines.push('');
    }

    if (cat.features.length > 0) {
      lines.push('### ✨ Features');
      lines.push('');
      cat.features.forEach(c => {
        lines.push(`- ${c.message} ([${c.sha}](${c.url}))`);
      });
      lines.push('');
    }

    if (cat.fixes.length > 0) {
      lines.push('### 🐛 Bug Fixes');
      lines.push('');
      cat.fixes.forEach(c => {
        lines.push(`- ${c.message} ([${c.sha}](${c.url}))`);
      });
      lines.push('');
    }

    if (cat.docs.length > 0) {
      lines.push('### 📚 Documentation');
      lines.push('');
      cat.docs.forEach(c => {
        lines.push(`- ${c.message} ([${c.sha}](${c.url}))`);
      });
      lines.push('');
    }

    if (cat.other.length > 0 || cat.chore.length > 0) {
      lines.push('### 🔧 Other Changes');
      lines.push('');
      [...cat.chore, ...cat.other].forEach(c => {
        lines.push(`- ${c.message} ([${c.sha}](${c.url}))`);
      });
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

async function main() {
  if (!RELEASE_ID || !RELEASE_TYPE) {
    console.error('Error: RELEASE_ID and RELEASE_TYPE required');
    process.exit(1);
  }

  try {
    // Load release plan
    const planPath = path.join(RELEASE_DIR, 'upcoming', RELEASE_ID, 'plan.json');
    if (!fs.existsSync(planPath)) {
      console.error(`Error: Release plan not found: ${planPath}`);
      process.exit(1);
    }

    const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
    const owner = 'garrick0';

    console.log('\n📝 Generating Changelog');
    console.log(`   Release ID: ${RELEASE_ID}`);
    console.log(`   Type: ${RELEASE_TYPE}`);
    console.log(`   Repositories: ${plan.repositories.length}\n`);

    // Generate changelog for each repo
    const changelogs = [];
    for (const repo of plan.repositories) {
      const changelog = await generateChangelogForRepo(repo.name, owner);
      if (changelog) {
        changelogs.push(changelog);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Format changelog
    const changelogText = formatChangelog(changelogs, RELEASE_TYPE, RELEASE_ID);

    // Save changelog
    const changelogPath = path.join(
      RELEASE_DIR,
      'upcoming',
      RELEASE_ID,
      'CHANGELOG.md'
    );
    fs.writeFileSync(changelogPath, changelogText);

    console.log(`\n✅ Changelog generated`);
    console.log(`   Repositories with changes: ${changelogs.length}`);
    console.log(`   Total commits: ${changelogs.reduce((sum, c) => sum + c.totalCommits, 0)}`);
    console.log(`   Saved to: ${changelogPath}`);
  } catch (error) {
    console.error('Error generating changelog:', error);
    process.exit(1);
  }
}

main();
