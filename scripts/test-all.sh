#!/bin/bash
# Test all C3 packages
set -e

echo "🧪 Testing all C3 packages..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_FILE="$SCRIPT_DIR/../config/repos.json"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install jq to use this script."
    echo "   On macOS: brew install jq"
    echo "   On Ubuntu: apt-get install jq"
    exit 1
fi

# Load build order from config
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Extract build order from JSON
mapfile -t repos < <(jq -r '.orchestration.build_order[]' "$CONFIG_FILE")

echo "📋 Testing ${#repos[@]} repositories..."

failed=()

for repo in "${repos[@]}"; do
  if [ -d "../$repo" ]; then
    echo ""
    echo "🧪 Testing $repo..."
    cd ../$repo
    if npm test; then
      echo "✅ $repo tests passed"
    else
      echo "❌ $repo tests failed"
      failed+=($repo)
    fi
    cd ../c3-platform
  else
    echo "⚠️  Skipping $repo (not found)"
  fi
done

echo ""
if [ ${#failed[@]} -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Tests failed in: ${failed[*]}"
  exit 1
fi
