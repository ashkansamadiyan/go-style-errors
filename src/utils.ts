export function normalizeError<E>(error: unknown): E {
  if (error instanceof Error) return error as E;
  return new Error(String(error)) as E;
}
