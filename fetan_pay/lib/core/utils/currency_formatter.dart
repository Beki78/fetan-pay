import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _formatter = NumberFormat.currency(
    locale: 'en_ET',
    symbol: 'ETB ',
    decimalDigits: 2,
  );

  static final NumberFormat _compactFormatter = NumberFormat.compactCurrency(
    locale: 'en_ET',
    symbol: 'ETB ',
    decimalDigits: 2,
  );

  /// Format currency with full precision (e.g., "ETB 1,234.56")
  static String format(double amount) {
    return _formatter.format(amount);
  }

  /// Format currency with compact notation for large amounts (e.g., "ETB 1.2K")
  static String formatCompact(double amount) {
    return _compactFormatter.format(amount);
  }

  /// Format currency without decimals for whole numbers (e.g., "ETB 1,234")
  static String formatWhole(double amount) {
    if (amount == amount.roundToDouble()) {
      return NumberFormat.currency(
        locale: 'en_ET',
        symbol: 'ETB ',
        decimalDigits: 0,
      ).format(amount);
    }
    return format(amount);
  }

  /// Format with commas but no currency symbol (e.g., "1,234.56")
  static String formatNumberWithCommas(double amount) {
    return NumberFormat('#,##0.##', 'en_US').format(amount);
  }

  /// Parse formatted currency string back to double
  static double? parse(String formattedAmount) {
    try {
      // Remove currency symbol and spaces
      final cleanAmount = formattedAmount
          .replaceAll('ETB', '')
          .replaceAll(' ', '')
          .replaceAll(',', '');
      return double.tryParse(cleanAmount);
    } catch (e) {
      return null;
    }
  }
}
