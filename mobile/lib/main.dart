import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/family_hub_app.dart';
import 'features/auth/auth_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final initialSession = await loadInitialSession();

  runApp(
    ProviderScope(
      overrides: [
        initialSessionProvider.overrideWithValue(initialSession),
      ],
      child: const FamilyHubApp(),
    ),
  );
}
