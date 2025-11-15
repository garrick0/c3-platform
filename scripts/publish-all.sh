#!/bin/bash
# Publish all C3 packages to NPM
set -e

echo "📦 Publishing all C3 packages to NPM..."

# Confirm
read -p "Are you sure you want to publish all packages? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Publish cancelled"
  exit 1
fi

# Check NPM authentication
if ! npm whoami > /dev/null 2>&1; then
  echo "❌ Not logged in to NPM. Run 'npm login' first."
  exit 1
fi

echo "✅ Logged in to NPM as: $(npm whoami)"

# Link packages first (for local builds)
echo ""
echo "🔗 Linking all packages for building..."
./scripts/link-all.sh

# Build first
echo ""
echo "🏗️  Building all packages..."
./scripts/build-all.sh

# Test first (optional - may not have tests yet)
echo ""
echo "🧪 Testing all packages..."
if ./scripts/test-all.sh 2>&1 | grep -q "✅ All tests passed"; then
  echo "✅ All tests passed"
else
  echo "⚠️  Some tests failed or missing, continuing anyway..."
fi

# Publish in dependency order
repos=(
  "c3-shared"
  "c3-parsing"
  "c3-compliance"
  "c3-projection"
  "c3-discovery"
  "c3-wiring"
  "c3-cli"
  "c3-bff"
)

failed=()

echo ""
echo "📦 Publishing packages..."

for repo in "${repos[@]}"; do
  if [ -d "../$repo" ]; then
    echo ""
    echo "📦 Publishing $repo..."
    cd ../$repo

    # Check if already published
    version=$(node -p "require('./package.json').version")
    name=$(node -p "require('./package.json').name")

    if npm view "$name@$version" > /dev/null 2>&1; then
      echo "⏭️  $name@$version already published, skipping"
    else
      echo "📤 Publishing $name@$version..."
      if npm publish 2>&1 | tail -1 | grep -q "^+"; then
        echo "✅ Published $name@$version"
      else
        # Check if it actually published despite errors
        if npm view "$name@$version" > /dev/null 2>&1; then
          echo "✅ Published $name@$version (with warnings)"
        else
          echo "❌ Failed to publish $name"
          failed+=($repo)
        fi
      fi
    fi

    cd ../c3-platform
  else
    echo "⚠️  Skipping $repo (not found)"
  fi
done

echo ""
if [ ${#failed[@]} -eq 0 ]; then
  echo "✅ All packages published!"
  exit 0
else
  echo "❌ Publish failed in: ${failed[*]}"
  exit 1
fi
