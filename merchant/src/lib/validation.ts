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
 * Detect bank from URL pattern (returns bankId or null)
 */
export function detectBankFromUrl(input: string): BankId | null {
  const haystack = input.toLowerCase();

  if (haystack.includes("cbe") || haystack.includes("apps.cbe.com.et")) {
    return "cbe";
  }
  if (haystack.includes("awash") || haystack.includes("awashbank.com")) {
    return "awash";
  }
  if (haystack.includes("telebirr") || haystack.includes("ethiotelecom.et")) {
    return "telebirr";
  }
  if (
    haystack.includes("abyssinia") ||
    haystack.includes("bankofabyssinia.com")
  ) {
    return "boa";
  }

  return null;
}

/**
 * Extract transaction ID from URL or return the input if it's already an ID
 * Works with or without bankId - will try to detect bank from URL if bankId not provided
 */
export function extractTransactionId(
  bankId: BankId | null,
  input: string
): string {
  // Remove whitespace
  input = input.trim();

  // Try to detect bank from URL if not provided
  const detectedBank = bankId || detectBankFromUrl(input);
  const effectiveBankId = bankId || detectedBank;

  // CBE URL patterns:
  // - https://apps.cbe.com.et:100/?id=FT253423SGLG32348645
  // - https://apps.cbe.com.et/?id=FT253423SGLG32348645
  // - apps.cbe.com.et:100/?id=FT253423SGLG32348645
  if (effectiveBankId === "cbe") {
    // Try multiple CBE URL patterns
    const cbePatterns = [
      /apps\.cbe\.com\.et[^?]*[?&]id=([A-Z0-9]+)/i,
      /[?&]id=([A-Z0-9]+)/i, // Fallback: any URL with id= parameter
    ];

    for (const pattern of cbePatterns) {
      const match = input.match(pattern);
      if (match) {
        const ref = match[1].toUpperCase();
        // Validate it looks like a CBE reference (FT prefix)
        if (/^FT[A-Z0-9]{10,}$/i.test(ref)) {
          return ref;
        }
      }
    }

    // CBE transaction ID format: FT + numbers/letters (e.g., FT253423SGLG32348645)
    if (/^FT[A-Z0-9]+$/i.test(input)) return input.toUpperCase();
  }

  // Awash URL patterns:
  // - https://awashpay.awashbank.com:8225/-2H1TUKXUG1-36WJ2U
  // - https://awashpay.awashbank.com:8225/-2H1NEM30Q0-32CRE9
  // - awashpay.awashbank.com/-2H1NEM30Q0-32CRE9
  if (effectiveBankId === "awash") {
    const awashPatterns = [
      // Match: https://awashpay.awashbank.com:8225/-2H1TUKXUG1-36WJ2U
      /awashpay\.awashbank\.com[^\/]*\/([A-Z0-9\-]+)/i,
      // Match: awashbank.com/...
      /awashbank\.com[^\/]*\/([A-Z0-9\-]+)/i,
      // Match any URL path ending with transaction ID (fallback)
      /\/[^\/\?]*([A-Z0-9\-]{8,})[^\/\?]*$/i,
    ];

    for (const pattern of awashPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const ref = match[1].toUpperCase();
        // Validate it looks like an Awash reference (8+ chars, alphanumeric with dashes)
        // Examples: -2H1TUKXUG1-36WJ2U, -2H1NEM30Q0-32CRE9, 251208095540328
        if (/^[A-Z0-9\-]{8,}$/i.test(ref)) {
          console.log(
            "✅ [VALIDATION] Awash reference extracted:",
            ref,
            "from:",
            input
          );
          return ref;
        }
      }
    }

    // Awash transaction ID can be numeric (e.g., 251208095540328) or alphanumeric with dashes
    // Must be at least 8 characters
    if (/^[A-Z0-9\-]{8,}$/i.test(input)) {
      console.log(
        "✅ [VALIDATION] Awash reference (direct):",
        input.toUpperCase()
      );
      return input.toUpperCase();
    }

    console.warn(
      "⚠️ [VALIDATION] Failed to extract Awash reference from:",
      input
    );
  }

  // Telebirr URL patterns:
  // - https://transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL
  // - transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL
  if (effectiveBankId === "telebirr") {
    const telebirrPatterns = [
      /transactioninfo\.ethiotelecom\.et\/receipt\/([A-Z0-9]+)/i,
      /ethiotelecom\.et\/receipt\/([A-Z0-9]+)/i,
    ];

    for (const pattern of telebirrPatterns) {
      const match = input.match(pattern);
      if (match) {
        const ref = match[1].toUpperCase();
        // Validate it looks like a Telebirr reference
        if (/^[A-Z0-9]{6,}$/i.test(ref)) {
          return ref;
        }
      }
    }

    // Telebirr transaction ID format: Alphanumeric (e.g., CL37MBRPQL)
    if (/^[A-Z0-9]+$/i.test(input)) return input.toUpperCase();
  }

  // BOA URL patterns:
  // - https://cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858
  // - https://bankofabyssinia.com/slip/?trx=FT250559L4W725858
  // - cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858
  if (effectiveBankId === "boa") {
    const boaPatterns = [
      /bankofabyssinia\.com[^?]*[?&]trx=([A-Z0-9]+)/i,
      /[?&]trx=([A-Z0-9]+)/i, // Fallback: any URL with trx= parameter
    ];

    for (const pattern of boaPatterns) {
      const match = input.match(pattern);
      if (match) {
        const ref = match[1].toUpperCase();
        // Validate it looks like a BOA reference (FT prefix, 10+ chars)
        if (/^FT[A-Z0-9]{10,}$/i.test(ref)) {
          return ref;
        }
      }
    }

    // BOA transaction ID format: FT + numbers/letters (e.g., FT250559L4W725858)
    // Must be at least 12 characters (FT + 10+ chars)
    if (/^FT[A-Z0-9]{10,}$/i.test(input)) return input.toUpperCase();
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
 * If bankId is null, will try to detect bank from URL
 */
export function validateTransactionInput(
  bankId: BankId | null,
  input: string
): ValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      transactionId: "",
      error: "Transaction ID or URL is required",
    };
  }

  // Try to detect bank from URL if not provided
  const detectedBank = bankId || detectBankFromUrl(input);

  if (!detectedBank) {
    return {
      isValid: false,
      transactionId: "",
      error: "Unable to detect bank from URL. Please select a bank.",
    };
  }

  // Extract transaction ID from URL or use input as-is
  const transactionId = extractTransactionId(detectedBank, input);

  if (!transactionId) {
    return {
      isValid: false,
      transactionId: "",
      error: "Invalid transaction format",
    };
  }

  // Validate the extracted/input transaction ID format
  if (!validateTransactionIdFormat(detectedBank, transactionId)) {
    return {
      isValid: false,
      transactionId,
      error: `Invalid ${detectedBank.toUpperCase()} transaction ID format`,
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
