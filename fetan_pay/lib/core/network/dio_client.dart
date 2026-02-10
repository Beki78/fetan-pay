import 'dart:io';
import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';
import '../config/api_config.dart';

class DioClient {
  late final Dio _dio;
  late final CookieJar _cookieJar;
  late final CookieManager _cookieManager;

  DioClient() {
    // Print configuration for debugging
    ApiConfig.printConfig();

    _initializeCookieJarSync();
    _dio = Dio(_createBaseOptions());

    // Create cookie manager with our custom jar
    _cookieManager = CookieManager(_cookieJar);

    // Add interceptors
    _dio.interceptors.addAll([
      _createAuthInterceptor(),
      _cookieManager, // Add cookie manager
      _createLoggingInterceptor(),
      _createRetryInterceptor(),
    ]);
  }

  void _initializeCookieJarSync() {
    // Create a custom cookie jar that handles persistence only (no domain mapping)
    _cookieJar = _CustomCookieJar();
    print('Initialized custom cookie jar with persistence only');
  }

  BaseOptions _createBaseOptions() {
    print('Creating Dio base options with baseUrl: ${ApiConfig.baseUrl}');

    return BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.connectTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: ApiConfig.defaultHeaders,
      // Enable cookies for session management - matches merchant web app
      extra: {'withCredentials': true},
      // Ensure cookies are sent with requests - CRITICAL for Better Auth
      followRedirects: true,
      maxRedirects: 5,
      // Add validation for responses
      validateStatus: (status) {
        print('Response status: $status');
        return status != null && status < 500;
      },
    );
  }

  Interceptor _createAuthInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add any additional headers if needed
        // For Better Auth, cookies are handled automatically
        handler.next(options);
      },
      onResponse: (response, handler) {
        handler.next(response);
      },
      onError: (error, handler) async {
        // Handle authentication errors
        if (error.response?.statusCode == 401) {
          // Token expired or invalid - could trigger logout
          print('Authentication error occurred');
        }
        handler.next(error);
      },
    );
  }

  Interceptor _createLoggingInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        print('=== REQUEST DEBUG ===');
        print('Request to: ${options.uri}');
        print('Request headers: ${options.headers}');

        // Check if cookies are available in the jar
        _checkCookiesInJar(options.uri);

        handler.next(options);
      },
      onResponse: (response, handler) {
        print('=== RESPONSE DEBUG ===');
        print('Response from: ${response.requestOptions.uri}');
        print('Response status: ${response.statusCode}');
        print('Response data: ${response.data}');
        print('All response headers: ${response.headers.map}');

        // Check if cookies were set
        final setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders != null && setCookieHeaders.isNotEmpty) {
          print('Set-Cookie headers received: $setCookieHeaders');
          print('Number of Set-Cookie headers: ${setCookieHeaders.length}');

          // Parse and log each cookie
          for (int i = 0; i < setCookieHeaders.length; i++) {
            print('Set-Cookie[$i]: ${setCookieHeaders[i]}');
          }

          // Give the cookie jar a moment to process the cookies
          Future.delayed(Duration(milliseconds: 100), () {
            _debugCookieJarAfterResponse();
          });
        } else {
          print('No Set-Cookie headers in response');
          print(
            'Available response headers: ${response.headers.map.keys.toList()}',
          );
        }

        handler.next(response);
      },
      onError: (error, handler) {
        print('=== ERROR DEBUG ===');
        print('Error response from: ${error.requestOptions.uri}');
        print('Error status: ${error.response?.statusCode}');
        print('Error data: ${error.response?.data}');
        print('Error message: ${error.message}');
        print('Error type: ${error.type}');

        // Enhanced connection debugging
        if (error.type == DioExceptionType.connectionTimeout) {
          print('CONNECTION TIMEOUT - Server not responding or unreachable');
          print('Attempted to connect to: ${error.requestOptions.uri}');
          print('Connect timeout: ${error.requestOptions.connectTimeout}');
          print('TROUBLESHOOTING:');
          print('1. Check if server is running on ${ApiConfig.baseUrl}');
          print(
            '2. Verify IP address ${error.requestOptions.uri.host} is correct',
          );
          print('3. Check network connectivity');
          print('4. Verify firewall/port settings');
        } else if (error.type == DioExceptionType.receiveTimeout) {
          print(
            'RECEIVE TIMEOUT - Server started responding but took too long',
          );
          print('Receive timeout: ${error.requestOptions.receiveTimeout}');
        } else if (error.type == DioExceptionType.sendTimeout) {
          print('SEND TIMEOUT - Failed to send request data');
          print('Send timeout: ${error.requestOptions.sendTimeout}');
        } else if (error.type == DioExceptionType.connectionError) {
          print('CONNECTION ERROR - Network connectivity issue');
          print('This usually means:');
          print('- No internet connection');
          print('- Server is not running');
          print('- Wrong IP address or port');
          print('- Firewall blocking connection');
        }

        if (error.response?.statusCode == 401) {
          print('401 Unauthorized - likely cookie/session issue');
        } else if (error.response?.statusCode == null) {
          print('Network error - server not responding or connection failed');
        }

        handler.next(error);
      },
    );
  }

  Interceptor _createRetryInterceptor() {
    return InterceptorsWrapper(
      onError: (error, handler) async {
        if (_shouldRetry(error)) {
          try {
            final response = await _retryRequest(error.requestOptions);
            handler.resolve(response);
          } catch (e) {
            handler.next(error);
          }
        } else {
          handler.next(error);
        }
      },
    );
  }

  bool _shouldRetry(DioException error) {
    return error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        (error.response?.statusCode != null &&
            error.response!.statusCode! >= 500);
  }

  Future<Response> _retryRequest(RequestOptions requestOptions) async {
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
      extra: requestOptions.extra,
    );

    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  Dio get dio => _dio;

  // Convenience methods for common HTTP operations
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onReceiveProgress: onReceiveProgress,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onReceiveProgress: onReceiveProgress,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onReceiveProgress: onReceiveProgress,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }

  void _checkCookiesInJar(Uri uri) {
    try {
      _cookieJar.loadForRequest(uri).then((cookieList) {
        if (cookieList.isNotEmpty) {
          print(
            'Cookies being sent: ${cookieList.map((c) => '${c.name}=${c.value}').join('; ')}',
          );
        } else {
          print('No cookies available for this request');
        }
      });
    } catch (e) {
      print('Error checking cookies in jar: $e');
    }
  }

  void _debugCookieJarAfterResponse() {
    try {
      // Check cookies for current base URL
      final ipUri = Uri.parse(ApiConfig.baseUrl);

      _cookieJar.loadForRequest(ipUri).then((ipCookies) {
        print(
          'Cookies stored for IP: ${ipCookies.map((c) => '${c.name}=${c.value}').join('; ')}',
        );
      });
    } catch (e) {
      print('Error debugging cookie jar: $e');
    }
  }

  /// Clear all cookies from the cookie jar (for logout)
  Future<void> clearAllCookies() async {
    try {
      print('=== CLEARING ALL COOKIES ===');
      await _cookieJar.deleteAll();
      print('All cookies cleared from cookie jar');
    } catch (e) {
      print('Error clearing cookies: $e');
      rethrow;
    }
  }
}

