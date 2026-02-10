import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../utils/secure_logger.dart';
import 'failures.dart';

/// Centralized error handling utility
class ErrorHandler {
  /// Convert various error types to appropriate Failure objects
  static Failure handleError(dynamic error, {String? context}) {
    SecureLogger.error(
      'Error occurred${context != null ? ' in $context' : ''}',
      error: error,
    );

    if (error is DioException) {
      return _handleDioError(error);
    }

    if (error is Failure) {
      return error;
    }

    if (error is Exception) {
      return _handleException(error);
    }

    // Handle any other type of error
    return UnknownFailure(
      message: 'An unexpected error occurred: ${error.toString()}',
      originalError: error,
    );
  }

  /// Handle Dio-specific errors
  static Failure _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkFailure(
          message: 'Connection timeout. Please check your internet connection.',
          code: 'TIMEOUT',
          originalError: error,
        );

      case DioExceptionType.badResponse:
        return _handleHttpError(error);

      case DioExceptionType.cancel:
        return NetworkFailure(
          message: 'Request was cancelled',
          code: 'CANCELLED',
          originalError: error,
        );

      case DioExceptionType.connectionError:
        return NetworkFailure(
          message:
              'No internet connection. Please check your network settings.',
          code: 'NO_CONNECTION',
          originalError: error,
        );

      case DioExceptionType.badCertificate:
        return NetworkFailure(
          message: 'Security certificate error. Please try again.',
          code: 'BAD_CERTIFICATE',
          originalError: error,
        );

      case DioExceptionType.unknown:
      default:
        return NetworkFailure(
          message: 'Network error occurred. Please try again.',
          code: 'UNKNOWN_NETWORK',
          originalError: error,
        );
    }
  }

  /// Handle HTTP response errors
  static Failure _handleHttpError(DioException error) {
    final statusCode = error.response?.statusCode;
    final responseData = error.response?.data;

    String message = 'An error occurred';
    String? code;

    // Try to extract error message from response
    if (responseData is Map<String, dynamic>) {
      message =
          responseData['message'] ??
          responseData['error'] ??
          responseData['detail'] ??
          message;
      code = responseData['code']?.toString();
    } else if (responseData is String) {
      message = responseData;
    }

    switch (statusCode) {
      case 400:
        return ValidationFailure(
          message: message.isEmpty ? 'Invalid request data' : message,
          code: code ?? 'BAD_REQUEST',
          originalError: error,
        );

      case 401:
        // Enhanced 401 error handling for authentication
        String authMessage = message.isEmpty
            ? 'Authentication failed. Please login again.'
            : message;

        // Provide more specific messages for common authentication scenarios
        if (message.toLowerCase().contains('password') ||
            message.toLowerCase().contains('credential') ||
            message.toLowerCase().contains('invalid')) {
          authMessage =
              'Incorrect email or password. Please check your credentials and try again.';
        } else if (message.toLowerCase().contains('email')) {
          authMessage =
              'Email address not found. Please check your email and try again.';
        } else if (message.toLowerCase().contains('expired')) {
          authMessage = 'Your session has expired. Please login again.';
        } else if (message.toLowerCase().contains('token')) {
          authMessage = 'Authentication token is invalid. Please login again.';
        }

        return AuthFailure(
          message: authMessage,
          code: code ?? 'UNAUTHORIZED',
          originalError: error,
        );

      case 403:
        return AuthFailure(
          message: message.isEmpty
              ? 'Access denied. You don\'t have permission to perform this action.'
              : message,
          code: code ?? 'FORBIDDEN',
          originalError: error,
        );

      case 404:
        return ServerFailure(
          message: message.isEmpty
              ? 'The requested resource was not found.'
              : message,
          code: code ?? 'NOT_FOUND',
          originalError: error,
        );

      case 422:
        return ValidationFailure(
          message: message.isEmpty
              ? 'Validation failed. Please check your input.'
              : message,
          code: code ?? 'VALIDATION_ERROR',
          originalError: error,
        );

      case 429:
        return NetworkFailure(
          message: message.isEmpty
              ? 'Too many requests. Please try again later.'
              : message,
          code: code ?? 'RATE_LIMITED',
          originalError: error,
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return ServerFailure(
          message: message.isEmpty
              ? 'Server error. Please try again later.'
              : message,
          code: code ?? 'SERVER_ERROR',
          originalError: error,
        );

      default:
        return ServerFailure(
          message: message.isEmpty
              ? 'An unexpected server error occurred.'
              : message,
          code: code ?? 'HTTP_$statusCode',
          originalError: error,
        );
    }
  }

  /// Handle general exceptions
  static Failure _handleException(Exception error) {
    final errorMessage = error.toString();

    // Check for specific exception types
    if (errorMessage.contains('SocketException') ||
        errorMessage.contains('HandshakeException')) {
      return NetworkFailure(
        message:
            'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        originalError: error,
      );
    }

    if (errorMessage.contains('FormatException')) {
      return ValidationFailure(
        message: 'Invalid data format received.',
        code: 'FORMAT_ERROR',
        originalError: error,
      );
    }

    if (errorMessage.contains('TimeoutException')) {
      return NetworkFailure(
        message: 'Operation timed out. Please try again.',
        code: 'TIMEOUT',
        originalError: error,
      );
    }

    // Default exception handling
    return UnknownFailure(
      message: 'An unexpected error occurred: ${error.toString()}',
      originalError: error,
    );
  }

  /// Get user-friendly error message from Failure
  static String getErrorMessage(Failure failure) {
    return failure.message;
  }

  /// Check if error is network-related
  static bool isNetworkError(Failure failure) {
    return failure is NetworkFailure;
  }

  /// Check if error is authentication-related
  static bool isAuthError(Failure failure) {
    return failure is AuthFailure;
  }

  /// Check if error is validation-related
  static bool isValidationError(Failure failure) {
    return failure is ValidationFailure;
  }

  /// Check if error requires user re-authentication
  static bool requiresReauth(Failure failure) {
    return failure is AuthFailure &&
        (failure.code == 'UNAUTHORIZED' || failure.code == 'TOKEN_EXPIRED');
  }
}
