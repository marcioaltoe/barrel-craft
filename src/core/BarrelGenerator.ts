import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { glob } from 'glob'
import type { BarrelConfig, BarrelGenerationResult, FileInfo } from '../types'

export class BarrelGenerator {
  constructor(private config: BarrelConfig) {}

  async generateBarrels(directory: string): Promise<BarrelGenerationResult[]> {
    const resolvedDir = path.resolve(directory)

    // Check if directory exists
    try {
      await fs.access(resolvedDir)
    } catch {
      throw new Error(`Directory does not exist: ${directory}`)
    }

    const results: BarrelGenerationResult[] = []

    if (this.config.includeSubdirectories) {
      // Find all subdirectories and generate barrels for each
      const subdirs = await this.findSubdirectories(resolvedDir)
      for (const subdir of subdirs) {
        const result = await this.generateBarrelForDirectory(subdir)
        if (result) results.push(result)
      }
    } else {
      // Generate barrel only for the specified directory
      const result = await this.generateBarrelForDirectory(resolvedDir)
      if (result) results.push(result)
    }

    return results
  }

  private async generateBarrelForDirectory(
    directory: string,
  ): Promise<BarrelGenerationResult | null> {
    const files = await this.getEligibleFiles(directory)

    if (files.length === 0) {
      return null
    }

    const exports = this.generateExportStatements(files, directory)
    const barrelPath = path.join(directory, this.getBarrelFileName(files))

    await fs.writeFile(barrelPath, `${exports.join('\n')}\n`)

    return {
      filePath: barrelPath,
      content: exports.join('\n'),
      exportsCount: exports.length,
    }
  }

  private async getEligibleFiles(directory: string): Promise<FileInfo[]> {
    const patterns = this.config.extensions.map((ext) => `*.${ext}`)
    const files: FileInfo[] = []

    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: directory,
        ignore: this.config.excludePatterns,
      })

      for (const match of matches) {
        const fullPath = path.join(directory, match)
        const stat = await fs.stat(fullPath)

        if (!stat.isFile()) continue

        // Skip existing barrel files
        if (match === 'index.ts' || match === 'index.tsx') continue

        files.push({
          path: fullPath,
          name: path.parse(match).name,
          extension: path.extname(match),
          isDirectory: false,
        })
      }
    }

    return files
  }

  private generateExportStatements(files: FileInfo[], directory: string): string[] {
    let exports = files.map((file) => {
      const relativePath = path.relative(directory, file.path)
      const importPath = `./${relativePath.replace(/\.(ts|tsx)$/, '')}`
      return `export * from '${importPath}'`
    })

    if (this.config.sortExports) {
      exports = exports.sort()
    }

    return exports
  }

  private getBarrelFileName(files: FileInfo[]): string {
    // Use .tsx if any of the files are .tsx, otherwise use .ts
    const hasTsx = files.some((file) => file.extension === '.tsx')
    return hasTsx ? 'index.tsx' : 'index.ts'
  }

  private async findSubdirectories(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const subdirs = [directory] // Include the root directory

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subdirPath = path.join(directory, entry.name)
        const nestedSubdirs = await this.findSubdirectories(subdirPath)
        subdirs.push(...nestedSubdirs)
      }
    }

    return subdirs
  }
}