/// Custom cookie jar that provides persistent storage without domain mapping
/// Uses IP address consistently as requested by user
class _CustomCookieJar implements CookieJar {
  late final CookieJar _delegate;
  bool _initialized = false;

  _CustomCookieJar() {
    _initializeAsync();
  }

  void _initializeAsync() async {
    try {
      // Use persistent cookie storage
      final appDocDir = await getApplicationDocumentsDirectory();
      final cookieDir = Directory('${appDocDir.path}/.cookies');

      // Ensure directory exists
      if (!await cookieDir.exists()) {
        await cookieDir.create(recursive: true);
        print('Created cookie directory: ${cookieDir.path}');
      }

      // Create a persistent cookie jar
      _delegate = PersistCookieJar(storage: FileStorage(cookieDir.path));
      _initialized = true;

      print('Initialized persistent cookie jar at: ${cookieDir.path}');
    } catch (e) {
      // Fallback to in-memory cookie jar if persistent storage fails
      print('Failed to initialize persistent cookie jar, using in-memory: $e');
      _delegate = CookieJar();
      _initialized = true;
    }
  }

  Future<void> _ensureInitialized() async {
    int attempts = 0;
    while (!_initialized && attempts < 100) {
      // Wait up to 10 seconds
      await Future.delayed(const Duration(milliseconds: 100));
      attempts++;
    }
    if (!_initialized) {
      print('Cookie jar initialization timeout, using fallback');
      _delegate = CookieJar();
      _initialized = true;
    }
  }

