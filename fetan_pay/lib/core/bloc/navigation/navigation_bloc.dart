import 'package:flutter_bloc/flutter_bloc.dart';

abstract class NavigationEvent {}

class NavigateToScan extends NavigationEvent {}

class NavigateToTips extends NavigationEvent {}

class NavigateToHistory extends NavigationEvent {}

class NavigateToProfile extends NavigationEvent {}

class NavigationState {
  final int currentIndex;

  const NavigationState(this.currentIndex);

  NavigationState copyWith({int? currentIndex}) {
    return NavigationState(currentIndex ?? this.currentIndex);
  }
}

class NavigationBloc extends Bloc<NavigationEvent, NavigationState> {
  NavigationBloc() : super(const NavigationState(0)) {
    on<NavigateToScan>((event, emit) => emit(state.copyWith(currentIndex: 0)));
    on<NavigateToTips>((event, emit) => emit(state.copyWith(currentIndex: 1)));
    on<NavigateToHistory>((event, emit) => emit(state.copyWith(currentIndex: 2)));
    on<NavigateToProfile>((event, emit) => emit(state.copyWith(currentIndex: 3)));
  }
}
