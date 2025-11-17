#!/bin/bash
# Script to configure a package for GitHub Packages
# Usage: ./setup-package-registry.sh <package-directory> <package-name> <version>

set -e

PACKAGE_DIR=$1
PACKAGE_NAME=$2
VERSION=${3:-"0.1.0-dev.0"}

if [ -z "$PACKAGE_DIR" ] || [ -z "$PACKAGE_NAME" ]; then
    echo "Usage: $0 <package-directory> <package-name> [version]"
    echo "Example: $0 ../c3-compliance c3-compliance 0.1.0-dev.0"
    exit 1
fi

echo "🔧 Configuring $PACKAGE_NAME for GitHub Packages..."

cd "$PACKAGE_DIR"

# 1. Create .npmrc
echo "📝 Creating .npmrc..."
cat > .npmrc << 'EOF'
# GitHub Packages configuration
@garrick0:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}

# Ensure packages are published to GitHub Packages
registry=https://registry.npmjs.org
EOF

# 2. Update package.json
echo "📦 Updating package.json..."

# Use Node.js to update package.json
node << NODEJS
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update name to scoped
if (!pkg.name.startsWith('@')) {
    pkg.name = '@garrick0/' + pkg.name.replace('c3-', 'c3-');
}

// Update version
pkg.version = '${VERSION}';

// Add/update repository
pkg.repository = {
    type: 'git',
    url: 'https://github.com/garrick0/${PACKAGE_NAME}'
};

// Add publishConfig
pkg.publishConfig = {
    registry: 'https://npm.pkg.github.com',
    access: 'public'
};

// Add versioning scripts if not present
if (!pkg.scripts) pkg.scripts = {};
if (!pkg.scripts['version:dev']) {
    pkg.scripts['version:dev'] = 'npm version prerelease --preid=dev.\$(git rev-parse --short HEAD) --no-git-tag-version';
}
if (!pkg.scripts['version:canary']) {
    pkg.scripts['version:canary'] = 'npm version prerelease --preid=canary --no-git-tag-version';
}

// Update dependencies to use scoped names
function updateDeps(deps) {
    if (!deps) return;
    const c3Packages = ['c3-shared', 'c3-parsing', 'c3-compliance', 'c3-projection', 'c3-discovery', 'c3-wiring'];
    for (const c3Pkg of c3Packages) {
        if (deps[c3Pkg]) {
            const version = deps[c3Pkg];
            delete deps[c3Pkg];
            deps['@garrick0/' + c3Pkg] = version.includes('file:') ? version : '^0.1.0-dev.0';
        }
    }
}

updateDeps(pkg.dependencies);
updateDeps(pkg.devDependencies);
updateDeps(pkg.peerDependencies);

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('✅ Updated package.json');
NODEJS

# 3. Create .github/workflows directory
echo "📁 Creating workflows directory..."
mkdir -p .github/workflows

# 4. Copy publish workflow from c3-shared
echo "📋 Copying publish workflow..."
cp ../c3-shared/.github/workflows/publish.yml .github/workflows/publish.yml

# 5. Update workflow to use correct package name
sed -i.bak "s/@garrick0\/c3-shared/@garrick0\/${PACKAGE_NAME}/g" .github/workflows/publish.yml
rm -f .github/workflows/publish.yml.bak

echo ""
echo "✅ Configuration complete for $PACKAGE_NAME!"
echo ""
echo "⚠️  IMPORTANT: Ensure package has tests before publishing"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Add tests if missing: npm test (should pass or add tests)"
echo "3. Test build: npm run build"
echo "4. Commit changes: git add . && git commit -m 'chore: configure for GitHub Packages'"
echo ""
echo "To temporarily skip tests in CI, update package.json:"
echo '  "prepublishOnly": "npm run clean && npm run build"'
echo ""

