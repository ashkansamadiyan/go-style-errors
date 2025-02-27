# go-errors

[![npm version](https://badge.fury.io/js/go-errors.svg)](https://badge.fury.io/js/go-errors)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library that brings Go-style error handling to JavaScript/TypeScript. Handle errors elegantly without try-catch blocks, using a functional approach that's both type-safe and intuitive.

## Features

- 🎯 **Type-safe** error handling with full TypeScript support
- 🔄 **Go-style** result tuples `[value, error]`
- ⚡ **Zero dependencies** and lightweight
- 🔀 **Unified API** for both synchronous and asynchronous operations
- 🛡️ **Predictable error handling** without try-catch blocks
- 📦 **Tree-shakeable** and optimized for bundle size

## Installation

```bash
npm install go-errors
# or
yarn add go-errors
# or
pnpm add go-errors
```

## Quick Start

```typescript
import { go } from 'go-errors';

// Synchronous usage
const [value, error] = go(() => {
  // Your code that might throw
  return "success";
});

if (error) {
  console.error("Something went wrong:", error.message);
} else {
  console.log("Got value:", value);
}

// Asynchronous usage
const [data, err] = await go(fetch("https://api.example.com/data"));
if (err) {
  console.error("API call failed:", err.message);
} else {
  console.log("API data:", data);
}
```

## Usage Examples

### Basic Error Handling

```typescript
import { go } from 'go-errors';

function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// Synchronous error handling
const [result, err] = go(() => divide(10, 0));
if (err) {
  console.log("Failed to divide:", err.message); // "Failed to divide: Division by zero"
} else {
  console.log("Result:", result);
}
```

### Async/Promise Handling

```typescript
import { go } from 'go-errors';

async function fetchUserData(id: string) {
  const [response, fetchError] = await go(
    fetch(`https://api.example.com/users/${id}`)
  );
  
  if (fetchError) {
    return [null, fetchError] as const;
  }
  
  const [data, parseError] = await go(response.json());
  if (parseError) {
    return [null, parseError] as const;
  }
  
  return [data, null] as const;
}

// Usage
async function main() {
  const [userData, error] = await fetchUserData("123");
  if (error) {
    console.error("Failed to fetch user:", error.message);
    return;
  }
  console.log("User data:", userData);
}
```

### Custom Error Types

```typescript
import { go } from 'go-errors';

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateUser(user: unknown) {
  if (typeof user !== 'object' || !user) {
    throw new ValidationError('Invalid user object');
  }
  return user;
}

const [user, error] = go<unknown, ValidationError>(() => 
  validateUser({ name: 'John' })
);

if (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed:", error.message);
  } else {
    console.log("Unknown error:", error.message);
  }
}
```

### Working with Multiple Operations

```typescript
import { go } from 'go-errors';

async function processUserData(userId: string) {
  // Fetch user
  const [user, userError] = await go(fetchUser(userId));
  if (userError) return [null, userError] as const;

  // Fetch user's posts
  const [posts, postsError] = await go(fetchUserPosts(userId));
  if (postsError) return [null, postsError] as const;

  // Process everything
  return [{
    user,
    posts,
    timestamp: new Date()
  }, null] as const;
}
```

## Edge Cases

The library handles various edge cases gracefully:

1. **Circular References**: Objects with circular references are handled gracefully with descriptive error messages:
   ```typescript
   const circular = { foo: 'bar' };
   circular.self = circular;
   const [result, err] = go(() => circular);
   // err.message will contain information about the circular structure
   ```

2. **Special Objects**: Special JavaScript objects are properly stringified:
   ```typescript
   // RegExp
   const [_, regexErr] = go(() => { throw /test/gi; });
   console.log(regexErr.message); // "/test/gi"

   // Date
   const [_, dateErr] = go(() => { throw new Date(); });
   // Preserves date format in error message
   ```

3. **Falsy Values**: Properly handles falsy values (undefined, null, 0, false, ''):
   ```typescript
   const [result, err] = go(() => false);
   console.log(result === false); // true
   console.log(err === null); // true
   ```

## API Reference

### Core Functions

#### `go<T, E = Error>(fn: () => T): Result<T, E>`
#### `go<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>`

The main function that handles both synchronous and asynchronous operations.

```typescript
// Sync
const [value, error] = go(() => someOperation());

// Async
const [value, error] = await go(somePromise);
```

#### `goSync<T, E = Error>(fn: () => T): Result<T, E>`

Specifically handles synchronous operations.

```typescript
const [value, error] = goSync(() => {
  // synchronous code that might throw
  return someValue;
});
```

#### `goAsync<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>`

Specifically handles asynchronous operations.

```typescript
const [value, error] = await goAsync(fetch('https://api.example.com'));
```

### Types

```typescript
type Result<T, E = Error> = [T, null] | [null, E];
```

## Best Practices

1. **Type Your Errors**: Always specify error types for better type safety:
   ```typescript
   const [value, error] = go<number, ValidationError>(() => validate(input));
   ```

2. **Early Returns**: Use early returns with error checking:
   ```typescript
   const [data, error] = await fetchData();
   if (error) return [null, error] as const;
   ```

3. **Error Propagation**: Propagate errors up the call stack:
   ```typescript
   function processData() {
     const [data, error] = getData();
     if (error) return [null, error] as const;
     // process data
   }
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Go's error handling pattern
- Built with TypeScript for type safety
- Designed for modern JavaScript/TypeScript applications

---

Made with ❤️ for the TypeScript community 