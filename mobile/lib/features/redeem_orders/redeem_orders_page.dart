import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';

class RedeemOrdersPage extends ConsumerStatefulWidget {
  const RedeemOrdersPage({super.key});

  @override
  ConsumerState<RedeemOrdersPage> createState() => _RedeemOrdersPageState();
}

class _RedeemOrdersPageState extends ConsumerState<RedeemOrdersPage> {
  String? _status;
  int _page = 1;
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    return AppScreen(
      title: '兑换审批',
      subtitle: '处理孩子提交的奖励兑换申请',
      child: AsyncContent<PageResult<RedeemOrder>>(
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
                    hint: const Text('全部状态'),
                    items: const [
                      DropdownMenuItem(value: null, child: Text('全部状态')),
                      DropdownMenuItem(value: 'PENDING', child: Text('待审批')),
                      DropdownMenuItem(value: 'APPROVED', child: Text('已通过')),
                      DropdownMenuItem(value: 'REJECTED', child: Text('已拒绝')),
                    ],
                    onChanged: (value) => setState(() {
                      _status = value;
                      _page = 1;
                    }),
                  ),
                ),
              ),
              for (final order in data.list)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(order.rewardName, style: Theme.of(context).textTheme.titleMedium),
                            ),
                            StatusChip(statusLabel(order.status)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('${formatPoints(order.pointsCost)} · ${formatDateTime(order.createdAt)}'),
                        if (order.status == 'PENDING') ...[
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            children: [
                              FilledButton(
                                onPressed: () => _run(() => api.approveRedeemOrder(order.id), '已通过兑换'),
                                child: const Text('通过'),
                              ),
                              OutlinedButton(
                                onPressed: () => _run(() => api.rejectRedeemOrder(order.id), '已拒绝兑换'),
                                child: const Text('拒绝'),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(onPressed: _page > 1 ? () => setState(() => _page--) : null, icon: const Icon(Icons.chevron_left)),
                  Text('第 $_page 页 / 共 ${data.total} 条'),
                  IconButton(
                    onPressed: _page * data.pageSize < data.total ? () => setState(() => _page++) : null,
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

  Future<PageResult<RedeemOrder>> _load(FamilyHubApi api) async {
    final token = _reload;
    final data = await api.redeemOrdersPaged(status: _status, page: _page);
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
}
