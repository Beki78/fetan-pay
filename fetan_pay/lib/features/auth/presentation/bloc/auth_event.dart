part of 'auth_bloc.dart';

abstract class AuthEvent {}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  LoginRequested(this.email, this.password);
}

class QRLoginRequested extends AuthEvent {
  final String qrData;

  QRLoginRequested(this.qrData);
}

class LogoutRequested extends AuthEvent {}

class CheckAuthStatus extends AuthEvent {}

class AuthStatusChanged extends AuthEvent {
  final bool isAuthenticated;

  AuthStatusChanged(this.isAuthenticated);
}
