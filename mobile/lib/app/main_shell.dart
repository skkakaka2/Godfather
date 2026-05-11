import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/utils/formatters.dart';
import '../features/auth/auth_controller.dart';

class AppDestination {
  const AppDestination({
    required this.route,
    required this.label,
    required this.icon,
    required this.roles,
  });

  final String route;
  final String label;
  final IconData icon;
  final Set<String> roles;
}

const primaryDestinations = [
  AppDestination(
    route: '/',
    label: '概览',
    icon: Icons.home_outlined,
    roles: {'ADMIN', 'PARENT'},
  ),
  AppDestination(
    route: '/tasks',
    label: '任务',
    icon: Icons.check_circle_outline,
    roles: {'ADMIN', 'PARENT', 'CHILD'},
  ),
  AppDestination(
    route: '/points',
    label: '积分',
    icon: Icons.stars_outlined,
    roles: {'ADMIN', 'PARENT', 'CHILD'},
  ),
  AppDestination(
    route: '/level',
    label: '等级',
    icon: Icons.workspace_premium_outlined,
    roles: {'ADMIN', 'PARENT', 'CHILD'},
  ),
  AppDestination(
    route: '/rewards',
    label: '商城',
    icon: Icons.card_giftcard_outlined,
    roles: {'ADMIN', 'PARENT', 'CHILD'},
  ),
];

const managementDestinations = [
  AppDestination(
    route: '/task-templates',
    label: '任务模板',
    icon: Icons.copy_all_outlined,
    roles: {'ADMIN', 'PARENT'},
  ),
  AppDestination(
    route: '/endorphins',
    label: '内啡肽',
    icon: Icons.bolt_outlined,
    roles: {'ADMIN', 'PARENT', 'CHILD'},
  ),
  AppDestination(
    route: '/redeem-orders',
    label: '兑换审批',
    icon: Icons.shopping_cart_checkout_outlined,
    roles: {'ADMIN', 'PARENT'},
  ),
  AppDestination(
    route: '/users',
    label: '成员管理',
    icon: Icons.group_outlined,
    roles: {'ADMIN', 'PARENT'},
  ),
];

class MainShell extends ConsumerWidget {
  const MainShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authControllerProvider);
    final role = session?.user.role;
    final destinations = primaryDestinations
        .where((item) => item.roles.contains(role))
        .toList();
    final location = GoRouterState.of(context).uri.path;
    final selectedIndex = destinations.indexWhere(
      (item) => item.route == location,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('家庭小助手'),
        actions: [
          IconButton(
            tooltip: '管理',
            icon: const Icon(Icons.menu_open_outlined),
            onPressed: () => _openManagementSheet(context, ref),
          ),
        ],
      ),
      body: SafeArea(child: child),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex < 0 ? 0 : selectedIndex,
        onDestinationSelected: (index) => context.go(destinations[index].route),
        destinations: [
          for (final item in destinations)
            NavigationDestination(icon: Icon(item.icon), label: item.label),
        ],
      ),
    );
  }

  void _openManagementSheet(BuildContext context, WidgetRef ref) {
    final session = ref.read(authControllerProvider);
    final role = session?.user.role;
    final routes = managementDestinations
        .where((item) => item.roles.contains(role))
        .toList();

    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const CircleAvatar(
                    child: Icon(Icons.person_outline),
                  ),
                  title: Text(
                    session?.user.nickname ?? session?.user.username ?? '未登录',
                  ),
                  subtitle: Text(statusLabel(session?.user.role ?? '')),
                ),
                const Divider(),
                for (final item in routes)
                  ListTile(
                    leading: Icon(item.icon),
                    title: Text(item.label),
                    onTap: () {
                      Navigator.pop(context);
                      context.go(item.route);
                    },
                  ),
                ListTile(
                  leading: const Icon(Icons.logout_outlined),
                  title: const Text('退出登录'),
                  onTap: () async {
                    Navigator.pop(context);
                    await ref.read(authControllerProvider.notifier).logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
