/**
 * Retry Utility with Exponential Backoff
 * Provides resilient retry logic for transient failures
 */

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in ms before first retry */
  initialDelay: number;
  /** Maximum delay in ms between retries */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Whether to add jitter to prevent thundering herd */
  jitter: boolean;
  /** Function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback on each retry attempt */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Default function to check if an error is retryable
 */
function defaultIsRetryable(error: Error): boolean {
  // Retry on network errors
  if (error.name === 'FetchError' || error.name === 'NetworkError') {
    return true;
  }

  // Retry on timeout errors
  if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
    return true;
  }

  // Retry on rate limit errors
  if (error.message.includes('rate limit') || error.message.includes('429')) {
    return true;
  }

  // Retry on server errors (5xx)
  if (error.message.includes('500') || error.message.includes('502') ||
      error.message.includes('503') || error.message.includes('504')) {
    return true;
  }

  // Retry on connection errors
  if (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED')) {
    return true;
  }

  // Don't retry on client errors (4xx) except rate limits
  if (error.message.includes('400') || error.message.includes('401') ||
      error.message.includes('403') || error.message.includes('404')) {
    return false;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Calculate delay for a given attempt with optional jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const baseDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  const delay = Math.min(baseDelay, config.maxDelay);

  if (config.jitter) {
    // Add random jitter between 0% and 25% of delay
    return delay + Math.random() * delay * 0.25;
  }

  return delay;
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const isRetryable = fullConfig.isRetryable || defaultIsRetryable;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (attempt >= fullConfig.maxRetries || !isRetryable(lastError)) {
        break;
      }

      const delay = calculateDelay(attempt, fullConfig);

      // Log retry attempt
      console.warn(
        JSON.stringify({
          event: 'retry_attempt',
          attempt: attempt + 1,
          maxRetries: fullConfig.maxRetries,
          delay: Math.round(delay),
          error: lastError.message,
        })
      );

      // Call retry callback if provided
      if (fullConfig.onRetry) {
        fullConfig.onRetry(lastError, attempt + 1, delay);
      }

      await sleep(delay);
    }
  }

  // Log final failure
  console.error(
    JSON.stringify({
      event: 'retry_exhausted',
      maxRetries: fullConfig.maxRetries,
      error: lastError?.message,
    })
  );

  throw lastError;
}

/**
 * Create a retry wrapper with pre-configured settings
 */
export function createRetryWrapper(
  config: Partial<RetryConfig>
): <T>(fn: () => Promise<T>) => Promise<T> {
  return <T>(fn: () => Promise<T>) => retry(fn, config);
}

/**
 * Decorator for retrying class methods
 */
export function Retryable(config: Partial<RetryConfig> = {}) {
  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return retry(() => originalMethod.apply(this, args), {
        ...config,
        onRetry: (error, attempt, delay) => {
          console.warn(
            JSON.stringify({
              event: 'method_retry',
              method: propertyKey,
              attempt,
              delay: Math.round(delay),
              error: error.message,
            })
          );
        },
      });
    };

    return descriptor;
  };
}

/**
 * Pre-configured retry strategies
 */
export const RetryStrategies = {
  /** Fast retries for quick operations */
  fast: createRetryWrapper({
    maxRetries: 3,
    initialDelay: 100,
    maxDelay: 1000,
    backoffMultiplier: 2,
  }),

  /** Standard retries for API calls */
  standard: createRetryWrapper({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }),

  /** Patient retries for external services */
  patient: createRetryWrapper({
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 2,
  }),

  /** Aggressive retries for critical operations */
  aggressive: createRetryWrapper({
    maxRetries: 10,
    initialDelay: 500,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
  }),
};

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> & { timeout: number }
): Promise<T> {
  const { timeout, ...retryConfig } = config;

  return Promise.race([
    retry(fn, retryConfig),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeout)
    ),
  ]);
}
