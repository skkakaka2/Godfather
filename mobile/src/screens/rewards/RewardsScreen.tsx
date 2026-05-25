import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Card, Dialog, Portal, SegmentedButtons, Text, TextInput} from 'react-native-paper';

import {storeApi} from '../../api';
import {ChoiceChips} from '../../components/ChoiceChips';
import {ConfirmDialog} from '../../components/ConfirmDialog';
import {EmptyState} from '../../components/EmptyState';
import {message} from '../../components/MessageHost';
import {PaginationBar} from '../../components/PaginationBar';
import {Screen} from '../../components/Screen';
import {StatusPill} from '../../components/StatusPill';
import {useAuthStore} from '../../store/authStore';
import {colors, spacing} from '../../theme/theme';
import {formatStock, isManagerRole, orderStatusLabel} from '../../utils/format';
import type {Reward, RewardPayload} from '../../types/domain';

const rewardStatusOptions = [
  {label: '全部', value: ''},
  {label: '上架', value: 'ON'},
  {label: '下架', value: 'OFF'},
];

const emptyForm = {
  name: '',
  description: '',
  pointsPrice: '',
  stock: '1',
  imageUrl: '',
};

export function RewardsScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const manager = isManagerRole(user?.role);
  const [activeTab, setActiveTab] = useState('rewards');
  const [status, setStatus] = useState(manager ? '' : 'ON');
  const [redeemPage, setRedeemPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null);
  const [redeemingReward, setRedeemingReward] = useState<Reward | null>(null);
  const [form, setForm] = useState(emptyForm);
  const redeemPageSize = 10;

  useEffect(() => {
    if (!manager) {
      setStatus('ON');
    }
  }, [manager]);

  const rewardsQuery = useQuery({
    queryKey: ['rewards', status],
    queryFn: () => storeApi.getRewards({status: status || undefined}),
    enabled: activeTab === 'rewards',
  });

  const redeemedQuery = useQuery({
    queryKey: ['redeem-orders', 'mine', user?.id, redeemPage],
    queryFn: () =>
      storeApi.getRedeemOrdersPaged({
        userId: user?.id,
        status: 'APPROVED',
        page: redeemPage,
        pageSize: redeemPageSize,
      }),
    enabled: activeTab === 'redeemed' && !!user?.id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['rewards']});
    queryClient.invalidateQueries({queryKey: ['redeem-orders']});
    queryClient.invalidateQueries({queryKey: ['points']});
  };

  const saveMutation = useMutation({
    mutationFn: ({id, payload}: {id?: string; payload: RewardPayload}) =>
      id ? storeApi.updateReward(id, payload) : storeApi.createReward(payload),
    onSuccess: () => {
      closeForm();
      invalidate();
    },
    onError: error => message.error('保存失败', error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: storeApi.deleteReward,
    onSuccess: invalidate,
    onError: error => message.error('删除失败', error.message),
  });
  const toggleMutation = useMutation({
    mutationFn: storeApi.toggleReward,
    onSuccess: invalidate,
    onError: error => message.error('切换失败', error.message),
  });
  const redeemMutation = useMutation({
    mutationFn: storeApi.redeem,
    onSuccess: () => {
      message.success('申请已提交', '等待家长审批。');
      invalidate();
    },
    onError: error => message.error('兑换失败', error.message),
  });

  const openCreate = () => {
    setEditingReward(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (reward: Reward) => {
    setEditingReward(reward);
    setForm({
      name: reward.name,
      description: reward.description ?? '',
      pointsPrice: String(reward.pointsPrice),
      stock: String(reward.stock),
      imageUrl: reward.imageUrl ?? '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingReward(null);
    setForm(emptyForm);
  };

  const submitForm = () => {
    const payload: RewardPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      pointsPrice: Number(form.pointsPrice),
      stock: Number(form.stock || 0),
      imageUrl: form.imageUrl.trim(),
    };
    saveMutation.mutate({id: editingReward?.id, payload});
  };

  const rewards = rewardsQuery.data ?? [];
  const redeemedOrders = redeemedQuery.data?.list ?? [];

  return (
    <Screen
      title="多巴胺商城"
      subtitle="浏览奖励，孩子可申请激发，家长可维护商品"
      refreshing={
        activeTab === 'rewards'
          ? rewardsQuery.isFetching
          : redeemedQuery.isFetching
      }
      onRefresh={() => {
        if (activeTab === 'rewards') {
          rewardsQuery.refetch();
        } else {
          redeemedQuery.refetch();
        }
      }}>
      <SegmentedButtons
        value={activeTab}
        onValueChange={value => {
          setActiveTab(value);
          setRedeemPage(1);
        }}
        buttons={[
          {label: '多巴胺列表', value: 'rewards'},
          {label: '我的兑换', value: 'redeemed'},
        ]}
      />

      {activeTab === 'rewards' ? (
        <>
          {manager ? (
            <>
              <ChoiceChips options={rewardStatusOptions} value={status} onChange={setStatus} />
              <Button mode="contained" onPress={openCreate}>
                新增多巴胺
              </Button>
            </>
          ) : null}

          {rewards.length === 0 ? (
            <Card mode="outlined">
              <Card.Content>
                <EmptyState title="暂无奖励商品" />
              </Card.Content>
            </Card>
          ) : (
            rewards.map(reward => (
              <Card key={reward.id} mode="outlined">
                <Card.Content>
                  <View style={styles.rewardHead}>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.title}>{reward.name}</Text>
                      <Text style={styles.meta}>{reward.description || '无说明'}</Text>
                    </View>
                    <StatusPill
                      label={reward.status === 'ON' ? '上架' : '下架'}
                      tone={reward.status === 'ON' ? 'success' : 'warning'}
                    />
                  </View>
                  <Text style={styles.price}>{reward.pointsPrice} 血清素</Text>
                  <Text style={styles.meta}>库存：{formatStock(reward.stock)}</Text>
                </Card.Content>

                <Card.Actions style={styles.actions}>
                  {manager ? (
                    <>
                      <Button mode="contained-tonal" onPress={() => openEdit(reward)}>
                        编辑
                      </Button>
                      <Button
                        loading={toggleMutation.isPending}
                        mode="outlined"
                        onPress={() => toggleMutation.mutate(reward.id)}>
                        {reward.status === 'ON' ? '下架' : '上架'}
                      </Button>
                      <Button
                        buttonColor={colors.danger}
                        loading={deleteMutation.isPending}
                        mode="contained"
                        onPress={() => setDeletingReward(reward)}>
                        删除
                      </Button>
                    </>
                  ) : (
                    <Button
                      disabled={reward.status !== 'ON'}
                      loading={redeemMutation.isPending}
                      mode="contained"
                      onPress={() => setRedeemingReward(reward)}>
                      申请激发
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            ))
          )}
        </>
      ) : (
        <>
          {redeemedOrders.length === 0 ? (
            <Card mode="outlined">
              <Card.Content>
                <EmptyState title="暂无已兑换的多巴胺" />
              </Card.Content>
            </Card>
          ) : (
            redeemedOrders.map(order => (
              <Card key={order.id} mode="outlined">
                <Card.Content>
                  <View style={styles.orderRow}>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.title}>{order.rewardName}</Text>
                      <Text style={styles.meta}>
                        {order.pointsCost} 血清素 · {order.createdAt ?? '无时间'}
                      </Text>
                    </View>
                    <StatusPill label={orderStatusLabel(order.status)} tone="info" />
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
          <PaginationBar
            page={redeemPage}
            pageSize={redeemPageSize}
            total={redeemedQuery.data?.total ?? 0}
            onChange={setRedeemPage}
          />
        </>
      )}

      <Portal>
        <Dialog
          visible={manager && formOpen}
          onDismiss={closeForm}>
          <Dialog.Title>{editingReward ? '编辑多巴胺' : '新增多巴胺'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <TextInput
                label="名称"
                mode="outlined"
                onChangeText={name => setForm(current => ({...current, name}))}
                placeholder="例如 周末电影"
                value={form.name}
              />
              <TextInput
                label="说明"
                mode="outlined"
                onChangeText={description => setForm(current => ({...current, description}))}
                placeholder="奖励说明"
                value={form.description}
              />
              <TextInput
                keyboardType="numeric"
                label="激发血清素"
                mode="outlined"
                onChangeText={pointsPrice => setForm(current => ({...current, pointsPrice}))}
                value={form.pointsPrice}
              />
              <TextInput
                keyboardType="numeric"
                label="库存（-1 为不限量）"
                mode="outlined"
                onChangeText={stock => setForm(current => ({...current, stock}))}
                value={form.stock}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeForm}>取消</Button>
            <Button
              disabled={!form.name.trim() || !Number(form.pointsPrice)}
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
        message={`确定删除 ${deletingReward?.name ?? ''}？`}
        onConfirm={() => {
          if (deletingReward) {
            deleteMutation.mutate(deletingReward.id);
            setDeletingReward(null);
          }
        }}
        onDismiss={() => setDeletingReward(null)}
        title="删除多巴胺"
        visible={!!deletingReward}
      />

      <ConfirmDialog
        confirmLabel="确认"
        message={
          redeemingReward
            ? `确认使用 ${redeemingReward.pointsPrice} 血清素激发「${redeemingReward.name}」？`
            : ''
        }
        onConfirm={() => {
          if (redeemingReward) {
            redeemMutation.mutate(redeemingReward.id);
            setRedeemingReward(null);
          }
        }}
        onDismiss={() => setRedeemingReward(null)}
        title="确认激发"
        visible={!!redeemingReward}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rewardHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  rewardInfo: {
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
  price: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  actions: {
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  orderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBody: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
});
