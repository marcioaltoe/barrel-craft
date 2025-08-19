export interface BarrelConfig {
  extensions: string[]
  excludePatterns: string[]
  includeSubdirectories: boolean
  sortExports: boolean
  verbose: boolean
  headerComment?: string
  targets?: string[]
  forceGenerate?: string[]
  configFile?: string
}

export interface FileConfig {
  headerComment: string
  targets: string[]
  forceGenerate: string[]
  exclude: string[]
  extensions: string[]
  sortExports: boolean
  subdirectories: boolean
  verbose: boolean
  force: boolean
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
  mode: 'normal' | 'forced'
}
