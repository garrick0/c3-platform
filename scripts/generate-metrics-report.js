#!/usr/bin/env node

/**
 * Generate markdown report from collected metrics
 */

const fs = require('fs');
const path = require('path');

const METRICS_PATH = path.join(__dirname, '../metrics/latest.json');
const REPORT_PATH = path.join(__dirname, '../metrics/report.md');

function generateReport(metrics) {
  const lines = [];

  lines.push('# CI/CD Metrics Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date(metrics.timestamp).toLocaleString()}`);
  lines.push(`**Period:** ${metrics.period}`);
  lines.push('');

  // Overall statistics
  const avgSuccessRate = (
    metrics.repositories.reduce((sum, r) => sum + parseFloat(r.successRate), 0) /
    metrics.repositories.length
  ).toFixed(1);

  const avgBuildTime = Math.round(
    metrics.repositories.reduce((sum, r) => sum + r.avgDuration, 0) /
    metrics.repositories.length
  );

  lines.push('## Overall Statistics');
  lines.push('');
  lines.push(`- **Average Success Rate:** ${avgSuccessRate}%`);
  lines.push(`- **Average Build Time:** ${avgBuildTime}s`);
  lines.push(`- **Total Repositories:** ${metrics.repositories.length}`);
  lines.push('');

  // Per repository metrics
  lines.push('## Repository Metrics');
  lines.push('');
  lines.push('| Repository | Success Rate | Avg Duration | Min | Max | Type |');
  lines.push('|------------|--------------|--------------|-----|-----|------|');

  for (const repo of metrics.repositories) {
    const successIcon = parseFloat(repo.successRate) >= 90 ? '✅' : '⚠️';
    lines.push(
      `| ${successIcon} ${repo.name} | ${repo.successRate}% | ${repo.avgDuration}s | ${repo.minDuration}s | ${repo.maxDuration}s | ${repo.type} |`
    );
  }

  lines.push('');

  // Performance insights
  lines.push('## Performance Insights');
  lines.push('');

  const fastest = metrics.repositories.reduce((prev, current) =>
    prev.avgDuration < current.avgDuration ? prev : current
  );

  const slowest = metrics.repositories.reduce((prev, current) =>
    prev.avgDuration > current.avgDuration ? prev : current
  );

  const mostReliable = metrics.repositories.reduce((prev, current) =>
    parseFloat(prev.successRate) > parseFloat(current.successRate) ? prev : current
  );

  lines.push(`- **Fastest Build:** ${fastest.name} (${fastest.avgDuration}s avg)`);
  lines.push(`- **Slowest Build:** ${slowest.name} (${slowest.avgDuration}s avg)`);
  lines.push(`- **Most Reliable:** ${mostReliable.name} (${mostReliable.successRate}% success rate)`);
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');

  const needsAttention = metrics.repositories.filter(r => parseFloat(r.successRate) < 90);
  if (needsAttention.length > 0) {
    lines.push('### Repositories Needing Attention');
    needsAttention.forEach(repo => {
      lines.push(`- **${repo.name}**: ${repo.successRate}% success rate (target: 90%+)`);
    });
    lines.push('');
  }

  const slowBuilds = metrics.repositories.filter(r => r.avgDuration > 120);
  if (slowBuilds.length > 0) {
    lines.push('### Slow Builds (>2 minutes)');
    slowBuilds.forEach(repo => {
      lines.push(`- **${repo.name}**: ${repo.avgDuration}s average (${Math.round(repo.avgDuration / 60)}m)`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  try {
    // Read metrics
    const metrics = JSON.parse(fs.readFileSync(METRICS_PATH, 'utf8'));

    // Generate report
    const report = generateReport(metrics);

    // Write report
    fs.writeFileSync(REPORT_PATH, report);

    console.log(`Report generated: ${REPORT_PATH}`);
    console.log('\n' + report);
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

main();
