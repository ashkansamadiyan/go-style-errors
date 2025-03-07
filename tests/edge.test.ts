import { describe, expect, test } from "vitest";
import { go, goSync, goAsync } from "../src";

describe("edge cases - complex objects", () => {
  test("handles nested objects", () => {
    const [result, err] = goSync(() => {
      throw { nested: { deep: { value: 42 } } };
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('{"nested":{"deep":{"value":42}}}');
  });

  test("handles arrays", () => {
    const [result, err] = goSync(() => {
      throw [1, 2, 3];
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('[1,2,3]');
  });

  test("handles mixed complex objects", () => {
    const [result, err] = goSync(() => {
      throw { arr: [1, { x: 2 }], obj: { y: [3, 4] } };
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('{"arr":[1,{"x":2}],"obj":{"y":[3,4]}}');
  });

  test("handles circular references", () => {
    const circular: any = { foo: "bar" };
    circular.self = circular;
    const [result, err] = goSync(() => {
      throw circular;
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    // JSON.stringify will throw on circular references
    expect(err?.message).toBe("JSON.stringify cannot serialize cyclic structures.");
  });
});

describe("edge cases - special values", () => {
  test("handles symbols", () => {
    const sym = Symbol('test');
    const [result, err] = goSync(() => {
      throw sym;
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('Symbol(test)');
  });

  test("handles bigint", () => {
    const [result, err] = goSync(() => {
      throw BigInt(9007199254740991);
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('9007199254740991');
  });

  test("handles functions", () => {
    function testFn() { return 42; }
    const [result, err] = goSync(() => {
      throw testFn;
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toContain('function');
  });

  test("handles Date objects", () => {
    const date = new Date('2024-01-01');
    const [result, err] = goSync(() => {
      throw date;
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe(JSON.stringify(date));
  });

  test("handles RegExp objects", () => {
    const regex = /test/gi;
    const [result, err] = goSync(() => {
      throw regex;
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe(regex.toString());
  });
});

describe("edge cases - error handling", () => {
  test("preserves error stack", () => {
    const [result, err] = goSync(() => {
      throw new Error('test');
    });
    expect(err?.stack).toBeDefined();
    expect(err?.stack).toContain('test');
    expect(err?.stack).toContain('edge.test.ts');
  });

  test("preserves custom error properties", () => {
    class CustomError extends Error {
      constructor(public code: number, message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }
    
    const [result, err] = goSync(() => {
      throw new CustomError(500, 'test');
    });
    expect(err).toBeInstanceOf(CustomError);
    expect((err as CustomError).code).toBe(500);
    expect(err?.name).toBe('CustomError');
  });

  test("handles errors thrown within errors", () => {
    const [result, err] = goSync(() => {
      const e = new Error('outer');
      (e as any).cause = new Error('inner');
      throw e;
    });
    expect(err?.message).toBe('outer');
    expect((err as any).cause?.message).toBe('inner');
  });
});

describe("edge cases - async patterns", () => {
  test("handles promise timeouts", async () => {
    const [result, err] = await Promise.race<[unknown | null, Error | null]>([
      goAsync(new Promise<never>(() => {})),
      new Promise<[null, Error]>(resolve => 
        setTimeout(() => resolve([null, new Error('timeout')]), 100)
      )
    ]);
    expect(err?.message).toBe('timeout');
  });

  test("handles multiple promise rejections", async () => {
    const promises = [
      Promise.reject(new Error('error1')),
      Promise.reject(new Error('error2'))
    ];
    const results = await Promise.all(promises.map(p => goAsync(p)));
    expect(results.every(([r, e]) => e !== null)).toBe(true);
    expect(results[0][1]?.message).toBe('error1');
    expect(results[1][1]?.message).toBe('error2');
  });

  test("handles nested promises", async () => {
    const [result, err] = await goAsync(
      Promise.resolve(Promise.resolve(42))
    );
    expect(result).toBe(42);
    expect(err).toBeNull();
  });

  test("handles promise rejections with undefined", async () => {
    const [result, err] = await goAsync(Promise.reject(undefined));
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('undefined');
  });
});

describe("edge cases - type safety", () => {
  test("handles union type errors", () => {
    function throwsUnion(): never {
      const errors = [TypeError, RangeError];
      throw new errors[Math.floor(Math.random() * errors.length)]();
    }
    
    const [result, err] = goSync(throwsUnion);
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err instanceof TypeError || err instanceof RangeError).toBe(true);
  });

  test("preserves error instance types", () => {
    const [result, err] = goSync(() => {
      throw new TypeError("type error");
    });
    expect(err).toBeInstanceOf(TypeError);
    expect(err?.name).toBe('TypeError');
  });

  test("handles null prototype objects", () => {
    const nullProtoObj = Object.create(null);
    nullProtoObj.message = "test";
    
    const [result, err] = goSync(() => {
      throw nullProtoObj;
    });
    expect(result).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('{"message":"test"}');
  });
});

describe("edge cases - return values", () => {
  test("handles promise resolving to undefined", async () => {
    const [result, err] = await goAsync(Promise.resolve(undefined));
    expect(result).toBeUndefined();
    expect(err).toBeNull();
  });

  test("handles promise resolving to null", async () => {
    const [result, err] = await goAsync(Promise.resolve(null));
    expect(result).toBeNull();
    expect(err).toBeNull();
  });

  test("handles promise resolving to empty string", async () => {
    const [result, err] = await goAsync(Promise.resolve(""));
    expect(result).toBe("");
    expect(err).toBeNull();
  });

  test("handles zero values correctly", () => {
    const [result, err] = goSync(() => 0);
    expect(result).toBe(0);
    expect(err).toBeNull();
  });

  test("handles false values correctly", () => {
    const [result, err] = goSync(() => false);
    expect(result).toBe(false);
    expect(err).toBeNull();
  });
}); 