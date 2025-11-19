#!/usr/bin/env node

/**
 * Process repository dispatch events
 * Logs events and triggers appropriate actions
 */

const fs = require('fs');
const path = require('path');

const EVENT_LOG_DIR = path.join(__dirname, '../logs/events');
const EVENT_TYPE = process.env.EVENT_TYPE;
const EVENT_PAYLOAD = process.env.EVENT_PAYLOAD;

function logEvent(eventType, payload) {
  // Ensure log directory exists
  if (!fs.existsSync(EVENT_LOG_DIR)) {
    fs.mkdirSync(EVENT_LOG_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    payload: JSON.parse(payload)
  };

  // Append to daily log file
  const date = timestamp.split('T')[0];
  const logFile = path.join(EVENT_LOG_DIR, `events-${date}.log`);

  fs.appendFileSync(
    logFile,
    JSON.stringify(logEntry) + '\n'
  );

  // Update latest event
  const latestFile = path.join(EVENT_LOG_DIR, 'latest.json');
  fs.writeFileSync(latestFile, JSON.stringify(logEntry, null, 2));

  console.log(`Event logged: ${eventType}`);
  console.log(`Repository: ${logEntry.payload.repo}`);

  return logEntry;
}

function processEvent(eventType, payload) {
  const parsedPayload = JSON.parse(payload);

  console.log('\n=== Event Processing ===');
  console.log(`Type: ${eventType}`);
  console.log(`Repository: ${parsedPayload.repo || 'unknown'}`);
  console.log(`Version: ${parsedPayload.version || 'N/A'}`);
  console.log(`SHA: ${parsedPayload.sha || 'N/A'}`);
  console.log('========================\n');

  switch (eventType) {
    case 'dependency_updated':
      console.log('✅ Dependency update detected');
      console.log(`   ${parsedPayload.repo} → ${parsedPayload.version}`);
      break;

    case 'build_failed':
      console.log('❌ Build failure detected');
      console.log(`   Repository: ${parsedPayload.repo}`);
      console.log(`   Run ID: ${parsedPayload.workflow_run_id}`);
      break;

    case 'release_requested':
      console.log('🚀 Release requested');
      console.log(`   Repository: ${parsedPayload.repo}`);
      console.log(`   Release type: ${parsedPayload.release_type}`);
      break;

    default:
      console.log(`⚠️  Unknown event type: ${eventType}`);
  }
}

function main() {
  if (!EVENT_TYPE || !EVENT_PAYLOAD) {
    console.error('Error: EVENT_TYPE and EVENT_PAYLOAD required');
    process.exit(1);
  }

  try {
    // Log the event
    logEvent(EVENT_TYPE, EVENT_PAYLOAD);

    // Process the event
    processEvent(EVENT_TYPE, EVENT_PAYLOAD);

    console.log('\n✅ Event processing complete');
  } catch (error) {
    console.error('Error processing event:', error);
    process.exit(1);
  }
}

main();
