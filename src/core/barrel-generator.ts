import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { glob } from 'glob'
import { minimatch } from 'minimatch'
import type { BarrelConfig, BarrelGenerationResult, FileConfig, FileInfo } from '../types'
import { findConfigFile, loadConfigFile } from '../utils/config-loader'

export class BarrelGenerator {
  private fileConfig?: FileConfig

  constructor(private config: BarrelConfig) {}

  private shouldIncludeSubdirectories(): boolean {
    // Use file config if available, otherwise use CLI config
    return this.fileConfig?.subdirectories ?? this.config.includeSubdirectories
  }

  private shouldShowVerboseOutput(): boolean {
    // Use CLI config first (if explicitly set), otherwise use file config
    return this.config.verbose || (this.fileConfig?.verbose ?? false)
  }

  public isVerbose(): boolean {
    return this.shouldShowVerboseOutput()
  }

  async generateBarrels(directory: string): Promise<BarrelGenerationResult[]> {
    const resolvedDir = path.resolve(directory)

    // Try to load config file if specified or found
    if (this.config.configFile) {
      this.fileConfig = await loadConfigFile(this.config.configFile)
    } else {
      const configPath = await findConfigFile(resolvedDir)
      if (configPath) {
        this.fileConfig = await loadConfigFile(configPath)
      }
    }

    // Check if directory exists
    try {
      await fs.access(resolvedDir)
    } catch {
      throw new Error(`Directory does not exist: ${directory}`)
    }

    const results: BarrelGenerationResult[] = []

    // If we have file config, use its target directories
    if (this.fileConfig) {
      // Process target directories (normal mode)
      for (const target of this.fileConfig.targets) {
        const targetPath = path.resolve(target)
        if (await this.directoryExists(targetPath)) {
          const targetResults = await this.processDirectory(targetPath, 'normal')
          results.push(...targetResults)
        }
      }

      // Process force generate directories
      for (const forceDir of this.fileConfig.forceGenerate) {
        const forcePath = path.resolve(forceDir)
        if (await this.directoryExists(forcePath)) {
          const forceResults = await this.processForceGenerateDirectory(forcePath)
          results.push(...forceResults)
        }
      }
    } else {
      // Original logic for CLI usage
      if (this.shouldIncludeSubdirectories()) {
        const subdirs = await this.findSubdirectories(resolvedDir)
        for (const subdir of subdirs) {
          const result = await this.generateBarrelForDirectory(subdir, 'normal')
          if (result) results.push(result)
        }
      } else {
        const result = await this.generateBarrelForDirectory(resolvedDir, 'normal')
        if (result) results.push(result)
      }
    }

    return results
  }

  private async processDirectory(
    directory: string,
    mode: 'normal' | 'forced',
  ): Promise<BarrelGenerationResult[]> {
    const results: BarrelGenerationResult[] = []

    if (this.isExcluded(directory)) {
      return results
    }

    if (this.shouldIncludeSubdirectories()) {
      const subdirs = await this.findSubdirectories(directory)
      for (const subdir of subdirs) {
        const result = await this.generateBarrelForDirectory(subdir, mode)
        if (result) results.push(result)
      }
    } else {
      const result = await this.generateBarrelForDirectory(directory, mode)
      if (result) results.push(result)
    }

    return results
  }

  private async processForceGenerateDirectory(
    directory: string,
  ): Promise<BarrelGenerationResult[]> {
    const results: BarrelGenerationResult[] = []

    if (this.isExcluded(directory)) {
      return results
    }

    const { dirs, files } = await this.getDirsAndFiles(directory)

    // Process subdirectories recursively
    const validSubDirs: string[] = []
    for (const subDir of dirs) {
      const subDirPath = path.join(directory, subDir)
      const subResults = await this.processForceGenerateDirectory(subDirPath)
      if (subResults.length > 0) {
        validSubDirs.push(subDir)
        results.push(...subResults)
      }
    }

    // Filter valid source files
    const validFiles = files.filter((file) => this.isValidSourceFile(file.name))

    // Generate barrel if we have content or valid subdirectories
    if (validFiles.length > 0 || validSubDirs.length > 0) {
      const result = await this.generateBarrelWithContent(
        directory,
        validFiles,
        validSubDirs,
        'forced',
      )
      if (result) {
        results.push(result)
      }
    }

    return results
  }

  private async generateBarrelForDirectory(
    directory: string,
    mode: 'normal' | 'forced',
  ): Promise<BarrelGenerationResult | null> {
    const files = await this.getEligibleFiles(directory)

    if (files.length === 0 && mode === 'normal') {
      return null
    }

    const exports = this.generateExportStatements(files, directory)
    const barrelPath = path.join(directory, this.getBarrelFileName(files))

    // Check if index.tsx already exists to avoid overwriting
    if (barrelPath.endsWith('index.ts')) {
      const indexTsxPath = path.join(directory, 'index.tsx')
      if (await this.fileExists(indexTsxPath)) {
        return null // Skip generation
      }
    }

    const content = this.getFileContent(exports)
    await fs.writeFile(barrelPath, content)

    return {
      filePath: barrelPath,
      content: exports.join('\n'),
      exportsCount: exports.length,
      mode,
    }
  }

