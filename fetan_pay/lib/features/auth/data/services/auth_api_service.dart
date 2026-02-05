import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../../../../core/utils/secure_logger.dart';
import '../models/login_models.dart';
import '../models/user_model.dart';

abstract class AuthApiService {
  Future<LoginResponse> signInWithEmail(String email, String password);
  Future<void> signOut();
  Future<User?> getCurrentUser();
  Future<QRLoginResponse> validateQRCode(String qrData, String origin);
  Future<Map<String, dynamic>?> getSession();
}

class AuthApiServiceImpl implements AuthApiService {
  final DioClient _dioClient;

  AuthApiServiceImpl(this._dioClient);

  @override
  Future<LoginResponse> signInWithEmail(String email, String password) async {
    try {
      SecureLogger.auth('Sign-in attempt initiated');

      final response = await _dioClient.post(
        ApiConfig.signInEmail,
        data: {'email': email, 'password': password},
        options: Options(
          // Ensure cookies are handled properly for login
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );
      print('-----------------signInWithEmail------------------------');
      print(response.data);

      SecureLogger.auth(
        'Login API response received with status: ${response.statusCode}',
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = response.data as Map<String, dynamic>;

        SecureLogger.auth(
          'Login response data keys: ${responseData.keys.toList()}',
        );

        // Better Auth typically returns session and user data
        // Handle different response formats from Better Auth
        String? token;
        Map<String, dynamic>? userData;

        // Check for Better Auth session format
        if (responseData.containsKey('session')) {
          final sessionData = responseData['session'] as Map<String, dynamic>?;
          token = sessionData?['token'] as String?;
        }

        // Check for user data in response
        if (responseData.containsKey('user')) {
          userData = responseData['user'] as Map<String, dynamic>?;
        }

        // Also check for direct token field
        if (token == null && responseData.containsKey('token')) {
          token = responseData['token'] as String?;
        }

        SecureLogger.auth(
          'Extracted token: ${token != null ? 'present' : 'null'}',
        );
        SecureLogger.auth(
          'Extracted user data: ${userData != null ? 'present' : 'null'}',
        );

        // Test session immediately after login to verify cookie handling
        print('-------------Session test after login----------');
        try {
          final sessionTest = await getSession();
          print(sessionTest);
          if (sessionTest != null) {
            SecureLogger.auth('Session successfully established after login');
          } else {
            SecureLogger.auth(
              'WARNING: Session not established - cookie issue likely',
            );
          }
        } catch (e) {
          SecureLogger.auth('Session test failed: $e');
        }

        return LoginResponse.fromJson({
          'message': responseData['message'] ?? 'Login successful',
          'success': true,
          'token': token,
          'user': userData,
        });
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          message: 'Login failed with status: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      SecureLogger.error('Login DioException', error: e);

      // Parse error response from Better Auth
      final errorData = e.response?.data;
      String errorMessage = 'Login failed';

      if (errorData is Map<String, dynamic>) {
        errorMessage =
            errorData['message'] ?? errorData['error'] ?? errorMessage;

        // Handle specific Better Auth error codes
        if (errorData['code'] == 'BANNED_USER' ||
            errorMessage.toLowerCase().contains('banned') ||
            errorMessage.toLowerCase().contains('suspended')) {
          errorMessage =
              'Your account has been banned. Please contact support.';
        }
      } else if (errorData is String) {
        errorMessage = errorData;
      }

      throw Exception(errorMessage);
    } catch (e) {
      SecureLogger.error('Login unexpected error', error: e);
      throw Exception('Network error: ${e.toString()}');
    }
  }

  @override
  Future<void> signOut() async {
    try {
      print("=== SIGN OUT DEBUG ===");
      print("Making sign out request to: ${ApiConfig.signOut}");

      // Make the sign out request with proper Better Auth configuration
      final response = await _dioClient.post(
        ApiConfig.signOut,
        options: Options(
          // Critical: Ensure cookies are sent with this request for Better Auth
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Follow redirects if Better Auth sends any
          followRedirects: true,
          maxRedirects: 3,
          // Set a reasonable timeout
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ),
      );

      print("Sign out response status: ${response.statusCode}");
      print("Sign out response data: ${response.data}");

      // Better Auth typically returns 200 for successful sign out
      if (response.statusCode == 200) {
        SecureLogger.auth(
          'Sign out successful - session invalidated on server',
        );
        print("------------------signed out successfully-------------------");
      } else {
        SecureLogger.auth(
          'Sign out returned unexpected status: ${response.statusCode}',
        );
        print("Unexpected status but proceeding with local cleanup");
      }
    } on DioException catch (e) {
      print("=== SIGN OUT ERROR DEBUG ===");
      print("Error response from: ${ApiConfig.signOut}");
      print("Error status: ${e.response?.statusCode}");
      print("Error data: ${e.response?.data}");
      print("Error message: ${e.message}");
      print("Error type: ${e.type}");

      SecureLogger.error('Sign out DioException', error: e);

      // Handle specific error cases like the merchant web app
      if (e.response?.statusCode == 403) {
        SecureLogger.auth(
          'Sign out 403 - session may already be expired or invalid',
        );
        print(
          "403 Forbidden - likely session already expired, proceeding with local cleanup",
        );
      } else if (e.response?.statusCode == 401) {
        SecureLogger.auth('Sign out 401 - user not authenticated');
        print(
          "401 Unauthorized - user not authenticated, proceeding with local cleanup",
        );
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        SecureLogger.auth('Sign out timeout - network issue');
        print("Network timeout during sign out, proceeding with local cleanup");
      } else if (e.type == DioExceptionType.connectionError) {
        SecureLogger.auth('Sign out connection error - no network');
        print(
          "Connection error during sign out, proceeding with local cleanup",
        );
      } else {
        SecureLogger.auth('Sign out API call failed: ${e.message}');
        print("Other error during sign out: ${e.message}");
      }

      // Following merchant web app pattern: don't throw errors, always proceed with local cleanup
      // This ensures the user is logged out locally even if the server call fails
    } catch (e) {
      print("Unexpected error in signOut: $e");
      SecureLogger.error('Sign out unexpected error', error: e);
      // Don't throw - always proceed with local cleanup like merchant web app
    }

    print(
      "Sign out API call completed, local cleanup will be handled by repository",
    );
  }

  @override
  Future<User?> getCurrentUser() async {
    try {
      final response = await _dioClient.get(
        ApiConfig.merchantProfile,
        options: Options(
          // Ensure cookies are sent with this request
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );
      print("---------------------getCurrentUser-----------------");
      print(response.data);
      SecureLogger.auth('getCurrentUser response received');

      if (response.statusCode == 200 && response.data != null) {
        // Handle membership response format
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('membership')) {
          final membership = data['membership'] as Map<String, dynamic>;
          return User.fromMembershipJson(membership);
        } else {
          // Fallback to direct user parsing (legacy format)
          return User.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        // User not authenticated
        SecureLogger.auth('getCurrentUser: 401 - User not authenticated');
        return null;
      }
      SecureLogger.error('Failed to get current user', error: e);
      return null;
    } catch (e) {
      SecureLogger.error('Error getting current user', error: e);
      return null;
    }
  }

  @override
  Future<QRLoginResponse> validateQRCode(String qrData, String origin) async {
    /*
     * QR Login Flow:
     * 1. Merchant web app generates encrypted QR codes with login credentials
     * 2. Mobile app scans QR code and sends raw encrypted data to backend
     * 3. Backend decrypts QR data and validates it hasn't expired
     * 4. Backend returns decrypted login credentials (email, password, userId, merchantId)
     * 5. Mobile app uses returned credentials to perform normal authentication
     *
     * IMPORTANT: Only QR codes generated by the merchant system's login feature will work.
     * Random QR codes, even if they contain data, will be rejected as invalid.
     */
    try {
      final requestData = <String, dynamic>{'qrData': qrData};

      // Only include origin if it's not empty
      if (origin.isNotEmpty) {
        requestData['origin'] = origin;
      }

      SecureLogger.qrEvent('Making QR validation request');

      final response = await _dioClient.post(
        ApiConfig.qrLogin,
        data: requestData,
      );

      print("validateQRCode");
      print(response);

      SecureLogger.qrEvent('QR validation response received');

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          response.data != null) {
        SecureLogger.qrEvent('QR validation successful, parsing response');
        final qrResponse = QRLoginResponse.fromJson(response.data);
        SecureLogger.qrEvent('QR response parsed successfully');
        return qrResponse;
      } else {
        SecureLogger.qrEvent('QR validation failed');
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          message: 'QR validation failed with status ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      SecureLogger.error('QR Login DioException', error: e);

      final errorData = e.response?.data;
      String errorMessage = 'QR code validation failed';

      if (errorData is Map<String, dynamic>) {
        final data = errorData['data'] as Map<String, dynamic>?;
        errorMessage = data?['message'] ?? errorData['message'] ?? errorMessage;

        // Add more specific error information
        if (errorData['error'] == 'Unauthorized') {
          errorMessage =
              'QR code authentication failed. Please ensure you\'re scanning a valid login QR code from the merchant system.';
        }
      }

      throw Exception(errorMessage);
    } catch (e) {
      SecureLogger.error('QR Login Unexpected Error', error: e);
      throw Exception('Network error during QR validation: ${e.toString()}');
    }
  }

  @override
  Future<Map<String, dynamic>?> getSession() async {
    try {
      final response = await _dioClient.get(
        ApiConfig.getSession,
        options: Options(
          // Ensure cookies are sent with this request
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );
      print("-------------getSession----------");
      print(response.data);
      SecureLogger.auth('getSession response received');

      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        // Session expired or invalid
        SecureLogger.auth('getSession: 401 - Session expired or invalid');
        return null;
      }
      SecureLogger.error('Failed to get session', error: e);
      return null;
    } catch (e) {
      SecureLogger.error('Error getting session', error: e);
      return null;
    }
  }
}
