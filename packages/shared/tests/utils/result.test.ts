import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, type Result } from '../../src/utils/result.js';

describe('Result utilities', () => {
  describe('ok()', () => {
    it('creates success result with value', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
    });

    it('creates success result with string value', () => {
      const result = ok('hello');
      expect(result.ok).toBe(true);
      expect(result.value).toBe('hello');
    });

    it('creates success result with object value', () => {
      const data = { name: 'test', count: 5 };
      const result = ok(data);
      expect(result.ok).toBe(true);
      expect(result.value).toEqual(data);
    });

    it('creates success result with null value', () => {
      const result = ok(null);
      expect(result.ok).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('err()', () => {
    it('creates failure result with Error', () => {
      const error = new Error('failed');
      const result = err(error);
      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
      expect(result.error.message).toBe('failed');
    });

    it('creates failure result with string error', () => {
      const result = err('something went wrong');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('something went wrong');
    });

    it('creates failure result with custom error object', () => {
      const customError = { code: 'NOT_FOUND', message: 'Resource not found' };
      const result = err(customError);
      expect(result.ok).toBe(false);
      expect(result.error).toEqual(customError);
    });
  });

  describe('isOk()', () => {
    it('returns true for success result', () => {
      const result = ok('success');
      expect(isOk(result)).toBe(true);
    });

    it('returns false for failure result', () => {
      const result = err(new Error('failed'));
      expect(isOk(result)).toBe(false);
    });

    it('narrows type correctly for success', () => {
      const result: Result<number, string> = ok(42);
      if (isOk(result)) {
        // TypeScript should know result.value is number here
        const value: number = result.value;
        expect(value).toBe(42);
      }
    });
  });

  describe('isErr()', () => {
    it('returns true for failure result', () => {
      const result = err('error');
      expect(isErr(result)).toBe(true);
    });

    it('returns false for success result', () => {
      const result = ok(100);
      expect(isErr(result)).toBe(false);
    });

    it('narrows type correctly for failure', () => {
      const result: Result<number, string> = err('failed');
      if (isErr(result)) {
        // TypeScript should know result.error is string here
        const error: string = result.error;
        expect(error).toBe('failed');
      }
    });
  });

  describe('type guards work together', () => {
    it('isOk and isErr are mutually exclusive', () => {
      const successResult = ok('value');
      const failureResult = err('error');

      expect(isOk(successResult)).toBe(true);
      expect(isErr(successResult)).toBe(false);

      expect(isOk(failureResult)).toBe(false);
      expect(isErr(failureResult)).toBe(true);
    });

    it('can be used in conditional logic', () => {
      function processResult(result: Result<number, string>): string {
        if (isOk(result)) {
          return `Success: ${result.value}`;
        } else {
          return `Error: ${result.error}`;
        }
      }

      expect(processResult(ok(42))).toBe('Success: 42');
      expect(processResult(err('failed'))).toBe('Error: failed');
    });
  });
});
