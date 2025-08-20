#!/bin/bash

# Simple release script for barrel-craft
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Preparing $VERSION_TYPE release...${NC}"

# Ensure working directory is clean
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}❌ Error: Working directory is not clean. Commit or stash changes first.${NC}"
  exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
bun run test

# Run build
echo -e "${YELLOW}🔨 Building...${NC}"
bun run build

# Bump version
echo -e "${YELLOW}📝 Bumping version...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Commit version bump
echo -e "${YELLOW}💾 Committing version bump...${NC}"
git add package.json
git commit -m "chore: release v$NEW_VERSION"

# Create and push tag
echo -e "${YELLOW}🏷️  Creating tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes
echo -e "${YELLOW}🚀 Pushing to origin...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo -e "${GREEN}✅ Release v$NEW_VERSION created successfully!${NC}"
echo -e "${GREEN}📦 GitHub Actions will now publish to npm...${NC}"