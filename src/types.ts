/**
 * Represents a Result tuple that contains either a value or an error.
 * This is the base type used internally.
 * 
 * @template T - The type of the successful value
 * @template E - The type of the error, defaults to Error
 */
export type Result<T, E = Error> = [T | null, E | null];

/**
 * Represents a strict Go-style result tuple that contains either a value or an error, but never both.
 * This is the recommended type for public APIs.
 * 
 * @template T - The type of the successful value
 * @template E - The type of the error, defaults to Error
 * 
 * @example
 * ```typescript
 * type ApiResult = GoResult<UserData, ApiError>;
 * // is equivalent to:
 * type ApiResult = readonly [UserData, null] | readonly [null, ApiError];
 * ```
 */
export type GoResult<T, E = Error> = readonly [T, null] | readonly [null, E];
