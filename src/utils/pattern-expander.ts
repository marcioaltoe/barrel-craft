/**
 * Expands variable patterns like "path/{option1|option2|option3}"
 * into multiple paths: ["path/option1", "path/option2", "path/option3"]
 */
export function expandVariablePatterns(paths: string[]): string[] {
  const expandedPaths: string[] = []

  for (const path of paths) {
    // Regex to find patterns like {option1|option2|option3}
    const variablePattern = /\{([^}]+)\}/g
    const matches = Array.from(path.matchAll(variablePattern))

    if (matches.length === 0) {
      // No variable patterns, add the path as is
      expandedPaths.push(path)
      continue
    }

    // Process each variable pattern found
    let expandedForThisPath = [path]

    for (const match of matches) {
      const fullMatch = match[0] // Ex: "{adapters|database|di}"
      const optionsString = match[1] // Ex: "adapters|database|di"
      const options = optionsString.split('|').map((opt) => opt.trim())

      // Expand each current path with all options
      const newExpanded: string[] = []
      for (const currentPath of expandedForThisPath) {
        for (const option of options) {
          newExpanded.push(currentPath.replace(fullMatch, option))
        }
      }
      expandedForThisPath = newExpanded
    }

    expandedPaths.push(...expandedForThisPath)
  }

  return expandedPaths
}
