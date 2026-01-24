import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';
import '../config/api_config.dart';

class DioClient {
  late final Dio _dio;
  late final CookieJar _cookieJar;

  DioClient() {
    _initializeCookieJarSync();
    _dio = Dio(_createBaseOptions());

    // Add interceptors
    _dio.interceptors.addAll([
      _createAuthInterceptor(),
      CookieManager(_cookieJar), // Add cookie manager
      _createLoggingInterceptor(),
      _createRetryInterceptor(),
    ]);
  }

  void _initializeCookieJarSync() {
    // Start with memory cookie jar to avoid async constructor issues
    _cookieJar = CookieJar();
    debugPrint('Initialized memory cookie jar');

    // Try to upgrade to persistent storage asynchronously
    _upgradeToPersistentStorage();
  }

  Future<void> _upgradeToPersistentStorage() async {
    try {
      final appDocDir = await getApplicationDocumentsDirectory();
      final cookiePath = '${appDocDir.path}/.cookies/';

      final persistentJar = PersistCookieJar(
        storage: FileStorage(cookiePath),
      );

      // Copy any existing cookies from memory jar to persistent jar
      // Note: This is a basic implementation - in production you'd want to copy cookies properly

      _cookieJar = persistentJar;
      debugPrint('Upgraded to persistent cookie jar');
    } catch (e) {
      debugPrint('Failed to upgrade to persistent cookie jar: $e');
      // Keep using memory cookie jar
    }
  }

  BaseOptions _createBaseOptions() {
    return BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.connectTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: ApiConfig.defaultHeaders,
      // Enable cookies for session management
      extra: {'withCredentials': true},
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
          debugPrint('Authentication error: ${error.response?.data}');
        }
        handler.next(error);
      },
    );
  }

  Interceptor _createLoggingInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        if (kDebugMode) {
          debugPrint('🌐 REQUEST: ${options.method} ${options.uri}');
          debugPrint('📤 DATA: ${options.data}');
          debugPrint('📋 HEADERS: ${options.headers}');
        }
        handler.next(options);
      },
      onResponse: (response, handler) {
        if (kDebugMode) {
          debugPrint('✅ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}');
          debugPrint('📥 DATA: ${response.data}');
        }
        handler.next(response);
      },
      onError: (error, handler) {
        if (kDebugMode) {
          debugPrint('❌ ERROR: ${error.response?.statusCode} ${error.requestOptions.uri}');
          debugPrint('💥 ERROR DATA: ${error.response?.data}');
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
}
