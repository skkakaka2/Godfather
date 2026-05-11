import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';

class EndorphinsPage extends ConsumerStatefulWidget {
  const EndorphinsPage({super.key});

  @override
  ConsumerState<EndorphinsPage> createState() => _EndorphinsPageState();
}

class _EndorphinsPageState extends ConsumerState<EndorphinsPage> {
  int _page = 1;
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    return AppScreen(
      title: '内啡肽',
      subtitle: '查看余额、流水并兑换积分',
      actions: [
        IconButton(
          tooltip: '兑换',
          icon: const Icon(Icons.currency_exchange_outlined),
          onPressed: () => _exchange(api),
        ),
      ],
      child: AsyncContent<_EndorphinData>(
        future: _load(api),
        builder: (context, data) {
          return Column(
            children: [
              StatTile(label: '当前内啡肽', value: '${data.balance}', icon: Icons.bolt_outlined),
              for (final log in data.logs.list)
                Card(
                  child: ListTile(
                    title: Text(log.remark ?? log.type),
                    subtitle: Text(formatDateTime(log.createdAt)),
                    trailing: Text(log.amount >= 0 ? '+${log.amount}' : '${log.amount}'),
                  ),
                ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(onPressed: _page > 1 ? () => setState(() => _page--) : null, icon: const Icon(Icons.chevron_left)),
                  Text('第 $_page 页 / 共 ${data.logs.total} 条'),
                  IconButton(
                    onPressed: _page * data.logs.pageSize < data.logs.total ? () => setState(() => _page++) : null,
                    icon: const Icon(Icons.chevron_right),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Future<_EndorphinData> _load(FamilyHubApi api) async {
    final token = _reload;
    final results = await Future.wait<Object>([
      api.endorphinBalance(),
      api.endorphinLogs(page: _page),
    ]);
    if (token != _reload) {
      return _load(api);
    }
    return _EndorphinData(
      balance: results[0] as int,
      logs: results[1] as PageResult<EndorphinLog>,
    );
  }

  Future<void> _exchange(FamilyHubApi api) async {
    final controller = TextEditingController(text: '1');
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).viewInsets.bottom + 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: '兑换数量'),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () async {
                  Navigator.pop(context);
                  try {
                    await api.exchangeEndorphins(int.tryParse(controller.text) ?? 0);
                    if (mounted) {
                      showSnack(context, '兑换成功');
                      setState(() => _reload++);
                    }
                  } catch (error) {
                    if (mounted) {
                      showSnack(context, error.toString());
                    }
                  }
                },
                child: const Text('确认兑换'),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _EndorphinData {
  const _EndorphinData({required this.balance, required this.logs});

  final int balance;
  final PageResult<EndorphinLog> logs;
}
