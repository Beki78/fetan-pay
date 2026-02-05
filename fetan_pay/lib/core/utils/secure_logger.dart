import 'package:flutter/foundation.dart';
import 'dart:developer' as developer;

/// Secure logging utility that prevents sensitive data leakage in production
class SecureLogger {
  static const String _tag = 'FetanPay';

  /// Log debug information (only in debug mode)
  static void debug(String message, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        _sanitizeMessage(message),
        name: tag ?? _tag,
        level: 500, // Debug level
      );
    }
  }

  /// Log info messages (only in debug mode)
  static void info(String message, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        _sanitizeMessage(message),
        name: tag ?? _tag,
        level: 800, // Info level
      );
    }
  }

  /// Log warning messages (only in debug mode)
  static void warning(String message, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        _sanitizeMessage(message),
        name: tag ?? _tag,
        level: 900, // Warning level
      );
    }
  }

  /// Log error messages (only in debug mode)
  static void error(String message, {String? tag, Object? error, StackTrace? stackTrace}) {
    if (kDebugMode) {
      developer.log(
        _sanitizeMessage(message),
        name: tag ?? _tag,
        level: 1000, // Error level
        error: error,
        stackTrace: stackTrace,
      );
    }
  }

  /// Log network requests (sanitized)
  static void networkRequest(String method, String path, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        '🌐 REQUEST: $method ${_sanitizePath(path)}',
        name: tag ?? '${_tag}_Network',
        level: 500,
      );
    }
  }

  /// Log network responses (sanitized)
  static void networkResponse(int statusCode, String path, {String? tag}) {
    if (kDebugMode) {
      final emoji = statusCode >= 200 && statusCode < 300 ? '✅' : '❌';
      developer.log(
        '$emoji RESPONSE: $statusCode ${_sanitizePath(path)}',
        name: tag ?? '${_tag}_Network',
        level: statusCode >= 400 ? 900 : 500,
      );
    }
  }

  /// Log authentication events (without sensitive data)
  static void auth(String event, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        '🔐 AUTH: $event',
        name: tag ?? '${_tag}_Auth',
        level: 500,
      );
    }
  }

  /// Sanitize message to remove sensitive information
  static String _sanitizeMessage(String message) {
    String sanitized = message;

    // Remove email addresses
    sanitized = sanitized.replaceAll(
      RegExp(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
      '[EMAIL_HIDDEN]',
    );

    // Remove potential passwords (common patterns)
    sanitized = sanitized.replaceAll(
      RegExp(r'password["\s]*[:=]["\s]*[^"\s,}]+', caseSensitive: false),
      'password: [PASSWORD_HIDDEN]',
    );

    // Remove potential tokens (JWT-like patterns)
    sanitized = sanitized.replaceAll(
      RegExp(r'[A-Za-z0-9_-]{20,}'),
      '[TOKEN_HIDDEN]',
    );

    // Remove potential API keys
    sanitized = sanitized.replaceAll(
      RegExp(r'(api[_-]?key|token|secret)["\s]*[:=]["\s]*[^"\s,}]+', caseSensitive: false),
      '[API_KEY_HIDDEN]',
    );

    return sanitized;
  }

  /// Sanitize URL paths to remove sensitive query parameters
  static String _sanitizePath(String path) {
    final uri = Uri.tryParse(path);
    if (uri == null) return path;

    // Remove query parameters that might contain sensitive data
    if (uri.hasQuery) {
      return '${uri.path}?[QUERY_PARAMS_HIDDEN]';
    }

    return uri.path;
  }

  /// Log QR code events without exposing the actual QR data
  static void qrEvent(String event, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        '📱 QR: $event',
        name: tag ?? '${_tag}_QR',
        level: 500,
      );
    }
  }

  /// Log session events
  static void session(String event, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        '🔑 SESSION: $event',
        name: tag ?? '${_tag}_Session',
        level: 500,
      );
    }
  }
}