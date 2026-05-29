import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Card, Dialog, Portal, SegmentedButtons, Text, TextInput} from 'react-native-paper';

import {activityApi} from '../../api';
import type {ActivityPayload} from '../../api/activity';
import {ConfirmDialog} from '../../components/ConfirmDialog';
import {EmptyState} from '../../components/EmptyState';
import {message} from '../../components/MessageHost';
import {Screen} from '../../components/Screen';
import {StatusPill} from '../../components/StatusPill';
import {colors, spacing} from '../../theme/theme';
import type {Activity} from '../../types/domain';

const typeOptions = [
  {label: '全部', value: ''},
  {label: '打折', value: 'DISCOUNT'},
  {label: '特惠', value: 'SPECIAL_REWARD'},
  {label: '加成', value: 'BONUS'},
];

const typeLabels: Record<string, string> = {
  DISCOUNT: '商城打折',
  SPECIAL_REWARD: '限时特惠',
  BONUS: '加成活动',
};

const statusLabels: Record<string, {label: string; tone: 'success' | 'warning' | 'default'}> = {
  ACTIVE: {label: '进行中', tone: 'success'},
  DRAFT: {label: '草稿', tone: 'warning'},
  EXPIRED: {label: '已过期', tone: 'default'},
};

const emptyForm = {
  name: '',
  description: '',
  bannerImage: '',
  type: 'DISCOUNT',
  startTime: '',
  endTime: '',
  discountRate: '',
  rewardName: '',
  rewardImage: '',
  rewardPointsPrice: '',
  rewardDescription: '',
  rewardStock: '',
  bonusType: 'POINTS',
  bonusMultiplier: '',
};

