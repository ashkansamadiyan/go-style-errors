// src/index.ts
import type { Result } from "./types";
import { goSync } from "./sync";
import { goAsync } from "./async";

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
