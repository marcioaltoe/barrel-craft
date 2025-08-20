# Publishing to npm

This project uses GitHub Actions to automate the publishing process to npm.

## Setup

### 1. Create npm Token

1. Go to [npmjs.com](https://www.npmjs.com/) and sign in
2. Click on your profile → Access Tokens
3. Generate New Token → Classic Token
4. Select "Automation" type
5. Copy the token

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token

## Publishing Process

### Automatic Publishing (via Scripts)

The easiest way to publish a new version:

```bash
# For patch release (1.0.x) - bug fixes
npm run release:patch

# For minor release (1.x.0) - new features
npm run release:minor

# For major release (x.0.0) - breaking changes
npm run release:major
```

These scripts will:
1. Run tests
2. Build the project
3. Bump the version in package.json
4. Create a git commit and tag
5. Push to GitHub
6. GitHub Actions will automatically publish to npm

### Manual Publishing Process

1. **Update version manually:**
   ```bash
   npm version patch  # or minor, or major
   ```

2. **Create and push tag:**
   ```bash
   git push origin main
   git push origin --tags
   ```

3. **GitHub Actions automatically publishes when detecting a `v*` tag**

### Direct GitHub Release

1. Go to repository Releases page
2. Click "Create a new release"
3. Create a new tag (e.g., `v1.0.4`)
4. Write release notes
5. Publish release
6. GitHub Actions automatically publishes to npm

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (1.x.0): New features (backwards compatible)
- **PATCH** (1.0.x): Bug fixes

## CI/CD Pipeline

### Continuous Integration (CI)

Runs on every push and pull request:
- Type checking
- Linting
- Testing on Node.js 18, 20, 22
- Build verification
- Package installation test

### Continuous Deployment (CD)

Triggers on tag push (`v*`):
- Runs all tests
- Builds the package
- Publishes to npm registry

## Local Testing

### Test the package locally before publishing:

```bash
# Build and create package
bun run build
npm pack

# Test local installation
npm install -g ./barrel-craft-*.tgz

# Verify it works
barrel-craft --version
barrel-craft init

# Cleanup
npm uninstall -g barrel-craft
rm barrel-craft-*.tgz
```

### Dry run publish (doesn't actually publish):

```bash
npm publish --dry-run
```

## Troubleshooting

### npm Token Issues

- Ensure the token has "Automation" permissions
- Check token hasn't expired
- Verify `NPM_TOKEN` secret is correctly set in GitHub

### Build Failures

```bash
# Check build locally
bun run build

# Run all tests
bun run test

# Check TypeScript
bun run type-check

# Check linting
bun run lint
```

### Version Conflicts

```bash
# Check existing versions on npm
npm view barrel-craft versions

# Check current version
npm view barrel-craft version

# Ensure your version is higher than latest
```

### Publishing Fails

1. Check GitHub Actions logs for errors
2. Verify NPM_TOKEN is set correctly
3. Ensure version hasn't been published before
4. Check package name availability on npm

### npm 24-Hour Republish Restriction

If you recently unpublished a package from npm, you must wait 24 hours before republishing with the same package name. This is an npm security policy to prevent abuse.

**Error message:** `403 Forbidden - barrel-craft cannot be republished until 24 hours have passed`

**Solution:**
- Wait 24 hours from the unpublish time
- The package can be republished after approximately 2025-08-21 at the same time you unpublished
- Once the waiting period passes, simply push a new tag or run the release script again

## Development Workflow

1. Create feature branch
2. Make changes
3. Run tests locally: `bun test`
4. Create PR
5. Wait for CI to pass
6. Merge to main
7. Run release script: `npm run release:patch`
8. Package automatically publishes to npm