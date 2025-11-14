#!/bin/bash
# Clone all C3 repositories from garrick0's GitHub
set -e

echo "📦 Cloning all C3 repositories..."

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
    echo "⏭️  Skipping $repo (already exists)"
  else
    echo "📥 Cloning $repo..."
    gh repo clone garrick0/$repo ../$repo
  fi
done

echo "✅ All repositories cloned!"
