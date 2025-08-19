# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

barrel-buddy is a npm CLI package for generating clean and consistent barrel files (`index.ts` and `index.tsx`) for TypeScript and React projects. This tool will be published to npm and used across multiple projects.

## Project Status

✅ **INITIALIZED** - Core structure implemented and ready for development/publishing.

## Architecture

NPM CLI package structure:

- CLI tool built with TypeScript
- **Runtime**: Node.js (for maximum compatibility)
- **Development**: Bun as package manager and dev runtime (faster development)
- **Linting & Formatting**: Biome.js + Prettier
- **Testing**: Vitest with coverage
- **Build**: TypeScript compilation to CommonJS
- Cross-platform compatibility

## Development Commands

**Daily Development:**

- `bun install` - Install dependencies
- `bun run dev` - Development mode with file watching
- `bun run test` - Run tests
- `bun run test:watch` - Run tests in watch mode

**Code Quality:**

- `bun run format` - Format all code (Biome + Prettier for MD/package.json)
- `bun run format:md` - Format only Markdown files
- `bun run format:pkg` - Format package.json
- `bun run lint` - Lint and auto-fix with Biome
- `bun run lint:fix` - Lint with unsafe fixes
- `bun run typecheck` - TypeScript type checking

**Build & Release:**

- `bun run build` - Build for distribution
- `bun run clean` - Clean dist folder
- `bun run compile` - TypeScript compilation only
- `bun run prepublishOnly` - Pre-publish validation (build + test + lint)
- `npm publish` - Publish to npm registry

**Testing:**

- `bun run test:ui` - Run tests with UI interface

## Project Structure

```
src/
├── core/
│   └── BarrelGenerator.ts    # Main barrel generation logic
├── types/
│   └── index.ts              # TypeScript interfaces
├── cli.ts                    # CLI entry point
└── index.ts                  # Library exports

tests/
└── BarrelGenerator.test.ts   # Unit tests

dist/                         # Build output (git ignored)
├── cli.js                    # CLI executable
└── *.js + *.d.ts            # Compiled library
```

## Package Configuration

**NPM Package Setup (✅ Completed):**

- `package.json` with proper `bin` field (`barrel-buddy` → `dist/cli.js`)
- TypeScript compilation to CommonJS for Node.js compatibility
- CLI entry point with Node.js shebang (`#!/usr/bin/env node`)
- Dependencies: `commander`, `glob`
- DevDependencies: `@biomejs/biome`, `vitest`, `prettier`, etc.
- Target Node.js >=18.0.0

**Publishing Workflow (✅ Ready):**

- `prepublishOnly` script runs: build + test + lint
- Only `dist/` folder included in published package
- Automated quality checks prevent bad publishes

## CLI Usage

The CLI is ready and functional:

```bash
# Basic usage
barrel-buddy                    # Generate barrel in current directory
barrel-buddy ./src/components   # Generate barrel in specific directory

# Options
barrel-buddy -e ts tsx js       # Custom extensions
barrel-buddy -x "*.test.*"      # Custom exclude patterns
barrel-buddy -s                 # Include subdirectories
barrel-buddy --no-sort          # Don't sort exports
barrel-buddy --help             # Show help
```

## Implementation Notes

**Current Features (✅ Implemented):**

- Supports both `.ts` and `.tsx` barrel generation
- Configurable via CLI arguments (`-e`, `-x`, `-s`, `--no-sort`)
- Cross-platform file system operations using `node:path` and `node:fs`
- Robust error handling with proper exit codes
- Excludes test files by default (`*.test.*`, `*.spec.*`)
- Smart barrel naming (`.tsx` if any TSX files present, otherwise `.ts`)

**Development Standards:**

- Uses `node:` import protocol for Node.js modules
- Template literals preferred over string concatenation
- Type-only imports where appropriate
- Comprehensive test coverage with Vitest
