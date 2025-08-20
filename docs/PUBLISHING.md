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

## Publishing Methods

### Method 1: Automatic Release (Recommended)

Uses [Release Please](https://github.com/googleapis/release-please) to automate versioning and publishing.

1. Merge PRs to `main` branch
2. Release Please creates a PR with version bumps
3. Merge the Release PR
4. Package is automatically published to npm

### Method 2: Manual Release via Tags

1. Update version in `package.json`
2. Commit and push to main
3. Create and push a tag:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
4. Package is automatically published to npm

### Method 3: GitHub Release

1. Go to Releases page
2. Create a new release
3. Create a new tag (e.g., `v0.1.0`)
4. Publish release
5. Package is automatically published to npm

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

## CI/CD Pipeline

The CI workflow runs on:

- Every push to `main`
- Every pull request

It performs:

- Type checking
- Linting
- Testing
- Building
- Package installation test

## Local Publishing (Testing)

To test the publish process locally:

```bash
# Build and create package
bun run build
npm pack

# Test global installation
npm install -g ./barrel-craft-*.tgz

# Verify installation
barrel-craft --version

# Dry run publish (doesn't actually publish)
npm publish --dry-run
```

## Troubleshooting

### npm Token Issues

- Ensure the token has "Automation" permissions
- Check token hasn't expired
- Verify `NPM_TOKEN` secret is correctly set in GitHub

### Build Failures

- Run `bun run build` locally to check for errors
- Ensure all tests pass: `bun run test`
- Check TypeScript compilation: `bun run type-check`

### Version Conflicts

- Check npm for existing versions: `npm view barrel-craft versions`
- Ensure version in `package.json` is higher than latest published
