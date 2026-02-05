import 'package:flutter/foundation.dart';

/// Bank transaction validation utilities
/// Supports both full URLs and transaction IDs
/// Based on merchant web app validation logic

enum BankId { cbe, boa, awash, telebirr }

class ValidationResult {
  final bool isValid;
  final String transactionId;
  final String? error;

  const ValidationResult({
    required this.isValid,
    required this.transactionId,
    this.error,
  });
}

class TransactionValidation {
  /// Detect bank from URL pattern (returns BankId or null)
  static BankId? detectBankFromUrl(String input) {
    final haystack = input.toLowerCase();

    if (haystack.contains("cbe") || haystack.contains("apps.cbe.com.et")) {
      return BankId.cbe;
    }
    if (haystack.contains("awash") || haystack.contains("awashbank.com")) {
      return BankId.awash;
    }
    if (haystack.contains("telebirr") || haystack.contains("ethiotelecom.et")) {
      return BankId.telebirr;
    }
    if (haystack.contains("abyssinia") ||
        haystack.contains("bankofabyssinia.com")) {
      return BankId.boa;
    }

    return null;
  }

  /// Extract transaction ID from URL or return the input if it's already an ID
  /// Works with or without bankId - will try to detect bank from URL if bankId not provided
  static String extractTransactionId(BankId? bankId, String input) {
    // Remove whitespace
    input = input.trim();

    // Try to detect bank from URL if not provided
    final detectedBank = bankId ?? detectBankFromUrl(input);
    final effectiveBankId = bankId ?? detectedBank;

    if (kDebugMode) {
      print('🔍 [VALIDATION] Extracting reference from: $input');
      print('🏦 [VALIDATION] Detected bank: $effectiveBankId');
    }

    // CBE URL patterns:
    // - https://apps.cbe.com.et:100/?id=FT253423SGLG32348645
    // - https://apps.cbe.com.et/?id=FT253423SGLG32348645
    // - apps.cbe.com.et:100/?id=FT253423SGLG32348645
    if (effectiveBankId == BankId.cbe) {
      // Try multiple CBE URL patterns
      final cbePatterns = [
        RegExp(
          r'apps\.cbe\.com\.et[^?]*[?&]id=([A-Z0-9]+)',
          caseSensitive: false,
        ),
        RegExp(
          r'[?&]id=([A-Z0-9]+)',
          caseSensitive: false,
        ), // Fallback: any URL with id= parameter
      ];

      for (final pattern in cbePatterns) {
        final match = pattern.firstMatch(input);
        if (match != null && match.groupCount >= 1) {
          final ref = match.group(1)!.toUpperCase();
          // Validate it looks like a CBE reference (FT prefix)
          if (RegExp(
            r'^FT[A-Z0-9]{10,}$',
            caseSensitive: false,
          ).hasMatch(ref)) {
            if (kDebugMode) {
              print('✅ [VALIDATION] CBE reference extracted: $ref');
            }
            return ref;
          }
        }
      }

      // CBE transaction ID format: FT + numbers/letters (e.g., FT253423SGLG32348645)
      if (RegExp(r'^FT[A-Z0-9]+$', caseSensitive: false).hasMatch(input)) {
        if (kDebugMode) {
          print(
            '✅ [VALIDATION] CBE reference (direct): ${input.toUpperCase()}',
          );
        }
        return input.toUpperCase();
      }
    }

    // Awash URL patterns:
    // - https://awashpay.awashbank.com:8225/-2H1TUKXUG1-36WJ2U
    // - https://awashpay.awashbank.com:8225/-2H1NEM30Q0-32CRE9
    // - awashpay.awashbank.com/-2H1NEM30Q0-32CRE9
    if (effectiveBankId == BankId.awash) {
      final awashPatterns = [
        // Match: https://awashpay.awashbank.com:8225/-2H1TUKXUG1-36WJ2U
        RegExp(
          r'awashpay\.awashbank\.com[^\/]*\/([A-Z0-9\-]+)',
          caseSensitive: false,
        ),
        // Match: awashbank.com/...
        RegExp(r'awashbank\.com[^\/]*\/([A-Z0-9\-]+)', caseSensitive: false),
        // Match any URL path ending with transaction ID (fallback)
        RegExp(r'\/[^\/\?]*([A-Z0-9\-]{8,})[^\/\?]*$', caseSensitive: false),
      ];

      for (final pattern in awashPatterns) {
        final match = pattern.firstMatch(input);
        if (match != null && match.groupCount >= 1) {
          final ref = match.group(1)!.toUpperCase();
          // Validate it looks like an Awash reference (8+ chars, alphanumeric with dashes)
          // Examples: -2H1TUKXUG1-36WJ2U, -2H1NEM30Q0-32CRE9, 251208095540328
          if (RegExp(r'^[A-Z0-9\-]{8,}$', caseSensitive: false).hasMatch(ref)) {
            if (kDebugMode) {
              print(
                '✅ [VALIDATION] Awash reference extracted: $ref from: $input',
              );
            }
            return ref;
          }
        }
      }

      // Awash transaction ID can be numeric (e.g., 251208095540328) or alphanumeric with dashes
      // Must be at least 8 characters
      if (RegExp(r'^[A-Z0-9\-]{8,}$', caseSensitive: false).hasMatch(input)) {
        if (kDebugMode) {
          print(
            '✅ [VALIDATION] Awash reference (direct): ${input.toUpperCase()}',
          );
        }
        return input.toUpperCase();
      }

      if (kDebugMode) {
        print('⚠️ [VALIDATION] Failed to extract Awash reference from: $input');
      }
    }

    // Telebirr URL patterns:
    // - https://transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL
    // - transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL
    if (effectiveBankId == BankId.telebirr) {
      final telebirrPatterns = [
        RegExp(
          r'transactioninfo\.ethiotelecom\.et\/receipt\/([A-Z0-9]+)',
          caseSensitive: false,
        ),
        RegExp(r'ethiotelecom\.et\/receipt\/([A-Z0-9]+)', caseSensitive: false),
      ];

      for (final pattern in telebirrPatterns) {
        final match = pattern.firstMatch(input);
        if (match != null && match.groupCount >= 1) {
          final ref = match.group(1)!.toUpperCase();
          // Validate it looks like a Telebirr reference
          if (RegExp(r'^[A-Z0-9]{6,}$', caseSensitive: false).hasMatch(ref)) {
            if (kDebugMode) {
              print('✅ [VALIDATION] Telebirr reference extracted: $ref');
            }
            return ref;
          }
        }
      }

      // Telebirr transaction ID format: Alphanumeric (e.g., CL37MBRPQL)
      if (RegExp(r'^[A-Z0-9]+$', caseSensitive: false).hasMatch(input)) {
        if (kDebugMode) {
          print(
            '✅ [VALIDATION] Telebirr reference (direct): ${input.toUpperCase()}',
          );
        }
        return input.toUpperCase();
      }
    }

    // BOA URL patterns:
    // - https://cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858
    // - https://bankofabyssinia.com/slip/?trx=FT250559L4W725858
    // - cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858
    if (effectiveBankId == BankId.boa) {
      final boaPatterns = [
        RegExp(
          r'bankofabyssinia\.com[^?]*[?&]trx=([A-Z0-9]+)',
          caseSensitive: false,
        ),
        RegExp(
          r'[?&]trx=([A-Z0-9]+)',
          caseSensitive: false,
        ), // Fallback: any URL with trx= parameter
      ];

      for (final pattern in boaPatterns) {
        final match = pattern.firstMatch(input);
        if (match != null && match.groupCount >= 1) {
          final ref = match.group(1)!.toUpperCase();
          // Validate it looks like a BOA reference (FT prefix, 10+ chars)
          if (RegExp(
            r'^FT[A-Z0-9]{10,}$',
            caseSensitive: false,
          ).hasMatch(ref)) {
            if (kDebugMode) {
              print('✅ [VALIDATION] BOA reference extracted: $ref');
            }
            return ref;
          }
        }
      }

      // BOA transaction ID format: FT + numbers/letters (e.g., FT250559L4W725858)
      // Must be at least 12 characters (FT + 10+ chars)
      if (RegExp(r'^FT[A-Z0-9]{10,}$', caseSensitive: false).hasMatch(input)) {
        if (kDebugMode) {
          print(
            '✅ [VALIDATION] BOA reference (direct): ${input.toUpperCase()}',
          );
        }
        return input.toUpperCase();
      }
    }

    // If no match, return the input as-is (might be a valid ID)
    if (kDebugMode) {
      print(
        '⚠️ [VALIDATION] No pattern matched, returning input as-is: $input',
      );
    }
    return input;
  }

