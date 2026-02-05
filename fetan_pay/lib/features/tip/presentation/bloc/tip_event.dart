import 'package:equatable/equatable.dart';
import '../../data/models/tip_models.dart';

abstract class TipEvent extends Equatable {
  const TipEvent();

  @override
  List<Object?> get props => [];
}

class LoadTipsSummary extends TipEvent {
  final TipsSummaryQuery query;

  const LoadTipsSummary({required this.query});

  @override
  List<Object?> get props => [query];
}

class LoadTipsList extends TipEvent {
  final ListTipsQuery query;

  const LoadTipsList({required this.query});

  @override
  List<Object?> get props => [query];
}

class RefreshTips extends TipEvent {
  const RefreshTips();
}

class LoadMoreTips extends TipEvent {
  const LoadMoreTips();
}