export function ActivityManageScreen() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const [form, setForm] = useState(emptyForm);

  const query = useQuery({
    queryKey: ['activities', 'manage', typeFilter],
    queryFn: () => activityApi.list({type: typeFilter || undefined}),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['activities']});
  };

  const saveMutation = useMutation({
    mutationFn: ({id, payload}: {id?: string; payload: Partial<ActivityPayload>}) =>
      id ? activityApi.update(id, payload) : activityApi.create(payload as ActivityPayload),
    onSuccess: () => { closeForm(); invalidate(); },
    onError: (e: Error) => message.error('保存失败', e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: activityApi.delete,
    onSuccess: invalidate,
    onError: (e: Error) => message.error('删除失败', e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: activityApi.toggle,
    onSuccess: invalidate,
    onError: (e: Error) => message.error('切换失败', e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (a: Activity) => {
    setEditing(a);
    setForm({
      name: a.name,
      description: a.description ?? '',
      bannerImage: a.bannerImage ?? '',
      type: a.type,
      startTime: a.startTime ? a.startTime.slice(0, 16) : '',
      endTime: a.endTime ? a.endTime.slice(0, 16) : '',
      discountRate: a.discountRate != null ? String(a.discountRate) : '',
      rewardName: a.rewardName ?? '',
      rewardImage: a.rewardImage ?? '',
      rewardPointsPrice: a.rewardPointsPrice != null ? String(a.rewardPointsPrice) : '',
      rewardDescription: a.rewardDescription ?? '',
      rewardStock: a.rewardStock != null ? String(a.rewardStock) : '',
      bonusType: a.bonusType ?? 'POINTS',
      bonusMultiplier: a.bonusMultiplier != null ? String(a.bonusMultiplier) : '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const submitForm = () => {
    const base = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      bannerImage: form.bannerImage.trim() || undefined,
      type: form.type,
      startTime: form.startTime,
      endTime: form.endTime,
    };

    let payload: Partial<ActivityPayload>;
    switch (form.type) {
      case 'DISCOUNT':
        payload = {...base, discountRate: Number(form.discountRate)};
        break;
      case 'SPECIAL_REWARD':
        payload = {
          ...base,
          rewardName: form.rewardName.trim(),
          rewardPointsPrice: Number(form.rewardPointsPrice),
          rewardDescription: form.rewardDescription.trim() || undefined,
          rewardStock: form.rewardStock ? Number(form.rewardStock) : undefined,
        };
        break;
      case 'BONUS':
        payload = {...base, bonusType: form.bonusType, bonusMultiplier: Number(form.bonusMultiplier)};
        break;
      default:
        payload = base;
    }

    saveMutation.mutate({id: editing?.id, payload});
  };

  const activities = query.data ?? [];
  const canSubmit = form.name.trim() && form.startTime && form.endTime;

  return (
    <Screen
      title="活动管理"
      subtitle="创建和管理节日活动"
      refreshing={query.isFetching}
      onRefresh={() => query.refetch()}>
      <SegmentedButtons
        value={typeFilter}
        onValueChange={setTypeFilter}
        buttons={typeOptions}
      />

      <Button mode="contained" onPress={openCreate} style={styles.createBtn}>
        新建活动
      </Button>

      {activities.length === 0 ? (
        <Card mode="outlined">
          <Card.Content><EmptyState title="暂无活动" /></Card.Content>
        </Card>
      ) : (
        activities.map(a => {
          const s = statusLabels[a.status] ?? {label: a.status, tone: 'muted' as const};
          return (
            <Card key={a.id} mode="outlined">
              <Card.Content>
                <View style={styles.cardHead}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.title}>{a.name}</Text>
                    <Text style={styles.meta}>{typeLabels[a.type] ?? a.type}</Text>
                  </View>
                  <StatusPill label={s.label} tone={s.tone} />
                </View>
                <Text style={styles.meta}>
                  {a.startTime?.slice(0, 10)} ~ {a.endTime?.slice(0, 10)}
                </Text>
              </Card.Content>
              <Card.Actions style={styles.actions}>
                <Button mode="contained-tonal" onPress={() => openEdit(a)}>编辑</Button>
                <Button
                  mode="outlined"
                  loading={toggleMutation.isPending}
                  disabled={a.status === 'EXPIRED'}
                  onPress={() => toggleMutation.mutate(a.id)}>
                  {a.status === 'ACTIVE' ? '下线' : '上线'}
                </Button>
                <Button
                  buttonColor={colors.danger}
                  loading={deleteMutation.isPending}
                  mode="contained"
                  onPress={() => setDeleting(a)}>
                  删除
                </Button>
              </Card.Actions>
            </Card>
          );
        })
      )}

      <Portal>
        <Dialog visible={formOpen} onDismiss={closeForm}>
          <Dialog.Title>{editing ? '编辑活动' : '新建活动'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <TextInput
                label="活动名称"
                mode="outlined"
                value={form.name}
                onChangeText={v => setForm(f => ({...f, name: v}))}
              />
              <TextInput
                label="描述"
                mode="outlined"
                value={form.description}
                onChangeText={v => setForm(f => ({...f, description: v}))}
              />
              <TextInput
                label="开始时间 (YYYY-MM-DDTHH:mm)"
                mode="outlined"
                value={form.startTime}
                onChangeText={v => setForm(f => ({...f, startTime: v}))}
                placeholder="2026-06-01T00:00"
              />
              <TextInput
                label="结束时间 (YYYY-MM-DDTHH:mm)"
                mode="outlined"
                value={form.endTime}
                onChangeText={v => setForm(f => ({...f, endTime: v}))}
                placeholder="2026-06-03T23:59"
              />
              {!editing && (
                <SegmentedButtons
                  value={form.type}
                  onValueChange={v => setForm(f => ({...f, type: v}))}
                  buttons={[
                    {label: '打折', value: 'DISCOUNT'},
                    {label: '特惠', value: 'SPECIAL_REWARD'},
                    {label: '加成', value: 'BONUS'},
                  ]}
                />
              )}
              {form.type === 'DISCOUNT' && (
                <TextInput
                  label="折扣率 (0.80=八折)"
                  mode="outlined"
                  keyboardType="numeric"
                  value={form.discountRate}
                  onChangeText={v => setForm(f => ({...f, discountRate: v}))}
                />
              )}
              {form.type === 'SPECIAL_REWARD' && (
                <>
                  <TextInput
                    label="奖励名称"
                    mode="outlined"
                    value={form.rewardName}
                    onChangeText={v => setForm(f => ({...f, rewardName: v}))}
                  />
                  <TextInput
                    label="血清素价格"
                    mode="outlined"
                    keyboardType="numeric"
                    value={form.rewardPointsPrice}
                    onChangeText={v => setForm(f => ({...f, rewardPointsPrice: v}))}
                  />
                  <TextInput
                    label="库存（留空=无限）"
                    mode="outlined"
                    keyboardType="numeric"
                    value={form.rewardStock}
                    onChangeText={v => setForm(f => ({...f, rewardStock: v}))}
                  />
                  <TextInput
                    label="奖励描述"
                    mode="outlined"
                    value={form.rewardDescription}
                    onChangeText={v => setForm(f => ({...f, rewardDescription: v}))}
                  />
                </>
              )}
              {form.type === 'BONUS' && (
                <>
                  <SegmentedButtons
                    value={form.bonusType}
                    onValueChange={v => setForm(f => ({...f, bonusType: v}))}
                    buttons={[
                      {label: '血清素', value: 'POINTS'},
                      {label: '经验', value: 'EXPERIENCE'},
                    ]}
                  />
                  <TextInput
                    label="倍数 (2=双倍)"
                    mode="outlined"
                    keyboardType="numeric"
                    value={form.bonusMultiplier}
                    onChangeText={v => setForm(f => ({...f, bonusMultiplier: v}))}
                  />
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeForm}>取消</Button>
            <Button
              disabled={!canSubmit}
              loading={saveMutation.isPending}
              mode="contained"
              onPress={submitForm}>
              保存
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog
        danger
        confirmLabel="删除"
        message={`确定删除活动「${deleting?.name ?? ''}」？`}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting.id);
            setDeleting(null);
          }
        }}
        onDismiss={() => setDeleting(null)}
        title="删除活动"
        visible={!!deleting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    marginBottom: spacing.sm,
  },
  cardHead: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardInfo: {
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
    lineHeight: 19,
  },
  actions: {
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  modalBody: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
});
