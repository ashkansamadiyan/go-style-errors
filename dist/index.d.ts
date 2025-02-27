import type { Result } from "./types";
export declare function go<T, E = Error>(fn: () => T): Result<T, E>;
export declare function go<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>;
export * from "./sync";
export * from "./async";
export * from "./types";
