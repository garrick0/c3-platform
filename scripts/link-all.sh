#!/bin/bash
# Link all C3 packages for local development
set -e

echo "🔗 Linking all C3 packages for local development..."

# First, make all packages available globally
echo ""
echo "📦 Step 1: Making all packages available globally..."

for repo in c3-shared c3-parsing c3-compliance c3-projection c3-discovery c3-wiring; do
  if [ -d "../$repo" ]; then
    echo "  → Linking $repo globally..."
    cd ../$repo
    npm link 2>/dev/null || true
    cd ../c3-platform
  fi
done

echo ""
echo "📦 Step 2: Linking dependencies in each package..."

# Link parsing (depends on shared)
if [ -d "../c3-parsing" ]; then
  echo "  → c3-parsing: linking c3-shared..."
  cd ../c3-parsing
  npm link c3-shared 2>/dev/null || true
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-parsing (not found)"
fi

# Link compliance (depends on shared + parsing)
if [ -d "../c3-compliance" ]; then
  echo "  → c3-compliance: linking c3-shared c3-parsing..."
  cd ../c3-compliance
  npm link c3-shared c3-parsing 2>/dev/null || true
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-compliance (not found)"
fi

# Link projection (depends on shared + parsing)
if [ -d "../c3-projection" ]; then
  echo "  → c3-projection: linking c3-shared c3-parsing..."
  cd ../c3-projection
  npm link c3-shared c3-parsing 2>/dev/null || true
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-projection (not found)"
fi

# Link discovery (depends on shared + parsing + compliance)
if [ -d "../c3-discovery" ]; then
  echo "  → c3-discovery: linking c3-shared c3-parsing c3-compliance..."
  cd ../c3-discovery
  npm link c3-shared c3-parsing c3-compliance 2>/dev/null || true
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-discovery (not found)"
fi

# Link wiring (depends on all contexts)
if [ -d "../c3-wiring" ]; then
  echo "  → c3-wiring: linking all contexts..."
  cd ../c3-wiring
  npm link c3-shared c3-parsing c3-compliance c3-projection c3-discovery 2>/dev/null || true
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-wiring (not found)"
fi

# Link apps
if [ -d "../c3-cli" ]; then
  echo "  → c3-cli: linking all packages..."
  cd ../c3-cli
  npm link c3-shared c3-wiring c3-parsing c3-compliance c3-projection c3-discovery 2>/dev/null || true
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-cli (not found)"
fi

if [ -d "../c3-bff" ]; then
  echo "  → c3-bff: linking all packages..."
  cd ../c3-bff
  npm link c3-shared c3-wiring c3-parsing c3-compliance c3-projection c3-discovery 2>/dev/null || true
  cd ../c3-platform
else
  echo "⚠️  Skipping c3-bff (not found)"
fi

echo ""
echo "✅ All packages linked!"
echo ""
echo "You can now make changes in any package and they will be"
echo "automatically available to dependent packages."
