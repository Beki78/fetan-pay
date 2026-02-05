import 'package:equatable/equatable.dart';
import '../../data/models/history_models.dart';

abstract class HistoryState extends Equatable {
  const HistoryState();

  @override
  List<Object?> get props => [];
}

class HistoryInitial extends HistoryState {
  const HistoryInitial();
}

class HistoryLoading extends HistoryState {
  const HistoryLoading();
}

class HistoryLoaded extends HistoryState {
  final List<VerificationHistoryItem> items;
  final bool hasReachedMax;
  final int currentPage;
  final bool isLoadingMore;
  final String? currentProvider;
  final String? currentStatus;
  final String? currentReference;

  const HistoryLoaded({
    required this.items,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.isLoadingMore = false,
    this.currentProvider,
    this.currentStatus,
    this.currentReference,
  });

  HistoryLoaded copyWith({
    List<VerificationHistoryItem>? items,
    bool? hasReachedMax,
    int? currentPage,
    bool? isLoadingMore,
    String? currentProvider,
    String? currentStatus,
    String? currentReference,
  }) {
    return HistoryLoaded(
      items: items ?? this.items,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      currentProvider: currentProvider ?? this.currentProvider,
      currentStatus: currentStatus ?? this.currentStatus,
      currentReference: currentReference ?? this.currentReference,
    );
  }

  @override
  List<Object?> get props => [
    items,
    hasReachedMax,
    currentPage,
    isLoadingMore,
    currentProvider,
    currentStatus,
    currentReference,
  ];
}

class HistoryError extends HistoryState {
  final String message;

  const HistoryError(this.message);

  @override
  List<Object?> get props => [message];
}
