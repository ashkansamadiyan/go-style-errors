// src/sync.ts
import type { Result } from "./types";
import { normalizeError } from "./utils";

export function goSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return [fn(), null];
  } catch (e) {
    return [null, normalizeError<E>(e)];
  }
}
