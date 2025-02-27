/**
 * Represents a Go-style result tuple that contains either a value or an error, but never both.
 * Similar to Rust's Result type or Haskell's Either type.
 * 
 * @template T - The type of the successful value
 * @template E - The type of the error, defaults to Error
 * 
 * @example
 * ```typescript
 * // Success case: [value, null]
 * const success: Result<number> = [42, null];
 * 
 * // Error case: [null, error]
 * const error: Result<number> = [null, new Error("failed")];
 * ```
 */
export type Result<T, E = Error> = [T, null] | [null, E];
