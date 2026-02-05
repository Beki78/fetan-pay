import 'package:equatable/equatable.dart';
import '../../data/models/history_models.dart';

abstract class HistoryEvent extends Equatable {
  const HistoryEvent();

  @override
  List<Object?> get props => [];
}

class LoadVerificationHistory extends HistoryEvent {
  final ListVerificationHistoryQuery query;

  const LoadVerificationHistory({required this.query});

  @override
  List<Object?> get props => [query];
}

class RefreshVerificationHistory extends HistoryEvent {
  const RefreshVerificationHistory();
}

class LoadMoreVerificationHistory extends HistoryEvent {
  const LoadMoreVerificationHistory();
}

class FilterVerificationHistory extends HistoryEvent {
  final String? provider;
  final String? status;
  final String? reference;

  const FilterVerificationHistory({
    this.provider,
    this.status,
    this.reference,
  });

  @override
  List<Object?> get props => [provider, status, reference];
}