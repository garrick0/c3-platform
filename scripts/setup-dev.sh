#!/bin/bash
# Setup C3 development environment
set -e

echo "🚀 Setting up C3 development environment..."

# Clone all repositories
./scripts/clone-all.sh

# Install dependencies in all repos
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
    echo "📦 Installing dependencies in $repo..."
    cd ../$repo
    npm install
    cd ../c3-platform
  else
    echo "⚠️  Skipping $repo (not found)"
  fi
done

echo ""
echo "✅ Development environment ready!"
echo ""
echo "Next steps:"
echo "  1. Run './scripts/link-all.sh' to link packages for local development"
echo "  2. Run './scripts/build-all.sh' to build all packages"
echo "  3. Run './scripts/test-all.sh' to test all packages"
