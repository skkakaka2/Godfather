import 'package:family_hub_mobile/core/models/models.dart';
import 'package:family_hub_mobile/core/storage/session_storage.dart';
import 'package:family_hub_mobile/features/auth/auth_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('auth controller stores and clears login session', () async {
    final storage = _MemorySessionStorage();
    final container = ProviderContainer(
      overrides: [
        sessionStorageProvider.overrideWithValue(storage),
        initialSessionProvider.overrideWithValue(null),
      ],
    );
    addTearDown(container.dispose);
    final controller = container.read(authControllerProvider.notifier);

    await controller.setLoginResponse(
      LoginResponse(
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
        user: const User(
          id: 1,
          familyId: 2,
          username: 'child',
          nickname: '孩子',
          role: 'CHILD',
        ),
      ),
    );

    expect(container.read(authControllerProvider)?.accessToken, 'access');
    expect(storage.saved?.user.role, 'CHILD');

    await controller.logout();

    expect(container.read(authControllerProvider), isNull);
    expect(storage.saved, isNull);
  });
}

class _MemorySessionStorage extends SessionStorage {
  SessionData? saved;

  @override
  Future<void> write(SessionData session) async {
    saved = session;
  }

  @override
  Future<void> clear() async {
    saved = null;
  }
}
