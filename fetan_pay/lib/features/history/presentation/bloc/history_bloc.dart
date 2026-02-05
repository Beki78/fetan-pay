import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/utils/secure_logger.dart';
import '../../domain/usecases/list_verification_history_usecase.dart';
import '../../data/models/history_models.dart';
import 'history_event.dart';
import 'history_state.dart';

class HistoryBloc extends Bloc<HistoryEvent, HistoryState> {
  final ListVerificationHistoryUseCase _listVerificationHistoryUseCase;

  // Current query parameters for pagination and filtering
  ListVerificationHistoryQuery _currentQuery =
      const ListVerificationHistoryQuery(page: 1, pageSize: 20);

  HistoryBloc({
    required ListVerificationHistoryUseCase listVerificationHistoryUseCase,
  }) : _listVerificationHistoryUseCase = listVerificationHistoryUseCase,
       super(const HistoryInitial()) {
    on<LoadVerificationHistory>(_onLoadVerificationHistory);
    on<RefreshVerificationHistory>(_onRefreshVerificationHistory);
    on<LoadMoreVerificationHistory>(_onLoadMoreVerificationHistory);
    on<FilterVerificationHistory>(_onFilterVerificationHistory);
  }

  Future<void> _onLoadVerificationHistory(
    LoadVerificationHistory event,
    Emitter<HistoryState> emit,
  ) async {
    try {
      SecureLogger.info('Loading verification history');
      _currentQuery = event.query;

      final result = await _listVerificationHistoryUseCase(
        ListVerificationHistoryParams(query: event.query),
      );

      result.fold(
        (failure) {
          SecureLogger.error(
            'Failed to load verification history',
            error: failure,
          );
          emit(HistoryError(ErrorHandler.getErrorMessage(failure)));
        },
        (response) {
          SecureLogger.info('Verification history loaded successfully');

          final hasReachedMax =
              response.data.length < (event.query.pageSize ?? 20);

          if (state is HistoryLoaded) {
            final currentState = state as HistoryLoaded;
            emit(
              currentState.copyWith(
                items: response.data,
                hasReachedMax: hasReachedMax,
                currentPage: event.query.page ?? 1,
                isLoadingMore: false,
                currentProvider: event.query.provider,
                currentStatus: event.query.status,
                currentReference: event.query.reference,
              ),
            );
          } else {
            emit(
              HistoryLoaded(
                items: response.data,
                hasReachedMax: hasReachedMax,
                currentPage: event.query.page ?? 1,
                currentProvider: event.query.provider,
                currentStatus: event.query.status,
                currentReference: event.query.reference,
              ),
            );
          }
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(
        e,
        context: 'LoadVerificationHistory',
      );
      SecureLogger.error(
        'Unexpected error loading verification history',
        error: failure,
      );
      emit(HistoryError(failure.message));
    }
  }

  Future<void> _onRefreshVerificationHistory(
    RefreshVerificationHistory event,
    Emitter<HistoryState> emit,
  ) async {
    emit(const HistoryLoading());

    try {
      SecureLogger.info('Refreshing verification history');

      // Reset to first page but keep current filters
      final refreshQuery = ListVerificationHistoryQuery(
        page: 1,
        pageSize: 20,
        provider: _currentQuery.provider,
        status: _currentQuery.status,
        reference: _currentQuery.reference,
        from: _currentQuery.from,
        to: _currentQuery.to,
      );

      _currentQuery = refreshQuery;

      final result = await _listVerificationHistoryUseCase(
        ListVerificationHistoryParams(query: refreshQuery),
      );

      result.fold(
        (failure) {
          SecureLogger.error(
            'Failed to refresh verification history',
            error: failure,
          );
          emit(HistoryError(ErrorHandler.getErrorMessage(failure)));
        },
        (response) {
          SecureLogger.info('Verification history refreshed successfully');

          final hasReachedMax = response.data.length < 20;

          emit(
            HistoryLoaded(
              items: response.data,
              hasReachedMax: hasReachedMax,
              currentPage: 1,
              currentProvider: refreshQuery.provider,
              currentStatus: refreshQuery.status,
              currentReference: refreshQuery.reference,
            ),
          );
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(
        e,
        context: 'RefreshVerificationHistory',
      );
      SecureLogger.error(
        'Unexpected error refreshing verification history',
        error: failure,
      );
      emit(HistoryError(failure.message));
    }
  }

  Future<void> _onLoadMoreVerificationHistory(
    LoadMoreVerificationHistory event,
    Emitter<HistoryState> emit,
  ) async {
    if (state is! HistoryLoaded) return;

    final currentState = state as HistoryLoaded;
    if (currentState.hasReachedMax || currentState.isLoadingMore) return;

    emit(currentState.copyWith(isLoadingMore: true));

    try {
      final nextPage = currentState.currentPage + 1;
      final query = _currentQuery.copyWith(page: nextPage);

      SecureLogger.info('Loading more verification history - page $nextPage');

      final result = await _listVerificationHistoryUseCase(
        ListVerificationHistoryParams(query: query),
      );

      result.fold(
        (failure) {
          SecureLogger.error(
            'Failed to load more verification history',
            error: failure,
          );
          emit(currentState.copyWith(isLoadingMore: false));
        },
        (response) {
          SecureLogger.info('More verification history loaded successfully');

          final newItems = [...currentState.items, ...response.data];
          final hasReachedMax = response.data.length < (query.pageSize ?? 20);

          emit(
            currentState.copyWith(
              items: newItems,
              hasReachedMax: hasReachedMax,
              currentPage: nextPage,
              isLoadingMore: false,
            ),
          );
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(
        e,
        context: 'LoadMoreVerificationHistory',
      );
      SecureLogger.error(
        'Unexpected error loading more verification history',
        error: failure,
      );
      emit(currentState.copyWith(isLoadingMore: false));
    }
  }

  Future<void> _onFilterVerificationHistory(
    FilterVerificationHistory event,
    Emitter<HistoryState> emit,
  ) async {
    emit(const HistoryLoading());

    try {
      SecureLogger.info('Filtering verification history');

      final filterQuery = ListVerificationHistoryQuery(
        page: 1,
        pageSize: 20,
        provider: event.provider,
        status: event.status,
        reference: event.reference,
      );

      _currentQuery = filterQuery;

      final result = await _listVerificationHistoryUseCase(
        ListVerificationHistoryParams(query: filterQuery),
      );

      result.fold(
        (failure) {
          SecureLogger.error(
            'Failed to filter verification history',
            error: failure,
          );
          emit(HistoryError(ErrorHandler.getErrorMessage(failure)));
        },
        (response) {
          SecureLogger.info('Verification history filtered successfully');

          final hasReachedMax = response.data.length < 20;

          emit(
            HistoryLoaded(
              items: response.data,
              hasReachedMax: hasReachedMax,
              currentPage: 1,
              currentProvider: event.provider,
              currentStatus: event.status,
              currentReference: event.reference,
            ),
          );
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(
        e,
        context: 'FilterVerificationHistory',
      );
      SecureLogger.error(
        'Unexpected error filtering verification history',
        error: failure,
      );
      emit(HistoryError(failure.message));
    }
  }
}

// Extension to add copyWith method to ListVerificationHistoryQuery
extension ListVerificationHistoryQueryExtension
    on ListVerificationHistoryQuery {
  ListVerificationHistoryQuery copyWith({
    String? provider,
    String? status,
    String? reference,
    String? from,
    String? to,
    int? page,
    int? pageSize,
  }) {
    return ListVerificationHistoryQuery(
      provider: provider ?? this.provider,
      status: status ?? this.status,
      reference: reference ?? this.reference,
      from: from ?? this.from,
      to: to ?? this.to,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
    );
  }
}
