#!/usr/bin/env node

import { Command } from 'commander'
import { BarrelGenerator } from './core/BarrelGenerator'
import type { BarrelConfig } from './types'

const program = new Command()

program
  .name('barrel-buddy')
  .description('Generate clean and consistent barrel files for TypeScript and React projects')
  .version('0.1.0')

program
  .argument('[directory]', 'directory to generate barrel files for', '.')
  .option('-e, --extensions <extensions...>', 'file extensions to include', ['ts', 'tsx'])
  .option('-x, --exclude <patterns...>', 'patterns to exclude', ['*.test.*', '*.spec.*'])
  .option('-s, --subdirectories', 'include subdirectories', false)
  .option('--no-sort', 'do not sort exports alphabetically')
  .action(async (directory: string, options) => {
    try {
      const config: BarrelConfig = {
        extensions: options.extensions,
        excludePatterns: options.exclude,
        includeSubdirectories: options.subdirectories,
        sortExports: options.sort,
      }

      const generator = new BarrelGenerator(config)
      const results = await generator.generateBarrels(directory)

      console.log(`✅ Generated ${results.length} barrel file(s):`)
      results.forEach((result) => {
        console.log(`   ${result.filePath} (${result.exportsCount} exports)`)
      })
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()
