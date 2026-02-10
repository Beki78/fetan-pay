import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/repositories/merchant_users_repository.dart';
import '../models/merchant_user_models.dart';
import '../services/merchant_users_api_service.dart';

class MerchantUsersRepositoryImpl implements MerchantUsersRepository {
  final MerchantUsersApiService _apiService;
  final NetworkInfo _networkInfo;

  // Cache for users list
  List<MerchantUser>? _cachedUsers;
  DateTime? _cacheTime;
  static const _cacheDuration = Duration(minutes: 5);

  MerchantUsersRepositoryImpl({
    required MerchantUsersApiService apiService,
    required NetworkInfo networkInfo,
  }) : _apiService = apiService,
       _networkInfo = networkInfo;

  @override
  Future<Either<Failure, List<MerchantUser>>> getMerchantUsers(
    String merchantId, {
    bool forceRefresh = false,
  }) async {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && _cachedUsers != null && _cacheTime != null) {
        final cacheAge = DateTime.now().difference(_cacheTime!);
        if (cacheAge < _cacheDuration) {
          print('Returning cached users (age: ${cacheAge.inSeconds}s)');
          return Right(_cachedUsers!);
        }
      }

      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        // Return cached data if available, otherwise return error
        if (_cachedUsers != null) {
          print('No network, returning cached users');
          return Right(_cachedUsers!);
        }
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Fetch from API
      final users = await _apiService.getMerchantUsers(merchantId);

      // Update cache
      _cachedUsers = users;
      _cacheTime = DateTime.now();

      return Right(users);
    } catch (e) {
      print('Error in getMerchantUsers repository: $e');
      final failure = ErrorHandler.handleError(e, context: 'getMerchantUsers');
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, MerchantUser>> getMerchantUser(
    String merchantId,
    String id,
  ) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        // Try to find in cache
        if (_cachedUsers != null) {
          final cachedUser = _cachedUsers!.firstWhere(
            (user) => user.id == id,
            orElse: () => throw Exception('User not found in cache'),
          );
          return Right(cachedUser);
        }
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Fetch from API
      final user = await _apiService.getMerchantUser(merchantId, id);
      return Right(user);
    } catch (e) {
      print('Error in getMerchantUser repository: $e');
      final failure = ErrorHandler.handleError(e, context: 'getMerchantUser');
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, MerchantUser>> createMerchantUser(
    CreateMerchantUserInput input,
  ) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Create user via API
      final user = await _apiService.createMerchantUser(input);

      // Invalidate cache to force refresh
      _cachedUsers = null;
      _cacheTime = null;

      return Right(user);
    } catch (e) {
      print('Error in createMerchantUser repository: $e');
      final failure = ErrorHandler.handleError(
        e,
        context: 'createMerchantUser',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, MerchantUser>> updateMerchantUser(
    UpdateMerchantUserInput input,
  ) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Update user via API
      final user = await _apiService.updateMerchantUser(input);

      // Update cache if exists
      if (_cachedUsers != null) {
        final index = _cachedUsers!.indexWhere((u) => u.id == user.id);
        if (index != -1) {
          _cachedUsers![index] = user;
        }
      }

      return Right(user);
    } catch (e) {
      print('Error in updateMerchantUser repository: $e');
      final failure = ErrorHandler.handleError(
        e,
        context: 'updateMerchantUser',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, MerchantUser>> deactivateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  ) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Deactivate user via API
      final user = await _apiService.deactivateMerchantUser(
        merchantId,
        id,
        actionBy,
      );

      // Update cache if exists
      if (_cachedUsers != null) {
        final index = _cachedUsers!.indexWhere((u) => u.id == user.id);
        if (index != -1) {
          _cachedUsers![index] = user;
        }
      }

      return Right(user);
    } catch (e) {
      print('Error in deactivateMerchantUser repository: $e');
      final failure = ErrorHandler.handleError(
        e,
        context: 'deactivateMerchantUser',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, MerchantUser>> activateMerchantUser(
    String merchantId,
    String id,
    String actionBy,
  ) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Activate user via API
      final user = await _apiService.activateMerchantUser(
        merchantId,
        id,
        actionBy,
      );

      // Update cache if exists
      if (_cachedUsers != null) {
        final index = _cachedUsers!.indexWhere((u) => u.id == user.id);
        if (index != -1) {
          _cachedUsers![index] = user;
        }
      }

      return Right(user);
    } catch (e) {
      print('Error in activateMerchantUser repository: $e');
      final failure = ErrorHandler.handleError(
        e,
        context: 'activateMerchantUser',
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, QRCodeResponse>> getQRCode(
    String merchantId,
    String userId,
  ) async {
    try {
      // Check network connectivity
      if (!await _networkInfo.isConnected) {
        return const Left(
          NetworkFailure(
            message: 'No internet connection',
            code: 'NO_CONNECTION',
          ),
        );
      }

      // Get QR code via API
      final qrCode = await _apiService.getQRCode(merchantId, userId);
      return Right(qrCode);
    } catch (e) {
      print('Error in getQRCode repository: $e');
      final failure = ErrorHandler.handleError(e, context: 'getQRCode');
      return Left(failure);
    }
  }

  @override
  void clearCache() {
    _cachedUsers = null;
    _cacheTime = null;
  }
}
