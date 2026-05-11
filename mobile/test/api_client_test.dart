import 'package:family_hub_mobile/core/network/api_client.dart';
import 'package:family_hub_mobile/core/network/api_exception.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('unwrapResponse returns data when backend code is success', () {
    final data = ApiClient.unwrapResponse({
      'code': 200,
      'message': 'success',
      'data': {'id': 1},
    });

    expect(data, {'id': 1});
  });

  test('unwrapResponse throws ApiException when backend code is not success', () {
    expect(
      () => ApiClient.unwrapResponse({
        'code': 403,
        'message': '无权访问',
        'data': null,
      }),
      throwsA(isA<ApiException>()),
    );
  });
}
