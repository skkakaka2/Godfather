import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';

import {authApi, userApi} from '../../api';
import {AppButton} from '../../components/AppButton';
import {Card} from '../../components/Card';
import {EmptyState} from '../../components/EmptyState';
import {Field} from '../../components/Field';
import {message} from '../../components/MessageHost';
import {OptionTabs} from '../../components/OptionTabs';
import {Screen} from '../../components/Screen';
import {StatusPill} from '../../components/StatusPill';
import {useAuthStore} from '../../store/authStore';
import {colors, spacing} from '../../theme/theme';
import {roleLabel} from '../../utils/format';
import type {User} from '../../types/domain';

const roleOptions = [
  {label: '家长', value: 'PARENT'},
  {label: '孩子', value: 'CHILD'},
  {label: '管理员', value: 'ADMIN'},
];

const emptyForm = {
  username: '',
  password: '',
  nickname: '',
  role: 'CHILD',
};

export function UsersScreen() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: userApi.familyMembers,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['members']});
  };

  const createMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      closeForm();
      invalidate();
    },
    onError: error => message.error('新增失败', error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({id, data}: {id: string; data: {nickname?: string; role?: string}}) =>
      userApi.updateUser(id, data),
    onSuccess: () => {
      closeForm();
      invalidate();
    },
    onError: error => message.error('更新失败', error.message),
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (member: User) => {
    setEditingUser(member);
    setForm({
      username: member.username,
      password: '',
      nickname: member.nickname,
      role: member.role,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const submit = () => {
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        data: {
          nickname: form.nickname.trim(),
          role: form.role,
        },
      });
      return;
    }

    createMutation.mutate({
      username: form.username.trim(),
      password: form.password,
      nickname: form.nickname.trim(),
      role: form.role,
      familyId: currentUser?.familyId,
    });
  };

  const members = membersQuery.data ?? [];

  return (
    <Screen
      hideHeading
      subtitle="维护家庭成员和角色"
      refreshing={membersQuery.isFetching}
      onRefresh={() => {
        membersQuery.refetch();
      }}>
      <AppButton title="新增居民" onPress={openCreate} />

      {members.length === 0 ? (
        <Card>
          <EmptyState title="暂无居民" />
        </Card>
      ) : (
        members.map(member => (
          <Card key={member.id}>
            <View style={styles.head}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.nickname?.slice(0, 1) || member.username.slice(0, 1)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{member.nickname || member.username}</Text>
                <Text style={styles.meta}>{member.username}</Text>
              </View>
              <StatusPill label={roleLabel(member.role)} tone="info" />
            </View>
            <View style={styles.actions}>
              <AppButton
                title="编辑"
                variant="secondary"
                onPress={() => openEdit(member)}
              />
            </View>
          </Card>
        ))
      )}

      <Modal
        animationType="slide"
        transparent
        visible={formOpen}
        onRequestClose={closeForm}>
        <View style={styles.modalMask}>
          <Card>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>{editingUser ? '编辑居民' : '新增居民'}</Text>
              {!editingUser ? (
                <>
                  <Field
                    autoCapitalize="none"
                    label="用户名"
                    onChangeText={username => setForm(current => ({...current, username}))}
                    value={form.username}
                  />
                  <Field
                    label="密码"
                    onChangeText={password => setForm(current => ({...current, password}))}
                    secureTextEntry
                    value={form.password}
                  />
                </>
              ) : null}
              <Field
                label="昵称"
                onChangeText={nickname => setForm(current => ({...current, nickname}))}
                value={form.nickname}
              />
              <Text style={styles.label}>角色</Text>
              <OptionTabs
                options={roleOptions}
                value={form.role}
                onChange={role => setForm(current => ({...current, role}))}
              />
              <View style={styles.actions}>
                <AppButton title="取消" variant="ghost" onPress={closeForm} />
                <AppButton
                  disabled={
                    editingUser
                      ? !form.nickname.trim()
                      : !form.username.trim() || !form.password || !form.nickname.trim()
                  }
                  loading={createMutation.isPending || updateMutation.isPending}
                  title="保存"
                  onPress={submit}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '900',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalMask: {
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  modalBody: {
    gap: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
});
