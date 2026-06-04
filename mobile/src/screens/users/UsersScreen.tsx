import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Button, Card, Dialog, Portal, Text, TextInput} from 'react-native-paper';

import {authApi, userApi} from '../../api';
import {ChoiceChips} from '../../components/ChoiceChips';
import {EmptyState} from '../../components/EmptyState';
import {message} from '../../components/MessageHost';
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
      <Button mode="contained" onPress={openCreate}>
        新增居民
      </Button>

      {members.length === 0 ? (
        <Card mode="outlined">
          <Card.Content>
            <EmptyState title="暂无居民" />
          </Card.Content>
        </Card>
      ) : (
        members.map(member => (
          <Card key={member.id} mode="outlined">
            <Card.Content>
            <View style={styles.head}>
              <Avatar.Text
                label={member.nickname?.slice(0, 1) || member.username.slice(0, 1)}
                labelStyle={styles.avatarText}
                size={40}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.title}>{member.nickname || member.username}</Text>
                <Text style={styles.meta}>{member.username}</Text>
              </View>
              <StatusPill label={roleLabel(member.role)} tone="info" />
            </View>
            </Card.Content>
            <Card.Actions style={styles.actions}>
              <Button mode="contained-tonal" onPress={() => openEdit(member)}>
                编辑
              </Button>
            </Card.Actions>
          </Card>
        ))
      )}

      <Portal>
        <Dialog visible={formOpen} onDismiss={closeForm}>
          <Dialog.Title>{editingUser ? '编辑居民' : '新增居民'}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.modalBody}>
              {!editingUser ? (
                <>
                  <TextInput
                    autoCapitalize="none"
                    label="用户名"
                    mode="outlined"
                    onChangeText={username => setForm(current => ({...current, username}))}
                    value={form.username}
                  />
                  <TextInput
                    label="密码"
                    mode="outlined"
                    onChangeText={password => setForm(current => ({...current, password}))}
                    secureTextEntry
                    value={form.password}
                  />
                </>
              ) : null}
              <TextInput
                label="昵称"
                mode="outlined"
                onChangeText={nickname => setForm(current => ({...current, nickname}))}
                value={form.nickname}
              />
              <Text style={styles.label}>角色</Text>
              <ChoiceChips
                options={roleOptions}
                value={form.role}
                onChange={role => setForm(current => ({...current, role}))}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeForm}>取消</Button>
            <Button
              disabled={
                editingUser
                  ? !form.nickname.trim()
                  : !form.username.trim() || !form.password || !form.nickname.trim()
              }
              loading={createMutation.isPending || updateMutation.isPending}
              mode="contained"
              onPress={submit}>
              保存
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    backgroundColor: colors.primarySoft,
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
    paddingHorizontal: spacing.md,
  },
  modalBody: {
    gap: spacing.md,
  },
});
