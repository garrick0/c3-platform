#!/bin/bash
# Extract a context from the monorepo
set -e

CONTEXT_NAME=$1
DESCRIPTION=$2

if [ -z "$CONTEXT_NAME" ] || [ -z "$DESCRIPTION" ]; then
  echo "Usage: ./extract-context.sh <context-name> <description>"
  echo "Example: ./extract-context.sh compliance 'Rules evaluation and remediation for C3'"
  exit 1
fi

MONOREPO="/Users/samuelgleeson/dev/c3"
TARGET_DIR="/Users/samuelgleeson/dev/c3-$CONTEXT_NAME"

echo "📦 Extracting c3-$CONTEXT_NAME..."

# 1. Create GitHub repo
echo "1. Creating GitHub repository..."
gh repo create garrick0/c3-$CONTEXT_NAME --public --description "$DESCRIPTION"

# 2. Clone locally
echo "2. Cloning repository..."
cd ~/dev
git clone https://github.com/garrick0/c3-$CONTEXT_NAME
cd c3-$CONTEXT_NAME

# 3. Copy files from monorepo
echo "3. Copying files from monorepo..."
cp -r $MONOREPO/contexts/$CONTEXT_NAME/* .

# 4. Reorganize to src/
echo "4. Reorganizing to src/ directory..."
mkdir -p src
mv domain application infrastructure src/ 2>/dev/null || true
mv index.ts src/ 2>/dev/null || true

# 5. Clean up
echo "5. Cleaning up..."
rm -rf dist node_modules package-lock.json 2>/dev/null || true

# 6. Replace imports
echo "6. Updating imports..."
find src -name "*.ts" -exec sed -i '' 's/@c3\/shared/c3-shared/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/@c3\/parsing/c3-parsing/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/@c3\/compliance/c3-compliance/g' {} \;

# 7. Create package.json
echo "7. Creating package.json..."
cat > package.json << EOF
{
  "name": "c3-$CONTEXT_NAME",
  "version": "0.1.0",
  "description": "$DESCRIPTION",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run"
  },
  "author": "garrick0",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4"
  },
  "publishConfig": {
    "access": "public"
  }
}
EOF

# 8. Create tsconfig.json
echo "8. Creating tsconfig.json..."
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF

# 9. Copy common files
echo "9. Copying common files..."
cp /Users/samuelgleeson/dev/c3-shared/.gitignore .
cp /Users/samuelgleeson/dev/c3-shared/.npmignore .
mkdir -p .github/workflows
cp /Users/samuelgleeson/dev/c3-platform/.github/workflows/lib-ci.yml .github/workflows/ci.yml

# 10. Create README
echo "10. Creating README..."
cat > README.md << EOF
# c3-$CONTEXT_NAME

> $DESCRIPTION

## Installation

\`\`\`bash
npm install c3-$CONTEXT_NAME c3-shared
\`\`\`

## Part of C3

[c3-platform](https://github.com/garrick0/c3-platform)

## License

MIT
EOF

# 11. Install dependencies
echo "11. Installing dependencies..."
npm install

# 12. Link dependencies
echo "12. Linking c3-shared..."
npm link c3-shared

# 13. Link c3-parsing if needed
if [ "$CONTEXT_NAME" != "parsing" ]; then
  echo "13. Linking c3-parsing..."
  npm link c3-parsing 2>/dev/null || true
fi

# 14. Build
echo "14. Building..."
npm run build

# 15. Commit and push
echo "15. Committing and pushing..."
git add -A
git commit -m "feat: initialize c3-$CONTEXT_NAME package"
git push -u origin main

echo "✅ c3-$CONTEXT_NAME extraction complete!"
echo "   Repository: https://github.com/garrick0/c3-$CONTEXT_NAME"
