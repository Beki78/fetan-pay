import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/config/api_config.dart';
import '../models/subscription_models.dart';

abstract class SubscriptionApiService {
  Future<List<Plan>> getPublicPlans({
    String? status,
    String? billingCycle,
    int? limit,
    String? sortBy,
    String? sortOrder,
  });
  Future<Subscription?> getMerchantSubscription(String merchantId);
  Future<List<BillingTransaction>> getMerchantBillingTransactions(
    String merchantId, {
    int? limit,
  });
  Future<Map<String, dynamic>> upgradeMerchantPlan({
    required String merchantId,
    required String planId,
    String? paymentReference,
    String? paymentMethod,
  });
}

class SubscriptionApiServiceImpl implements SubscriptionApiService {
  final DioClient _dioClient;

  SubscriptionApiServiceImpl(this._dioClient);

  @override
  Future<List<Plan>> getPublicPlans({
    String? status,
    String? billingCycle,
    int? limit,
    String? sortBy,
    String? sortOrder,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;
      if (billingCycle != null) queryParams['billingCycle'] = billingCycle;
      if (limit != null) queryParams['limit'] = limit.toString();
      if (sortBy != null) queryParams['sortBy'] = sortBy;
      if (sortOrder != null) queryParams['sortOrder'] = sortOrder;

      final response = await _dioClient.get(
        '${ApiConfig.apiBaseUrl}/pricing/public/plans',
        queryParameters: queryParams,
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data as Map<String, dynamic>;
        final List<dynamic> plansJson = responseData['data'] as List<dynamic>;
        return plansJson
            .map((json) => Plan.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Subscription?> getMerchantSubscription(String merchantId) async {
    try {
      final response = await _dioClient.get(
        '${ApiConfig.apiBaseUrl}/pricing/merchants/$merchantId/subscription',
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data as Map<String, dynamic>;
        final subscriptionData = responseData['subscription'];

        if (subscriptionData == null) {
          return null;
        }

        return Subscription.fromJson(subscriptionData as Map<String, dynamic>);
      }

      return null;
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<BillingTransaction>> getMerchantBillingTransactions(
    String merchantId, {
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{'merchantId': merchantId};
      if (limit != null) queryParams['limit'] = limit.toString();

      final response = await _dioClient.get(
        '${ApiConfig.apiBaseUrl}/pricing/billing/transactions',
        queryParameters: queryParams,
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data as Map<String, dynamic>;
        final List<dynamic> transactionsJson =
            responseData['data'] as List<dynamic>;
        return transactionsJson
            .map(
              (json) =>
                  BillingTransaction.fromJson(json as Map<String, dynamic>),
            )
            .toList();
      }

      return [];
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Map<String, dynamic>> upgradeMerchantPlan({
    required String merchantId,
    required String planId,
    String? paymentReference,
    String? paymentMethod,
  }) async {
    try {
      final body = <String, dynamic>{
        'planId': planId,
        if (paymentReference != null) 'paymentReference': paymentReference,
        if (paymentMethod != null) 'paymentMethod': paymentMethod,
      };

      final response = await _dioClient.post(
        '${ApiConfig.apiBaseUrl}/pricing/merchants/$merchantId/upgrade',
        data: body,
        options: Options(
          extra: {'withCredentials': true},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 201 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }

      throw Exception('Failed to upgrade plan');
    } on DioException {
      // Rethrow DioException to preserve backend error message
      rethrow;
    } catch (e) {
      rethrow;
    }
  }
}
