#!/bin/bash
# Install dependencies in all existing C3 repositories
# Use this when repos already exist (vs setup-dev.sh for first-time setup)
set -e

echo "📦 Installing dependencies in all C3 repositories..."

repos=(
  "c3-shared"
  "c3-wiring"
  "c3-parsing"
  "c3-compliance"
  "c3-projection"
  "c3-discovery"
  "c3-cli"
  "c3-bff"
  "c3-web"
)

for repo in "${repos[@]}"; do
  if [ -d "../$repo" ]; then
    echo ""
    echo "📦 Installing in $repo..."
    cd ../$repo
    npm install
    cd ../c3-platform
  else
    echo "⚠️  Skipping $repo (not found)"
  fi
done

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Next steps:"
echo "  1. Run './scripts/link-all.sh' to link packages for local development"
echo "  2. Run './scripts/build-all.sh' to build all packages"
