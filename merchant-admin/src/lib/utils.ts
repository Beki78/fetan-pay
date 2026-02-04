/**
 * Format number with commas (e.g., 3000 -> 3,000)
 */
export function formatNumberWithCommas(value: string | number): string {
  // Convert to string if number
  const stringValue = typeof value === "number" ? value.toString() : value;
  
  // Remove any existing commas and non-numeric characters except decimal point
  const cleanValue = stringValue.replace(/[^\d.-]/g, "");
  
  // Split by decimal point
  const parts = cleanValue.split(".");
  
  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Join back with decimal point if there was one
  return parts.join(".");
}

/**
 * Parse formatted number (remove commas)
 */
export function parseFormattedNumber(value: string): string {
  return value.replace(/,/g, "");
}

/**
 * Validate amount (must be whole number, no decimals)
 */
export function validateAmount(value: string): {
  isValid: boolean;
  error?: string;
} {
  const cleanValue = parseFormattedNumber(value);
  
  if (!cleanValue) {
    return { isValid: false, error: "Amount is required" };
  }
  
  const numValue = parseFloat(cleanValue);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: "Invalid amount" };
  }
  
  if (numValue <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }
  
  if (numValue % 1 !== 0) {
    return { isValid: false, error: "Amount must be a whole number (no decimals)" };
  }
  
  return { isValid: true };
}

/**
 * Format currency with ETB suffix
 */
export function formatCurrency(amount: string | number | null | undefined): string {
  if (!amount) return "0.00 ETB";
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${formatNumberWithCommas(numAmount.toFixed(2))} ETB`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClasses(status: string): string {
  const statusColors = {
    VERIFIED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    UNVERIFIED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return statusColors[status as keyof typeof statusColors] || statusColors.PENDING;
}