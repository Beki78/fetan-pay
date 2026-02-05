import 'package:equatable/equatable.dart';
import '../../data/models/tip_models.dart';

abstract class TipState extends Equatable {
  const TipState();

  @override
  List<Object?> get props => [];
}

class TipInitial extends TipState {
  const TipInitial();
}

class TipLoading extends TipState {
  const TipLoading();
}

class TipLoaded extends TipState {
  final TipStatistics statistics;
  final List<TipItem> tips;
  final bool isLoadingMore;
  final bool hasReachedMax;
  final int currentPage;

  const TipLoaded({
    required this.statistics,
    required this.tips,
    this.isLoadingMore = false,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  TipLoaded copyWith({
    TipStatistics? statistics,
    List<TipItem>? tips,
    bool? isLoadingMore,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return TipLoaded(
      statistics: statistics ?? this.statistics,
      tips: tips ?? this.tips,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [
    statistics,
    tips,
    isLoadingMore,
    hasReachedMax,
    currentPage,
  ];
}

class TipError extends TipState {
  final String message;

  const TipError(this.message);

  @override
  List<Object?> get props => [message];
}
