import 'package:family_hub_mobile/app/role_routes.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('parent can access management routes', () {
    expect(canAccessRoute('PARENT', '/task-templates'), isTrue);
    expect(canAccessRoute('PARENT', '/redeem-orders'), isTrue);
  });

  test('child can access child routes only', () {
    expect(canAccessRoute('CHILD', '/tasks'), isTrue);
    expect(canAccessRoute('CHILD', '/users'), isFalse);
    expect(defaultRouteForRole('CHILD'), '/tasks');
  });
}
