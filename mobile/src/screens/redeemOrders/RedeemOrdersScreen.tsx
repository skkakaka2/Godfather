import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';

import {storeApi, userApi} from '../../api';
import {AppButton} from '../../components/AppButton';
import {Card} from '../../components/Card';
import {EmptyState} from '../../components/EmptyState';
import {message} from '../../components/MessageHost';
import {OptionTabs} from '../../components/OptionTabs';
import {PaginationBar} from '../../components/PaginationBar';
import {Screen} from '../../components/Screen';
import {StatusPill} from '../../components/StatusPill';
import {colors, spacing} from '../../theme/theme';
import {orderStatusLabel} from '../../utils/format';

const statusOptions = [
  {label: '全部', value: ''},
  {label: '待审批', value: 'PENDING'},
  {label: '已通过', value: 'APPROVED'},
  {label: '已拒绝', value: 'REJECTED'},
];

export function RedeemOrdersScreen() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: userApi.familyMembers,
  });

  const ordersQuery = useQuery({
    queryKey: ['redeem-orders', 'paged', status, userId, page],
    queryFn: () =>
      storeApi.getRedeemOrdersPaged({
        status: status || undefined,
        userId,
        page,
        pageSize,
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['redeem-orders']});
    queryClient.invalidateQueries({queryKey: ['points']});
  };

  const approveMutation = useMutation({
    mutationFn: storeApi.approveRedeemOrder,
    onSuccess: invalidate,
    onError: error => message.error('审批失败', error.message),
  });
  const rejectMutation = useMutation({
    mutationFn: storeApi.rejectRedeemOrder,
    onSuccess: invalidate,
    onError: error => message.error('审批失败', error.message),
  });

  const memberOptions = [
    {label: '全部成员', value: ''},
    ...(membersQuery.data ?? []).map(member => ({
      label: member.nickname || member.username,
      value: member.id,
    })),
  ];

  const getMemberName = (id: string) =>
    membersQuery.data?.find(item => item.id === id)?.nickname ?? `#${id}`;

  const orders = ordersQuery.data?.list ?? [];

  return (
    <Screen
      hideHeading
      subtitle="处理孩子提交的多巴胺激发申请"
      refreshing={ordersQuery.isFetching}
      onRefresh={() => {
        ordersQuery.refetch();
      }}>
      <OptionTabs
        options={statusOptions}
        value={status}
        onChange={value => {
          setStatus(value);
          setPage(1);
        }}
      />
      <OptionTabs
        options={memberOptions}
        value={userId ?? ''}
        onChange={value => {
          setUserId(value || undefined);
          setPage(1);
        }}
      />

      {orders.length === 0 ? (
        <Card>
          <EmptyState title="暂无兑换订单" />
        </Card>
      ) : (
        orders.map(order => (
          <Card key={order.id}>
            <View style={styles.head}>
              <View style={styles.info}>
                <Text style={styles.title}>{order.rewardName}</Text>
                <Text style={styles.meta}>
                  {getMemberName(order.userId)} · {order.pointsCost} 血清素 · {order.createdAt ?? '无时间'}
                </Text>
              </View>
              <StatusPill label={orderStatusLabel(order.status)} tone="info" />
            </View>
            {order.status === 'PENDING' ? (
              <View style={styles.actions}>
                <AppButton
                  loading={approveMutation.isPending}
                  title="通过"
                  onPress={() => approveMutation.mutate(order.id)}
                />
                <AppButton
                  loading={rejectMutation.isPending}
                  title="拒绝"
                  variant="danger"
                  onPress={() =>
                    Alert.alert('确认拒绝', '确认拒绝该激发申请？血清素将退还。', [
                      {text: '取消', style: 'cancel'},
                      {text: '确认拒绝', style: 'destructive', onPress: () => rejectMutation.mutate(order.id)},
                    ])
                  }
                />
              </View>
            ) : null}
          </Card>
        ))
      )}

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={ordersQuery.data?.total ?? 0}
        onChange={setPage}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
