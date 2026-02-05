import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/utils/secure_logger.dart';
import '../../domain/usecases/get_tips_summary_usecase.dart';
import '../../domain/usecases/list_tips_usecase.dart';
import '../../data/models/tip_models.dart';
import 'tip_event.dart';
import 'tip_state.dart';

class TipBloc extends Bloc<TipEvent, TipState> {
  final GetTipsSummaryUseCase _getTipsSummaryUseCase;
  final ListTipsUseCase _listTipsUseCase;

  // Current query parameters for pagination
  ListTipsQuery _currentQuery = const ListTipsQuery(page: 1, pageSize: 20);

  TipBloc({
    required GetTipsSummaryUseCase getTipsSummaryUseCase,
    required ListTipsUseCase listTipsUseCase,
  }) : _getTipsSummaryUseCase = getTipsSummaryUseCase,
       _listTipsUseCase = listTipsUseCase,
       super(const TipInitial()) {
    on<LoadTipsSummary>(_onLoadTipsSummary);
    on<LoadTipsList>(_onLoadTipsList);
    on<RefreshTips>(_onRefreshTips);
    on<LoadMoreTips>(_onLoadMoreTips);
  }

  Future<void> _onLoadTipsSummary(
    LoadTipsSummary event,
    Emitter<TipState> emit,
  ) async {
    try {
      SecureLogger.info('Loading tips summary');

      final result = await _getTipsSummaryUseCase(
        TipsSummaryParams(query: event.query),
      );

      result.fold(
        (failure) {
          SecureLogger.error('Failed to load tips summary', error: failure);
          emit(TipError(ErrorHandler.getErrorMessage(failure)));
        },
        (tipsSummary) {
          SecureLogger.info('Tips summary loaded successfully');
          // This is just for summary, we need to combine with existing state if available
          if (state is TipLoaded) {
            final currentState = state as TipLoaded;
            // Update statistics but keep existing tips
            emit(
              currentState.copyWith(
                statistics: _buildStatisticsFromSummary(tipsSummary),
              ),
            );
          } else {
            // Initial load with empty tips
            emit(
              TipLoaded(
                statistics: _buildStatisticsFromSummary(tipsSummary),
                tips: const [],
              ),
            );
          }
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'LoadTipsSummary');
      SecureLogger.error(
        'Unexpected error loading tips summary',
        error: failure,
      );
      emit(TipError(failure.message));
    }
  }

  Future<void> _onLoadTipsList(
    LoadTipsList event,
    Emitter<TipState> emit,
  ) async {
    try {
      SecureLogger.info('Loading tips list');
      _currentQuery = event.query;

      final result = await _listTipsUseCase(ListTipsParams(query: event.query));

      result.fold(
        (failure) {
          SecureLogger.error('Failed to load tips list', error: failure);
          emit(TipError(ErrorHandler.getErrorMessage(failure)));
        },
        (listTipsResponse) {
          SecureLogger.info('Tips list loaded successfully');

          final hasReachedMax =
              listTipsResponse.data.length < (event.query.pageSize ?? 20);

          if (state is TipLoaded) {
            final currentState = state as TipLoaded;
            emit(
              currentState.copyWith(
                tips: listTipsResponse.data,
                hasReachedMax: hasReachedMax,
                currentPage: event.query.page ?? 1,
                isLoadingMore: false,
              ),
            );
          } else {
            emit(
              TipLoaded(
                statistics: TipStatistics.empty(),
                tips: listTipsResponse.data,
                hasReachedMax: hasReachedMax,
                currentPage: event.query.page ?? 1,
              ),
            );
          }
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'LoadTipsList');
      SecureLogger.error('Unexpected error loading tips list', error: failure);
      emit(TipError(failure.message));
    }
  }

  Future<void> _onRefreshTips(RefreshTips event, Emitter<TipState> emit) async {
    emit(const TipLoading());

    try {
      SecureLogger.info('Refreshing tips data');

      // Load both summary and tips list concurrently
      final now = DateTime.now();
      final todayStart = DateTime(now.year, now.month, now.day);
      final weekStart = DateTime(now.year, now.month, now.day - now.weekday);
      final monthStart = DateTime(now.year, now.month, 1);

      // Load all summaries concurrently (same return type)
      final summaryFutures = await Future.wait([
        _getTipsSummaryUseCase(
          TipsSummaryParams(
            query: TipsSummaryQuery(
              from: todayStart.toIso8601String(),
              to: now.toIso8601String(),
            ),
          ),
        ),
        _getTipsSummaryUseCase(
          TipsSummaryParams(
            query: TipsSummaryQuery(
              from: weekStart.toIso8601String(),
              to: now.toIso8601String(),
            ),
          ),
        ),
        _getTipsSummaryUseCase(
          TipsSummaryParams(
            query: TipsSummaryQuery(
              from: monthStart.toIso8601String(),
              to: now.toIso8601String(),
            ),
          ),
        ),
        _getTipsSummaryUseCase(
          TipsSummaryParams(
            query: const TipsSummaryQuery(), // Total
          ),
        ),
      ]);

      // Load tips list separately (different return type)
      final tipsListResult = await _listTipsUseCase(
        ListTipsParams(query: const ListTipsQuery(page: 1, pageSize: 20)),
      );

      // Check if any summary failed
      for (final result in summaryFutures) {
        result.fold(
          (failure) {
            SecureLogger.error('Failed to refresh tips data', error: failure);
            emit(TipError(ErrorHandler.getErrorMessage(failure)));
            return;
          },
          (_) {}, // Success, continue
        );
      }

      // Check if tips list failed
      tipsListResult.fold(
        (failure) {
          SecureLogger.error('Failed to refresh tips data', error: failure);
          emit(TipError(ErrorHandler.getErrorMessage(failure)));
          return;
        },
        (_) {}, // Success, continue
      );

      // All succeeded, extract data
      final todayResult = summaryFutures[0];
      final weekResult = summaryFutures[1];
      final monthResult = summaryFutures[2];
      final totalResult = summaryFutures[3];

      double todayAmount = 0.0;
      double weekAmount = 0.0;
      double monthAmount = 0.0;
      double totalAmount = 0.0;
      List<TipItem> tips = [];

      // Extract summary data
      todayResult.fold(
        (_) {},
        (summary) => todayAmount = summary.totalTipAmount ?? 0.0,
      );
      weekResult.fold(
        (_) {},
        (summary) => weekAmount = summary.totalTipAmount ?? 0.0,
      );
      monthResult.fold(
        (_) {},
        (summary) => monthAmount = summary.totalTipAmount ?? 0.0,
      );
      totalResult.fold(
        (_) {},
        (summary) => totalAmount = summary.totalTipAmount ?? 0.0,
      );

      // Extract tips list data
      tipsListResult.fold((_) {}, (listResponse) => tips = listResponse.data);

      final statistics = TipStatistics(
        today: todayAmount,
        thisWeek: weekAmount,
        thisMonth: monthAmount,
        total: totalAmount,
      );

      final hasReachedMax = tips.length < 20;

      emit(
        TipLoaded(
          statistics: statistics,
          tips: tips,
          hasReachedMax: hasReachedMax,
          currentPage: 1,
        ),
      );

      SecureLogger.info('Tips data refreshed successfully');
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'RefreshTips');
      SecureLogger.error('Unexpected error refreshing tips', error: failure);
      emit(TipError(failure.message));
    }
  }

  Future<void> _onLoadMoreTips(
    LoadMoreTips event,
    Emitter<TipState> emit,
  ) async {
    if (state is! TipLoaded) return;

    final currentState = state as TipLoaded;
    if (currentState.hasReachedMax || currentState.isLoadingMore) return;

    emit(currentState.copyWith(isLoadingMore: true));

    try {
      final nextPage = currentState.currentPage + 1;
      final query = _currentQuery.copyWith(page: nextPage);

      SecureLogger.info('Loading more tips - page $nextPage');

      final result = await _listTipsUseCase(ListTipsParams(query: query));

      result.fold(
        (failure) {
          SecureLogger.error('Failed to load more tips', error: failure);
          emit(currentState.copyWith(isLoadingMore: false));
        },
        (listTipsResponse) {
          SecureLogger.info('More tips loaded successfully');

          final newTips = [...currentState.tips, ...listTipsResponse.data];
          final hasReachedMax =
              listTipsResponse.data.length < (query.pageSize ?? 20);

          emit(
            currentState.copyWith(
              tips: newTips,
              hasReachedMax: hasReachedMax,
              currentPage: nextPage,
              isLoadingMore: false,
            ),
          );
        },
      );
    } catch (e) {
      final failure = ErrorHandler.handleError(e, context: 'LoadMoreTips');
      SecureLogger.error('Unexpected error loading more tips', error: failure);
      emit(currentState.copyWith(isLoadingMore: false));
    }
  }

  TipStatistics _buildStatisticsFromSummary(TipsSummary summary) {
    // This is a simplified version - in a real app you'd need to call multiple
    // summary endpoints for different time periods
    return TipStatistics(
      today: 0.0, // Would need separate call
      thisWeek: 0.0, // Would need separate call
      thisMonth: 0.0, // Would need separate call
      total: summary.totalTipAmount ?? 0.0,
    );
  }
}

// Extension to add copyWith method to ListTipsQuery
extension ListTipsQueryExtension on ListTipsQuery {
  ListTipsQuery copyWith({String? from, String? to, int? page, int? pageSize}) {
    return ListTipsQuery(
      from: from ?? this.from,
      to: to ?? this.to,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
    );
  }
}
