/**
 * Circuit Breaker Pattern
 * Prevents cascade failures by temporarily blocking calls to failing services
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting to close circuit */
  resetTimeout: number;
  /** Number of successful calls needed to close circuit */
  successThreshold: number;
  /** Time window in ms to count failures */
  failureWindow: number;
  /** Optional name for logging */
  name?: string;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  openedAt: Date | null;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 2,
  failureWindow: 60000, // 1 minute
  name: 'default',
};

/**
 * In-memory circuit breaker implementation
 * For distributed systems, use DynamoDB or Redis instead
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure: Date | null = null;
  private lastSuccess: Date | null = null;
  private openedAt: Date | null = null;
  private failureTimestamps: number[] = [];
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      openedAt: this.openedAt,
    };
  }

  /**
   * Check if the circuit allows requests
   */
  isAllowed(): boolean {
    this.updateState();
    return this.state !== 'OPEN';
  }

  /**
   * Record a successful call
   */
  recordSuccess(): void {
    this.lastSuccess = new Date();

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.close();
      }
    }
  }

  /**
   * Record a failed call
   */
  recordFailure(error?: Error): void {
    const now = Date.now();
    this.lastFailure = new Date();
    this.failureTimestamps.push(now);

    // Remove failures outside the window
    const windowStart = now - this.config.failureWindow;
    this.failureTimestamps = this.failureTimestamps.filter((t) => t > windowStart);
    this.failures = this.failureTimestamps.length;

    if (this.state === 'HALF_OPEN') {
      // Any failure in half-open state reopens the circuit
      this.open();
    } else if (
      this.state === 'CLOSED' &&
      this.failures >= this.config.failureThreshold
    ) {
      this.open();
    }

    // Log the failure
    console.warn(
      JSON.stringify({
        event: 'circuit_breaker_failure',
        circuit: this.config.name,
        state: this.state,
        failures: this.failures,
        threshold: this.config.failureThreshold,
        error: error?.message,
      })
    );
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.isAllowed()) {
      throw new CircuitOpenError(
        `Circuit ${this.config.name} is open. Try again later.`
      );
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error as Error);
      throw error;
    }
  }

  /**
   * Update state based on timeouts
   */
  private updateState(): void {
    if (this.state === 'OPEN' && this.openedAt) {
      const elapsed = Date.now() - this.openedAt.getTime();
      if (elapsed >= this.config.resetTimeout) {
        this.halfOpen();
      }
    }
  }

  /**
   * Open the circuit
   */
  private open(): void {
    if (this.state !== 'OPEN') {
      console.warn(
        JSON.stringify({
          event: 'circuit_breaker_opened',
          circuit: this.config.name,
          failures: this.failures,
          resetTimeout: this.config.resetTimeout,
        })
      );
    }
    this.state = 'OPEN';
    this.openedAt = new Date();
    this.successes = 0;
  }

  /**
   * Half-open the circuit (allow testing)
   */
  private halfOpen(): void {
    console.info(
      JSON.stringify({
        event: 'circuit_breaker_half_open',
        circuit: this.config.name,
      })
    );
    this.state = 'HALF_OPEN';
    this.successes = 0;
  }

  /**
   * Close the circuit
   */
  private close(): void {
    console.info(
      JSON.stringify({
        event: 'circuit_breaker_closed',
        circuit: this.config.name,
        recoveryTime:
          this.openedAt ? Date.now() - this.openedAt.getTime() : null,
      })
    );
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.failureTimestamps = [];
    this.openedAt = null;
  }

  /**
   * Force reset the circuit
   */
  reset(): void {
    this.close();
    this.lastFailure = null;
    this.lastSuccess = null;
  }
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

/**
 * Circuit breaker registry for managing multiple circuits
 */
class CircuitBreakerRegistry {
  private circuits: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, new CircuitBreaker({ name, ...config }));
    }
    return this.circuits.get(name)!;
  }

  /**
   * Get all circuit stats
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, circuit] of this.circuits) {
      stats[name] = circuit.getStats();
    }
    return stats;
  }

  /**
   * Reset all circuits
   */
  resetAll(): void {
    for (const circuit of this.circuits.values()) {
      circuit.reset();
    }
  }
}

// Singleton registry
export const circuitBreakers = new CircuitBreakerRegistry();

/**
 * Pre-configured circuit breakers for common services
 */
export const ServiceCircuits = {
  plaid: () =>
    circuitBreakers.get('plaid', {
      failureThreshold: 3,
      resetTimeout: 60000,
      successThreshold: 2,
      failureWindow: 120000,
    }),
  database: () =>
    circuitBreakers.get('database', {
      failureThreshold: 5,
      resetTimeout: 10000,
      successThreshold: 3,
      failureWindow: 30000,
    }),
  cognitoAuth: () =>
    circuitBreakers.get('cognito', {
      failureThreshold: 5,
      resetTimeout: 30000,
      successThreshold: 2,
      failureWindow: 60000,
    }),
};
