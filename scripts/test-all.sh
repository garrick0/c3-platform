#!/bin/bash
# Test all C3 packages
set -e

echo "🧪 Testing all C3 packages..."

failed=()

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
