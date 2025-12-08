/**
 * Parsed step information from evidence file paths
 */
export interface ParsedStep {
  /** Step number (1-based) */
  number: number;
  /** Action performed (e.g., 'navigate', 'click', 'fill') */
  action: string;
  /** URL to access the evidence file via API */
  path: string;
}

/**
 * Convert an absolute file path to an API URL
 * Absolute paths like "C:\Users\..." are converted to "/api/file?path=..."
 */
function toApiUrl(filePath: string): string {
  if (/^[A-Z]:[/\\]/i.test(filePath) || filePath.startsWith('/')) {
    return `/api/file?path=${encodeURIComponent(filePath)}`;
  }
  return filePath;
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
    .map((filePath) => {
      // Extract filename from path (works with both / and \ separators)
      const filename = filePath.split(/[/\\]/).pop() || '';
      const match = filename.match(/^step-(\d+)-(.+)\.(png|jpg|jpeg)$/i);

      if (!match || !match[1] || !match[2]) {
        return { number: 0, action: 'unknown', path: toApiUrl(filePath) };
      }

      return {
        number: parseInt(match[1], 10),
        action: match[2],
        path: toApiUrl(filePath),
      };
    })
    .filter((step) => step.number > 0)
    .sort((a, b) => a.number - b.number);
}
