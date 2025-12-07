import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from '../../src/lib/parsers';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Null and invalid input', () => {
    it('returns "Never" for null input', () => {
      expect(formatRelativeTime(null)).toBe('Never');
    });

    it('returns "Never" for invalid date string', () => {
      expect(formatRelativeTime('invalid-date')).toBe('Never');
    });

    it('returns "Never" for empty string', () => {
      expect(formatRelativeTime('')).toBe('Never');
    });
  });

  describe('Future dates', () => {
    it('returns "In the future" for future timestamps', () => {
      expect(formatRelativeTime('2025-01-16T12:00:00Z')).toBe('In the future');
    });
  });

  describe('Just now (< 60 seconds)', () => {
    it('returns "Just now" for timestamps within 60 seconds', () => {
      expect(formatRelativeTime('2025-01-15T11:59:30Z')).toBe('Just now');
    });

    it('returns "Just now" for timestamps 1 second ago', () => {
      expect(formatRelativeTime('2025-01-15T11:59:59Z')).toBe('Just now');
    });
  });

  describe('Minutes (< 60 minutes)', () => {
    it('returns "1m ago" for 1 minute ago', () => {
      expect(formatRelativeTime('2025-01-15T11:59:00Z')).toBe('1m ago');
    });

    it('returns "30m ago" for 30 minutes ago', () => {
      expect(formatRelativeTime('2025-01-15T11:30:00Z')).toBe('30m ago');
    });

    it('returns "59m ago" for 59 minutes ago', () => {
      expect(formatRelativeTime('2025-01-15T11:01:00Z')).toBe('59m ago');
    });
  });

  describe('Hours (< 24 hours)', () => {
    it('returns "1h ago" for 1 hour ago', () => {
      expect(formatRelativeTime('2025-01-15T11:00:00Z')).toBe('1h ago');
    });

    it('returns "12h ago" for 12 hours ago', () => {
      expect(formatRelativeTime('2025-01-15T00:00:00Z')).toBe('12h ago');
    });

    it('returns "23h ago" for 23 hours ago', () => {
      expect(formatRelativeTime('2025-01-14T13:00:00Z')).toBe('23h ago');
    });
  });

  describe('Yesterday', () => {
    it('returns "Yesterday" for exactly 24 hours ago', () => {
      expect(formatRelativeTime('2025-01-14T12:00:00Z')).toBe('Yesterday');
    });

    it('returns "Yesterday" for 1 day ago', () => {
      expect(formatRelativeTime('2025-01-14T10:00:00Z')).toBe('Yesterday');
    });
  });

  describe('Days (< 7 days)', () => {
    it('returns "2d ago" for 2 days ago', () => {
      expect(formatRelativeTime('2025-01-13T12:00:00Z')).toBe('2d ago');
    });

    it('returns "6d ago" for 6 days ago', () => {
      expect(formatRelativeTime('2025-01-09T12:00:00Z')).toBe('6d ago');
    });
  });

  describe('Weeks (< 4 weeks)', () => {
    it('returns "1w ago" for 7 days ago', () => {
      expect(formatRelativeTime('2025-01-08T12:00:00Z')).toBe('1w ago');
    });

    it('returns "2w ago" for 14 days ago', () => {
      expect(formatRelativeTime('2025-01-01T12:00:00Z')).toBe('2w ago');
    });

    it('returns "3w ago" for 21 days ago', () => {
      expect(formatRelativeTime('2024-12-25T12:00:00Z')).toBe('3w ago');
    });
  });

  describe('Months (< 12 months)', () => {
    it('returns "1mo ago" for 30+ days ago', () => {
      expect(formatRelativeTime('2024-12-15T12:00:00Z')).toBe('1mo ago');
    });

    it('returns "3mo ago" for 90+ days ago', () => {
      expect(formatRelativeTime('2024-10-15T12:00:00Z')).toBe('3mo ago');
    });
  });

  describe('Old dates (12+ months)', () => {
    it('returns formatted date for dates over a year ago', () => {
      const result = formatRelativeTime('2023-01-15T12:00:00Z');
      // Result depends on locale, but should be a date string
      expect(result).not.toBe('Never');
      expect(result).not.toContain('ago');
    });
  });
});
