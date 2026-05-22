import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';

import {storeApi} from '../../api';
import {AppButton} from '../../components/AppButton';
import {Card} from '../../components/Card';
import {EmptyState} from '../../components/EmptyState';
import {Field} from '../../components/Field';
import {message} from '../../components/MessageHost';
import {OptionTabs} from '../../components/OptionTabs';
import {PaginationBar} from '../../components/PaginationBar';
import {Screen} from '../../components/Screen';
import {StatCard} from '../../components/StatCard';
import {colors, spacing} from '../../theme/theme';
import {EXCHANGE_RATE, formatPoints} from '../../utils/format';

const typeOptions = [
  {label: '全部', value: ''},
  {label: '获得', value: 'EARN'},
  {label: '兑换', value: 'EXCHANGE'},
];

export function EndorphinsScreen() {
  const queryClient = useQueryClient();
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const pageSize = 10;

  const balanceQuery = useQuery({
    queryKey: ['endorphins', 'balance'],
    queryFn: storeApi.getEndorphinBalance,
  });
  const logsQuery = useQuery({
    queryKey: ['endorphins', 'logs', type, page],
    queryFn: () =>
      storeApi.getEndorphinLogs({
        type: type || undefined,
        page,
        pageSize,
      }),
  });

  const exchangeMutation = useMutation({
    mutationFn: (value: number) => storeApi.exchangeEndorphins(value),
    onSuccess: () => {
      setAmount('');
      setExchangeOpen(false);
      queryClient.invalidateQueries({queryKey: ['endorphins']});
      queryClient.invalidateQueries({queryKey: ['points']});
      message.success('兑换成功', '内啡肽已兑换为血清素。');
    },
    onError: error => message.error('兑换失败', error.message),
  });

  const logs = logsQuery.data?.list ?? [];
  const parsedAmount = Number(amount);
  const balance = balanceQuery.data ?? 0;

  return (
    <Screen
      hideHeading
      subtitle="查看内啡肽余额，并按规则兑换奖励"
      refreshing={balanceQuery.isFetching || logsQuery.isFetching}
      onRefresh={() => {
        balanceQuery.refetch();
        logsQuery.refetch();
      }}>
      <StatCard
        label="当前内啡肽"
        value={formatPoints(balanceQuery.data)}
        hint="可兑换血清素"
        tone="green"
      />
      <AppButton title="激发血清素" onPress={() => setExchangeOpen(true)} />
      <OptionTabs
        options={typeOptions}
        value={type}
        onChange={value => {
          setType(value);
          setPage(1);
        }}
      />

      <Card>
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
      </Card>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={logsQuery.data?.total ?? 0}
        onChange={setPage}
      />

      <Modal
        animationType="slide"
        transparent
        visible={exchangeOpen}
        onRequestClose={() => setExchangeOpen(false)}>
        <View style={styles.modalMask}>
          <Card>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>激发血清素</Text>
              <Text style={styles.meta}>当前内啡肽余额：{balance} 个</Text>
              <Text style={styles.meta}>
                兑换比率：1 内啡肽 → {EXCHANGE_RATE} 血清素
              </Text>
              <Field
                keyboardType="numeric"
                label="激发数量"
                onChangeText={setAmount}
                placeholder="请输入数量"
                value={amount}
              />
              {parsedAmount > 0 ? (
                <Text style={styles.preview}>
                  可获得 {parsedAmount * EXCHANGE_RATE} 血清素
                </Text>
              ) : null}
              <View style={styles.actions}>
                <AppButton
                  title="取消"
                  variant="ghost"
                  onPress={() => setExchangeOpen(false)}
                />
                <AppButton
                  disabled={!parsedAmount || parsedAmount <= 0 || parsedAmount > balance}
                  loading={exchangeMutation.isPending}
                  title="确认激发"
                  onPress={() => exchangeMutation.mutate(parsedAmount)}
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
    lineHeight: 18,
  },
  preview: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
