import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';

class TaskTemplatesPage extends ConsumerStatefulWidget {
  const TaskTemplatesPage({super.key});

  @override
  ConsumerState<TaskTemplatesPage> createState() => _TaskTemplatesPageState();
}

class _TaskTemplatesPageState extends ConsumerState<TaskTemplatesPage> {
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    return AppScreen(
      title: '任务模板',
      subtitle: '配置每日自动生成的任务规则',
      actions: [
        IconButton(
          tooltip: '新增模板',
          icon: const Icon(Icons.add_circle_outline),
          onPressed: () => _openEditor(api),
        ),
      ],
      child: AsyncContent<List<TaskTemplate>>(
        future: _load(api),
        empty: (data) => data.isEmpty,
        builder: (context, data) {
          return Column(
            children: [
              for (final item in data)
                Card(
                  child: ListTile(
                    title: Text(item.name),
                    subtitle: Text('${item.category} · ${formatPoints(item.defaultPoints)} · ${item.deadlineTime}'),
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'edit') {
                          _openEditor(api, item);
                        }
                        if (value == 'delete') {
                          _run(() => api.deleteTaskTemplate(item.id), '模板已删除');
                        }
                      },
                      itemBuilder: (context) => const [
                        PopupMenuItem(value: 'edit', child: Text('编辑')),
                        PopupMenuItem(value: 'delete', child: Text('删除')),
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

  Future<List<TaskTemplate>> _load(FamilyHubApi api) async {
    final token = _reload;
    final data = await api.taskTemplates();
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

  Future<void> _openEditor(FamilyHubApi api, [TaskTemplate? template]) async {
    final name = TextEditingController(text: template?.name ?? '');
    final category = TextEditingController(text: template?.category ?? 'STUDY');
    final points = TextEditingController(text: (template?.defaultPoints ?? 5).toString());
    final deadline = TextEditingController(text: template?.deadlineTime ?? '20:00:00');
    final sortOrder = TextEditingController(text: (template?.sortOrder ?? 0).toString());
    final selectedDays = <int>{
      if ((template?.applicableMon ?? 1) == 1) 1,
      if ((template?.applicableTue ?? 1) == 1) 2,
      if ((template?.applicableWed ?? 1) == 1) 3,
      if ((template?.applicableThu ?? 1) == 1) 4,
      if ((template?.applicableFri ?? 1) == 1) 5,
      if ((template?.applicableSat ?? 1) == 1) 6,
      if ((template?.applicableSun ?? 1) == 1) 7,
    };

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).viewInsets.bottom + 16),
              child: ListView(
                shrinkWrap: true,
                children: [
                  Text(template == null ? '新增模板' : '编辑模板', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  TextField(controller: name, decoration: const InputDecoration(labelText: '模板名称')),
                  const SizedBox(height: 12),
                  TextField(controller: category, decoration: const InputDecoration(labelText: '分类')),
                  const SizedBox(height: 12),
                  TextField(controller: points, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: '默认积分')),
                  const SizedBox(height: 12),
                  TextField(controller: deadline, decoration: const InputDecoration(labelText: '截止时间 HH:mm:ss')),
                  const SizedBox(height: 12),
                  TextField(controller: sortOrder, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: '排序')),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: [
                      for (final entry in const {1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '日'}.entries)
                        FilterChip(
                          label: Text('周${entry.value}'),
                          selected: selectedDays.contains(entry.key),
                          onSelected: (selected) {
                            setSheetState(() {
                              selected ? selectedDays.add(entry.key) : selectedDays.remove(entry.key);
                            });
                          },
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () async {
                      final payload = {
                        'name': name.text.trim(),
                        'category': category.text.trim(),
                        'defaultPoints': int.tryParse(points.text) ?? 0,
                        'applicableMon': selectedDays.contains(1) ? 1 : 0,
                        'applicableTue': selectedDays.contains(2) ? 1 : 0,
                        'applicableWed': selectedDays.contains(3) ? 1 : 0,
                        'applicableThu': selectedDays.contains(4) ? 1 : 0,
                        'applicableFri': selectedDays.contains(5) ? 1 : 0,
                        'applicableSat': selectedDays.contains(6) ? 1 : 0,
                        'applicableSun': selectedDays.contains(7) ? 1 : 0,
                        'deadlineTime': deadline.text.trim(),
                        'sortOrder': int.tryParse(sortOrder.text) ?? 0,
                        'enabled': 1,
                      };
                      Navigator.pop(context);
                      if (template == null) {
                        await _run(() async {
                          await api.createTaskTemplate(payload);
                        }, '模板已创建');
                      } else {
                        await _run(() async {
                          await api.updateTaskTemplate(template.id, payload);
                        }, '模板已更新');
                      }
                    },
                    child: Text(template == null ? '创建' : '保存'),
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
