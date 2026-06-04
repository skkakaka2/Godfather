import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import {Avatar, Card, Text} from 'react-native-paper';

import { storeApi, taskApi, userApi } from '../../api';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { StatusPill } from '../../components/StatusPill';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme/theme';
import {
  formatPoints,
  orderStatusLabel,
  taskStatusLabel,
  todayString,
} from '../../utils/format';

export function DashboardScreen() {
  const currentUser = useAuthStore(state => state.user);
  const today = todayString();

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: userApi.familyMembers,
  });
  const tasksQuery = useQuery({
    queryKey: ['tasks', today, currentUser?.id],
    queryFn: () => taskApi.list({ taskDate: today, userId: currentUser?.id }),
    enabled: !!currentUser,
  });
  const balanceQuery = useQuery({
    queryKey: ['points', 'balance'],
    queryFn: storeApi.getBalance,
  });
  const rewardsQuery = useQuery({
    queryKey: ['rewards', 'on'],
    queryFn: () => storeApi.getRewards({ status: 'ON' }),
  });
  const ordersQuery = useQuery({
    queryKey: ['redeem-orders', 'recent'],
    queryFn: () => storeApi.getRedeemOrders({}),
  });

  const tasks = tasksQuery.data ?? [];
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
  const waitingConfirm = tasks.filter(
    task => task.status === 'COMPLETED',
  ).length;

  const refresh = () => {
    membersQuery.refetch();
    tasksQuery.refetch();
    balanceQuery.refetch();
    rewardsQuery.refetch();
    ordersQuery.refetch();
  };

  return (
    <Screen
      title="概览"
      subtitle={`${
        currentUser?.nickname ?? currentUser?.username ?? '家庭成员'
      }，今天是 ${today}`}
      refreshing={
        membersQuery.isFetching ||
        tasksQuery.isFetching ||
        balanceQuery.isFetching ||
        rewardsQuery.isFetching ||
        ordersQuery.isFetching
      }
      onRefresh={refresh}
    >
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <StatCard label="今日突触" value={tasks.length} hint="当天任务总数" />
        </View>
        <View style={styles.statItem}>
          <StatCard label="待完成" value={pendingTasks} tone="gold" />
        </View>
        <View style={styles.statItem}>
          <StatCard label="待确认" value={waitingConfirm} />
        </View>
        <View style={styles.statItem}>
          <StatCard
            label="当前血清素"
            value={formatPoints(balanceQuery.data)}
            tone="green"
          />
        </View>
      </View>

      <Card mode="outlined">
        <Card.Content>
          <SectionTitle title="今日突触清单" />
        {tasks.length === 0 ? (
          <EmptyState title="今天还没有任务" />
        ) : (
          tasks.slice(0, 5).map(task => (
            <View key={task.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.itemTitle}>{task.name}</Text>
                <Text style={styles.itemMeta}>{task.points} 血清素</Text>
              </View>
              <StatusPill
                label={taskStatusLabel(task.status)}
                tone={task.status === 'PENDING' ? 'warning' : 'success'}
              />
            </View>
          ))
        )}
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Content>
          <SectionTitle title="星球居民" />
        {(membersQuery.data ?? []).slice(0, 6).map(member => (
          <View key={member.id} style={styles.row}>
            <Avatar.Text
              label={member.nickname?.slice(0, 1) || member.username.slice(0, 1)}
              size={36}
              style={styles.avatar}
              labelStyle={styles.avatarText}
            />
            <View style={styles.rowText}>
              <Text style={styles.itemTitle}>
                {member.nickname || member.username}
              </Text>
              <Text style={styles.itemMeta}>{member.role}</Text>
            </View>
          </View>
        ))}
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Content>
          <SectionTitle title="上架多巴胺" />
        {(rewardsQuery.data ?? []).slice(0, 4).map(reward => (
          <View key={reward.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.itemTitle}>{reward.name}</Text>
              <Text style={styles.itemMeta}>
                {reward.pointsPrice} 血清素 · 库存 {reward.stock}
              </Text>
            </View>
          </View>
        ))}
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Content>
          <SectionTitle title="最近激发订单" />
        {(ordersQuery.data ?? []).slice(0, 4).map(order => (
          <View key={order.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.itemTitle}>{order.rewardName}</Text>
              <Text style={styles.itemMeta}>{order.pointsCost} 血清素</Text>
            </View>
            <StatusPill label={orderStatusLabel(order.status)} tone="info" />
          </View>
        ))}
        </Card.Content>
      </Card>
    </Screen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  stats: {
    gap: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '48%',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  row: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '900',
  },
});
