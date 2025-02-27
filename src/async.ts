import type { Result } from "./types";
import { normalizeError } from "./utils";

/**
 * Handles asynchronous operations in a Go-style error handling pattern.
 * Wraps a Promise and returns a Result tuple wrapped in a Promise.
 * 
 * @template T - The type of the successful value
 * @template E - The type of the error (defaults to Error)
 * 
 * @param promise - A Promise that might reject
 * @returns A Promise that resolves to a Result tuple [value, error]
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const [data, error] = await goAsync(fetch("https://api.example.com/data"));
 * 
 * // With custom error type
 * const [user, error] = await goAsync<User, ApiError>(api.getUser(123));
 * ```
 */
export async function goAsync<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    return [await promise, null];
  } catch (e) {
    return [null, normalizeError<E>(e)];
  }
}
