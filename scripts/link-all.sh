#!/bin/bash
# Link all C3 packages for local development (using repos.json)
set -e

echo "🔗 Linking all C3 packages for local development..."

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

# Load config
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Step 1: Make all library packages available globally
echo ""
echo "📦 Step 1: Making all packages available globally..."

# Get all library repos
libraries=$(jq -r '.repositories[] | select(.type == "library") | .name' "$CONFIG_FILE")

for repo in $libraries; do
  if [ -d "../$repo" ]; then
    echo "  → Linking $repo globally..."
    cd ../$repo
    npm link 2>/dev/null || true
    cd ../c3-platform
  fi
done

# Step 2: Link dependencies in each package
echo ""
echo "📦 Step 2: Linking dependencies in each package..."

# Process each repo in build order
mapfile -t repos < <(jq -r '.orchestration.build_order[]' "$CONFIG_FILE")

for repo in "${repos[@]}"; do
  if [ -d "../$repo" ]; then
    # Get dependencies for this repo
    deps=$(jq -r --arg repo "$repo" '.repositories[] | select(.name == $repo) | .dependencies[]?' "$CONFIG_FILE")

    if [ -n "$deps" ]; then
      echo "  → $repo: linking dependencies..."

      # Get the scope
      scope=$(jq -r --arg repo "$repo" '.repositories[] | select(.name == $repo) | .scope' "$CONFIG_FILE")

      cd ../$repo

      # Link each dependency
      for dep in $deps; do
        echo "      - @${scope}/${dep}"
        npm link "@${scope}/${dep}" 2>/dev/null || true
      done

      cd ../c3-platform
    fi
  else
    echo "⚠️  Skipping $repo (not found)"
  fi
done

echo ""
echo "✅ All packages linked!"
echo ""
echo "You can now make changes in any package and they will be"
echo "automatically available to dependent packages."
