import { describe, expect, test } from "vitest";
import { go, goSync, goAsync } from "../src";

describe("goSync", () => {
  test("returns value when no error", () => {
    const [result, err] = goSync(() => 42);
    expect(result).toBe(42);
    expect(err).toBeNull();
  });

  test("handles thrown errors", () => {
    const [result, err] = goSync(() => {
      throw new Error("test error");
    });
    expect(result).toBeNull();
    expect(err?.message).toBe("test error");
  });

  test("handles non-Error objects thrown", () => {
    const [result, err] = goSync(() => {
      throw "string error";
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("string error");
  });

  test("handles undefined return", () => {
    const [result, err] = goSync(() => undefined);
    expect(result).toBeUndefined();
    expect(err).toBeNull();
  });

  test("handles null return", () => {
    const [result, err] = goSync(() => null);
    expect(result).toBeNull();
    expect(err).toBeNull();
  });

  test("handles custom error types", () => {
    class CustomError extends Error {
      code: number;
      constructor(message: string, code: number) {
        super(message);
        this.code = code;
      }
    }
    
    const [result, err] = goSync<number, CustomError>(() => {
      throw new CustomError("custom error", 500);
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(CustomError);
    expect((err as CustomError).code).toBe(500);
  });

  test("handles thrown objects", () => {
    const [result, err] = goSync(() => {
      throw { foo: "bar" };
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('{"foo":"bar"}');
  });
});

describe("goAsync", () => {
  test("resolves successful promises", async () => {
    const [result, err] = await goAsync(Promise.resolve(42));
    expect(result).toBe(42);
    expect(err).toBeNull();
  });

  test("handles rejected promises", async () => {
    const [result, err] = await goAsync(
      Promise.reject(new Error("async error")),
    );
    expect(result).toBeNull();
    expect(err?.message).toBe("async error");
  });

  test("handles async undefined return", async () => {
    const [result, err] = await goAsync(Promise.resolve(undefined));
    expect(result).toBeUndefined();
    expect(err).toBeNull();
  });

  test("handles async null return", async () => {
    const [result, err] = await goAsync(Promise.resolve(null));
    expect(result).toBeNull();
    expect(err).toBeNull();
  });

  test("handles rejected non-Error objects", async () => {
    const [result, err] = await goAsync(Promise.reject("string error"));
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("string error");
  });

  test("handles rejected objects", async () => {
    const [result, err] = await goAsync(Promise.reject({ foo: "bar" }));
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('{"foo":"bar"}');
  });

  test("handles custom error types in async", async () => {
    class CustomError extends Error {
      code: number;
      constructor(message: string, code: number) {
        super(message);
        this.code = code;
      }
    }
    
    const [result, err] = await goAsync<number, CustomError>(
      Promise.reject(new CustomError("custom async error", 404))
    );
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(CustomError);
    expect((err as CustomError).code).toBe(404);
  });
});

describe("go", () => {
  test("handles sync functions", () => {
    const [result, err] = go(() => 42);
    expect(result).toBe(42);
    expect(err).toBeNull();
  });

  test("handles async functions", async () => {
    const [result, err] = await go(Promise.resolve(42));
    expect(result).toBe(42);
    expect(err).toBeNull();
  });

  test("handles sync errors", () => {
    const [result, err] = go(() => {
      throw new Error("sync error in go");
    });
    expect(result).toBeNull();
    expect(err?.message).toBe("sync error in go");
  });

  test("handles async errors", async () => {
    const [result, err] = await go(Promise.reject(new Error("async error in go")));
    expect(result).toBeNull();
    expect(err?.message).toBe("async error in go");
  });

  test("type inference works correctly", () => {
    const syncResult = go(() => "string"); // Should infer [string, null] | [null, Error]
    const asyncResult = go(Promise.resolve(42)); // Should infer Promise<[number, null] | [null, Error]>
    
    // TypeScript will error if these types are wrong
    if (syncResult[0] !== null) {
      const str: string = syncResult[0];
      expect(typeof str).toBe("string");
    }
    
    // Testing async type inference
    asyncResult.then(([num]) => {
      if (num !== null) {
        const n: number = num;
        expect(typeof n).toBe("number");
      }
    });
  });
});
