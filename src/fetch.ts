import type { Result } from "./types";

/**
 * Options for goFetch function
 * @template T - Expected type of the response data
 * @template E - Expected type of the error (defaults to string)
 */
export interface GoFetchOptions<T = any, E = string> {
  /** Optional error transformer function */
  errorTransformer?: (error: unknown) => E;
  /** Optional response transformer function */
  responseTransformer?: (data: unknown) => T;
}

/**
 * A lightweight fetch wrapper that returns a Promise of Result tuple.
 *
 * @template T - Expected type of the response data
 * @template E - Expected type of the error (defaults to string)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const [data, error] = await goFetch('https://api.example.com/data');
 *
 * // With type safety
 * interface UserData {
 *   id: number;
 *   name: string;
 * }
 * const [data, error] = await goFetch<UserData>('https://api.example.com/user/1');
 * ```
 */
function goFetch<T = any, E = string>(
  url: string,
  fetchOptions?: RequestInit,
  options?: GoFetchOptions<T, E>,
): Promise<Result<T, E>> {
  return fetch(url, fetchOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json().catch(() => {
        throw new Error("Failed to parse JSON");
      });
    })
    .then((data) => {
      const result: Result<T, E> = options?.responseTransformer
        ? [options.responseTransformer(data), null]
        : [data as T, null];
      return result;
    })
    .catch((e) => {
      const error = options?.errorTransformer
        ? options.errorTransformer(e)
        : ((e instanceof Error ? e.message : "Failed to fetch data") as E);
      const result: Result<T, E> = [null, error];
      return result;
    });
}

// Re-export the type
export { goFetch };
export type { Result };