  private async generateBarrelWithContent(
    directory: string,
    files: FileInfo[],
    subDirs: string[],
    mode: 'normal' | 'forced',
  ): Promise<BarrelGenerationResult | null> {
    const exports: string[] = []

    // Add subdirectory exports
    for (const subDir of subDirs) {
      exports.push(`export * from './${subDir}'`)
    }

    // Add file exports
    for (const file of files) {
      const relativePath = path.relative(directory, file.path)
      const importPath = `./${relativePath.replace(/\.(ts|tsx)$/, '')}`
      exports.push(`export * from '${importPath}'`)
    }

    if (exports.length === 0) {
      return null
    }

    const sortedExports = this.getSortExports() ? exports.sort() : exports
    const barrelPath = path.join(directory, this.getBarrelFileName(files))
    const content = this.getFileContent(sortedExports)

    await fs.writeFile(barrelPath, content)

    return {
      filePath: barrelPath,
      content: sortedExports.join('\n'),
      exportsCount: sortedExports.length,
      mode,
    }
  }

  private async getEligibleFiles(directory: string): Promise<FileInfo[]> {
    const patterns = this.getExtensions().map((ext) => `*.${ext}`)
    const files: FileInfo[] = []

    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: directory,
        ignore: this.getExcludePatterns(),
      })

      for (const match of matches) {
        const fullPath = path.join(directory, match)
        const stat = await fs.stat(fullPath)

        if (!stat.isFile()) continue

        // Skip existing barrel files
        if (match === 'index.ts' || match === 'index.tsx') continue

        if (this.isValidSourceFile(match)) {
          files.push({
            path: fullPath,
            name: path.parse(match).name,
            extension: path.extname(match),
            isDirectory: false,
          })
        }
      }
    }

    // Include subdirectories that contain barrel files
    const entries = await fs.readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subdirPath = path.join(directory, entry.name)
        
        // Skip if subdirectory is excluded
        if (this.isExcluded(subdirPath)) continue

        // Check if subdirectory has a barrel file
        const hasBarrel = await this.hasBarrelFile(subdirPath)
        if (hasBarrel) {
          files.push({
            path: subdirPath,
            name: entry.name,
            extension: '',
            isDirectory: true,
          })
        }
      }
    }

    return files
  }

  private async hasBarrelFile(directory: string): Promise<boolean> {
    try {
      const indexTs = path.join(directory, 'index.ts')
      const indexTsx = path.join(directory, 'index.tsx')
      
      const [hasTs, hasTsx] = await Promise.all([
        this.fileExists(indexTs),
        this.fileExists(indexTsx),
      ])
      
      return hasTs || hasTsx
    } catch {
      return false
    }
  }

  private async getDirsAndFiles(directory: string): Promise<{ dirs: string[]; files: FileInfo[] }> {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const dirs: string[] = []
    const files: FileInfo[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(entry.name)
      } else if (this.isValidSourceFile(entry.name)) {
        files.push({
          path: path.join(directory, entry.name),
          name: path.parse(entry.name).name,
          extension: path.extname(entry.name),
          isDirectory: false,
        })
      }
    }

    return { dirs, files }
  }

  private generateExportStatements(files: FileInfo[], directory: string): string[] {
    let exports = files.map((file) => {
      if (file.isDirectory) {
        // Export subdirectory
        return `export * from './${file.name}'`
      } else {
        // Export file
        const relativePath = path.relative(directory, file.path)
        const importPath = `./${relativePath.replace(/\.(ts|tsx)$/, '')}`
        return `export * from '${importPath}'`
      }
    })

    if (this.getSortExports()) {
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
        
        // Skip if subdirectory is excluded
        if (this.isExcluded(subdirPath)) {
          if (this.config.verbose) {
            console.log(`[EXCLUDED] Skipping directory: ${subdirPath}`)
          }
          continue
        }
        
        const nestedSubdirs = await this.findSubdirectories(subdirPath)
        subdirs.push(...nestedSubdirs)
      }
    }

    return subdirs
  }

  private isValidSourceFile(filename: string): boolean {
    const extensions = this.getExtensions()
    const extPattern = new RegExp(`\\.(${extensions.join('|')})$`)

    return (
      extPattern.test(filename) &&
      filename !== 'index.ts' &&
      filename !== 'index.tsx' &&
      !filename.endsWith('.d.ts') &&
      !this.getExcludePatterns().some((pattern) =>
        minimatch(filename, pattern, { dot: true, nocase: true }),
      )
    )
  }

  private isExcluded(dirPath: string): boolean {
    const patterns = this.fileConfig?.exclude || this.config.excludePatterns
    const normalizedPath = path.normalize(dirPath)
    
    // Convert to relative path from current working directory for pattern matching
    const relativePath = path.relative(process.cwd(), normalizedPath)
    
    // Test both relative and absolute paths with different variations
    const pathsToTest = [
      relativePath,
      relativePath + path.sep,
      // Also test with forward slashes normalized
      relativePath.replace(/\\/g, '/'),
      relativePath.replace(/\\/g, '/') + '/',
      normalizedPath,
      normalizedPath + path.sep
    ]
    
    return patterns.some((pattern) => {
      return pathsToTest.some(testPath => 
        minimatch(testPath, pattern, { dot: true, nocase: true })
      )
    })
  }

  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private getFileContent(exports: string[]): string {
    const comment = this.getHeaderComment()
    return `${comment}${exports.join('\n')}\n`
  }

  private getHeaderComment(): string {
    return this.fileConfig?.headerComment || this.config.headerComment || ''
  }

  private getExtensions(): string[] {
    return this.fileConfig?.extensions || this.config.extensions
  }

  private getExcludePatterns(): string[] {
    return this.fileConfig?.exclude || this.config.excludePatterns
  }

  private getSortExports(): boolean {
    return this.fileConfig?.sortExports ?? this.config.sortExports
  }

  async cleanOldBarrelFiles(dryRun: boolean = false, forceClean: boolean = false): Promise<void> {
    // Load config to get targets and headerComment
    const cwd = process.cwd()
    if (this.config.configFile) {
      this.fileConfig = await loadConfigFile(this.config.configFile)
    } else {
      const configPath = await findConfigFile(cwd)
      if (configPath) {
        this.fileConfig = await loadConfigFile(configPath)
      }
    }

    if (!this.fileConfig) {
      throw new Error('No configuration found. Please run "barrel-craft init" or specify a config file.')
    }

    const shouldForce = forceClean || this.fileConfig.force
    const expectedHeader = this.fileConfig.headerComment.trim()
    
    console.log(`🧹 ${dryRun ? 'Analyzing' : 'Cleaning'} old barrel files...`)
    if (shouldForce) {
      console.log('⚠️  Force mode enabled - will remove ALL index.ts/tsx files in target directories')
    } else {
      console.log(`📝 Only removing files with matching header comment`)
    }

    let cleanedCount = 0
    const allTargets = [...this.fileConfig.targets, ...this.fileConfig.forceGenerate]

    for (const target of allTargets) {
      await this.cleanDirectoryBarrels(target, expectedHeader, shouldForce, dryRun, (count) => {
        cleanedCount += count
      })
    }

    if (dryRun) {
      console.log(`\n📊 Analysis complete: ${cleanedCount} file(s) would be cleaned`)
      console.log('Run without --dry-run to actually remove the files')
    } else {
      console.log(`\n✅ Cleaned ${cleanedCount} old barrel file(s)`)
    }
  }

  private async cleanDirectoryBarrels(
    targetPath: string,
    expectedHeader: string,
    forceClean: boolean,
    dryRun: boolean,
    onCleaned: (count: number) => void
  ): Promise<void> {
    const resolvedPath = path.resolve(targetPath)
    
    try {
      await fs.access(resolvedPath)
    } catch {
      return // Directory doesn't exist, skip
    }

    const entries = await fs.readdir(resolvedPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(resolvedPath, entry.name)
      
      if (entry.isDirectory()) {
        // Recursively clean subdirectories
        await this.cleanDirectoryBarrels(
          fullPath,
          expectedHeader,
          forceClean,
          dryRun,
          onCleaned
        )
      } else if (entry.name === 'index.ts' || entry.name === 'index.tsx') {
        const shouldClean = await this.shouldCleanBarrelFile(fullPath, expectedHeader, forceClean)
        
        if (shouldClean) {
          console.log(`${dryRun ? '📄' : '🗑️'} ${fullPath}`)
          
          if (!dryRun) {
            await fs.unlink(fullPath)
          }
          onCleaned(1)
        }
      }
    }
  }

  private async shouldCleanBarrelFile(
    filePath: string,
    expectedHeader: string,
    forceClean: boolean
  ): Promise<boolean> {
    if (forceClean) {
      return true
    }

    try {
      const content = await fs.readFile(filePath, 'utf8')
      const firstLine = content.split('\n')[0]?.trim() || ''
      
      // Check if first line contains expected header comment pattern
      // Remove both "// " prefixes to compare core content
      const normalizeComment = (comment: string) => 
        comment.replace(/^\/\/ /, '').trim()
      
      const normalizedExpected = normalizeComment(expectedHeader.split('\n')[0] || '')
      const normalizedFirst = normalizeComment(firstLine)
      
      return normalizedFirst.includes('auto-generated') && 
             (normalizedFirst.includes(normalizedExpected) || normalizedExpected === '')
    } catch {
      return false // If can't read file, don't clean it
    }
  }
}
