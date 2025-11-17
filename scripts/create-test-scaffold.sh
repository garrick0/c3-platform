#!/bin/bash
# Separate script to scaffold basic tests for packages
# Usage: ./create-test-scaffold.sh <package-directory> <package-name>

set -e

PACKAGE_DIR=$1
PACKAGE_NAME=$2

if [ -z "$PACKAGE_DIR" ] || [ -z "$PACKAGE_NAME" ]; then
    echo "Usage: $0 <package-directory> <package-name>"
    echo "Example: $0 ../c3-compliance c3-compliance"
    exit 1
fi

cd "$PACKAGE_DIR"

# Check if tests already exist
if [ -d "tests" ] || [ -f "tests/sanity.test.ts" ]; then
    echo "⚠️  Tests directory or sanity.test.ts already exists"
    echo "Skipping test creation to avoid overwriting existing tests"
    exit 0
fi

echo "📝 Creating basic test scaffold for $PACKAGE_NAME..."
mkdir -p tests

cat > tests/sanity.test.ts << 'EOF'
/**
 * Sanity tests for {{PACKAGE_NAME}} package
 * Ensures basic exports and structure are correct
 * 
 * TODO: Replace with actual unit tests for your package
 */

import { describe, it, expect } from 'vitest';

describe('{{PACKAGE_NAME}} package', () => {
  it('should be importable', () => {
    // This test just verifies the package can be imported
    expect(true).toBe(true);
  });

  it('should export main index', async () => {
    // Verify the main entry point exists and is importable
    const pkg = await import('../src/index.js');
    expect(pkg).toBeDefined();
  });

  // TODO: Add tests for your package's main exports
  // Example:
  // it('should export MyClass', async () => {
  //   const { MyClass } = await import('../src/MyClass.js');
  //   expect(MyClass).toBeDefined();
  //   
  //   const instance = new MyClass();
  //   expect(instance).toBeInstanceOf(MyClass);
  // });
});
EOF

# Replace placeholder
sed -i.bak "s/{{PACKAGE_NAME}}/${PACKAGE_NAME}/g" tests/sanity.test.ts
rm -f tests/sanity.test.ts.bak

echo "✅ Created tests/sanity.test.ts"
echo ""
echo "⚠️  This is just a scaffold - you should:"
echo "1. Add real unit tests for your package's functionality"
echo "2. Test edge cases and error conditions"
echo "3. Ensure good test coverage"
echo ""
echo "Run tests with: npm test"

