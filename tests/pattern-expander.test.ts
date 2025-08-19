import { describe, expect, it } from 'vitest'
import { expandVariablePatterns } from '../src/utils/pattern-expander'

describe('expandVariablePatterns', () => {
  it('should return paths unchanged when no variable patterns exist', () => {
    const paths = ['src/components', 'src/utils']
    const result = expandVariablePatterns(paths)

    expect(result).toEqual(['src/components', 'src/utils'])
  })

  it('should expand single variable pattern', () => {
    const paths = ['src/{components|utils}']
    const result = expandVariablePatterns(paths)

    expect(result).toEqual(['src/components', 'src/utils'])
  })

  it('should expand multiple variable patterns in same path', () => {
    const paths = ['apps/{frontend|backend}/src/{auth|dashboard}']
    const result = expandVariablePatterns(paths)

    expect(result).toEqual([
      'apps/frontend/src/auth',
      'apps/frontend/src/dashboard',
      'apps/backend/src/auth',
      'apps/backend/src/dashboard',
    ])
  })

  it('should handle multiple paths with variable patterns', () => {
    const paths = ['src/{components|utils}', 'tests/{unit|integration}']
    const result = expandVariablePatterns(paths)

    expect(result).toEqual(['src/components', 'src/utils', 'tests/unit', 'tests/integration'])
  })

  it('should handle mixed paths with and without variable patterns', () => {
    const paths = ['src/components', 'src/{utils|hooks}', 'tests/fixtures']
    const result = expandVariablePatterns(paths)

    expect(result).toEqual(['src/components', 'src/utils', 'src/hooks', 'tests/fixtures'])
  })

  it('should handle whitespace in variable patterns', () => {
    const paths = ['src/{ components | utils | hooks }']
    const result = expandVariablePatterns(paths)

    expect(result).toEqual(['src/components', 'src/utils', 'src/hooks'])
  })
})
