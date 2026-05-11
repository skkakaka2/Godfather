const allRoutes = <String>[
  '/',
  '/tasks',
  '/task-templates',
  '/points',
  '/level',
  '/endorphins',
  '/rewards',
  '/redeem-orders',
  '/users',
];

bool canAccessRoute(String? role, String route) {
  if (role == null || role.isEmpty) {
    return false;
  }
  final adminRoutes = {
    '/',
    '/tasks',
    '/task-templates',
    '/points',
    '/level',
    '/endorphins',
    '/rewards',
    '/redeem-orders',
    '/users',
  };
  final childRoutes = {
    '/tasks',
    '/points',
    '/level',
    '/endorphins',
    '/rewards',
  };
  if (role == 'ADMIN' || role == 'PARENT') {
    return adminRoutes.contains(route);
  }
  if (role == 'CHILD') {
    return childRoutes.contains(route);
  }
  return false;
}

String defaultRouteForRole(String? role) {
  return role == 'CHILD' ? '/tasks' : '/';
}
