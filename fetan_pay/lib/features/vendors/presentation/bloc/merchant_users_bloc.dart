import 'package:fetan_pay/features/vendors/data/models/merchant_user_models.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_merchant_users.dart';
import '../../domain/usecases/merchant_users_usecases.dart';
import 'merchant_users_event.dart';
import 'merchant_users_state.dart';

class MerchantUsersBloc extends Bloc<MerchantUsersEvent, MerchantUsersState> {
  final GetMerchantUsers getMerchantUsers;
  final GetMerchantUser getMerchantUser;
  final CreateMerchantUser createMerchantUser;
  final UpdateMerchantUser updateMerchantUser;
  final DeactivateMerchantUser deactivateMerchantUser;
  final ActivateMerchantUser activateMerchantUser;
  final GetUserQRCode getUserQRCode;

  MerchantUsersBloc({
    required this.getMerchantUsers,
    required this.getMerchantUser,
    required this.createMerchantUser,
    required this.updateMerchantUser,
    required this.deactivateMerchantUser,
    required this.activateMerchantUser,
    required this.getUserQRCode,
  }) : super(const MerchantUsersInitial()) {
    on<LoadMerchantUsers>(_onLoadMerchantUsers);
    on<CreateMerchantUserEvent>(_onCreateMerchantUser);
    on<UpdateMerchantUserEvent>(_onUpdateMerchantUser);
    on<DeactivateMerchantUserEvent>(_onDeactivateMerchantUser);
    on<ActivateMerchantUserEvent>(_onActivateMerchantUser);
    on<GetUserQRCodeEvent>(_onGetUserQRCode);
    on<ClearMerchantUsersError>(_onClearError);
  }

  Future<void> _onLoadMerchantUsers(
    LoadMerchantUsers event,
    Emitter<MerchantUsersState> emit,
  ) async {
    emit(const MerchantUsersLoading());

    final result = await getMerchantUsers(
      event.merchantId,
      forceRefresh: event.forceRefresh,
    );

    result.fold(
      (failure) => emit(MerchantUsersError(message: failure.message)),
      (users) => emit(MerchantUsersLoaded(users: users)),
    );
  }

  Future<void> _onCreateMerchantUser(
    CreateMerchantUserEvent event,
    Emitter<MerchantUsersState> emit,
  ) async {
    // Get current users list
    final currentUsers = state is MerchantUsersLoaded
        ? (state as MerchantUsersLoaded).users
        : <MerchantUser>[];

    emit(
      MerchantUsersOperationInProgress(
        users: currentUsers,
        operationType: 'create',
      ),
    );

    final result = await createMerchantUser(event.input);

    result.fold(
      (failure) => emit(
        MerchantUsersError(message: failure.message, users: currentUsers),
      ),
      (newUser) {
        // Add new user to the list
        final updatedUsers = [...currentUsers, newUser];
        emit(
          MerchantUsersOperationSuccess(
            users: updatedUsers,
            message: 'User created successfully',
          ),
        );
        // Transition to loaded state
        emit(MerchantUsersLoaded(users: updatedUsers));
      },
    );
  }

  Future<void> _onUpdateMerchantUser(
    UpdateMerchantUserEvent event,
    Emitter<MerchantUsersState> emit,
  ) async {
    // Get current users list
    final currentUsers = state is MerchantUsersLoaded
        ? (state as MerchantUsersLoaded).users
        : <MerchantUser>[];

    emit(
      MerchantUsersOperationInProgress(
        users: currentUsers,
        operationType: 'update',
      ),
    );

    final result = await updateMerchantUser(event.input);

    result.fold(
      (failure) => emit(
        MerchantUsersError(message: failure.message, users: currentUsers),
      ),
      (updatedUser) {
        // Update user in the list
        final updatedUsers = currentUsers.map((user) {
          return user.id == updatedUser.id ? updatedUser : user;
        }).toList();
        emit(
          MerchantUsersOperationSuccess(
            users: updatedUsers,
            message: 'User updated successfully',
          ),
        );
        // Transition to loaded state
        emit(MerchantUsersLoaded(users: updatedUsers));
      },
    );
  }

  Future<void> _onDeactivateMerchantUser(
    DeactivateMerchantUserEvent event,
    Emitter<MerchantUsersState> emit,
  ) async {
    // Get current users list
    final currentUsers = state is MerchantUsersLoaded
        ? (state as MerchantUsersLoaded).users
        : <MerchantUser>[];

    emit(
      MerchantUsersOperationInProgress(
        users: currentUsers,
        operationType: 'deactivate',
      ),
    );

    final result = await deactivateMerchantUser(
      event.merchantId,
      event.userId,
      event.actionBy,
    );

    result.fold(
      (failure) => emit(
        MerchantUsersError(message: failure.message, users: currentUsers),
      ),
      (updatedUser) {
        // Update user in the list
        final updatedUsers = currentUsers.map((user) {
          return user.id == updatedUser.id ? updatedUser : user;
        }).toList();
        emit(
          MerchantUsersOperationSuccess(
            users: updatedUsers,
            message: 'User deactivated successfully',
          ),
        );
        // Transition to loaded state
        emit(MerchantUsersLoaded(users: updatedUsers));
      },
    );
  }

  Future<void> _onActivateMerchantUser(
    ActivateMerchantUserEvent event,
    Emitter<MerchantUsersState> emit,
  ) async {
    // Get current users list
    final currentUsers = state is MerchantUsersLoaded
        ? (state as MerchantUsersLoaded).users
        : <MerchantUser>[];

    emit(
      MerchantUsersOperationInProgress(
        users: currentUsers,
        operationType: 'activate',
      ),
    );

    final result = await activateMerchantUser(
      event.merchantId,
      event.userId,
      event.actionBy,
    );

    result.fold(
      (failure) => emit(
        MerchantUsersError(message: failure.message, users: currentUsers),
      ),
      (updatedUser) {
        // Update user in the list
        final updatedUsers = currentUsers.map((user) {
          return user.id == updatedUser.id ? updatedUser : user;
        }).toList();
        emit(
          MerchantUsersOperationSuccess(
            users: updatedUsers,
            message: 'User activated successfully',
          ),
        );
        // Transition to loaded state
        emit(MerchantUsersLoaded(users: updatedUsers));
      },
    );
  }

  Future<void> _onGetUserQRCode(
    GetUserQRCodeEvent event,
    Emitter<MerchantUsersState> emit,
  ) async {
    // Get current users list
    final currentUsers = state is MerchantUsersLoaded
        ? (state as MerchantUsersLoaded).users
        : <MerchantUser>[];

    final result = await getUserQRCode(event.merchantId, event.userId);

    result.fold(
      (failure) => emit(
        MerchantUsersError(message: failure.message, users: currentUsers),
      ),
      (qrCode) =>
          emit(MerchantUsersQRCodeLoaded(users: currentUsers, qrCode: qrCode)),
    );
  }

  void _onClearError(
    ClearMerchantUsersError event,
    Emitter<MerchantUsersState> emit,
  ) {
    if (state is MerchantUsersError) {
      final errorState = state as MerchantUsersError;
      if (errorState.users != null) {
        emit(MerchantUsersLoaded(users: errorState.users!));
      } else {
        emit(const MerchantUsersInitial());
      }
    }
  }
}
