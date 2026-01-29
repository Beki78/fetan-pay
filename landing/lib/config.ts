/**
 * Centralized configuration for API endpoints and base URLs
 * All URLs should be configured via environment variables for deployment
 */

// Base API URL (without /api/v1 suffix) - used for Better Auth
// This should point to the server where Better Auth is running
// In production: https://api.fetanpay.et
// In development: http://localhost:3003
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  (process.env.NODE_ENV === "production"
    ? "https://api.fetanpay.et"
    : "http://localhost:3003");

// Full API base URL (with /api/v1 suffix) - used for API calls
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || `${BASE_URL}/api/v1`;

// Frontend URL (for callbacks and redirects)
export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://fetanpay.com"
    : "http://localhost:3002");

// Merchant signup URL
export const MERCHANT_SIGNUP_URL =
  process.env.NEXT_PUBLIC_MERCHANT_SIGNUP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://merchant.fetanpay.et/signup"
    : "http://localhost:3001/signup");
