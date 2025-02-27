import type { Result } from "./types";
import { normalizeError } from "./utils";

export async function goAsync<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    return [await promise, null];
  } catch (e) {
    return [null, normalizeError<E>(e)];
  }
}
