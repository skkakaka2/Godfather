import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/models.dart';

class SessionData {
  const SessionData({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  final String accessToken;
  final String refreshToken;
  final User user;

  Map<String, Object?> toJson() => {
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'user': user.toJson(),
      };

  factory SessionData.fromLogin(LoginResponse response) {
    return SessionData(
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    );
  }

  factory SessionData.fromJson(Map<String, Object?> json) {
    return SessionData(
      accessToken: json['accessToken']?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      user: User.fromJson(asJsonMap(json['user'])),
    );
  }
}

class SessionStorage {
  SessionStorage({
    FlutterSecureStorage? storage,
  }) : _storage = storage ?? const FlutterSecureStorage();

  static const _sessionKey = 'family_hub_mobile_session';

  final FlutterSecureStorage _storage;

  Future<SessionData?> read() async {
    final raw = await _storage.read(key: _sessionKey);
    if (raw == null || raw.isEmpty) {
      return null;
    }
    try {
      return SessionData.fromJson(asJsonMap(jsonDecode(raw)));
    } catch (_) {
      await clear();
      return null;
    }
  }

  Future<void> write(SessionData session) async {
    await _storage.write(
      key: _sessionKey,
      value: jsonEncode(session.toJson()),
    );
  }

  Future<void> clear() async {
    await _storage.delete(key: _sessionKey);
  }
}
