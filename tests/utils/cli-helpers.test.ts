import { describe, it, expect, vi } from 'vitest';
import { withErrorHandling } from '../../src/utils/cli-helpers.js';

describe('withErrorHandling', () => {
  it('calls the wrapped function on success', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    await withErrorHandling(fn)('arg1');
    expect(fn).toHaveBeenCalledWith('arg1');
  });

  it('outputs JSON error to stderr and exits on failure', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('boom'));
    const stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    await withErrorHandling(fn)();
    expect(stderrSpy).toHaveBeenCalledWith(JSON.stringify({ error: 'boom' }));
    expect(exitSpy).toHaveBeenCalledWith(1);
    stderrSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
