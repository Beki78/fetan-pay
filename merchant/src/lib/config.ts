/**
 * Centralized configuration for FetanPay
 * All app constants, colors, settings, and API URLs should be defined here
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
    ? 'https://fetan-pay-merchant.vercel.app'
    : 'http://localhost:3002');

// Static assets base URL (for logo previews, etc.)
export const STATIC_ASSETS_BASE_URL = BASE_URL;

export const APP_CONFIG = {
  name: "Fetan Pay",
  description: "Instant payment verification system",
} as const;

/**
 * Supported banks configuration
 */
export const BANKS = [
  {
    id: "cbe",
    name: "CBE",
    fullName: "Commercial Bank of Ethiopia",
    icon: "/banks/CBE.png",
  },
  {
    id: "boa",
    name: "BOA",
    fullName: "Bank of Abyssinia",
    icon: "/banks/BOA.png",
  },
  {
    id: "awash",
    name: "Awash",
    fullName: "Awash Bank",
    icon: "/banks/Awash.png",
  },
  {
    id: "telebirr",
    name: "Telebirr",
    fullName: "Telebirr",
    icon: "/banks/Telebirr.png",
  },
] as const;

/**
 * Finance theme colors - accessible via Tailwind
 * These are used throughout the app for consistent theming
 */
export const FINANCE_THEME = {
  primary: "hsl(221, 83%, 53%)", // Professional blue
  primaryDark: "hsl(221, 83%, 43%)",
  secondary: "hsl(142, 71%, 45%)", // Success green
  accent: "hsl(38, 92%, 50%)", // Warning/attention
  background: "hsl(0, 0%, 100%)",
  foreground: "hsl(222, 47%, 11%)",
  muted: "hsl(210, 40%, 96%)",
  border: "hsl(214, 32%, 91%)",
} as const;

