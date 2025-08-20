#!/bin/bash

# Enhanced release script for barrel-craft with automatic changelog
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Barrel-Craft Release Script${NC}"
echo -e "${YELLOW}📦 Preparing $VERSION_TYPE release...${NC}"

# Ensure working directory is clean
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}❌ Error: Working directory is not clean. Commit or stash changes first.${NC}"
  exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: $CURRENT_VERSION${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
bun run test

# Run build
echo -e "${YELLOW}🔨 Building...${NC}"
bun run build

# Run linting
echo -e "${YELLOW}🔍 Linting...${NC}"
bun run lint

# Bump version
echo -e "${YELLOW}📝 Bumping version...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}New version: $NEW_VERSION${NC}"

# Generate changelog entry
echo -e "${YELLOW}📄 Generating changelog...${NC}"
CHANGELOG_ENTRY="## [$NEW_VERSION] - $(date +%Y-%m-%d)\n"

# Get commit messages since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -z "$LAST_TAG" ]; then
  echo "No previous tags found, using all commits"
  COMMITS=$(git log --pretty=format:"%s (%h)" --no-merges)
else
  echo "Getting commits since $LAST_TAG"
  COMMITS=$(git log $LAST_TAG..HEAD --pretty=format:"%s (%h)" --no-merges)
fi

# Parse commits into categories
FEATURES=""
FIXES=""
DOCS=""
CHORES=""
OTHERS=""

while IFS= read -r commit; do
  if [[ $commit == feat:* ]] || [[ $commit == feat\(*\):* ]]; then
    FEATURES="$FEATURES- $commit\n"
  elif [[ $commit == fix:* ]] || [[ $commit == fix\(*\):* ]]; then
    FIXES="$FIXES- $commit\n"
  elif [[ $commit == docs:* ]] || [[ $commit == docs\(*\):* ]]; then
    DOCS="$DOCS- $commit\n"
  elif [[ $commit == chore:* ]] || [[ $commit == chore\(*\):* ]]; then
    CHORES="$CHORES- $commit\n"
  else
    OTHERS="$OTHERS- $commit\n"
  fi
done <<< "$COMMITS"

# Build changelog entry
if [ -n "$FEATURES" ]; then
  CHANGELOG_ENTRY="$CHANGELOG_ENTRY\n### 🎉 Features\n$FEATURES"
fi
if [ -n "$FIXES" ]; then
  CHANGELOG_ENTRY="$CHANGELOG_ENTRY\n### 🐛 Bug Fixes\n$FIXES"
fi
if [ -n "$DOCS" ]; then
  CHANGELOG_ENTRY="$CHANGELOG_ENTRY\n### 📚 Documentation\n$DOCS"
fi
if [ -n "$CHORES" ]; then
  CHANGELOG_ENTRY="$CHANGELOG_ENTRY\n### 🧹 Chores\n$CHORES"
fi
if [ -n "$OTHERS" ]; then
  CHANGELOG_ENTRY="$CHANGELOG_ENTRY\n### 📦 Other Changes\n$OTHERS"
fi

# Update CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
  # Insert new entry after the header
  echo -e "${YELLOW}📝 Updating CHANGELOG.md...${NC}"
  
  # Create temp file with new entry
  echo "# Changelog" > CHANGELOG.tmp.md
  echo "" >> CHANGELOG.tmp.md
  echo "All notable changes to this project will be documented in this file." >> CHANGELOG.tmp.md
  echo "" >> CHANGELOG.tmp.md
  echo "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)," >> CHANGELOG.tmp.md
  echo "and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)." >> CHANGELOG.tmp.md
  echo "" >> CHANGELOG.tmp.md
  echo -e "$CHANGELOG_ENTRY" >> CHANGELOG.tmp.md
  echo "" >> CHANGELOG.tmp.md
  
  # Append rest of old changelog (skip header lines)
  tail -n +8 CHANGELOG.md >> CHANGELOG.tmp.md 2>/dev/null || true
  
  # Replace old changelog
  mv CHANGELOG.tmp.md CHANGELOG.md
fi

# Commit version bump and changelog
echo -e "${YELLOW}💾 Committing version bump and changelog...${NC}"
git add package.json CHANGELOG.md
git commit -m "chore: release v$NEW_VERSION

[skip ci]"

# Create and push tag
echo -e "${YELLOW}🏷️  Creating tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

$CHANGELOG_ENTRY"

# Push changes
echo -e "${YELLOW}🚀 Pushing to origin...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo -e "${GREEN}✅ Release v$NEW_VERSION created successfully!${NC}"
echo -e "${GREEN}📦 GitHub Actions will now:${NC}"
echo -e "${GREEN}  1. Create GitHub Release${NC}"
echo -e "${GREEN}  2. Publish to npm${NC}"
echo -e "${GREEN}  3. Update release notes${NC}"

# Show changelog entry
echo -e "${BLUE}📋 Release Notes:${NC}"
echo -e "$CHANGELOG_ENTRY"