  /// Validate transaction ID format for each bank
  static bool _validateTransactionIdFormat(
    BankId bankId,
    String transactionId,
  ) {
    switch (bankId) {
      case BankId.cbe:
        // CBE: FT followed by alphanumeric (e.g., FT253423SGLG32348645)
        return RegExp(
          r'^FT[A-Z0-9]{10,}$',
          caseSensitive: false,
        ).hasMatch(transactionId);

      case BankId.boa:
        // BOA: FT followed by alphanumeric (e.g., FT250559L4W725858)
        return RegExp(
          r'^FT[A-Z0-9]{10,}$',
          caseSensitive: false,
        ).hasMatch(transactionId);

      case BankId.awash:
        // Awash: Alphanumeric with optional dashes (e.g., 251208095540328 or -2H1NEM30Q0-32CRE9)
        return RegExp(
          r'^[A-Z0-9\-]{8,}$',
          caseSensitive: false,
        ).hasMatch(transactionId);

      case BankId.telebirr:
        // Telebirr: Alphanumeric (e.g., CL37MBRPQL)
        return RegExp(
          r'^[A-Z0-9]{6,}$',
          caseSensitive: false,
        ).hasMatch(transactionId);
    }
  }

  /// Validate transaction input (URL or ID) for a specific bank
  /// If bankId is null, will try to detect bank from URL
  static ValidationResult validateTransactionInput(
    BankId? bankId,
    String input,
  ) {
    if (input.trim().isEmpty) {
      return const ValidationResult(
        isValid: false,
        transactionId: "",
        error: "Transaction ID or URL is required",
      );
    }

    // Try to detect bank from URL if not provided
    final detectedBank = bankId ?? detectBankFromUrl(input);

    if (detectedBank == null) {
      return ValidationResult(
        isValid: false,
        transactionId: "",
        error: "Unable to detect bank from URL. Please select a bank.",
      );
    }

    // Extract transaction ID from URL or use input as-is
    final transactionId = extractTransactionId(detectedBank, input);

    if (transactionId.isEmpty) {
      return const ValidationResult(
        isValid: false,
        transactionId: "",
        error: "Invalid transaction format",
      );
    }

    // Validate the extracted/input transaction ID format
    if (!_validateTransactionIdFormat(detectedBank, transactionId)) {
      return ValidationResult(
        isValid: false,
        transactionId: transactionId,
        error:
            "Invalid ${detectedBank.name.toUpperCase()} transaction ID format",
      );
    }

    return ValidationResult(isValid: true, transactionId: transactionId);
  }

  /// Convert BankId enum to string for API calls
  static String bankIdToString(BankId bankId) {
    switch (bankId) {
      case BankId.cbe:
        return 'cbe';
      case BankId.boa:
        return 'boa';
      case BankId.awash:
        return 'awash';
      case BankId.telebirr:
        return 'telebirr';
    }
  }

  /// Convert string to BankId enum
  static BankId? stringToBankId(String bankString) {
    switch (bankString.toLowerCase()) {
      case 'cbe':
        return BankId.cbe;
      case 'boa':
        return BankId.boa;
      case 'awash':
        return BankId.awash;
      case 'telebirr':
        return BankId.telebirr;
      default:
        return null;
    }
  }

  /// Get provider string for API calls (uppercase)
  static String getProviderFromBankId(BankId bankId) {
    switch (bankId) {
      case BankId.cbe:
        return 'CBE';
      case BankId.boa:
        return 'BOA';
      case BankId.awash:
        return 'AWASH';
      case BankId.telebirr:
        return 'TELEBIRR';
    }
  }
}
