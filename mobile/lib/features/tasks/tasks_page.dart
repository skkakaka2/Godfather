import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';
import '../auth/auth_controller.dart';

class TasksPage extends ConsumerStatefulWidget {
  const TasksPage({super.key});

  @override
  ConsumerState<TasksPage> createState() => _TasksPageState();
}

class _TasksPageState extends ConsumerState<TasksPage> {
  String _taskDate = todayText();
  String? _status;
  int? _userId;
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    final currentUser = ref.watch(authControllerProvider)?.user;
    final review = canManage(currentUser?.role);
    _userId ??= currentUser?.id;

    return AppScreen(
      title: '任务',
      subtitle: '孩子打卡后由家长确认或打回',
      actions: [
        IconButton(
          tooltip: '选择日期',
          icon: const Icon(Icons.calendar_month_outlined),
          onPressed: _pickDate,
        ),
      ],
      child: AsyncContent<_TaskData>(
        future: _load(api, review, currentUser?.id),
        builder: (context, data) {
          return Column(
            children: [
              _Filters(
                taskDate: _taskDate,
                status: _status,
                members: data.members,
                selectedUserId: review ? _userId : null,
                canReview: review,
                onStatusChanged: (value) => setState(() => _status = value),
                onUserChanged: (value) => setState(() => _userId = value),
              ),
              const SizedBox(height: 12),
              if (data.tasks.isEmpty)
                const InfoCard(icon: Icons.check_circle_outline, title: '暂无任务', subtitle: '当前筛选条件下没有任务')
              else
                for (final task in data.tasks)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  task.name,
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                                ),
                              ),
                              StatusChip(statusLabel(task.status)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${task.category ?? '未分类'} · ${_memberName(data.members, task.userId)} · ${formatPoints(task.points)}',
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if ((task.status == 'PENDING' || task.status == 'REJECTED') && task.userId == currentUser?.id)
                                FilledButton.icon(
                                  onPressed: () => _run(() => api.completeTask(task.id), '任务已打卡，等待确认'),
                                  icon: const Icon(Icons.done_outline),
                                  label: const Text('打卡'),
                                ),
                              if (task.status == 'COMPLETED' && review) ...[
                                OutlinedButton.icon(
                                  onPressed: () => _confirmTask(api, task),
                                  icon: const Icon(Icons.verified_outlined),
                                  label: const Text('确认'),
                                ),
                                OutlinedButton.icon(
                                  onPressed: () => _rejectTask(api, task),
                                  icon: const Icon(Icons.close_outlined),
                                  label: const Text('打回'),
                                ),
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

  Future<_TaskData> _load(FamilyHubApi api, bool review, int? currentUserId) async {
    final token = _reload;
    final queryUserId = review ? _userId : currentUserId;
    final results = await Future.wait<Object>([
      api.tasks(taskDate: _taskDate, status: _status, userId: queryUserId),
      api.familyMembers(),
    ]);
    if (token != _reload) {
      return _load(api, review, currentUserId);
    }
    return _TaskData(
      tasks: results[0] as List<DailyTask>,
      members: results[1] as List<User>,
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.tryParse(_taskDate) ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() => _taskDate = DateFormat('yyyy-MM-dd').format(picked));
    }
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

  Future<void> _confirmTask(FamilyHubApi api, DailyTask task) async {
    final pointsController = TextEditingController(text: task.points.toString());
    final remarkController = TextEditingController();
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).viewInsets.bottom + 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('确认任务：${task.name}', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              TextField(
                controller: pointsController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: '发放积分'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: remarkController,
                decoration: const InputDecoration(labelText: '备注'),
                minLines: 2,
                maxLines: 4,
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () async {
                  Navigator.pop(context);
                  await _run(
                    () => api.confirmTask(
                      task.id,
                      points: int.tryParse(pointsController.text),
                      remark: remarkController.text,
                    ),
                    '任务已确认',
                  );
                },
                child: const Text('确认并发放积分'),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _rejectTask(FamilyHubApi api, DailyTask task) async {
    final reasonController = TextEditingController();
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).viewInsets.bottom + 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('打回任务：${task.name}', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              TextField(
                controller: reasonController,
                decoration: const InputDecoration(labelText: '打回原因'),
                minLines: 2,
                maxLines: 4,
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () async {
                  Navigator.pop(context);
                  await _run(() => api.rejectTask(task.id, reasonController.text), '任务已打回');
                },
                child: const Text('打回'),
              ),
            ],
          ),
        );
      },
    );
  }

  String _memberName(List<User> members, int userId) {
    for (final member in members) {
      if (member.id == userId) {
        return member.nickname;
      }
    }
    return '#$userId';
  }
}

class _Filters extends StatelessWidget {
  const _Filters({
    required this.taskDate,
    required this.status,
    required this.members,
    required this.selectedUserId,
    required this.canReview,
    required this.onStatusChanged,
    required this.onUserChanged,
  });

  final String taskDate;
  final String? status;
  final List<User> members;
  final int? selectedUserId;
  final bool canReview;
  final ValueChanged<String?> onStatusChanged;
  final ValueChanged<int?> onUserChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(child: Text('日期：$taskDate')),
                DropdownButton<String?>(
                  value: status,
                  hint: const Text('全部状态'),
                  items: const [
                    DropdownMenuItem(value: null, child: Text('全部状态')),
                    DropdownMenuItem(value: 'PENDING', child: Text('待完成')),
                    DropdownMenuItem(value: 'COMPLETED', child: Text('待确认')),
                    DropdownMenuItem(value: 'CONFIRMED', child: Text('已确认')),
                    DropdownMenuItem(value: 'REJECTED', child: Text('已打回')),
                  ],
                  onChanged: onStatusChanged,
                ),
              ],
            ),
            if (canReview)
              DropdownButton<int?>(
                value: selectedUserId,
                isExpanded: true,
                hint: const Text('全部成员'),
                items: [
                  const DropdownMenuItem<int?>(value: null, child: Text('全部成员')),
                  for (final member in members)
                    DropdownMenuItem<int?>(
                      value: member.id,
                      child: Text(member.nickname),
                    ),
                ],
                onChanged: onUserChanged,
              ),
          ],
        ),
      ),
    );
  }
}

class _TaskData {
  const _TaskData({required this.tasks, required this.members});

  final List<DailyTask> tasks;
  final List<User> members;
}
