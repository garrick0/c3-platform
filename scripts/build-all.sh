#!/bin/bash
# Build all C3 packages in dependency order
set -e

echo "🏗️  Building all C3 packages..."

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

echo "📋 Build order loaded from config: ${#repos[@]} repositories"

failed=()

for repo in "${repos[@]}"; do
  if [ -d "../$repo" ]; then
    echo ""
    echo "🔨 Building $repo..."
    cd ../$repo
    if npm run build; then
      echo "✅ $repo built successfully"
    else
      echo "❌ $repo build failed"
      failed+=($repo)
    fi
    cd ../c3-platform
  else
    echo "⚠️  Skipping $repo (not found)"
  fi
done

echo ""
if [ ${#failed[@]} -eq 0 ]; then
  echo "✅ All packages built successfully!"
  exit 0
else
  echo "❌ Build failed in: ${failed[*]}"
  exit 1
fi
