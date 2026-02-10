import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../models/merchant_user_models.dart';

abstract class MerchantUsersApiService {
  Future<List<MerchantUser>> getMerchantUsers(String merchantId);
  Future<MerchantUser> getMerchantUser(String merchantId, String id);
  Future<MerchantUser> createMerchantUser(CreateMerchantUserInput input);
  Future<MerchantUser> updateMerchantUser(UpdateMerchantUserInput input);
  Future<MerchantUser> deactivateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  );
  Future<MerchantUser> activateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  );
  Future<QRCodeResponse> getQRCode(String merchantId, String userId);
}

class MerchantUsersApiServiceImpl implements MerchantUsersApiService {
  final DioClient _dioClient;

  MerchantUsersApiServiceImpl(this._dioClient);

  @override
  Future<List<MerchantUser>> getMerchantUsers(String merchantId) async {
    try {
      print('=== GET MERCHANT USERS ===');
      print('Merchant ID: $merchantId');

      final response = await _dioClient.get(
        '${ApiConfig.apiBaseUrl}/merchant-accounts/$merchantId/users',
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('Response status: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200 && response.data != null) {
        final List<dynamic> usersJson = response.data as List<dynamic>;
        return usersJson
            .map((json) => MerchantUser.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      print('Unexpected error getting merchant users: $e');
      rethrow;
    }
  }

  @override
  Future<MerchantUser> getMerchantUser(String merchantId, String id) async {
    try {
      print('=== GET MERCHANT USER ===');
      print('Merchant ID: $merchantId, User ID: $id');

      final response = await _dioClient.get(
        '${ApiConfig.apiBaseUrl}/merchant-accounts/$merchantId/users/$id',
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        return MerchantUser.fromJson(response.data as Map<String, dynamic>);
      }

      throw Exception('Failed to get merchant user');
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      print('Unexpected error getting merchant user: $e');
      rethrow;
    }
  }

  @override
  Future<MerchantUser> createMerchantUser(CreateMerchantUserInput input) async {
    try {
      print('=== CREATE MERCHANT USER ===');
      print('Merchant ID: ${input.merchantId}');
      print('User data: ${input.toJson()}');

      final response = await _dioClient.post(
        '${ApiConfig.apiBaseUrl}/merchant-accounts/${input.merchantId}/users',
        data: input.toJson(),
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return MerchantUser.fromJson(response.data as Map<String, dynamic>);
      }

      throw Exception('Failed to create merchant user');
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      print('Unexpected error creating merchant user: $e');
      rethrow;
    }
  }

  @override
  Future<MerchantUser> updateMerchantUser(UpdateMerchantUserInput input) async {
    try {
      print('=== UPDATE MERCHANT USER ===');
      print('Merchant ID: ${input.merchantId}, User ID: ${input.id}');
      print('Update data: ${input.toJson()}');

      final response = await _dioClient.patch(
        '${ApiConfig.apiBaseUrl}/merchant-accounts/${input.merchantId}/users/${input.id}',
        data: input.toJson(),
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return MerchantUser.fromJson(response.data as Map<String, dynamic>);
      }

      throw Exception('Failed to update merchant user');
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      print('Unexpected error updating merchant user: $e');
      rethrow;
    }
  }

  @override
  Future<MerchantUser> deactivateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  ) async {
    try {
      print('=== DEACTIVATE MERCHANT USER ===');
      print('Merchant ID: $merchantId, User ID: $id, Action by: $actionBy');

      final response = await _dioClient.patch(
        '${ApiConfig.apiBaseUrl}/merchant-accounts/$merchantId/users/$id/deactivate',
        data: {'actionBy': actionBy},
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return MerchantUser.fromJson(response.data as Map<String, dynamic>);
      }

      throw Exception('Failed to deactivate merchant user');
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      print('Unexpected error deactivating merchant user: $e');
      rethrow;
    }
  }

  @override
  Future<MerchantUser> activateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  ) async {
    try {
      print('=== ACTIVATE MERCHANT USER ===');
      print('Merchant ID: $merchantId, User ID: $id, Action by: $actionBy');

      final response = await _dioClient.patch(
        '${ApiConfig.apiBaseUrl}/merchant-accounts/$merchantId/users/$id/activate',
        data: {'actionBy': actionBy},
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return MerchantUser.fromJson(response.data as Map<String, dynamic>);
      }

      throw Exception('Failed to activate merchant user');
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      print('Unexpected error activating merchant user: $e');
      rethrow;
    }
  }

  @override
  Future<QRCodeResponse> getQRCode(String merchantId, String userId) async {
    try {
      print('=== GET QR CODE ===');
      print('Merchant ID: $merchantId, User ID: $userId');

      final response = await _dioClient.get(
        '${ApiConfig.apiBaseUrl}/merchant-accounts/$merchantId/users/$userId/qr-code',
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200 && response.data != null) {
        return QRCodeResponse.fromJson(response.data as Map<String, dynamic>);
      }

      throw Exception('Failed to get QR code');
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      print('Unexpected error getting QR code: $e');
      rethrow;
    }
  }
}
