// src/sync.ts
import type { Result } from "./types";
import { normalizeError } from "./utils";

/**
 * Handles synchronous operations in a Go-style error handling pattern.
 * Wraps a synchronous function that might throw and returns a Result tuple.
 * 
 * @template T - The type of the successful value
 * @template E - The type of the error (defaults to Error)
 * 
 * @param fn - A synchronous function that might throw
 * @returns A Result tuple [value, error]
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const [value, error] = goSync(() => {
 *   if (x < 0) throw new Error("negative");
 *   return x * 2;
 * });
 * 
 * // With custom error type
 * const [value, error] = goSync<number, ValidationError>(() => validate(input));
 * ```
 */
export function goSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return [fn(), null];
  } catch (e) {
    return [null, normalizeError<E>(e)];
  }
}
