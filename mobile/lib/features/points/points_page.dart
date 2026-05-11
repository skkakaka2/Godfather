import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';

class PointsPage extends ConsumerStatefulWidget {
  const PointsPage({super.key});

  @override
  ConsumerState<PointsPage> createState() => _PointsPageState();
}

class _PointsPageState extends ConsumerState<PointsPage> {
  int _page = 1;
  String? _type;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    return AppScreen(
      title: '积分',
      subtitle: '查看积分余额和流水明细',
      child: AsyncContent<_PointData>(
        future: _load(api),
        builder: (context, data) {
          return Column(
            children: [
              StatTile(label: '当前余额', value: formatPoints(data.balance), icon: Icons.stars_outlined),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: DropdownButton<String?>(
                    value: _type,
                    isExpanded: true,
                    hint: const Text('全部类型'),
                    items: const [
                      DropdownMenuItem(value: null, child: Text('全部类型')),
                      DropdownMenuItem(value: 'EARN', child: Text('任务收入')),
                      DropdownMenuItem(value: 'BONUS', child: Text('等级加成')),
                      DropdownMenuItem(value: 'REDEEM', child: Text('兑换扣除')),
                    ],
                    onChanged: (value) => setState(() {
                      _type = value;
                      _page = 1;
                    }),
                  ),
                ),
              ),
              for (final log in data.logs.list)
                Card(
                  child: ListTile(
                    title: Text(log.remark ?? log.type),
                    subtitle: Text(formatDateTime(log.createdAt)),
                    trailing: Text(
                      log.amount >= 0 ? '+${log.amount}' : '${log.amount}',
                      style: TextStyle(color: log.amount >= 0 ? Colors.green : Colors.red),
                    ),
                  ),
                ),
              _Pager(
                page: _page,
                total: data.logs.total,
                pageSize: data.logs.pageSize,
                onPrev: _page > 1 ? () => setState(() => _page--) : null,
                onNext: _page * data.logs.pageSize < data.logs.total ? () => setState(() => _page++) : null,
              ),
            ],
          );
        },
      ),
    );
  }

  Future<_PointData> _load(FamilyHubApi api) async {
    final results = await Future.wait<Object>([
      api.pointBalance(),
      api.pointLogs(type: _type, page: _page),
    ]);
    return _PointData(
      balance: results[0] as int,
      logs: results[1] as PageResult<PointLog>,
    );
  }
}

class _PointData {
  const _PointData({required this.balance, required this.logs});

  final int balance;
  final PageResult<PointLog> logs;
}

class _Pager extends StatelessWidget {
  const _Pager({
    required this.page,
    required this.total,
    required this.pageSize,
    required this.onPrev,
    required this.onNext,
  });

  final int page;
  final int total;
  final int pageSize;
  final VoidCallback? onPrev;
  final VoidCallback? onNext;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(onPressed: onPrev, icon: const Icon(Icons.chevron_left)),
        Text('第 $page 页 / 共 $total 条'),
        IconButton(onPressed: onNext, icon: const Icon(Icons.chevron_right)),
      ],
    );
  }
}
