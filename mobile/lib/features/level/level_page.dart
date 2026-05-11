import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';

class LevelPage extends ConsumerStatefulWidget {
  const LevelPage({super.key});

  @override
  ConsumerState<LevelPage> createState() => _LevelPageState();
}

class _LevelPageState extends ConsumerState<LevelPage> {
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    return AppScreen(
      title: '等级',
      subtitle: '签到、宝箱和等级权益',
      child: AsyncContent<_LevelData>(
        future: _load(api),
        builder: (context, data) {
          final next = data.info.nextExpRequired;
          final percent = next == null || next == 0 ? 1.0 : (data.info.exp / next).clamp(0.0, 1.0);
          return Column(
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(data.info.title, style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(value: percent),
                      const SizedBox(height: 6),
                      Text('经验 ${data.info.exp}/${next ?? 'MAX'}'),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          StatusChip('血清素加成 ${data.info.bonusPercent}%'),
                          StatusChip('签到 +${data.info.dailySignBonus}'),
                          StatusChip('护盾 ${data.info.streakShield}'),
                          StatusChip('翻倍卡 ${data.info.doubleCard}'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  FilledButton.icon(
                    onPressed: () => _run(() => api.dailySign(), '签到成功'),
                    icon: const Icon(Icons.event_available_outlined),
                    label: const Text('每日签到'),
                  ),
                  FilledButton.icon(
                    onPressed: () => _openChest(api),
                    icon: const Icon(Icons.inventory_2_outlined),
                    label: const Text('开宝箱'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () => _run(() => api.useDoubleCard(), '翻倍卡已使用'),
                    icon: const Icon(Icons.control_point_duplicate_outlined),
                    label: const Text('翻倍卡'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () => _useWish(api, data.rewards),
                    icon: const Icon(Icons.favorite_border),
                    label: const Text('心愿直达'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('等级配置', style: Theme.of(context).textTheme.titleMedium),
                      const Divider(),
                      for (final config in data.configs.take(12))
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(config.title),
                          subtitle: Text('L${config.level}-${config.subLevel} · ${config.expRequired} 经验'),
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

  Future<_LevelData> _load(FamilyHubApi api) async {
    final token = _reload;
    final results = await Future.wait<Object>([
      api.levelInfo(),
      api.levelConfigs(),
      api.rewards(status: 'ON'),
    ]);
    if (token != _reload) {
      return _load(api);
    }
    return _LevelData(
      info: results[0] as UserLevel,
      configs: results[1] as List<LevelConfig>,
      rewards: results[2] as List<Reward>,
    );
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

  Future<void> _openChest(FamilyHubApi api) async {
    try {
      final result = await api.openChest();
      if (mounted) {
        showSnack(context, '获得 ${formatPoints(result.points)} 和 ${result.exp} 经验');
        setState(() => _reload++);
      }
    } catch (error) {
      if (mounted) {
        showSnack(context, error.toString());
      }
    }
  }

  Future<void> _useWish(FamilyHubApi api, List<Reward> rewards) async {
    int? selected = rewards.isNotEmpty ? rewards.first.id : null;
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButton<int>(
                    value: selected,
                    isExpanded: true,
                    items: [
                      for (final reward in rewards)
                        DropdownMenuItem(value: reward.id, child: Text(reward.name)),
                    ],
                    onChanged: (value) => setSheetState(() => selected = value),
                  ),
                  FilledButton(
                    onPressed: selected == null
                        ? null
                        : () async {
                            Navigator.pop(context);
                            await _run(() => api.useWishDirect(selected!), '心愿直达已使用');
                          },
                    child: const Text('使用'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _LevelData {
  const _LevelData({
    required this.info,
    required this.configs,
    required this.rewards,
  });

  final UserLevel info;
  final List<LevelConfig> configs;
  final List<Reward> rewards;
}
