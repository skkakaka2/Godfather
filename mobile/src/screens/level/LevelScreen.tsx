import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import {Button, Card, ProgressBar, Text} from 'react-native-paper';

import { levelApi } from '../../api';
import { EmptyState } from '../../components/EmptyState';
import { message } from '../../components/MessageHost';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { colors, spacing } from '../../theme/theme';

export function LevelScreen() {
  const queryClient = useQueryClient();
  const infoQuery = useQuery({
    queryKey: ['level', 'info'],
    queryFn: levelApi.getInfo,
  });
  const configsQuery = useQuery({
    queryKey: ['level', 'configs'],
    queryFn: levelApi.listConfigs,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['level'] });
    queryClient.invalidateQueries({ queryKey: ['points'] });
  };

  const signMutation = useMutation({
    mutationFn: levelApi.dailySign,
    onSuccess: () => {
      message.success('签到成功', '今日自律经验已记录。');
      invalidate();
    },
    onError: error => message.error('操作失败', error.message),
  });
  const chestMutation = useMutation({
    mutationFn: levelApi.openChest,
    onSuccess: data => {
      message.success(
        '幸运宝箱',
        `开出 ${data.points} 血清素，获得 ${data.exp} 经验。`,
      );
      invalidate();
    },
    onError: error => message.error('操作失败', error.message),
  });
  const doubleMutation = useMutation({
    mutationFn: levelApi.useDoubleCard,
    onSuccess: () => {
      message.success('翻倍卡已激活', '今天完成任务的血清素将翻倍。');
      invalidate();
    },
    onError: error => message.error('操作失败', error.message),
  });

  const info = infoQuery.data;
  const percent = info?.nextExpRequired
    ? Math.min(Math.round((info.exp / info.nextExpRequired) * 100), 100)
    : 100;

  return (
    <Screen
      title="自律等级"
      subtitle="签到、开宝箱和查看等级特权"
      refreshing={infoQuery.isFetching || configsQuery.isFetching}
      onRefresh={() => {
        infoQuery.refetch();
        configsQuery.refetch();
      }}
    >
      {info ? (
        <>
          <View style={styles.stats}>
            <StatCard
              label="当前等级"
              value={`Lv.${info.level}-${info.subLevel}`}
            />
            <StatCard label="称号" value={info.title} tone="gold" />
            <View style={styles.statItem}>
              <StatCard label="经验进度" value={`${percent}%`} tone="green" />
            </View>
            <View style={styles.statItem}>
              <Card mode="outlined">
                <Card.Content>
                <Text style={styles.title}>经验</Text>
                <ProgressBar progress={percent / 100} />
                <Text style={styles.meta}>
                  {info.exp}/{info.nextExpRequired ?? 'MAX'}
                </Text>
                </Card.Content>
              </Card>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              loading={signMutation.isPending}
              mode="contained"
              onPress={() => signMutation.mutate()}
            >
              每日签到
            </Button>
            <Button
              disabled={!info.dailyChest}
              loading={chestMutation.isPending}
              mode="contained-tonal"
              onPress={() => chestMutation.mutate()}
            >
              {info.dailyChest ? '开宝箱' : '未解锁'}
            </Button>
            <Button
              disabled={!info.doubleCard}
              loading={doubleMutation.isPending}
              mode="outlined"
              onPress={() => doubleMutation.mutate()}
            >
              使用翻倍卡
            </Button>
          </View>

          <Card mode="outlined">
            <Card.Content>
              <Text style={styles.title}>当前特权</Text>
              <Text style={styles.meta}>
                任务血清素加成：{info.bonusPercent}%
              </Text>
              <Text style={styles.meta}>签到加成：{info.dailySignBonus}</Text>
              <Text style={styles.meta}>补签护盾：{info.streakShield}</Text>
              <Text style={styles.meta}>兑换折扣：{info.redeemDiscount}%</Text>
            </Card.Content>
          </Card>
        </>
      ) : (
        <Card mode="outlined">
          <Card.Content>
            <EmptyState title="暂未获取等级信息" />
          </Card.Content>
        </Card>
      )}

      <Card mode="outlined">
        <Card.Content>
          <Text style={styles.title}>等级总览</Text>
          {(configsQuery.data ?? []).map(config => (
            <View key={config.id} style={styles.configRow}>
              <Text style={styles.configName}>
                Lv.{config.level}-{config.subLevel} {config.title}
              </Text>
              <Text style={styles.meta}>{config.expRequired} 经验</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </Screen>
  );
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
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
  configRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  configName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
});
