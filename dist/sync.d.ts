import type { Result } from "./types";
export declare function goSync<T, E = Error>(fn: () => T): Result<T, E>;
