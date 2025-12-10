/**
 * Evidence types supported by HarshJudge
 */
export type EvidenceType = 'screenshot' | 'console_log' | 'db_snapshot' | 'network_log' | 'html_snapshot' | 'custom';

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
 * Parsed evidence item with type information
 */
export interface ParsedEvidence {
  /** Step number (1-based) */
  number: number;
  /** Name/description of the evidence */
  name: string;
  /** URL to access the evidence file via API */
  path: string;
  /** Evidence type */
  type: EvidenceType;
  /** File extension */
  extension: string;
}

/**
 * All parsed evidence grouped by type
 */
export interface ParsedEvidenceCollection {
  /** Screenshot evidence (images) */
  screenshots: ParsedStep[];
  /** Console log evidence (text files) */
  logs: ParsedEvidence[];
  /** Database snapshot evidence (JSON files) */
  dbSnapshots: ParsedEvidence[];
  /** Network log evidence (JSON files) */
  networkLogs: ParsedEvidence[];
  /** HTML snapshot evidence */
  htmlSnapshots: ParsedEvidence[];
  /** Custom evidence */
  custom: ParsedEvidence[];
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

/**
 * Determine evidence type from file extension
 */
function getEvidenceType(extension: string, filename: string): EvidenceType {
  const ext = extension.toLowerCase();
  const name = filename.toLowerCase();

  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
    return 'screenshot';
  }
  if (ext === 'txt') {
    return 'console_log';
  }
  if (ext === 'html') {
    return 'html_snapshot';
  }
  if (ext === 'json') {
    // Distinguish between db_snapshot, network_log, and custom based on name
    if (name.includes('db') || name.includes('database') || name.includes('mongo') || name.includes('consistency')) {
      return 'db_snapshot';
    }
    if (name.includes('network') || name.includes('request') || name.includes('api')) {
      return 'network_log';
    }
    return 'custom';
  }
  return 'custom';
}

/**
 * Parse a single evidence file path
 */
function parseEvidenceFile(filePath: string): ParsedEvidence | null {
  // Skip metadata files
  if (filePath.includes('.meta.json')) {
    return null;
  }

  // Extract filename from path (works with both / and \ separators)
  const filename = filePath.split(/[/\\]/).pop() || '';

  // Match pattern: step-{number}-{name}.{ext}
  const match = filename.match(/^step-(\d+)-(.+)\.(\w+)$/i);

  if (!match || !match[1] || !match[2] || !match[3]) {
    return null;
  }

  const extension = match[3];
  const type = getEvidenceType(extension, match[2]);

  return {
    number: parseInt(match[1], 10),
    name: match[2],
    path: toApiUrl(filePath),
    type,
    extension,
  };
}

/**
 * Parse all evidence file paths and group by type
 *
 * @param paths - Array of evidence file paths
 * @returns Evidence collection grouped by type
 */
export function parseAllEvidence(paths: string[]): ParsedEvidenceCollection {
  const collection: ParsedEvidenceCollection = {
    screenshots: [],
    logs: [],
    dbSnapshots: [],
    networkLogs: [],
    htmlSnapshots: [],
    custom: [],
  };

  for (const filePath of paths) {
    const evidence = parseEvidenceFile(filePath);
    if (!evidence) continue;

    switch (evidence.type) {
      case 'screenshot':
        collection.screenshots.push({
          number: evidence.number,
          action: evidence.name,
          path: evidence.path,
        });
        break;
      case 'console_log':
        collection.logs.push(evidence);
        break;
      case 'db_snapshot':
        collection.dbSnapshots.push(evidence);
        break;
      case 'network_log':
        collection.networkLogs.push(evidence);
        break;
      case 'html_snapshot':
        collection.htmlSnapshots.push(evidence);
        break;
      case 'custom':
        collection.custom.push(evidence);
        break;
    }
  }

  // Sort all arrays by step number
  collection.screenshots.sort((a, b) => a.number - b.number);
  collection.logs.sort((a, b) => a.number - b.number);
  collection.dbSnapshots.sort((a, b) => a.number - b.number);
  collection.networkLogs.sort((a, b) => a.number - b.number);
  collection.htmlSnapshots.sort((a, b) => a.number - b.number);
  collection.custom.sort((a, b) => a.number - b.number);

  return collection;
}
