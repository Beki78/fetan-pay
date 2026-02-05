import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import '../config/api_config.dart';
import '../utils/secure_logger.dart';

class DioClient {
  late final Dio _dio;
  late final CookieJar _cookieJar;
  late final CookieManager _cookieManager;

  DioClient() {
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
    // Create a custom cookie jar that handles domain mapping
    _cookieJar = _CustomCookieJar();
    SecureLogger.debug('Initialized custom cookie jar with domain mapping');
  }

  BaseOptions _createBaseOptions() {
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
          SecureLogger.auth('Authentication error occurred');
        }
        handler.next(error);
      },
    );
  }

  Interceptor _createLoggingInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        SecureLogger.networkRequest(options.method, options.uri.toString());

        // Debug cookie information for authentication debugging
        print('=== REQUEST DEBUG ===');
        print('Request to: ${options.uri}');
        print('Request headers: ${options.headers}');

        // Check if cookies are available in the jar
        _checkCookiesInJar(options.uri);

        handler.next(options);
      },
      onResponse: (response, handler) {
        SecureLogger.networkResponse(
          response.statusCode ?? 0,
          response.requestOptions.uri.toString(),
        );

        // Debug response cookies
        print('=== RESPONSE DEBUG ===');
        print('Response from: ${response.requestOptions.uri}');
        print('Response status: ${response.statusCode}');

        // Check if cookies were set
        final setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders != null && setCookieHeaders.isNotEmpty) {
          print('Set-Cookie headers received: $setCookieHeaders');
          // Give the cookie jar a moment to process the cookies
          Future.delayed(Duration(milliseconds: 100), () {
            _debugCookieJarAfterResponse();
          });
        }

        handler.next(response);
      },
      onError: (error, handler) {
        SecureLogger.networkResponse(
          error.response?.statusCode ?? 0,
          error.requestOptions.uri.toString(),
        );

        print('=== ERROR DEBUG ===');
        print('Error response from: ${error.requestOptions.uri}');
        print('Error status: ${error.response?.statusCode}');
        if (error.response?.statusCode == 401) {
          print('401 Unauthorized - likely cookie/session issue');
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
      // Check cookies for both localhost and IP
      final localhostUri = Uri.parse('http://localhost:3003');
      final ipUri = Uri.parse('http://192.168.0.147:3003');

      _cookieJar.loadForRequest(localhostUri).then((localhostCookies) {
        print(
          'Cookies stored for localhost: ${localhostCookies.map((c) => '${c.name}=${c.value}').join('; ')}',
        );
      });

      _cookieJar.loadForRequest(ipUri).then((ipCookies) {
        print(
          'Cookies stored for IP: ${ipCookies.map((c) => '${c.name}=${c.value}').join('; ')}',
        );
      });
    } catch (e) {
      print('Error debugging cookie jar: $e');
    }
  }
}

/// Custom cookie jar that maps IP addresses to localhost for cookie domain matching
class _CustomCookieJar implements CookieJar {
  final CookieJar _delegate = CookieJar();

  @override
  bool get ignoreExpires => _delegate.ignoreExpires;

  @override
  Future<void> saveFromResponse(Uri uri, List<Cookie> cookies) async {
    print('=== SAVING COOKIES ===');
    print('Original URI: $uri');
    print('Cookies to save: ${cookies.length}');

    // Map IP address to localhost for cookie storage
    final mappedUri = _mapUriToLocalhost(uri);
    print('Mapped URI: $mappedUri');

    // Modify cookies to work with both localhost and IP address
    final modifiedCookies = cookies.map((cookie) {
      print(
        'Original cookie: ${cookie.name}=${cookie.value}, domain=${cookie.domain}',
      );

      // Create a new cookie with modified domain
      final newCookie = Cookie(cookie.name, cookie.value)
        ..path = cookie.path ?? '/'
        ..httpOnly = cookie.httpOnly
        ..secure = cookie.secure
        ..expires = cookie.expires
        ..maxAge = cookie.maxAge;

      // CRITICAL: Remove domain restrictions to allow cookies to work with any host
      // This is the key fix for the domain mismatch issue
      newCookie.domain = null;

      print(
        'Modified cookie: ${newCookie.name}=${newCookie.value}, domain=${newCookie.domain}',
      );
      return newCookie;
    }).toList();

    print('Saving ${modifiedCookies.length} modified cookies');

    // Save cookies for both original and mapped URI to ensure compatibility
    await _delegate.saveFromResponse(uri, modifiedCookies);
    if (uri != mappedUri) {
      await _delegate.saveFromResponse(mappedUri, modifiedCookies);
      print('Also saved cookies for mapped URI');
    }

    print('=== COOKIES SAVED ===');
  }

  @override
  Future<List<Cookie>> loadForRequest(Uri uri) async {
    print('=== LOADING COOKIES ===');
    print('Loading cookies for URI: $uri');

    // Try to load cookies for both original and mapped URI
    final mappedUri = _mapUriToLocalhost(uri);
    print('Mapped URI: $mappedUri');

    final originalCookies = await _delegate.loadForRequest(uri);
    print(
      'Original cookies (${originalCookies.length}): ${originalCookies.map((c) => '${c.name}=${c.value}').join('; ')}',
    );

    final mappedCookies = uri != mappedUri
        ? await _delegate.loadForRequest(mappedUri)
        : <Cookie>[];
    print(
      'Mapped cookies (${mappedCookies.length}): ${mappedCookies.map((c) => '${c.name}=${c.value}').join('; ')}',
    );

    // Combine and deduplicate cookies by name
    final allCookies = <String, Cookie>{};
    for (final cookie in [...originalCookies, ...mappedCookies]) {
      allCookies[cookie.name] = cookie;
    }

    final result = allCookies.values.toList();
    print(
      'Final cookies (${result.length}): ${result.map((c) => '${c.name}=${c.value}').join('; ')}',
    );
    print('=== COOKIES LOADED ===');

    return result;
  }

  @override
  Future<void> delete(Uri uri, [bool withDomainSharedCookie = false]) async {
    final mappedUri = _mapUriToLocalhost(uri);
    await _delegate.delete(uri, withDomainSharedCookie);
    if (uri != mappedUri) {
      await _delegate.delete(mappedUri, withDomainSharedCookie);
    }
  }

  @override
  Future<void> deleteAll() async {
    await _delegate.deleteAll();
  }

  /// Maps IP address URIs to localhost for cookie compatibility
  Uri _mapUriToLocalhost(Uri uri) {
    if (uri.host == '192.168.0.147') {
      return uri.replace(host: 'localhost');
    }
    return uri;
  }
}
