import logger from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 * Handles temporary network issues and transient failures
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryableErrors = [
      'timeout',
      'network',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'EAI_AGAIN',
      'socket hang up',
      'read ECONNRESET',
    ],
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 0) {
        logger.info(`✅ Retry succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const errorMessage = error?.message?.toLowerCase() || '';
      const errorCode = error?.code?.toLowerCase() || '';
      
      const isRetryable = retryableErrors.some(
        errType => 
          errorMessage.includes(errType.toLowerCase()) ||
          errorCode.includes(errType.toLowerCase())
      );

      // Don't retry if:
      // 1. Error is not retryable
      // 2. We've exhausted all retries
      // 3. Error is a validation/authentication error (4xx)
      const isClientError = error?.response?.status >= 400 && error?.response?.status < 500;
      
      if (!isRetryable || attempt === maxRetries || isClientError) {
        if (attempt > 0) {
          logger.warn(`❌ All retry attempts failed (${attempt + 1}/${maxRetries + 1})`);
        }
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      logger.warn(
        `⚠️ Attempt ${attempt + 1}/${maxRetries + 1} failed: ${errorMessage}. Retrying in ${delay}ms...`
      );

      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed: Unknown error');
}

/**
 * Retry with custom retry condition
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  options: Omit<RetryOptions, 'retryableErrors'> = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (!shouldRetry(error, attempt) || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      logger.warn(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);

      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

