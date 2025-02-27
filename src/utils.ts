/**
 * Normalizes any thrown value into an Error object.
 * Handles various special cases:
 * - Error instances are passed through unchanged
 * - RegExp objects are converted to their string representation
 * - Objects are JSON stringified (with circular reference detection)
 * - Primitives are converted to strings
 * 
 * @template E - The expected error type
 * @param error - The value to normalize into an Error
 * @returns The normalized Error object
 * 
 * @example
 * ```typescript
 * normalizeError(new Error("test")); // Returns the original error
 * normalizeError({ foo: "bar" }); // Returns Error with message '{"foo":"bar"}'
 * normalizeError(/test/gi); // Returns Error with message '/test/gi'
 * ```
 */
export function normalizeError<E>(error: unknown): E {
  if (error instanceof Error) return error as E;
  if (error instanceof RegExp) return new Error(error.toString()) as E;
  if (typeof error === 'object' && error !== null) {
    try {
      return new Error(JSON.stringify(error)) as E;
    } catch (e) {
      // Pass through the actual circular reference error message
      return new Error(e instanceof Error ? e.message : 'Circular structure detected') as E;
    }
  }
  return new Error(String(error)) as E;
}
