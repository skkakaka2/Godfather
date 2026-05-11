import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/ui.dart';
import '../../core/models/models.dart';
import '../../core/network/api_repository.dart';
import '../../core/utils/formatters.dart';
import '../auth/auth_controller.dart';

class UsersPage extends ConsumerStatefulWidget {
  const UsersPage({super.key});

  @override
  ConsumerState<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends ConsumerState<UsersPage> {
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(familyHubApiProvider);
    return AppScreen(
      title: '成员管理',
      subtitle: '管理家庭中的家长和孩子账号',
      actions: [
        IconButton(
          tooltip: '新增成员',
          icon: const Icon(Icons.person_add_alt_outlined),
          onPressed: () => _openCreate(api),
        ),
      ],
      child: AsyncContent<List<User>>(
        future: _load(api),
        builder: (context, data) {
          return Column(
            children: [
              for (final user in data)
                Card(
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.person_outline)),
                    title: Text(user.nickname),
                    subtitle: Text('${user.username} · ${formatPoints(user.points)}'),
                    trailing: StatusChip(statusLabel(user.role)),
                    onTap: () => _openEdit(api, user),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Future<List<User>> _load(FamilyHubApi api) async {
    final token = _reload;
    final data = await api.familyMembers();
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

  Future<void> _openCreate(FamilyHubApi api) async {
    final currentFamilyId = ref.read(authControllerProvider)?.user.familyId;
    final username = TextEditingController();
    final nickname = TextEditingController();
    final password = TextEditingController();
    var role = 'CHILD';

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
                  Text('新增成员', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  TextField(controller: username, decoration: const InputDecoration(labelText: '用户名')),
                  const SizedBox(height: 12),
                  TextField(controller: nickname, decoration: const InputDecoration(labelText: '昵称')),
                  const SizedBox(height: 12),
                  TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: '密码')),
                  const SizedBox(height: 12),
                  DropdownButton<String>(
                    value: role,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: 'PARENT', child: Text('家长')),
                      DropdownMenuItem(value: 'CHILD', child: Text('孩子')),
                    ],
                    onChanged: (value) => setSheetState(() => role = value ?? role),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () async {
                      Navigator.pop(context);
                      await _run(
                        () async {
                          await api.register(
                            username: username.text.trim(),
                            password: password.text,
                            nickname: nickname.text.trim(),
                            role: role,
                            familyId: currentFamilyId,
                          );
                        },
                        '成员已创建',
                      );
                    },
                    child: const Text('创建'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openEdit(FamilyHubApi api, User user) async {
    final nickname = TextEditingController(text: user.nickname);
    final avatar = TextEditingController(text: user.avatar ?? '');
    var role = user.role;

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
                  Text('编辑成员', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  TextField(controller: nickname, decoration: const InputDecoration(labelText: '昵称')),
                  const SizedBox(height: 12),
                  TextField(controller: avatar, decoration: const InputDecoration(labelText: '头像 URL')),
                  const SizedBox(height: 12),
                  DropdownButton<String>(
                    value: role,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: 'ADMIN', child: Text('管理员')),
                      DropdownMenuItem(value: 'PARENT', child: Text('家长')),
                      DropdownMenuItem(value: 'CHILD', child: Text('孩子')),
                    ],
                    onChanged: (value) => setSheetState(() => role = value ?? role),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () async {
                      Navigator.pop(context);
                      await _run(
                        () async {
                          await api.updateUser(
                            user.id,
                            nickname: nickname.text.trim(),
                            avatar: avatar.text.trim(),
                            role: role,
                          );
                        },
                        '成员已更新',
                      );
                    },
                    child: const Text('保存'),
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
