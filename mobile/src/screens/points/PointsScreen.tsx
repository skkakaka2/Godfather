import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {storeApi, userApi} from '../../api';
import {ChoiceChips} from '../../components/ChoiceChips';
import {EmptyState} from '../../components/EmptyState';
import {PaginationBar} from '../../components/PaginationBar';
import {Screen} from '../../components/Screen';
import {StatCard} from '../../components/StatCard';
import {useAuthStore} from '../../store/authStore';
import {colors, spacing} from '../../theme/theme';
import {formatPoints, isManagerRole} from '../../utils/format';

const typeOptions = [
  {label: '全部', value: ''},
  {label: '冻结', value: 'FREEZE'},
  {label: '兑换', value: 'REDEEM'},
  {label: '解冻', value: 'UNFREEZE'},
  {label: '手动增加', value: 'MANUAL_ADD'},
  {label: '手动扣减', value: 'MANUAL_SUB'},
  {label: '收入', value: 'EARN'},
];

export function PointsScreen() {
  const currentUser = useAuthStore(state => state.user);
  const manager = isManagerRole(currentUser?.role);
  const [type, setType] = useState('');
  const [userId, setUserId] = useState<string | undefined>(currentUser?.id);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: userApi.familyMembers,
    enabled: manager,
  });

  const balanceQuery = useQuery({
    queryKey: ['points', 'balance'],
    queryFn: storeApi.getBalance,
  });
  const logsQuery = useQuery({
    queryKey: ['points', 'logs', type, userId, page],
    queryFn: () =>
      storeApi.getPointLogs({
        userId,
        type: type || undefined,
        page,
        pageSize,
      }),
  });

  const memberOptions = (membersQuery.data ?? []).map(member => ({
    label: member.nickname || member.username,
    value: member.id,
  }));

  const logs = logsQuery.data?.list ?? [];
  const income = logs.filter(log => log.amount > 0).reduce((sum, log) => sum + log.amount, 0);
  const outcome = logs.filter(log => log.amount < 0).reduce((sum, log) => sum + Math.abs(log.amount), 0);

  return (
    <Screen
      title="血清素脉冲"
      subtitle="查看当前余额和积分流水"
      refreshing={balanceQuery.isFetching || logsQuery.isFetching}
      onRefresh={() => {
        balanceQuery.refetch();
        logsQuery.refetch();
      }}>
      <View style={styles.stats}>
        <StatCard label="当前血清素" value={formatPoints(balanceQuery.data)} tone="green" />
        <StatCard label="本页收入" value={`${income}`} />
        <StatCard label="本页支出" value={`${outcome}`} tone="gold" />
      </View>

      {manager && memberOptions.length > 0 ? (
        <ChoiceChips
          options={memberOptions}
          value={userId ?? ''}
          onChange={value => {
            setUserId(value || undefined);
            setPage(1);
          }}
        />
      ) : null}

      <ChoiceChips
        options={typeOptions}
        value={type}
        onChange={value => {
          setType(value);
          setPage(1);
        }}
      />

      <Card mode="outlined">
        <Card.Content>
          {logs.length === 0 ? (
            <EmptyState title="暂无流水" />
          ) : (
            logs.map(log => (
              <View key={log.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.title}>{log.type}</Text>
                  <Text style={styles.meta}>{log.remark || log.createdAt || '无备注'}</Text>
                </View>
                <Text style={[styles.amount, log.amount >= 0 ? styles.income : styles.outcome]}>
                  {log.amount >= 0 ? '+' : ''}
                  {log.amount}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={logsQuery.data?.total ?? 0}
        onChange={setPage}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    gap: spacing.md,
    
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
  },
  income: {
    color: colors.success,
  },
  outcome: {
    color: colors.warning,
  },
});
