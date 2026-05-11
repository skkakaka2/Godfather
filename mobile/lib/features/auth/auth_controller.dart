import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/models.dart';
import '../../core/storage/session_storage.dart';

final sessionStorageProvider = Provider<SessionStorage>((ref) => SessionStorage());

final initialSessionProvider = Provider<SessionData?>((ref) => null);

final authControllerProvider = NotifierProvider<AuthController, SessionData?>(AuthController.new);

Future<SessionData?> loadInitialSession() {
  return SessionStorage().read();
}

class AuthController extends Notifier<SessionData?> {
  late final SessionStorage _storage;

  @override
  SessionData? build() {
    _storage = ref.watch(sessionStorageProvider);
    return ref.watch(initialSessionProvider);
  }

  String? get accessToken => state?.accessToken;

  Future<void> setLoginResponse(LoginResponse response) async {
    final session = SessionData.fromLogin(response);
    state = session;
    await _storage.write(session);
  }

  Future<void> logout() async {
    state = null;
    await _storage.clear();
  }
}
