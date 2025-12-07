import { describe, it, expect } from 'vitest';
import { parseEvidencePaths } from '../../src/lib/parseEvidence';

describe('parseEvidencePaths', () => {
  describe('basic parsing', () => {
    it('parses valid evidence paths', () => {
      const paths = [
        '/project/evidence/step-01-navigate.png',
        '/project/evidence/step-02-click.png',
        '/project/evidence/step-03-fill.png',
      ];

      const result = parseEvidencePaths(paths);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        number: 1,
        action: 'navigate',
        path: '/project/evidence/step-01-navigate.png',
      });
      expect(result[1]).toEqual({
        number: 2,
        action: 'click',
        path: '/project/evidence/step-02-click.png',
      });
      expect(result[2]).toEqual({
        number: 3,
        action: 'fill',
        path: '/project/evidence/step-03-fill.png',
      });
    });

    it('handles Windows-style paths', () => {
      const paths = [
        'C:\\Users\\test\\evidence\\step-01-navigate.png',
        'C:\\Users\\test\\evidence\\step-02-click.png',
      ];

      const result = parseEvidencePaths(paths);

      expect(result).toHaveLength(2);
      expect(result[0].number).toBe(1);
      expect(result[0].action).toBe('navigate');
      expect(result[1].number).toBe(2);
      expect(result[1].action).toBe('click');
    });
  });

  describe('sorting', () => {
    it('sorts by step number ascending', () => {
      const paths = [
        '/evidence/step-03-fill.png',
        '/evidence/step-01-navigate.png',
        '/evidence/step-02-click.png',
      ];

      const result = parseEvidencePaths(paths);

      expect(result[0].number).toBe(1);
      expect(result[1].number).toBe(2);
      expect(result[2].number).toBe(3);
    });
  });

  describe('file extension handling', () => {
    it('accepts png files', () => {
      const paths = ['/evidence/step-01-test.png'];
      const result = parseEvidencePaths(paths);
      expect(result).toHaveLength(1);
    });

    it('accepts jpg files', () => {
      const paths = ['/evidence/step-01-test.jpg'];
      const result = parseEvidencePaths(paths);
      expect(result).toHaveLength(1);
    });

    it('accepts jpeg files', () => {
      const paths = ['/evidence/step-01-test.jpeg'];
      const result = parseEvidencePaths(paths);
      expect(result).toHaveLength(1);
    });

    it('handles case-insensitive extensions', () => {
      const paths = [
        '/evidence/step-01-test.PNG',
        '/evidence/step-02-test.JPG',
        '/evidence/step-03-test.JPEG',
      ];
      const result = parseEvidencePaths(paths);
      expect(result).toHaveLength(3);
    });

    it('filters out non-image files', () => {
      const paths = [
        '/evidence/step-01-test.png',
        '/evidence/step-02-test.json',
        '/evidence/step-03-test.meta.json',
        '/evidence/log.txt',
      ];

      const result = parseEvidencePaths(paths);

      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
    });
  });

  describe('invalid path handling', () => {
    it('filters out files not matching step pattern', () => {
      const paths = [
        '/evidence/step-01-navigate.png',
        '/evidence/screenshot.png',
        '/evidence/random-image.jpg',
      ];

      const result = parseEvidencePaths(paths);

      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('navigate');
    });

    it('returns empty array for empty input', () => {
      const result = parseEvidencePaths([]);
      expect(result).toEqual([]);
    });

    it('handles paths with no valid steps', () => {
      const paths = [
        '/evidence/screenshot.png',
        '/evidence/image.jpg',
      ];

      const result = parseEvidencePaths(paths);

      expect(result).toEqual([]);
    });
  });

  describe('action name extraction', () => {
    it('extracts hyphenated action names', () => {
      const paths = ['/evidence/step-01-wait-for-element.png'];
      const result = parseEvidencePaths(paths);
      expect(result[0].action).toBe('wait-for-element');
    });

    it('extracts underscored action names', () => {
      const paths = ['/evidence/step-01-wait_for_element.png'];
      const result = parseEvidencePaths(paths);
      expect(result[0].action).toBe('wait_for_element');
    });

    it('handles single-word actions', () => {
      const paths = ['/evidence/step-01-click.png'];
      const result = parseEvidencePaths(paths);
      expect(result[0].action).toBe('click');
    });
  });

  describe('step number handling', () => {
    it('handles double-digit step numbers', () => {
      const paths = [
        '/evidence/step-01-first.png',
        '/evidence/step-10-tenth.png',
        '/evidence/step-99-last.png',
      ];

      const result = parseEvidencePaths(paths);

      expect(result).toHaveLength(3);
      expect(result[0].number).toBe(1);
      expect(result[1].number).toBe(10);
      expect(result[2].number).toBe(99);
    });

    it('handles non-padded step numbers', () => {
      const paths = ['/evidence/step-1-test.png'];
      const result = parseEvidencePaths(paths);
      expect(result[0].number).toBe(1);
    });
  });
});
