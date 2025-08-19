import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BarrelGenerator } from '../src/core/barrel-generator'
import type { BarrelConfig, FileConfig } from '../src/types'
import * as configLoader from '../src/utils/config-loader'

describe('BarrelGenerator', () => {
  const testDir = path.join(__dirname, 'temp-fixed')
  let generator: BarrelGenerator

  const defaultConfig: BarrelConfig = {
    extensions: ['ts', 'tsx'],
    excludePatterns: ['*.test.*', '*.spec.*'],
    includeSubdirectories: false,
    sortExports: true,
  }

  beforeEach(async () => {
    generator = new BarrelGenerator(defaultConfig)
    await fs.mkdir(testDir, { recursive: true })
    vi.clearAllMocks()
  })

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('generateBarrels', () => {
    it('should throw error for non-existent directory', async () => {
      const nonExistentDir = path.join(testDir, 'does-not-exist')

      await expect(generator.generateBarrels(nonExistentDir)).rejects.toThrow(
        `Directory does not exist: ${nonExistentDir}`,
      )
    })

    it('should generate barrel file for directory with TypeScript files', async () => {
      await fs.writeFile(path.join(testDir, 'component-a.ts'), 'export const ComponentA = {}')
      await fs.writeFile(path.join(testDir, 'component-b.tsx'), 'export const ComponentB = {}')

      const results = await generator.generateBarrels(testDir)

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        filePath: path.join(testDir, 'index.tsx'),
        exportsCount: 2,
        mode: 'normal',
      })

      const barrelContent = await fs.readFile(path.join(testDir, 'index.tsx'), 'utf8')
      expect(barrelContent).toContain("export * from './component-a'")
      expect(barrelContent).toContain("export * from './component-b'")
    })

    it('should use .ts extension when no .tsx files present', async () => {
      await fs.writeFile(path.join(testDir, 'util-a.ts'), 'export const utilA = {}')
      await fs.writeFile(path.join(testDir, 'util-b.ts'), 'export const utilB = {}')

      const results = await generator.generateBarrels(testDir)

      expect(results[0].filePath).toBe(path.join(testDir, 'index.ts'))
    })

    it('should exclude files matching exclude patterns', async () => {
      await fs.writeFile(path.join(testDir, 'component.ts'), 'export const Component = {}')
      await fs.writeFile(path.join(testDir, 'component.test.ts'), 'export const Test = {}')
      await fs.writeFile(path.join(testDir, 'component.spec.ts'), 'export const Spec = {}')

      const results = await generator.generateBarrels(testDir)

      expect(results[0].exportsCount).toBe(1)
      const content = await fs.readFile(results[0].filePath, 'utf8')
      expect(content).toContain("export * from './component'")
      expect(content).not.toContain('test')
      expect(content).not.toContain('spec')
    })

    it('should sort exports when sortExports is true', async () => {
      await fs.writeFile(path.join(testDir, 'zebra.ts'), 'export const Zebra = {}')
      await fs.writeFile(path.join(testDir, 'alpha.ts'), 'export const Alpha = {}')
      await fs.writeFile(path.join(testDir, 'beta.ts'), 'export const Beta = {}')

      const results = await generator.generateBarrels(testDir)

      const content = await fs.readFile(results[0].filePath, 'utf8')
      const lines = content.split('\n').filter((line) => line.trim())

      expect(lines[0]).toBe("export * from './alpha'")
      expect(lines[1]).toBe("export * from './beta'")
      expect(lines[2]).toBe("export * from './zebra'")
    })

    it('should add header comment when provided', async () => {
      const config = { ...defaultConfig, headerComment: '// Auto-generated file\n\n' }
      generator = new BarrelGenerator(config)

      await fs.writeFile(path.join(testDir, 'component.ts'), 'export const Component = {}')

      const results = await generator.generateBarrels(testDir)

      const content = await fs.readFile(results[0].filePath, 'utf8')
      expect(content.startsWith('// Auto-generated file\n\n')).toBe(true)
    })

    it('should return empty results when no eligible files found', async () => {
      await fs.writeFile(path.join(testDir, 'README.md'), 'readme content')
      await fs.writeFile(path.join(testDir, 'package.json'), '{}')

      const results = await generator.generateBarrels(testDir)

      expect(results).toHaveLength(0)
    })

    it('should exclude .d.ts files', async () => {
      await fs.writeFile(path.join(testDir, 'types.d.ts'), 'declare module "test"')
      await fs.writeFile(path.join(testDir, 'component.ts'), 'export const Component = {}')

      const results = await generator.generateBarrels(testDir)

      expect(results[0].exportsCount).toBe(1)
      const content = await fs.readFile(results[0].filePath, 'utf8')
      expect(content).toContain("export * from './component'")
      expect(content).not.toContain('types')
    })
  })

  describe('config file integration', () => {
    it('should load config file when configFile option provided', async () => {
      const mockFileConfig: FileConfig = {
        headerComment: '// Config header\n',
        targets: [testDir],
        forceGenerate: [],
        exclude: ['*.test.*'],
        extensions: ['ts', 'tsx'],
        sortExports: false,
      }

      const configPath = path.join(testDir, 'barrel.config.json')
      const loadConfigSpy = vi
        .spyOn(configLoader, 'loadConfigFile')
        .mockResolvedValue(mockFileConfig)
      const config = { ...defaultConfig, configFile: configPath }
      generator = new BarrelGenerator(config)

      await fs.writeFile(path.join(testDir, 'button.tsx'), 'export const Button = {}')

      const results = await generator.generateBarrels(testDir)

      expect(loadConfigSpy).toHaveBeenCalledWith(configPath)
      expect(results).toHaveLength(1)

      const content = await fs.readFile(results[0].filePath, 'utf8')
      expect(content.startsWith('// Config header\n')).toBe(true)
    })

    it('should auto-discover config file when none specified', async () => {
      const mockFileConfig: FileConfig = {
        headerComment: '// Auto header\n',
        targets: [testDir],
        forceGenerate: [],
        exclude: ['*.test.*'],
        extensions: ['ts'],
        sortExports: true,
      }

      const configPath = path.join(testDir, 'barrel-craft.json')
      const findConfigSpy = vi.spyOn(configLoader, 'findConfigFile').mockResolvedValue(configPath)
      const loadConfigSpy = vi
        .spyOn(configLoader, 'loadConfigFile')
        .mockResolvedValue(mockFileConfig)

      await fs.writeFile(path.join(testDir, 'component.ts'), 'export const Component = {}')

      const results = await generator.generateBarrels(testDir)

      expect(findConfigSpy).toHaveBeenCalledWith(path.resolve(testDir))
      expect(loadConfigSpy).toHaveBeenCalledWith(configPath)
      expect(results).toHaveLength(1)
    })
  })
})
