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
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') ||
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.fetanpay.et' 
    : 'http://localhost:3003');

// Better Auth base URL - explicitly for Better Auth endpoints
// Better Auth endpoints are at /api/auth, so this should be BASE_URL
export const BETTER_AUTH_BASE_URL = BASE_URL;

// Full API base URL (with /api/v1 suffix) - used for RTK Query services
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  `${BASE_URL}/api/v1`;

// Frontend URL (for callbacks and redirects)
export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://admin.fetanpay.et'
    : 'http://localhost:3000');

// Payment page URL (for transaction links)
export const PAYMENT_PAGE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_PAGE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://fetanpay.et'
    : 'http://localhost:3001');

// Static assets base URL (for logo previews, etc.)
export const STATIC_ASSETS_BASE_URL = BASE_URL;

