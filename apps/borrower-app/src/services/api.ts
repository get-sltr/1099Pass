/**
 * API Service
 * Centralized HTTP client with authentication, retry logic, and error handling
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

// Storage keys
const TOKEN_KEY = '1099pass_auth_token';
const REFRESH_TOKEN_KEY = '1099pass_refresh_token';

// API configuration
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  retries: 3,
  retryDelays: [1000, 2000, 4000], // Exponential backoff
};

// Error types for user-friendly messages
export type ApiErrorType =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'server'
  | 'unknown';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
}

// Network status
let isOnline = true;
let networkListeners: ((online: boolean) => void)[] = [];

// Initialize network monitoring
NetInfo.addEventListener((state) => {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? true;

  if (wasOnline !== isOnline) {
    networkListeners.forEach((listener) => listener(isOnline));
  }
});

export function addNetworkListener(listener: (online: boolean) => void): () => void {
  networkListeners.push(listener);
  return () => {
    networkListeners = networkListeners.filter((l) => l !== listener);
  };
}

export function getNetworkStatus(): boolean {
  return isOnline;
}

// Parse API errors into user-friendly messages
function parseApiError(error: AxiosError): ApiError {
  // Network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Request timed out. Please try again.',
        originalError: error,
      };
    }
    return {
      type: 'network',
      message: isOnline
        ? 'Unable to connect to the server. Please try again.'
        : 'You appear to be offline. Please check your connection.',
      originalError: error,
    };
  }

  const { status, data } = error.response;
  const serverMessage = (data as any)?.message || (data as any)?.error;

  switch (status) {
    case 400:
      return {
        type: 'validation',
        message: serverMessage || 'Invalid request. Please check your input.',
        statusCode: status,
        originalError: error,
      };
    case 401:
      return {
        type: 'unauthorized',
        message: 'Your session has expired. Please sign in again.',
        statusCode: status,
        originalError: error,
      };
    case 403:
      return {
        type: 'forbidden',
        message: serverMessage || 'You do not have permission to perform this action.',
        statusCode: status,
        originalError: error,
      };
    case 404:
      return {
        type: 'not_found',
        message: serverMessage || 'The requested resource was not found.',
        statusCode: status,
        originalError: error,
      };
    case 429:
      return {
        type: 'server',
        message: 'Too many requests. Please wait a moment and try again.',
        statusCode: status,
        originalError: error,
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'server',
        message: 'Server error. Our team has been notified. Please try again later.',
        statusCode: status,
        originalError: error,
      };
    default:
      return {
        type: 'unknown',
        message: serverMessage || 'An unexpected error occurred. Please try again.',
        statusCode: status,
        originalError: error,
      };
  }
}

// Request queue for token refresh
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => {
        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // Queue this request to be retried after token refresh
            return new Promise((resolve, reject) => {
              refreshQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newToken = await this.refreshToken();

            // Process queued requests
            refreshQueue.forEach(({ resolve }) => resolve(newToken));
            refreshQueue = [];

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear auth and reject all queued requests
            refreshQueue.forEach(({ reject }) => reject(refreshError as Error));
            refreshQueue = [];

            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
      refreshToken,
    });

    const { token, refreshToken: newRefreshToken } = response.data;

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (newRefreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
    }

    return token;
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = API_CONFIG.retries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        const axiosError = error as AxiosError;

        // Don't retry certain errors
        if (
          axiosError.response?.status === 400 ||
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403 ||
          axiosError.response?.status === 404
        ) {
          throw error;
        }

        // Check if we should retry
        if (attempt < retries) {
          const delay = API_CONFIG.retryDelays[attempt] || API_CONFIG.retryDelays[API_CONFIG.retryDelays.length - 1];

          if (process.env.NODE_ENV === 'development') {
            console.log(`[API] Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.retryRequest(() => this.client.get<T>(url, config));
      return response.data;
    } catch (error) {
      throw parseApiError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.retryRequest(() => this.client.post<T>(url, data, config));
      return response.data;
    } catch (error) {
      throw parseApiError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.retryRequest(() => this.client.put<T>(url, data, config));
      return response.data;
    } catch (error) {
      throw parseApiError(error as AxiosError);
    }
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.retryRequest(() => this.client.patch<T>(url, data, config));
      return response.data;
    } catch (error) {
      throw parseApiError(error as AxiosError);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.retryRequest(() => this.client.delete<T>(url, config));
      return response.data;
    } catch (error) {
      throw parseApiError(error as AxiosError);
    }
  }
}

export const api = new ApiService();
