# go-errors

A lightweight, type-safe TypeScript library that brings Go-style error handling to JavaScript/TypeScript. Say goodbye to try-catch blocks and hello to elegant, functional error handling! This library brings the simplicity and elegance of Go's error handling pattern to your TypeScript/JavaScript projects.

## Features

- 🎯 **Type-safe**: Full TypeScript support with precise type inference
- 🔄 **Unified API**: Same pattern for both sync and async operations
- 🌐 **Fetch Support**: Built-in wrapper for fetch operations with transformers
- 🪶 **Lightweight**: Zero dependencies, minimal overhead
- 🔒 **Immutable**: Results are readonly tuples
- 🎨 **Flexible**: Support for custom error types
- 📦 **Tree-shakeable**: Only import what you need
- 🔍 **Predictable**: No more try-catch spaghetti code
- 🚀 **Fast**: Minimal runtime overhead
- 💡 **Intuitive**: Familiar pattern for Go developers

## Installation

```bash
bun add go-errors
```

## Quick Start

```typescript
import { go } from 'go-errors';

// Synchronous usage
let [value, err] = go(() => {
  if (Math.random() > 0.5) throw new Error('Bad luck!');
  return 42;
});

if (err) {
  console.error('Something went wrong:', err);
} else {
  console.log('Got value:', value);
}

// Asynchronous usage
let [data, err] = await go(fetch('https://api.example.com/data'));

if (err) {
  console.error('Failed to fetch:', err);
} else {
  console.log('Got data:', data);
}
```

## Core Concepts

### The Result Type

The library uses a tuple-based Result type that's similar to Go's multiple return values:

```typescript
type Result<T, E = Error> = readonly [T, null] | readonly [null, E];
```

This means a function will always return either:
- `[value, null]` for success
- `[null, error]` for failure

### Variable Declaration Best Practice

Following Go's convention, we recommend using `let` instead of `const` for result declarations. This allows you to reuse the error variable name (typically `err`) throughout your code, just like in Go:

```typescript
// ✅ Recommended: Using let
let [value, err] = go(() => someOperation());
if (err) return handleError(err);

// Another operation using the same err variable
let [result, err] = go(() => anotherOperation());
if (err) return handleError(err);

// ❌ Not recommended: Using const requires unique variable names
const [value1, error1] = go(() => someOperation());
if (error1) return handleError(error1);

const [value2, error2] = go(() => anotherOperation());
if (error2) return handleError(error2);
```

### Main Functions

#### 1. `go<T, E = Error>`

The main function that handles both synchronous and asynchronous operations:

```typescript
// Synchronous
let [value, err] = go(() => someOperation());

// Asynchronous
let [value, err] = await go(somePromise);

// With custom error types
let [value, err] = go<number, CustomError>(() => validate(input));
```

#### 2. `goFetch<T, E = string>`

A powerful fetch wrapper with built-in error handling and transformation capabilities:

```typescript
interface User {
  id: number;
  name: string;
}

// Basic usage
let [user, err] = await goFetch<User>('https://api.example.com/user/1');

// Advanced usage with options
let [user, err] = await goFetch<User>('https://api.example.com/user/1', {
  // Request options (extends Fetch API options)
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'John' }),
  
  // Response transformation
  responseTransformer: (data: unknown) => ({
    ...data as User,
    lastFetched: new Date()
  }),
  
  // Error transformation
  errorTransformer: (error: unknown) => {
    if (error instanceof Error) {
      return `API Error: ${error.message}`;
    }
    return 'Unknown error occurred';
  }
});
```

##### goFetch Options

The `goFetch` function accepts an optional options object that extends the standard Fetch API options:

```typescript
interface GoFetchOptions<T = any, E = string> extends RequestInit {
  // Transform the response data before returning
  responseTransformer?: (data: unknown) => T;
  
  // Transform errors into your preferred format
  errorTransformer?: (error: unknown) => E;
  
  // All standard fetch options are supported
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  // ... and more
}
```

## Advanced Usage

### Custom Error Types

You can specify custom error types for more precise error handling:

