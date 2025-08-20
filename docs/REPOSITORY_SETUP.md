# Repository Setup Guide

## 1. Branch Protection Rules

### Configure Main Branch Protection

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Configure protection settings:

#### Required Settings:

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 1
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from CODEOWNERS (optional)
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Add status checks:
    - `test (18)`
    - `test (20)`
    - `test (22)`

- ✅ **Require conversation resolution before merging**
- ✅ **Require linear history** (optional, for cleaner git history)
- ✅ **Include administrators** (optional, enforce for admins too)

#### Allow Bypass for Bots:

- ✅ **Allow specified actors to bypass**
  - Add: `github-actions[bot]` (for Release Please)
  - Add: Your username (for emergency fixes)

## 2. GitHub Actions Permissions

### Enable GitHub Actions to Create PRs

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select: **Read and write permissions**
4. ✅ **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

### Repository Settings for Release Please

1. Go to **Settings** → **General**
2. Under **Pull Requests**, ensure:
   - ✅ Allow merge commits
   - ✅ Allow squash merging
   - ✅ Allow auto-merge

## 3. Create GitHub App Token (Optional - More Secure)

For better security, create a GitHub App instead of using GITHUB_TOKEN:

### Create GitHub App:

1. Go to **Settings** → **Developer settings** → **GitHub Apps**
2. Click **New GitHub App**
3. App name: `barrel-craft-release`
4. Homepage URL: `https://github.com/marcioaltoe/barrel-craft`
5. Webhook: Uncheck **Active**
6. Permissions:
   - **Repository permissions:**
     - Contents: Write
     - Pull requests: Write
     - Metadata: Read
7. Click **Create GitHub App**

### Install GitHub App:

1. After creation, click **Install App**
2. Select your repository
3. Click **Install**

### Generate Private Key:

1. In GitHub App settings, scroll to **Private keys**
2. Click **Generate a private key**
3. Save the `.pem` file

### Add Secrets to Repository:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `APP_ID`: Your GitHub App ID
   - `APP_PRIVATE_KEY`: Contents of the `.pem` file

## 4. Update Release Please Workflow (if using GitHub App)

If using GitHub App, update `.github/workflows/release.yml`:

```yaml
name: Release Please

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      # If using GitHub App (recommended)
      - uses: actions/create-github-app-token@v1
        id: app-token
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ steps.app-token.outputs.token || secrets.GITHUB_TOKEN }}
          release-type: node
          package-name: barrel-craft
          changelog-types: '[
            {"type": "feat", "section": "Features", "hidden": false},
            {"type": "fix", "section": "Bug Fixes", "hidden": false},
            {"type": "chore", "section": "Miscellaneous", "hidden": false},
            {"type": "docs", "section": "Documentation", "hidden": false},
            {"type": "style", "section": "Styles", "hidden": false},
            {"type": "refactor", "section": "Code Refactoring", "hidden": false},
            {"type": "perf", "section": "Performance Improvements", "hidden": false},
            {"type": "test", "section": "Tests", "hidden": false}
          ]'

  # ... rest of the workflow remains the same
```

## 5. Configure Release Please

### Create Configuration Files

#### `.release-please-manifest.json`

```json
{
  ".": "0.1.0"
}
```

#### `release-please-config.json`

```json
{
  "packages": {
    ".": {
      "changelog-path": "CHANGELOG.md",
      "release-type": "node",
      "bump-minor-pre-major": false,
      "bump-patch-for-minor-pre-major": false,
      "draft": false,
      "prerelease": false
    }
  },
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json"
}
```

## 6. NPM Token Setup

1. Go to [npmjs.com](https://www.npmjs.com/)
2. Sign in → Profile → Access Tokens
3. Generate New Token → Classic Token → Automation
4. Copy token
5. Go to GitHub repository → Settings → Secrets → Actions
6. Add secret: `NPM_TOKEN` = your-token

## 7. Workflow Summary

After setup, your workflow will be:

1. **Development:**
   - Create feature branch: `git checkout -b feat/new-feature`
   - Make changes and commit using conventional commits
   - Push branch: `git push origin feat/new-feature`
   - Create PR via GitHub

2. **CI Checks:**
   - GitHub Actions runs tests on PR
   - Required checks must pass
   - PR needs approval (if configured)

3. **Merge:**
   - Merge PR to main
   - Release Please creates a release PR automatically

4. **Release:**
   - Review and merge the Release Please PR
   - Package automatically publishes to npm
   - GitHub release is created with changelog

## 8. Initial Release

For the first release after setup:

```bash
# Make sure everything is committed
git add .
git commit -m "chore: configure repository for automated releases"
git push origin main

# Create initial tag for Release Please to track
git tag v0.1.0
git push origin v0.1.0
```

## Troubleshooting

### "GitHub Actions is not permitted to create or approve pull requests"

- Go to Settings → Actions → General → Workflow permissions
- Enable "Allow GitHub Actions to create and approve pull requests"

### Release Please not creating PRs

- Check if conventional commits are being used
- Verify workflow permissions are correct
- Check GitHub Actions logs for errors

### NPM publish failing

- Verify NPM_TOKEN is set correctly
- Check token has Automation permissions
- Ensure package.json version is correct