  @override
  bool get ignoreExpires => _initialized ? _delegate.ignoreExpires : false;

  @override
  Future<void> saveFromResponse(Uri uri, List<Cookie> cookies) async {
    await _ensureInitialized();

    print('=== SAVING COOKIES ===');
    print('URI: $uri');
    print('Cookies to save: ${cookies.length}');

    if (cookies.isEmpty) {
      print('No cookies to save');
      print('=== COOKIES SAVED (NONE) ===');
      return;
    }

    // No domain mapping - use IP address consistently as requested

    // Modify cookies to work with IP address consistently
    final modifiedCookies = cookies.map((cookie) {
      print(
        'Original cookie: ${cookie.name}=${cookie.value}, domain=${cookie.domain}, path=${cookie.path}, secure=${cookie.secure}, httpOnly=${cookie.httpOnly}',
      );

      // Create a new cookie with modified domain and path
      final newCookie = Cookie(cookie.name, cookie.value)
        ..path = cookie.path ?? '/'
        ..httpOnly = cookie.httpOnly
        ..secure =
            false // Disable secure flag for local development
        ..expires = cookie.expires
        ..maxAge = cookie.maxAge;

      // CRITICAL: Remove domain restrictions to allow cookies to work with IP address
      newCookie.domain = null;

      print(
        'Modified cookie: ${newCookie.name}=${newCookie.value}, domain=${newCookie.domain}, path=${newCookie.path}, secure=${newCookie.secure}',
      );
      return newCookie;
    }).toList();

    print('Saving ${modifiedCookies.length} modified cookies');

    try {
      // Save cookies for the original URI only (no domain mapping)
      await _delegate.saveFromResponse(uri, modifiedCookies);
      print('Saved cookies for URI: $uri');

      // Immediately verify cookies were saved
      final savedCookies = await _delegate.loadForRequest(uri);
      print('Verification: ${savedCookies.length} cookies now stored for URI');

      print('=== COOKIES SAVED SUCCESSFULLY ===');
    } catch (e) {
      print('Error saving cookies: $e');
      print('=== COOKIES SAVE FAILED ===');
    }
  }

  @override
  Future<List<Cookie>> loadForRequest(Uri uri) async {
    await _ensureInitialized();

    print('=== LOADING COOKIES ===');
    print('Loading cookies for URI: $uri');

    // Load cookies only from the original URI (no domain mapping)
    try {
      final cookies = await _delegate.loadForRequest(uri);
      print(
        'Original cookies (${cookies.length}): ${cookies.map((c) => '${c.name}=${c.value}').join('; ')}',
      );

      print('=== COOKIES LOADED ===');
      return cookies;
    } catch (e) {
      print('Error loading cookies: $e');
      print('=== COOKIES LOADED ===');
      return [];
    }
  }

  @override
  Future<void> delete(Uri uri, [bool withDomainSharedCookie = false]) async {
    await _ensureInitialized();

    // Delete cookies only from the original URI (no domain mapping)
    await _delegate.delete(uri, withDomainSharedCookie);
    print('Deleted cookies for URI: $uri');
  }

  @override
  Future<void> deleteAll() async {
    await _ensureInitialized();
    await _delegate.deleteAll();
  }
}
