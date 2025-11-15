#!/bin/bash
# Setup C3 development environment
set -e

echo "🚀 Setting up C3 development environment..."
echo ""

# Check if repos already exist
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

existing_count=0
for repo in "${repos[@]}"; do
  if [ -d "../$repo" ]; then
    ((existing_count++))
  fi
done

# If repos exist, ask if we should clone
if [ $existing_count -gt 0 ]; then
  echo "ℹ️  Found $existing_count existing repositories in ~/dev/"
  echo ""
  echo "Options:"
  echo "  1. Skip cloning, just install dependencies (recommended if repos exist)"
  echo "  2. Run clone-all.sh anyway (will skip existing repos)"
  echo ""
  read -p "Choose [1/2] (default: 1): " choice
  choice=${choice:-1}

  if [ "$choice" = "2" ]; then
    echo ""
    echo "📥 Cloning repositories..."
    ./scripts/clone-all.sh
  else
    echo ""
    echo "⏭️  Skipping clone step (repos already exist)"
  fi
else
  echo "📥 No existing repositories found. Cloning all..."
  ./scripts/clone-all.sh
fi

echo ""
echo "📦 Installing dependencies in all repositories..."

for repo in "${repos[@]}"; do
  if [ -d "../$repo" ]; then
    echo "📦 Installing in $repo..."
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
