export interface BarrelConfig {
  extensions: string[]
  excludePatterns: string[]
  includeSubdirectories: boolean
  sortExports: boolean
}

export interface FileInfo {
  path: string
  name: string
  extension: string
  isDirectory: boolean
}

export interface BarrelGenerationResult {
  filePath: string
  content: string
  exportsCount: number
}
