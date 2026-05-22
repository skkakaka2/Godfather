import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {Alert, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {storeApi} from '../../api';
import {AppButton} from '../../components/AppButton';
import {Card} from '../../components/Card';
import {EmptyState} from '../../components/EmptyState';
import {Field} from '../../components/Field';
import {message} from '../../components/MessageHost';
import {OptionTabs} from '../../components/OptionTabs';
import {PaginationBar} from '../../components/PaginationBar';
import {Screen} from '../../components/Screen';
import {StatusPill} from '../../components/StatusPill';
import {useAuthStore} from '../../store/authStore';
import {colors, radius, spacing} from '../../theme/theme';
import {formatStock, isManagerRole, orderStatusLabel} from '../../utils/format';
import type {Reward, RewardPayload} from '../../types/domain';

const rewardStatusOptions = [
  {label: '全部', value: ''},
  {label: '上架', value: 'ON'},
  {label: '下架', value: 'OFF'},
];

const tabOptions = [
  {label: '多巴胺列表', value: 'rewards'},
  {label: '我的兑换', value: 'redeemed'},
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
      <View style={styles.tabBar}>
        {tabOptions.map(option => {
          const active = option.value === activeTab;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              key={option.value}
              onPress={() => {
                setActiveTab(option.value);
                setRedeemPage(1);
              }}
              style={[styles.tabButton, active && styles.tabButtonActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'rewards' ? (
        <>
          {manager ? (
            <>
              <OptionTabs options={rewardStatusOptions} value={status} onChange={setStatus} />
              <AppButton title="新增多巴胺" onPress={openCreate} />
            </>
          ) : null}

          {rewards.length === 0 ? (
            <Card>
              <EmptyState title="暂无奖励商品" />
            </Card>
          ) : (
            rewards.map(reward => (
              <Card key={reward.id}>
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

                <View style={styles.actions}>
                  {manager ? (
                    <>
                      <AppButton title="编辑" variant="secondary" onPress={() => openEdit(reward)} />
                      <AppButton
                        title={reward.status === 'ON' ? '下架' : '上架'}
                        variant="ghost"
                        loading={toggleMutation.isPending}
                        onPress={() => toggleMutation.mutate(reward.id)}
                      />
                      <AppButton
                        title="删除"
                        variant="danger"
                        loading={deleteMutation.isPending}
                        onPress={() =>
                          Alert.alert('删除多巴胺', `确定删除 ${reward.name}？`, [
                            {text: '取消', style: 'cancel'},
                            {text: '删除', style: 'destructive', onPress: () => deleteMutation.mutate(reward.id)},
                          ])
                        }
                      />
                    </>
                  ) : (
                    <AppButton
                      disabled={reward.status !== 'ON'}
                      loading={redeemMutation.isPending}
                      onPress={() =>
                        Alert.alert('确认激发', `确认使用 ${reward.pointsPrice} 血清素激发「${reward.name}」？`, [
                          {text: '取消', style: 'cancel'},
                          {text: '确认', onPress: () => redeemMutation.mutate(reward.id)},
                        ])
                      }
                      title="申请激发"
                    />
                  )}
                </View>
              </Card>
            ))
          )}
        </>
      ) : (
        <>
          {redeemedOrders.length === 0 ? (
            <Card>
              <EmptyState title="暂无已兑换的多巴胺" />
            </Card>
          ) : (
            redeemedOrders.map(order => (
              <Card key={order.id}>
                <View style={styles.orderRow}>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.title}>{order.rewardName}</Text>
                    <Text style={styles.meta}>
                      {order.pointsCost} 血清素 · {order.createdAt ?? '无时间'}
                    </Text>
                  </View>
                  <StatusPill label={orderStatusLabel(order.status)} tone="info" />
                </View>
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

      <Modal
        animationType="slide"
        transparent
        visible={manager && formOpen}
        onRequestClose={closeForm}>
        <View style={styles.modalMask}>
          <Card>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>{editingReward ? '编辑多巴胺' : '新增多巴胺'}</Text>
              <Field
                label="名称"
                onChangeText={name => setForm(current => ({...current, name}))}
                placeholder="例如 周末电影"
                value={form.name}
              />
              <Field
                label="说明"
                onChangeText={description => setForm(current => ({...current, description}))}
                placeholder="奖励说明"
                value={form.description}
              />
              <Field
                keyboardType="numeric"
                label="激发血清素"
                onChangeText={pointsPrice => setForm(current => ({...current, pointsPrice}))}
                value={form.pointsPrice}
              />
              <Field
                keyboardType="numeric"
                label="库存（-1 为不限量）"
                onChangeText={stock => setForm(current => ({...current, stock}))}
                value={form.stock}
              />
              <View style={styles.actions}>
                <AppButton title="取消" variant="ghost" onPress={closeForm} />
                <AppButton
                  disabled={!form.name.trim() || !Number(form.pointsPrice)}
                  loading={saveMutation.isPending}
                  title="保存"
                  onPress={submitForm}
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
  tabBar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#ffffff',
  },
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  orderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
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
