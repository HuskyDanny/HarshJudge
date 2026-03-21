import yaml from 'js-yaml';

/**
 * Parse YAML content
 */
export function parseYaml<T>(content: string): T | null {
  try {
    return yaml.load(content) as T;
  } catch {
    return null;
  }
}

/**
 * Parse Markdown with YAML frontmatter
 */
export function parseMarkdownWithFrontmatter<T>(
  content: string
): { frontmatter: T; content: string } | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match || !match[1] || match[2] === undefined) {
    return null;
  }

  try {
    const frontmatter = yaml.load(match[1]) as T;
    return {
      frontmatter,
      content: match[2].trim(),
    };
  } catch {
    return null;
  }
}

/**
 * Parse JSON content safely
 */
export function parseJson<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Format an ISO timestamp as a relative time string
 * @param isoString - ISO 8601 timestamp string or null
 * @returns Human-readable relative time (e.g., "2h ago", "Yesterday")
 */
export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) {
    return 'Never';
  }

  const date = new Date(isoString);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Never';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle future dates
  if (diffMs < 0) {
    return 'In the future';
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) {
    return 'Just now';
  }

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  }

  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  // For older dates, show the actual date
  return date.toLocaleDateString();
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
