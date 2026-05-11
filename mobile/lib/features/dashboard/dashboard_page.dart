import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';
import '../auth/auth_controller.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(familyHubApiProvider);
    final user = ref.watch(authControllerProvider)?.user;
    return AppScreen(
      title: '概览',
      subtitle: '今日任务、积分余额和最近兑换记录',
      child: AsyncContent<_DashboardData>(
        future: _load(api, user?.id),
        builder: (context, data) {
          final pending = data.tasks.where((item) => item.status == 'PENDING').length;
          final completed = data.tasks.where((item) => item.status == 'COMPLETED').length;
          return Column(
            children: [
              GridView.count(
                crossAxisCount: 2,
                childAspectRatio: 1.9,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  StatTile(label: '今日任务', value: '${data.tasks.length}', icon: Icons.today_outlined),
                  StatTile(label: '待完成', value: '$pending', icon: Icons.pending_actions_outlined),
                  StatTile(label: '待确认', value: '$completed', icon: Icons.verified_outlined),
                  StatTile(label: '积分余额', value: formatPoints(data.balance), icon: Icons.stars_outlined),
                ],
              ),
              _SectionCard(
                title: '今日任务',
                children: [
                  for (final task in data.tasks.take(5))
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(task.name),
                      subtitle: Text(formatPoints(task.points)),
                      trailing: StatusChip(statusLabel(task.status)),
                    ),
                  if (data.tasks.isEmpty) const ListTile(title: Text('今天还没有任务')),
                ],
              ),
              _SectionCard(
                title: '家庭成员',
                children: [
                  for (final member in data.members)
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(member.nickname),
                      subtitle: Text(member.username),
                      trailing: Text(formatPoints(member.points)),
                    ),
                ],
              ),
              _SectionCard(
                title: '奖励商城',
                children: [
                  for (final reward in data.rewards.take(5))
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(reward.name),
                      subtitle: Text(reward.description ?? '暂无描述'),
                      trailing: Text(formatPoints(reward.pointsPrice)),
                    ),
                  if (data.rewards.isEmpty) const ListTile(title: Text('暂无上架奖励')),
                ],
              ),
              _SectionCard(
                title: '最近兑换',
                children: [
                  for (final order in data.orders.take(5))
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(order.rewardName),
                      subtitle: Text(formatDateTime(order.createdAt)),
                      trailing: StatusChip(statusLabel(order.status)),
                    ),
                  if (data.orders.isEmpty) const ListTile(title: Text('暂无兑换记录')),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Future<_DashboardData> _load(FamilyHubApi api, int? userId) async {
    final results = await Future.wait<Object>([
      api.familyMembers(),
      api.tasks(taskDate: todayText(), userId: userId),
      api.pointBalance(),
      api.rewards(status: 'ON'),
      api.redeemOrders(),
    ]);
    return _DashboardData(
      members: results[0] as List<User>,
      tasks: results[1] as List<DailyTask>,
      balance: results[2] as int,
      rewards: results[3] as List<Reward>,
      orders: results[4] as List<RedeemOrder>,
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            const Divider(),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _DashboardData {
  const _DashboardData({
    required this.members,
    required this.tasks,
    required this.balance,
    required this.rewards,
    required this.orders,
  });

  final List<User> members;
  final List<DailyTask> tasks;
  final int balance;
  final List<Reward> rewards;
  final List<RedeemOrder> orders;
}
