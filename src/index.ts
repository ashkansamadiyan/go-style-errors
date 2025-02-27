// src/index.ts
import type { Result } from "./types";
import { goSync } from "./sync";
import { goAsync } from "./async";

/**
 * A unified function for handling both synchronous and asynchronous operations in a Go-style error handling pattern.
 * This function provides a consistent way to handle errors without try-catch blocks.
 * 
 * For synchronous operations, it returns a Result tuple [value, error].
 * For asynchronous operations, it returns a Promise<Result<T, E>> tuple.
 * 
 * @template T - The type of the successful value
 * @template E - The type of the error (defaults to Error)
 * 
 * @param input - Either a synchronous function or a Promise
 * @returns Either Result<T, E> for sync operations or Promise<Result<T, E>> for async
 * 
 * @example
 * ```typescript
 * // Synchronous usage
 * const [value, error] = go(() => {
 *   if (someCondition) throw new Error("failed");
 *   return 42;
 * });
 * 
 * // Asynchronous usage
 * const [data, error] = await go(fetch("https://api.example.com/data"));
 * 
 * // With custom error types
 * const [value, error] = go<number, CustomError>(() => validate(input));
 * ```
 */
export function go<T, E = Error>(fn: () => T): Result<T, E>;
export function go<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>;
export function go<T, E = Error>(
  input: (() => T) | Promise<T>,
): Result<T, E> | Promise<Result<T, E>> {
  return input instanceof Promise ? goAsync<T, E>(input) : goSync<T, E>(input);
}

export * from "./sync";
export * from "./async";
export * from "./types";
