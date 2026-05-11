import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_controller.dart';
import '../features/auth/login_page.dart';
import '../features/dashboard/dashboard_page.dart';
import '../features/endorphins/endorphins_page.dart';
import '../features/level/level_page.dart';
import '../features/points/points_page.dart';
import '../features/redeem_orders/redeem_orders_page.dart';
import '../features/rewards/rewards_page.dart';
import '../features/task_templates/task_templates_page.dart';
import '../features/tasks/tasks_page.dart';
import '../features/users/users_page.dart';
import 'main_shell.dart';
import 'role_routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: defaultRouteForRole(session?.user.role),
    redirect: (context, state) {
      final loggedIn = session != null;
      final path = state.uri.path;
      if (!loggedIn) {
        return path == '/login' ? null : '/login';
      }
      if (path == '/login') {
        return defaultRouteForRole(session.user.role);
      }
      if (!canAccessRoute(session.user.role, path)) {
        return defaultRouteForRole(session.user.role);
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/', builder: (context, state) => const DashboardPage()),
          GoRoute(path: '/tasks', builder: (context, state) => const TasksPage()),
          GoRoute(path: '/task-templates', builder: (context, state) => const TaskTemplatesPage()),
          GoRoute(path: '/points', builder: (context, state) => const PointsPage()),
          GoRoute(path: '/level', builder: (context, state) => const LevelPage()),
          GoRoute(path: '/endorphins', builder: (context, state) => const EndorphinsPage()),
          GoRoute(path: '/rewards', builder: (context, state) => const RewardsPage()),
          GoRoute(path: '/redeem-orders', builder: (context, state) => const RedeemOrdersPage()),
          GoRoute(path: '/users', builder: (context, state) => const UsersPage()),
        ],
      ),
    ],
  );
});
