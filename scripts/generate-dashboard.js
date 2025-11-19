#!/usr/bin/env node

/**
 * Generate HTML dashboard from collected metrics
 */

const fs = require('fs');
const path = require('path');

const METRICS_PATH = path.join(__dirname, '../metrics/latest.json');
const OUTPUT_PATH = path.join(__dirname, '../metrics/dashboard.html');

function getStatusEmoji(conclusion) {
  switch (conclusion) {
    case 'success': return '✅';
    case 'failure': return '❌';
    case 'cancelled': return '🚫';
    case 'skipped': return '⏭️';
    default: return '❓';
  }
}

function getStatusColor(conclusion) {
  switch (conclusion) {
    case 'success': return '#28a745';
    case 'failure': return '#dc3545';
    case 'cancelled': return '#6c757d';
    default: return '#ffc107';
  }
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

function generateHTML(metrics) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="300"> <!-- Auto-refresh every 5 minutes -->
    <title>C3 Platform CI/CD Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #0d1117;
            color: #c9d1d9;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            padding: 40px 0;
            border-bottom: 1px solid #30363d;
            margin-bottom: 40px;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #58a6ff;
        }

        .timestamp {
            color: #8b949e;
            font-size: 0.9rem;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #8b949e;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .repos-grid {
            display: grid;
            gap: 15px;
        }

        .repo-card {
            background: #161b22;
            border: 1px solid #30363d;
            border-left: 4px solid #30363d;
            border-radius: 6px;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s;
        }

        .repo-card:hover {
            background: #1c2128;
            border-left-color: #58a6ff;
        }

        .repo-card.success {
            border-left-color: #28a745;
        }

        .repo-card.failure {
            border-left-color: #dc3545;
        }

        .repo-info {
            flex: 1;
        }

        .repo-name {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 5px;
            color: #58a6ff;
        }

        .repo-meta {
            color: #8b949e;
            font-size: 0.85rem;
        }

        .repo-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            margin-right: 8px;
            background: #30363d;
            color: #c9d1d9;
        }

        .repo-status {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .status-icon {
            font-size: 2rem;
        }

        .duration {
            color: #8b949e;
            font-size: 0.85rem;
        }

        .last-run {
            color: #8b949e;
            font-size: 0.75rem;
            margin-top: 5px;
        }

        footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #30363d;
            color: #8b949e;
            font-size: 0.85rem;
        }

        @media (max-width: 768px) {
            .repo-card {
                flex-direction: column;
                align-items: flex-start;
            }

            .repo-status {
                margin-top: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 C3 Platform CI/CD Status</h1>
            <p class="timestamp">Last updated: ${new Date(metrics.timestamp).toLocaleString()}</p>
        </header>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-value" style="color: #58a6ff">${metrics.summary.total}</div>
                <div class="stat-label">Total Repos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #28a745">${metrics.summary.passing}</div>
                <div class="stat-label">Passing</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #dc3545">${metrics.summary.failing}</div>
                <div class="stat-label">Failing</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #58a6ff">${metrics.summary.passRate}%</div>
                <div class="stat-label">Pass Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #8b949e">${metrics.summary.avgDuration}s</div>
                <div class="stat-label">Avg Duration</div>
            </div>
        </div>

        <div class="repos-grid">
            ${metrics.repositories.map(repo => `
                <div class="repo-card ${repo.conclusion}">
                    <div class="repo-info">
                        <div class="repo-name">${repo.name}</div>
                        <div class="repo-meta">
                            <span class="repo-badge">Layer ${repo.layer}</span>
                            <span class="repo-badge">${repo.type}</span>
                            <span class="repo-badge">${repo.workflow}</span>
                        </div>
                        ${repo.lastRun ? `<div class="last-run">Last run: ${new Date(repo.lastRun).toLocaleString()}</div>` : ''}
                    </div>
                    <div class="repo-status">
                        <div class="status-icon">${getStatusEmoji(repo.conclusion)}</div>
                        <div>
                            <div class="duration">${formatDuration(repo.duration)}</div>
                            ${repo.url ? `<a href="${repo.url}" target="_blank" style="color: #58a6ff; font-size: 0.75rem;">View Run</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('\n')}
        </div>

        <footer>
            <p>Auto-refreshes every 5 minutes | Generated by C3 Platform CI/CD Orchestration</p>
        </footer>
    </div>
</body>
</html>`;

  return html;
}

function main() {
  try {
    // Read metrics
    const metrics = JSON.parse(fs.readFileSync(METRICS_PATH, 'utf8'));

    // Generate HTML
    const html = generateHTML(metrics);

    // Write output
    fs.writeFileSync(OUTPUT_PATH, html);

    console.log(`Dashboard generated: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error generating dashboard:', error);
    process.exit(1);
  }
}

main();
