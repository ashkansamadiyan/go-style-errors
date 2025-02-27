import type { Result } from "./types";
export declare function goAsync<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>;
