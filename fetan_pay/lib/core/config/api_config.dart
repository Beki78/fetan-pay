class ApiConfig {
  // Base URLs - should match merchant app configuration
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'http://192.168.0.147:3003',
  );

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://192.168.0.147:3003/api/v1',
  );

  // Better Auth endpoints
  static const String betterAuthBaseUrl = '$baseUrl/api/auth';

  // Auth endpoints
  static const String signInEmail = '$betterAuthBaseUrl/sign-in/email';
  static const String signOut = '$betterAuthBaseUrl/sign-out';
  static const String getSession = '$betterAuthBaseUrl/get-session';

  // Merchant endpoints
  static const String qrLogin = '$apiBaseUrl/merchant-accounts/qr-login';
  static const String merchantProfile = '$apiBaseUrl/merchant-users/me';

  // Scan/Payment endpoints
  static const String activeReceiverAccounts =
      '$apiBaseUrl/payments/receiver-accounts/active';
  static const String verifyMerchantPayment = '$apiBaseUrl/payments/verify';

  // Tip endpoints
  static const String tipsSummary = '$apiBaseUrl/payments/tips/summary';
  static const String listTips = '$apiBaseUrl/payments/tips';

  // History endpoints
  static const String verificationHistory =
      '$apiBaseUrl/payments/verification-history';

  // Environment helpers
  static bool get isProduction =>
      const String.fromEnvironment('ENVIRONMENT') == 'production';
  static bool get isDevelopment => !isProduction;

  // HTTP Configuration
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const int maxRetries = 3;

  // Headers
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
