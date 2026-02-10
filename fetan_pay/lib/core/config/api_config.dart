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

  // Transaction endpoints
  static const String transactionsEndpoint = '$apiBaseUrl/transactions';

  // Payments endpoints
  static const String paymentsEndpoint = '$apiBaseUrl/payments';

  // Merchant Users endpoints
  static const String merchantUsersEndpoint = '$apiBaseUrl/merchant-users';

  // Environment helpers
  static bool get isProduction =>
      const String.fromEnvironment('ENVIRONMENT') == 'production';
  static bool get isDevelopment => !isProduction;

  // HTTP Configuration - Increased timeouts for better debugging
  static const Duration connectTimeout = Duration(seconds: 60);
  static const Duration receiveTimeout = Duration(seconds: 60);
  static const int maxRetries = 3;

  // Headers
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Required by Better Auth for CORS
  };

  // Debug method to print current configuration
  static void printConfig() {
    print('=== API CONFIG DEBUG ===');
    print('Base URL: $baseUrl');
    print('API Base URL: $apiBaseUrl');
    print('Better Auth Base URL: $betterAuthBaseUrl');
    print('Sign In Email: $signInEmail');
    print('Environment: ${isProduction ? 'production' : 'development'}');
    print('Connect Timeout: ${connectTimeout.inSeconds}s');
    print('Receive Timeout: ${receiveTimeout.inSeconds}s');
    print('=== END CONFIG DEBUG ===');
  }
}
