# Testing Strategy for C3 Packages

**Status:** Active  
**Last Updated:** November 16, 2024

---

## Philosophy

**Tests should be written by developers who understand the code, not auto-generated.**

While we provide scaffolding tools, actual test implementation is the responsibility of package maintainers.

---

## Approach

### 1. **Registry Setup ≠ Test Creation**

The `setup-package-registry.sh` script focuses on:
- ✅ Package configuration
- ✅ GitHub Packages setup
- ✅ Workflow creation
- ❌ NOT test creation (wrong concern)

### 2. **Separate Test Scaffolding**

If you need a quick test scaffold, use the dedicated script:

```bash
# Optional: Create basic test structure
./scripts/create-test-scaffold.sh ../c3-compliance c3-compliance
```

This creates a minimal test file that you **must** expand with real tests.

### 3. **Make Tests Optional Initially**

For packages without tests yet, you can temporarily skip tests in publishing:

```json
{
  "scripts": {
    "prepublishOnly": "npm run clean && npm run build"
    // Removed: && npm test
  }
}
```

**Add tests back once ready!**

---

## Testing Requirements

### Minimum (Sanity Tests)
✅ Package imports correctly  
✅ Main exports are defined  
✅ No runtime errors on import

### Recommended (Unit Tests)
✅ Core functionality tested  
✅ Edge cases covered  
✅ Error handling verified

### Ideal (Full Coverage)
✅ >80% code coverage  
✅ Integration tests  
✅ Type checking tests

---

## Current Status

| Package | Tests | Status | Action Needed |
|---------|-------|--------|---------------|
| c3-shared | ✅ 14 tests | Complete | None |
| c3-parsing | ✅ 31 tests | Complete | None |
| c3-compliance | ❓ Unknown | Check | Run `npm test` |
| c3-projection | ✅ 17 tests | Complete | None |
| c3-discovery | ❓ Unknown | Check | Run `npm test` |
| c3-wiring | ❓ Unknown | Check | Run `npm test` |
| c3-bff | ✅ 25 tests | Complete | None |
| c3-web | ❓ Unknown | Check | Run `npm test` |
| c3-cli | ❓ Unknown | Check | Run `npm test` |

---

## Options for Packages Without Tests

### Option 1: Add Real Tests (Recommended)
Write proper unit tests for your package.

### Option 2: Use Test Scaffold (Quick Start)
```bash
./scripts/create-test-scaffold.sh ../c3-compliance c3-compliance
# Then expand with real tests
```

### Option 3: Skip Tests Temporarily
Update `prepublishOnly` script to skip tests.

**Remember:** Add tests before first stable release!

---

## Best Practices

### ✅ DO

1. **Write tests for new code**
   - Test public APIs
   - Test error conditions
   - Test edge cases

2. **Use descriptive test names**
   ```typescript
   it('should return error when input is invalid')
   it('should cache results after first call')
   ```

3. **Keep tests focused**
   - One concept per test
   - Clear arrange/act/assert

4. **Test behavior, not implementation**
   - Test what it does
   - Not how it does it

### ❌ DON'T

1. **Auto-generate tests blindly**
   - Tests should understand the domain
   - Not just check if functions exist

2. **Skip tests for convenience**
   - Tests catch bugs
   - Tests are documentation

3. **Test private implementation**
   - Test public API
   - Implementation can change

4. **Write tests just for coverage**
   - Coverage ≠ Quality
   - Test meaningful scenarios

---

## Test Structure

### Recommended Structure

```
package/
├── src/
│   └── MyClass.ts
└── tests/
    ├── unit/
    │   └── MyClass.test.ts
    ├── integration/
    │   └── my-feature.test.ts
    └── sanity.test.ts
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { MyClass } from '../src/MyClass.js';

describe('MyClass', () => {
  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const instance = new MyClass({ option: 'value' });
      expect(instance).toBeInstanceOf(MyClass);
    });

    it('should throw error with invalid config', () => {
      expect(() => new MyClass(null)).toThrow('Config required');
    });
  });

  describe('myMethod', () => {
    it('should return expected result', () => {
      const instance = new MyClass({ option: 'value' });
      const result = instance.myMethod('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      const instance = new MyClass({ option: 'value' });
      const result = instance.myMethod('');
      expect(result).toBe(null);
    });
  });
});
```

---

## CI/CD Integration

### Publishing Workflow

By default, workflows require tests to pass:

```yaml
- name: Run tests
  run: npm test

- name: Build
  run: npm run build

- name: Publish
  run: npm publish
```

### Temporarily Skip Tests

If a package isn't ready, you can skip tests in CI:

```yaml
- name: Run tests
  run: npm test || echo "Tests not ready yet"
  continue-on-error: true
```

**Remove this once tests are added!**

---

## Tools Available

### 1. `setup-package-registry.sh`
**Purpose:** Configure package for GitHub Packages  
**Does NOT:** Create tests  
**Usage:** `./scripts/setup-package-registry.sh ../c3-compliance c3-compliance`

### 2. `create-test-scaffold.sh`
**Purpose:** Create minimal test structure  
**Does NOT:** Create comprehensive tests  
**Usage:** `./scripts/create-test-scaffold.sh ../c3-compliance c3-compliance`

**After scaffolding, you MUST add real tests!**

---

## Migration Path

For packages without tests:

1. **Immediate:** Configure for GitHub Packages (no test requirement)
2. **Week 1:** Add sanity tests (imports work)
3. **Week 2:** Add unit tests (core functionality)
4. **Week 3:** Add integration tests (full coverage)

---

## Summary

- ✅ **Registry setup** = Configuration only
- ✅ **Test scaffolding** = Optional, separate tool
- ✅ **Real tests** = Developer responsibility
- ✅ **Tests optional** = For initial setup
- ⚠️ **Tests required** = Before stable release

**Tests are important, but should be written thoughtfully, not auto-generated.**

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2024

