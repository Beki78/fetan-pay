import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class ThemeEvent {}

class ToggleTheme extends ThemeEvent {}

class LoadTheme extends ThemeEvent {}

class ThemeState {
  final ThemeMode themeMode;

  const ThemeState(this.themeMode);

  ThemeState copyWith({ThemeMode? themeMode}) {
    return ThemeState(themeMode ?? this.themeMode);
  }
}

class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  static const String _themeKey = 'theme_mode';

  ThemeBloc() : super(const ThemeState(ThemeMode.light)) {
    on<LoadTheme>(_onLoadTheme);
    on<ToggleTheme>(_onToggleTheme);

    // Load theme after initialization
    _initializeTheme();
  }

  Future<void> _initializeTheme() async {
    // Add a small delay to ensure platform channels are ready
    await Future.delayed(const Duration(milliseconds: 100));
    add(LoadTheme());
  }

  Future<void> _onLoadTheme(LoadTheme event, Emitter<ThemeState> emit) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeIndex = prefs.getInt(_themeKey) ?? ThemeMode.light.index;
      final themeMode = ThemeMode.values[themeIndex];
      emit(state.copyWith(themeMode: themeMode));
    } catch (e) {
      // If SharedPreferences fails, default to light theme
      emit(state.copyWith(themeMode: ThemeMode.light));
    }
  }

  Future<void> _onToggleTheme(ToggleTheme event, Emitter<ThemeState> emit) async {
    final newThemeMode = state.themeMode == ThemeMode.light
        ? ThemeMode.dark
        : ThemeMode.light;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_themeKey, newThemeMode.index);
    } catch (e) {
      // If SharedPreferences fails, still update the UI state
    }

    emit(state.copyWith(themeMode: newThemeMode));
  }
}
