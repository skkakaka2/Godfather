import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';
import '../auth/auth_controller.dart';

class RewardsPage extends ConsumerStatefulWidget {
  const RewardsPage({super.key});

  @override
  ConsumerState<RewardsPage> createState() => _RewardsPageState();
}

class _RewardsPageState extends ConsumerState<RewardsPage> {
  String? _status = 'ON';
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    final role = ref.watch(authControllerProvider)?.user.role;
    final manage = canManage(role);
    return AppScreen(
      title: '奖励商城',
      subtitle: '使用积分兑换家庭奖励',
      actions: [
        if (manage)
          IconButton(
            tooltip: '新增奖励',
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => _openEditor(api),
          ),
      ],
      child: AsyncContent<List<Reward>>(
        future: _load(api),
        builder: (context, data) {
          return Column(
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: DropdownButton<String?>(
                    value: _status,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: null, child: Text('全部')),
                      DropdownMenuItem(value: 'ON', child: Text('上架')),
                      DropdownMenuItem(value: 'OFF', child: Text('下架')),
                    ],
                    onChanged: (value) => setState(() => _status = value),
                  ),
                ),
              ),
              if (data.isEmpty)
                const InfoCard(icon: Icons.card_giftcard_outlined, title: '暂无奖励', subtitle: '当前筛选条件下没有奖励')
              else
                for (final reward in data)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  reward.name,
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ),
                              StatusChip(statusLabel(reward.status)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(reward.description ?? '暂无描述'),
                          const SizedBox(height: 6),
                          Text('${formatPoints(reward.pointsPrice)} · 库存 ${reward.stock}'),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              FilledButton.icon(
                                onPressed: reward.status == 'ON'
                                    ? () => _run(() async {
                                          await api.redeem(reward.id);
                                        }, '兑换申请已提交')
                                    : null,
                                icon: const Icon(Icons.shopping_bag_outlined),
                                label: const Text('兑换'),
                              ),
                              if (manage) ...[
                                OutlinedButton(onPressed: () => _openEditor(api, reward), child: const Text('编辑')),
                                OutlinedButton(onPressed: () => _run(() => api.toggleReward(reward.id), '状态已更新'), child: const Text('上下架')),
                                OutlinedButton(onPressed: () => _run(() => api.deleteReward(reward.id), '奖励已删除'), child: const Text('删除')),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
            ],
          );
        },
      ),
    );
  }

  Future<List<Reward>> _load(FamilyHubApi api) async {
    final token = _reload;
    final data = await api.rewards(status: _status);
    if (token != _reload) {
      return _load(api);
    }
    return data;
  }

  Future<void> _run(Future<void> Function() action, String success) async {
    try {
      await action();
      if (mounted) {
        showSnack(context, success);
        setState(() => _reload++);
      }
    } catch (error) {
      if (mounted) {
        showSnack(context, error.toString());
      }
    }
  }

  Future<void> _openEditor(FamilyHubApi api, [Reward? reward]) async {
    final name = TextEditingController(text: reward?.name ?? '');
    final description = TextEditingController(text: reward?.description ?? '');
    final points = TextEditingController(text: (reward?.pointsPrice ?? 10).toString());
    final stock = TextEditingController(text: (reward?.stock ?? 1).toString());
    final imageUrl = TextEditingController(text: reward?.imageUrl ?? '');

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).viewInsets.bottom + 16),
          child: ListView(
            shrinkWrap: true,
            children: [
              Text(reward == null ? '新增奖励' : '编辑奖励', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              TextField(controller: name, decoration: const InputDecoration(labelText: '名称')),
              const SizedBox(height: 12),
              TextField(controller: description, decoration: const InputDecoration(labelText: '描述')),
              const SizedBox(height: 12),
              TextField(controller: points, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: '积分价格')),
              const SizedBox(height: 12),
              TextField(controller: stock, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: '库存')),
              const SizedBox(height: 12),
              TextField(controller: imageUrl, decoration: const InputDecoration(labelText: '图片 URL')),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () async {
                  final payload = {
                    'name': name.text.trim(),
                    'description': description.text.trim(),
                    'pointsPrice': int.tryParse(points.text) ?? 1,
                    'stock': int.tryParse(stock.text) ?? 0,
                    'imageUrl': imageUrl.text.trim(),
                  };
                  Navigator.pop(context);
                  if (reward == null) {
                    await _run(() async {
                      await api.createReward(payload);
                    }, '奖励已创建');
                  } else {
                    await _run(() async {
                      await api.updateReward(reward.id, payload);
                    }, '奖励已更新');
                  }
                },
                child: Text(reward == null ? '创建' : '保存'),
              ),
            ],
          ),
        );
      },
    );
  }
}
