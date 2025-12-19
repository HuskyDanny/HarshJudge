import { describe, it, expect } from 'vitest';
import {
  StepReferenceSchema,
  ScenarioMetaSchema,
  padStepId,
  generateStepFilename,
} from '../../src/types/scenario.js';

describe('StepReferenceSchema', () => {
  it('validates valid step reference', () => {
    const ref = {
      id: '01',
      title: 'Navigate to login',
      file: '01-navigate-to-login.md',
    };
    expect(StepReferenceSchema.parse(ref)).toEqual(ref);
  });

  it('validates zero-padded id from 01 to 99', () => {
    expect(() =>
      StepReferenceSchema.parse({ id: '01', title: 'Test', file: '01-test.md' })
    ).not.toThrow();
    expect(() =>
      StepReferenceSchema.parse({ id: '10', title: 'Test', file: '10-test.md' })
    ).not.toThrow();
    expect(() =>
      StepReferenceSchema.parse({ id: '99', title: 'Test', file: '99-test.md' })
    ).not.toThrow();
  });

  it('rejects non-zero-padded step id', () => {
    expect(() =>
      StepReferenceSchema.parse({ id: '1', title: 'Test', file: '1-test.md' })
    ).toThrow('Step ID must be zero-padded');
  });

  it('rejects three-digit step id', () => {
    expect(() =>
      StepReferenceSchema.parse({ id: '100', title: 'Test', file: '100-test.md' })
    ).toThrow('Step ID must be zero-padded');
  });

  it('rejects invalid file pattern', () => {
    expect(() =>
      StepReferenceSchema.parse({ id: '01', title: 'Test', file: 'test.md' })
    ).toThrow('Step file must match pattern');
  });
});

describe('ScenarioMetaSchema', () => {
  it('validates minimal scenario meta', () => {
    const meta = ScenarioMetaSchema.parse({
      slug: 'login-flow',
      title: 'Login Flow',
    });
    expect(meta.slug).toBe('login-flow');
    expect(meta.title).toBe('Login Flow');
    expect(meta.starred).toBe(false);
    expect(meta.tags).toEqual([]);
    expect(meta.steps).toEqual([]);
    expect(meta.totalRuns).toBe(0);
  });

  it('includes starred field defaulting to false', () => {
    const meta = ScenarioMetaSchema.parse({
      slug: 'test',
      title: 'Test',
    });
    expect(meta.starred).toBe(false);
  });

  it('accepts starred as true', () => {
    const meta = ScenarioMetaSchema.parse({
      slug: 'test',
      title: 'Test',
      starred: true,
    });
    expect(meta.starred).toBe(true);
  });

  it('validates steps array', () => {
    const meta = ScenarioMetaSchema.parse({
      slug: 'login-flow',
      title: 'Login Flow',
      steps: [
        { id: '01', title: 'Navigate', file: '01-navigate.md' },
        { id: '02', title: 'Submit', file: '02-submit.md' },
      ],
    });
    expect(meta.steps).toHaveLength(2);
    expect(meta.steps[0].id).toBe('01');
  });

  it('validates full scenario meta with statistics', () => {
    const meta = ScenarioMetaSchema.parse({
      slug: 'login-flow',
      title: 'Login Flow',
      starred: true,
      tags: ['auth', 'critical'],
      estimatedDuration: 30,
      steps: [{ id: '01', title: 'Test', file: '01-test.md' }],
      totalRuns: 5,
      passCount: 4,
      failCount: 1,
      lastRun: '2025-01-01T00:00:00Z',
      lastResult: 'pass',
      avgDuration: 3200,
    });
    expect(meta.starred).toBe(true);
    expect(meta.tags).toEqual(['auth', 'critical']);
    expect(meta.totalRuns).toBe(5);
    expect(meta.lastResult).toBe('pass');
  });

  it('rejects invalid slug', () => {
    expect(() =>
      ScenarioMetaSchema.parse({ slug: 'Invalid Slug', title: 'Test' })
    ).toThrow();
  });
});

describe('padStepId', () => {
  it('pads single digit numbers', () => {
    expect(padStepId(1)).toBe('01');
    expect(padStepId(9)).toBe('09');
  });

  it('keeps two digit numbers as-is', () => {
    expect(padStepId(10)).toBe('10');
    expect(padStepId(99)).toBe('99');
  });
});

describe('generateStepFilename', () => {
  it('generates filename from id and title', () => {
    expect(generateStepFilename('01', 'Navigate to Login')).toBe(
      '01-navigate-to-login.md'
    );
  });

  it('handles special characters in title', () => {
    expect(generateStepFilename('02', "Enter User's Email")).toBe(
      '02-enter-user-s-email.md'
    );
  });

  it('handles multiple spaces', () => {
    expect(generateStepFilename('03', 'Click   Submit   Button')).toBe(
      '03-click-submit-button.md'
    );
  });
});
