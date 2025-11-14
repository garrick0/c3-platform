#!/bin/bash
# Link all C3 packages for local development
set -e

echo "🔗 Linking all C3 packages for local development..."

# Link shared first (everything depends on it)
if [ -d "../c3-shared" ]; then
  echo "🔗 Linking c3-shared..."
  cd ../c3-shared
  npm link
  cd ../c3-platform
else
  echo "❌ c3-shared not found. Run './scripts/clone-all.sh' first."
  exit 1
fi

# Link contexts
for repo in c3-parsing c3-compliance c3-projection c3-discovery; do
  if [ -d "../$repo" ]; then
    echo "🔗 Linking $repo..."
    cd ../$repo
    npm link c3-shared
    npm link
    cd ../c3-platform
  else
    echo "⚠️  Skipping $repo (not found)"
  fi
done

# Link wiring
if [ -d "../c3-wiring" ]; then
  echo "🔗 Linking c3-wiring..."
  cd ../c3-wiring
  npm link c3-shared
  npm link c3-parsing
  npm link c3-compliance
  npm link c3-projection
  npm link c3-discovery
  npm link
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-wiring (not found)"
fi

# Link apps
if [ -d "../c3-cli" ]; then
  echo "🔗 Linking c3-cli..."
  cd ../c3-cli
  npm link c3-shared
  npm link c3-wiring
  npm link c3-parsing
  npm link c3-compliance
  npm link c3-projection
  npm link c3-discovery
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-cli (not found)"
fi

if [ -d "../c3-bff" ]; then
  echo "🔗 Linking c3-bff..."
  cd ../c3-bff
  npm link c3-shared
  npm link c3-wiring
  npm link c3-parsing
  npm link c3-compliance
  npm link c3-projection
  npm link c3-discovery
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-bff (not found)"
fi

echo ""
echo "✅ All packages linked!"
echo ""
echo "You can now make changes in any package and they will be"
echo "automatically available to dependent packages."
