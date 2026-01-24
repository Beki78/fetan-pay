import 'package:flutter_bloc/flutter_bloc.dart';

abstract class AdminNavigationEvent {}

class NavigateToDashboard extends AdminNavigationEvent {}

class NavigateToTransactions extends AdminNavigationEvent {}

class NavigateToUsers extends AdminNavigationEvent {}

class NavigateToSettings extends AdminNavigationEvent {}

class AdminNavigationState {
  final int currentIndex;

  const AdminNavigationState(this.currentIndex);

  AdminNavigationState copyWith({int? currentIndex}) {
    return AdminNavigationState(currentIndex ?? this.currentIndex);
  }
}

class AdminNavigationBloc extends Bloc<AdminNavigationEvent, AdminNavigationState> {
  AdminNavigationBloc() : super(const AdminNavigationState(0)) {
    on<NavigateToDashboard>((event, emit) => emit(state.copyWith(currentIndex: 0)));
    on<NavigateToTransactions>((event, emit) => emit(state.copyWith(currentIndex: 1)));
    on<NavigateToUsers>((event, emit) => emit(state.copyWith(currentIndex: 2)));
    on<NavigateToSettings>((event, emit) => emit(state.copyWith(currentIndex: 3)));
  }
}
