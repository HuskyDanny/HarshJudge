/**
 * Parsed step information from evidence file paths
 */
export interface ParsedStep {
  /** Step number (1-based) */
  number: number;
  /** Action performed (e.g., 'navigate', 'click', 'fill') */
  action: string;
  /** Full path to the evidence file */
  path: string;
}

/**
 * Parse evidence file paths to extract step information
 * Evidence files follow the pattern: step-{number}-{action}.{ext}
 *
 * @param paths - Array of evidence file paths
 * @returns Sorted array of parsed steps
 */
export function parseEvidencePaths(paths: string[]): ParsedStep[] {
  return paths
    .filter((p) => /\.(png|jpg|jpeg)$/i.test(p))
    .map((path) => {
      // Extract filename from path (works with both / and \ separators)
      const filename = path.split(/[/\\]/).pop() || '';
      const match = filename.match(/^step-(\d+)-(.+)\.(png|jpg|jpeg)$/i);

      if (!match || !match[1] || !match[2]) {
        return { number: 0, action: 'unknown', path };
      }

      return {
        number: parseInt(match[1], 10),
        action: match[2],
        path,
      };
    })
    .filter((step) => step.number > 0)
    .sort((a, b) => a.number - b.number);
}
