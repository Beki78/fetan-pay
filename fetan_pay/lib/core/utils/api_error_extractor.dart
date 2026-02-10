import 'package:dio/dio.dart';

/// Utility class to extract error messages from API responses
class ApiErrorExtractor {
  /// Extract error message from DioException response
  /// Returns the backend error message if available, otherwise returns a default message
  static String extractErrorMessage(
    DioException error, {
    String defaultMessage = 'An error occurred',
  }) {
    // Try to extract message from response data
    final responseData = error.response?.data;

    if (responseData is Map<String, dynamic>) {
      // Check for common error message fields
      final message = responseData['message'] as String?;
      if (message != null && message.isNotEmpty) {
        return message;
      }

      final errorField = responseData['error'] as String?;
      if (errorField != null && errorField.isNotEmpty) {
        return errorField;
      }

      final detailField = responseData['detail'] as String?;
      if (detailField != null && detailField.isNotEmpty) {
        return detailField;
      }
    } else if (responseData is String && responseData.isNotEmpty) {
      return responseData;
    }

    // If no message found in response, use the error message
    if (error.message != null && error.message!.isNotEmpty) {
      return error.message!;
    }

    return defaultMessage;
  }

  /// Extract error message and throw it as an exception
  /// This preserves the backend error message through the error handling chain
  static Never throwExtractedError(
    DioException error, {
    String defaultMessage = 'An error occurred',
  }) {
    // Simply rethrow the DioException - the ErrorHandler will extract the message
    throw error;
  }
}