```typescript
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}

let [value, err] = go<number, ValidationError>(() => {
  if (input < 0) throw new ValidationError('input', 'Must be positive');
  return input * 2;
});

if (err) {
  console.error(`Validation failed for ${err.field}: ${err.message}`);
}
```

### Complex API Interactions

```typescript
interface ApiResponse<T> {
  data: T;
  status: string;
  metadata: {
    timestamp: string;
    version: string;
  };
}

interface ApiError {
  code: number;
  message: string;
  details?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUserData(userId: string) {
  let [user, err] = await goFetch<ApiResponse<User>, ApiError>(
    `https://api.example.com/user/${userId}`,
    {
      headers: {
        'Authorization': 'Bearer token',
      },
      responseTransformer: (data: unknown) => {
        const response = data as ApiResponse<User>;
        // Add custom validation
        if (!response.data.id) {
          throw new Error('Invalid user data');
        }
        return response;
      },
      errorTransformer: (error: unknown) => {
        if (error instanceof Error) {
          return {
            code: 500,
            message: error.message,
            details: error.stack
          };
        }
        return {
          code: 400,
          message: 'Unknown error'
        };
      },
    }
  );

  if (err) {
    console.error(`API Error ${err.code}: ${err.message}`);
    return [null, err] as const;
  }

  return [user.data, null] as const;
}
```

### Error Handling Patterns

#### Sequential Operations

```typescript
async function processUserData(userId: string) {
  // Fetch user
  let [user, err] = await goFetch<User>(`/api/users/${userId}`);
  if (err) return [null, err] as const;

  // Fetch user's posts
  let [posts, err] = await goFetch<Post[]>(`/api/users/${userId}/posts`);
  if (err) return [null, err] as const;

  // Process everything
  let [result, err] = go(() => ({
    user,
    posts,
    timestamp: new Date()
  }));
  
  return [result, err] as const;
}
```

#### Parallel Operations

```typescript
async function fetchUserDashboard(userId: string) {
  // Fetch multiple resources in parallel
  let [results, err] = await go(Promise.all([
    goFetch<User>(`/api/users/${userId}`),
    goFetch<Post[]>(`/api/users/${userId}/posts`),
    goFetch<Activity[]>(`/api/users/${userId}/activity`)
  ]));

  if (err) return [null, err] as const;

  const [[user, userErr], [posts, postsErr], [activity, activityErr]] = results;

  // Check for individual errors
  if (userErr || postsErr || activityErr) {
    return [null, new Error('Failed to fetch some dashboard data')] as const;
  }

  return [{
    user,
    posts,
    activity,
    lastUpdated: new Date()
  }, null] as const;
}
```

## Best Practices

1. **Always Check for Errors First**
   ```typescript
   let [data, err] = await go(fetchData());
   if (err) {
     // Handle error first
     return handleError(err);
   }
   // Then work with data
   processData(data);
   ```

2. **Use Type Parameters for Better Type Safety**
   ```typescript
   let [value, err] = go<number, CustomError>(() => validate(input));
   ```

3. **Avoid Nested Error Handling**
   ```typescript
   // Good
   let [data, err] = await go(step1());
   if (err) return handleError(err);
   
   let [result, err] = await go(step2(data));
   if (err) return handleError(err);
   
   // Not recommended
   let [data, err] = await go(step1());
   if (!err) {
     let [result, err] = await go(step2(data));
     if (!err) {
       // ...
     }
   }
   ```

4. **Use Consistent Error Types**
   ```typescript
   // Define your error types
   type AppError = ValidationError | DatabaseError | NetworkError;

   // Use them consistently
   let [data, err] = go<Data, AppError>(() => processData());
   ```

5. **Propagate Errors Up**
   ```typescript
   function processData(): GoResult<ProcessedData, AppError> {
     let [data, err] = getData();
     if (err) return [null, err] as const;

     let [processed, err] = go(() => transform(data));
     if (err) return [null, err] as const;

     return [processed, null] as const;
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

MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by Ashkan Samadiyan

---

Made with ❤️ for the TypeScript community 