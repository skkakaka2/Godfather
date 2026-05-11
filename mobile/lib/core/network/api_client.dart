import 'package:dio/dio.dart';

import 'api_exception.dart';

typedef JsonFactory<T> = T Function(Map<String, Object?> json);

class ApiClient {
  ApiClient({
    required Future<String?> Function() readAccessToken,
    required Future<void> Function() onUnauthorized,
    Dio? dio,
  }) : _readAccessToken = readAccessToken,
       _onUnauthorized = onUnauthorized,
       _dio =
           dio ??
           Dio(
             BaseOptions(
               baseUrl: const String.fromEnvironment(
                 'API_BASE_URL',
                 defaultValue: 'http://192.168.0.7:8081',
               ),
               connectTimeout: const Duration(seconds: 12),
               receiveTimeout: const Duration(seconds: 12),
               sendTimeout: const Duration(seconds: 12),
             ),
           ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await _onUnauthorized();
          }
          handler.next(error);
        },
      ),
    );
  }

  final Dio _dio;
  final Future<String?> Function() _readAccessToken;
  final Future<void> Function() _onUnauthorized;

  Future<T> get<T>(
    String path, {
    Map<String, Object?>? query,
    required T Function(Object? data) decode,
  }) async {
    return _request<T>(
      () => _dio.get<Object?>(path, queryParameters: _cleanQuery(query)),
      decode,
    );
  }

  Future<T> post<T>(
    String path, {
    Object? data,
    Map<String, Object?>? query,
    required T Function(Object? data) decode,
  }) async {
    return _request<T>(
      () => _dio.post<Object?>(
        path,
        data: data,
        queryParameters: _cleanQuery(query),
      ),
      decode,
    );
  }

  Future<T> put<T>(
    String path, {
    Object? data,
    Map<String, Object?>? query,
    required T Function(Object? data) decode,
  }) async {
    return _request<T>(
      () => _dio.put<Object?>(
        path,
        data: data,
        queryParameters: _cleanQuery(query),
      ),
      decode,
    );
  }

  Future<T> delete<T>(
    String path, {
    Map<String, Object?>? query,
    required T Function(Object? data) decode,
  }) async {
    return _request<T>(
      () => _dio.delete<Object?>(path, queryParameters: _cleanQuery(query)),
      decode,
    );
  }

  Future<T> _request<T>(
    Future<Response<Object?>> Function() call,
    T Function(Object? data) decode,
  ) async {
    try {
      final response = await call();
      return decode(unwrapResponse(response.data));
    } on DioException catch (error) {
      final response = error.response;
      final data = response?.data;
      if (data is Map) {
        final message = data['message']?.toString();
        if (message != null && message.isNotEmpty) {
          throw ApiException(message, statusCode: response?.statusCode);
        }
      }
      throw ApiException(
        error.message ?? '网络异常，请稍后重试',
        statusCode: response?.statusCode,
      );
    }
  }

  static Object? unwrapResponse(Object? raw) {
    if (raw is Map) {
      final code = raw['code'];
      if (code is num) {
        if (code.toInt() == 200) {
          return raw['data'];
        }
        throw ApiException(
          raw['message']?.toString() ?? '请求失败',
          code: code.toInt(),
        );
      }
    }
    return raw;
  }

  Map<String, Object?>? _cleanQuery(Map<String, Object?>? query) {
    if (query == null) {
      return null;
    }
    return Map.fromEntries(
      query.entries.where((entry) => entry.value != null && entry.value != ''),
    );
  }
}
