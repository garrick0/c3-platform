#!/bin/bash
# Build all C3 packages in dependency order
set -e

echo "🏗️  Building all C3 packages..."

# Build in dependency order
repos=(
  "c3-shared"
  "c3-parsing"
  "c3-compliance"
  "c3-projection"
  "c3-discovery"
  "c3-wiring"
  "c3-cli"
  "c3-bff"
  "c3-web"
)

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
