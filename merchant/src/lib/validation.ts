/**
 * Bank transaction validation utilities
 * Supports both full URLs and transaction IDs
 */

export type BankId = "cbe" | "boa" | "awash" | "telebirr";

interface ValidationResult {
  isValid: boolean;
  transactionId: string;
  error?: string;
}

/**
 * Extract transaction ID from URL or return the input if it's already an ID
 */
function extractTransactionId(bankId: BankId, input: string): string {
  // Remove whitespace
  input = input.trim();

  // CBE URL pattern: https://apps.cbe.com.et:100/?id=FT253423SGLG32348645
  if (bankId === "cbe") {
    const cbeUrlMatch = input.match(/apps\.cbe\.com\.et.*[?&]id=([A-Z0-9]+)/i);
    if (cbeUrlMatch) return cbeUrlMatch[1].toUpperCase();
    // CBE transaction ID format: FT + numbers/letters (e.g., FT253423SGLG32348645)
    if (/^FT[A-Z0-9]+$/i.test(input)) return input.toUpperCase();
  }

  // Awash URL pattern: https://awashpay.awashbank.com:8225/-2H1NEM30Q0-32CRE9
  if (bankId === "awash") {
    const awashUrlMatch = input.match(
      /awashpay\.awashbank\.com[^\/]*\/([A-Z0-9\-]+)/i
    );
    if (awashUrlMatch) return awashUrlMatch[1].toUpperCase();
    // Awash transaction ID can be numeric (e.g., 251208095540328) or alphanumeric with dashes
    if (/^[A-Z0-9\-]+$/i.test(input)) return input.toUpperCase();
  }

  // Telebirr URL pattern: https://transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL
  if (bankId === "telebirr") {
    const telebirrUrlMatch = input.match(
      /transactioninfo\.ethiotelecom\.et\/receipt\/([A-Z0-9]+)/i
    );
    if (telebirrUrlMatch) return telebirrUrlMatch[1].toUpperCase();
    // Telebirr transaction ID format: Alphanumeric (e.g., CL37MBRPQL)
    if (/^[A-Z0-9]+$/i.test(input)) return input.toUpperCase();
  }

  // BOA URL pattern: https://cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858
  if (bankId === "boa") {
    const boaUrlMatch = input.match(
      /bankofabyssinia\.com.*[?&]trx=([A-Z0-9]+)/i
    );
    if (boaUrlMatch) return boaUrlMatch[1].toUpperCase();
    // BOA transaction ID format: FT + numbers/letters (e.g., FT250559L4W725858)
    if (/^FT[A-Z0-9]+$/i.test(input)) return input.toUpperCase();
  }

  // If no match, return the input as-is (might be a valid ID)
  return input;
}

/**
 * Validate transaction ID format for each bank
 */
function validateTransactionIdFormat(
  bankId: BankId,
  transactionId: string
): boolean {
  switch (bankId) {
    case "cbe":
      // CBE: FT followed by alphanumeric (e.g., FT253423SGLG32348645)
      return /^FT[A-Z0-9]{10,}$/i.test(transactionId);

    case "boa":
      // BOA: FT followed by alphanumeric (e.g., FT250559L4W725858)
      return /^FT[A-Z0-9]{10,}$/i.test(transactionId);

    case "awash":
      // Awash: Alphanumeric with optional dashes (e.g., 251208095540328 or -2H1NEM30Q0-32CRE9)
      return /^[A-Z0-9\-]{8,}$/i.test(transactionId);

    case "telebirr":
      // Telebirr: Alphanumeric (e.g., CL37MBRPQL)
      return /^[A-Z0-9]{6,}$/i.test(transactionId);

    default:
      return false;
  }
}

/**
 * Validate transaction input (URL or ID) for a specific bank
 */
export function validateTransactionInput(
  bankId: BankId,
  input: string
): ValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      transactionId: "",
      error: "Transaction ID or URL is required",
    };
  }

  // Extract transaction ID from URL or use input as-is
  const transactionId = extractTransactionId(bankId, input);

  if (!transactionId) {
    return {
      isValid: false,
      transactionId: "",
      error: "Invalid transaction format",
    };
  }

  // Validate the extracted/input transaction ID format
  if (!validateTransactionIdFormat(bankId, transactionId)) {
    return {
      isValid: false,
      transactionId,
      error: `Invalid ${bankId.toUpperCase()} transaction ID format`,
    };
  }

  return {
    isValid: true,
    transactionId,
  };
}

/**
 * Format number with commas (e.g., 3000 -> 3,000)
 */
export function formatNumberWithCommas(value: string | number): string {
  // Convert to string if number
  const stringValue = typeof value === "number" ? value.toString() : value;

  // Remove all non-digit characters
  const numbers = stringValue.replace(/\D/g, "");
  if (!numbers) return "";

  // Add commas for thousands
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
  const parsed = parseFormattedNumber(value);

  if (!parsed) {
    return { isValid: false, error: "Amount is required" };
  }

  const num = parseInt(parsed, 10);

  if (isNaN(num)) {
    return { isValid: false, error: "Invalid amount" };
  }

  if (num <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  // Check if there are decimals
  if (parsed.includes(".")) {
    return { isValid: false, error: "Amount must be a whole number" };
  }

  return { isValid: true };
}
