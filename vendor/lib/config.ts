/**
 * Centralized configuration for Kifiya Pay
 * All app constants, colors, and settings should be defined here
 */

export const APP_CONFIG = {
  name: "Kifiya Pay",
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

