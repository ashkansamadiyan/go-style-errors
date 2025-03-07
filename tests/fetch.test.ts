import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { goFetch } from '../src/fetch';

describe('goFetch', () => {
  // Mock global fetch
  const originalFetch = global.fetch;
  
  beforeAll(() => {
    // @ts-ignore - mock fetch
    global.fetch = vi.fn();
  });

  afterAll(() => {
    // @ts-ignore - restore fetch
    global.fetch = originalFetch;
  });

  it('should handle successful fetch with JSON response', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    // @ts-ignore - mock implementation
    global.fetch.mockResolvedValueOnce(mockResponse);

    const [data, error] = await goFetch('https://api.example.com/data');

    expect(error).toBeNull();
    expect(data).toEqual(mockData);
  });

  it('should handle HTTP errors', async () => {
    const mockResponse = new Response('Not Found', {
      status: 404,
      statusText: 'Not Found',
    });

    // @ts-ignore - mock implementation
    global.fetch.mockResolvedValueOnce(mockResponse);

    const [data, error] = await goFetch('https://api.example.com/notfound');

    expect(data).toBeNull();
    expect(error).toBe('HTTP error! status: 404');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    // @ts-ignore - mock implementation
    global.fetch.mockRejectedValueOnce(networkError);

    const [data, error] = await goFetch('https://api.example.com/error');

    expect(data).toBeNull();
    expect(error).toBe('Network error');
  });

  it('should handle invalid JSON response', async () => {
    const mockResponse = new Response('invalid json', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    // @ts-ignore - mock implementation
    global.fetch.mockResolvedValueOnce(mockResponse);

    const [data, error] = await goFetch('https://api.example.com/invalid');

    expect(data).toBeNull();
    expect(error).toBe('Failed to parse JSON');
  });

  it('should use response transformer when provided', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    // @ts-ignore - mock implementation
    global.fetch.mockResolvedValueOnce(mockResponse);

    interface TransformedData {
      userId: number;
      userName: string;
    }

    const [data, error] = await goFetch<TransformedData>('https://api.example.com/data', {
      responseTransformer: (data: unknown) => ({
        userId: (data as typeof mockData).id,
        userName: (data as typeof mockData).name.toUpperCase(),
      }),
    });

    expect(error).toBeNull();
    expect(data).toEqual({
      userId: 1,
      userName: 'TEST',
    });
  });

  it('should use error transformer when provided', async () => {
    const networkError = new Error('Network error');
    // @ts-ignore - mock implementation
    global.fetch.mockRejectedValueOnce(networkError);

    interface CustomError {
      code: string;
      message: string;
    }

    const [data, error] = await goFetch<unknown, CustomError>('https://api.example.com/error', {
      errorTransformer: (e) => ({
        code: 'NETWORK_ERROR',
        message: e instanceof Error ? e.message : 'Unknown error',
      }),
    });

    expect(data).toBeNull();
    expect(error).toEqual({
      code: 'NETWORK_ERROR',
      message: 'Network error',
    });
  });

  it('should handle non-Error objects in error transformer', async () => {
    // @ts-ignore - mock implementation
    global.fetch.mockRejectedValueOnce('string error');

    const [data, error] = await goFetch('https://api.example.com/error');

    expect(data).toBeNull();
    expect(error).toBe('Failed to fetch data');
  });

  it('should handle both transformers together', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    // @ts-ignore - mock implementation
    global.fetch.mockResolvedValueOnce(mockResponse);

    interface TransformedData {
      uid: string;
      displayName: string;
    }

    interface CustomError {
      type: string;
      details: string;
    }

    const [data, error] = await goFetch<TransformedData, CustomError>(
      'https://api.example.com/data',
      {
        responseTransformer: (data: unknown) => ({
          uid: `user_${(data as typeof mockData).id}`,
          displayName: (data as typeof mockData).name,
        }),
        errorTransformer: (e) => ({
          type: 'API_ERROR',
          details: e instanceof Error ? e.message : String(e),
        }),
      }
    );

    expect(error).toBeNull();
    expect(data).toEqual({
      uid: 'user_1',
      displayName: 'Test',
    });
  });
}); 