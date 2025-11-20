#!/usr/bin/env node

/**
 * C3 Repository Validator
 * Validates all C3 repositories against the schema
 * 
 * Usage:
 *   node validate-repos.js                  # Validate all repos
 *   node validate-repos.js c3-parsing       # Validate single repo
 *   node validate-repos.js --fix            # Auto-fix issues
 *   node validate-repos.js --graph          # Show dependency graph
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const REPOS = [
  'c3-shared',
  'c3-parsing',
  'c3-compliance',
  'c3-projection',
  'c3-discovery',
  'c3-wiring',
  'c3-cli',
  'c3-bff',
  'c3-web',
];

const REPO_ROOT = path.resolve(process.cwd(), '..');

class ValidationError {
  constructor(repo, field, message) {
    this.repo = repo;
    this.field = field;
    this.message = message;
    this.severity = 'error';
  }
}

class ValidationWarning {
  constructor(repo, field, message) {
    this.repo = repo;
    this.field = field;
    this.message = message;
    this.severity = 'warning';
  }
}

class RepoValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.repoConfigs = new Map();
  }

  /**
   * Load all repository configurations
   */
  loadConfigs() {
    console.log('📂 Loading repository configurations...\n');
    
    for (const repo of REPOS) {
      const configPath = path.join(REPO_ROOT, repo, 'c3-repo.yaml');
      
      if (!fs.existsSync(configPath)) {
        this.warnings.push(
          new ValidationWarning(repo, 'config', `Missing c3-repo.yaml`)
        );
        continue;
      }

      try {
        const content = fs.readFileSync(configPath, 'utf8');
        const config = yaml.parse(content);
        this.repoConfigs.set(repo, config);
        console.log(`  ✓ Loaded ${repo}`);
      } catch (error) {
        this.errors.push(
          new ValidationError(repo, 'config', `Failed to parse: ${error.message}`)
        );
      }
    }
    
    console.log('');
  }

  /**
   * Validate individual repository configuration
   */
  validateRepoConfig(repo, config) {
    // Validate required fields
    if (config.name !== repo) {
      this.errors.push(
        new ValidationError(repo, 'name', `Name mismatch: "${config.name}" !== "${repo}"`)
      );
    }

    if (!config.type) {
      this.errors.push(
        new ValidationError(repo, 'type', 'Missing type field')
      );
    }

    if (config.layer === undefined) {
      this.errors.push(
        new ValidationError(repo, 'layer', 'Missing layer field')
      );
    }

    if (!config.dependencies) {
      this.errors.push(
        new ValidationError(repo, 'dependencies', 'Missing dependencies field')
      );
    }

    // Validate layer matches type
    const expectedLayers = {
      foundation: 0,
      context: 1,
      integration: 3,
      application: 4,
      orchestration: 5,
    };

    if (config.type && config.layer !== undefined) {
      const expectedLayer = expectedLayers[config.type];
      if (config.type === 'context' && (config.layer < 1 || config.layer > 2)) {
        this.warnings.push(
          new ValidationWarning(repo, 'layer', `Context layer should be 1 or 2, got ${config.layer}`)
        );
      } else if (config.type !== 'context' && config.layer !== expectedLayer) {
        this.warnings.push(
          new ValidationWarning(repo, 'layer', `Expected layer ${expectedLayer} for type ${config.type}, got ${config.layer}`)
        );
      }
    }

    // Validate tooling commands exist
    if (config.tooling) {
      const packageJsonPath = path.join(REPO_ROOT, repo, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (config.tooling.buildCommand && !packageJson.scripts?.build) {
          this.warnings.push(
            new ValidationWarning(repo, 'tooling.buildCommand', 'Build command specified but no "build" script in package.json')
          );
        }
        
        if (config.tooling.testCommand && !packageJson.scripts?.test) {
          this.warnings.push(
            new ValidationWarning(repo, 'tooling.testCommand', 'Test command specified but no "test" script in package.json')
          );
        }
      }
    }
  }

  /**
   * Validate dependency graph
   */
  validateDependencyGraph() {
    console.log('🔗 Validating dependency graph...\n');

    for (const [repo, config] of this.repoConfigs) {
      if (!config.dependencies) continue;

      for (const [dep, version] of Object.entries(config.dependencies)) {
        // Check if dependency exists
        if (!this.repoConfigs.has(dep)) {
          this.errors.push(
            new ValidationError(repo, 'dependencies', `Depends on unknown repo: ${dep}`)
          );
          continue;
        }

        const depConfig = this.repoConfigs.get(dep);
        
        // Check layer ordering (can only depend on lower layers)
        if (config.layer <= depConfig.layer && dep !== repo) {
          this.errors.push(
            new ValidationError(
              repo,
              'dependencies',
              `Layer violation: ${repo} (layer ${config.layer}) depends on ${dep} (layer ${depConfig.layer})`
            )
          );
        }

        // Check version format
        if (!/^[\^~]?\d+\.\d+\.\d+$/.test(version)) {
          this.errors.push(
            new ValidationError(repo, 'dependencies', `Invalid version format for ${dep}: ${version}`)
          );
        }

        // Cross-check with package.json
        const packageJsonPath = path.join(REPO_ROOT, repo, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const actualVersion = packageJson.dependencies?.[dep];
          
          if (!actualVersion) {
            this.warnings.push(
              new ValidationWarning(
                repo,
                'dependencies',
                `${dep} listed in c3-repo.yaml but not in package.json`
              )
            );
          } else if (actualVersion !== version) {
            this.warnings.push(
              new ValidationWarning(
                repo,
                'dependencies',
                `Version mismatch for ${dep}: c3-repo.yaml has ${version}, package.json has ${actualVersion}`
              )
            );
          }
        }
      }
    }
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies() {
    console.log('🔄 Checking for circular dependencies...\n');

    const visited = new Set();
    const stack = new Set();

    const visit = (repo, path = []) => {
      if (stack.has(repo)) {
        this.errors.push(
          new ValidationError(
            repo,
            'dependencies',
            `Circular dependency detected: ${[...path, repo].join(' → ')}`
          )
        );
        return;
      }

      if (visited.has(repo)) return;

      visited.add(repo);
      stack.add(repo);

      const config = this.repoConfigs.get(repo);
      if (config?.dependencies) {
        for (const dep of Object.keys(config.dependencies)) {
          visit(dep, [...path, repo]);
        }
      }

      stack.delete(repo);
    };

    for (const repo of this.repoConfigs.keys()) {
      visit(repo);
    }
  }

  /**
   * Generate build order
   */
  generateBuildOrder() {
    console.log('🏗️  Generating build order...\n');

    const graph = new Map();
    const inDegree = new Map();

    // Initialize
    for (const [repo, config] of this.repoConfigs) {
      graph.set(repo, []);
      inDegree.set(repo, 0);
    }

    // Build graph
    for (const [repo, config] of this.repoConfigs) {
      if (config.dependencies) {
        for (const dep of Object.keys(config.dependencies)) {
          if (graph.has(dep)) {
            graph.get(dep).push(repo);
            inDegree.set(repo, inDegree.get(repo) + 1);
          }
        }
      }
    }

    // Topological sort
    const queue = [];
    for (const [repo, degree] of inDegree) {
      if (degree === 0) queue.push(repo);
    }

    const buildOrder = [];
    while (queue.length > 0) {
      const currentLevel = [...queue];
      queue.length = 0;

      buildOrder.push(currentLevel);

      for (const repo of currentLevel) {
        for (const dependent of graph.get(repo)) {
          const newDegree = inDegree.get(dependent) - 1;
          inDegree.set(dependent, newDegree);
          if (newDegree === 0) {
            queue.push(dependent);
          }
        }
      }
    }

    // Display build order
    buildOrder.forEach((level, index) => {
      if (level.length === 1) {
        console.log(`  ${index + 1}. ${level[0]}`);
      } else {
        console.log(`  ${index + 1}. ${level.join(', ')} (parallel)`);
      }
    });

    console.log('');
    return buildOrder;
  }

  /**
   * Generate dependency graph visualization
   */
  generateDependencyGraph() {
    console.log('📊 Dependency Graph:\n');

    const layers = new Map();
    
    // Group by layer
    for (const [repo, config] of this.repoConfigs) {
      const layer = config.layer || 0;
      if (!layers.has(layer)) {
        layers.set(layer, []);
      }
      layers.get(layer).push(repo);
    }

    // Sort layers
    const sortedLayers = Array.from(layers.entries()).sort((a, b) => a[0] - b[0]);

    for (const [layer, repos] of sortedLayers) {
      console.log(`\nLayer ${layer}:`);
      for (const repo of repos) {
        const config = this.repoConfigs.get(repo);
        const deps = config.dependencies ? Object.keys(config.dependencies) : [];
        
        if (deps.length > 0) {
          console.log(`  ${repo}`);
          deps.forEach(dep => {
            console.log(`    └─► ${dep}`);
          });
        } else {
          console.log(`  ${repo} (no dependencies)`);
        }
      }
    }

    console.log('');
  }

  /**
   * Run all validations
   */
  async validate() {
    this.loadConfigs();

    console.log('🔍 Validating repository configurations...\n');

    for (const [repo, config] of this.repoConfigs) {
      this.validateRepoConfig(repo, config);
    }

    this.validateDependencyGraph();
    this.detectCircularDependencies();

    return this.getResults();
  }

  /**
   * Get validation results
   */
  getResults() {
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    console.log('═══════════════════════════════════════════════════\n');

    if (hasErrors) {
      console.log('❌ Errors:\n');
      this.errors.forEach(error => {
        console.log(`  ${error.repo} [${error.field}]`);
        console.log(`    ${error.message}\n`);
      });
    }

    if (hasWarnings) {
      console.log('⚠️  Warnings:\n');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.repo} [${warning.field}]`);
        console.log(`    ${warning.message}\n`);
      });
    }

    if (!hasErrors && !hasWarnings) {
      console.log('✅ All validations passed!\n');
    }

    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Summary: ${this.errors.length} errors, ${this.warnings.length} warnings\n`);

    return {
      success: !hasErrors,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}

// Main execution
const args = process.argv.slice(2);
const validator = new RepoValidator();

if (args.includes('--graph')) {
  validator.loadConfigs();
  validator.generateDependencyGraph();
} else if (args.includes('--build-order')) {
  validator.loadConfigs();
  validator.generateBuildOrder();
} else {
  validator.validate().then(results => {
    if (args.includes('--build-order-after')) {
      validator.generateBuildOrder();
    }
    process.exit(results.success ? 0 : 1);
  });
}


