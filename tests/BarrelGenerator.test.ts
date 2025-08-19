import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BarrelGenerator } from '../src/core/BarrelGenerator'
import type { BarrelConfig } from '../src/types'

describe('BarrelGenerator', () => {
  const testDir = path.join(__dirname, 'temp')
  let generator: BarrelGenerator

  beforeEach(async () => {
    const config: BarrelConfig = {
      extensions: ['ts', 'tsx'],
      excludePatterns: ['*.test.*', '*.spec.*'],
      includeSubdirectories: false,
      sortExports: true,
    }
    generator = new BarrelGenerator(config)

    // Create test directory
    await fs.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true })
  })

  it('should generate barrel file for TypeScript files', async () => {
    // Create test files
    await fs.writeFile(path.join(testDir, 'component.ts'), 'export const Component = {}')
    await fs.writeFile(path.join(testDir, 'utils.ts'), 'export const utils = {}')

    const results = await generator.generateBarrels(testDir)

    expect(results).toHaveLength(1)
    expect(results[0].exportsCount).toBe(2)
    expect(results[0].content).toContain("export * from './component'")
    expect(results[0].content).toContain("export * from './utils'")
  })

  it('should use .tsx extension when TSX files are present', async () => {
    // Create test files
    await fs.writeFile(
      path.join(testDir, 'Component.tsx'),
      'export const Component = () => <div />',
    )
    await fs.writeFile(path.join(testDir, 'utils.ts'), 'export const utils = {}')

    const results = await generator.generateBarrels(testDir)

    expect(results[0].filePath).toMatch(/index\.tsx$/)
  })

  it('should exclude test files by default', async () => {
    // Create test files
    await fs.writeFile(path.join(testDir, 'component.ts'), 'export const Component = {}')
    await fs.writeFile(path.join(testDir, 'component.test.ts'), 'test')

    const results = await generator.generateBarrels(testDir)

    expect(results[0].exportsCount).toBe(1)
    expect(results[0].content).not.toContain('test')
  })
})
