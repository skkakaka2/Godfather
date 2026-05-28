import {useQuery} from '@tanstack/react-query';
import {StyleSheet, View} from 'react-native';
import {Card, ProgressBar, Text} from 'react-native-paper';

import {levelApi, taskApi} from '../../api';
import {Screen} from '../../components/Screen';
import {StatCard} from '../../components/StatCard';
import {useAuthStore} from '../../store/authStore';
import {colors, spacing} from '../../theme/theme';

const quotes = [
  '每天进步一点点，未来就会亮一点。',
  '认真完成今天的小任务，就是给明天的自己加能量。',
  '慢慢来，比较快；坚持住，就会看见新的自己。',
  '会学习的人不是从不累，而是累了也知道再迈一小步。',
  '今天写下的一行字、完成的一件事，都会变成成长的证据。',
];

function quoteForToday() {
  const index = new Date().getDate() % quotes.length;
  return quotes[index];
}

function getProgress(exp?: number, nextExpRequired?: number | null) {
  if (!nextExpRequired) {
    return 1;
  }
  return Math.min(exp ?? 0, nextExpRequired) / nextExpRequired;
}

export function WelcomeScreen() {
  const user = useAuthStore(state => state.user);
  const levelQuery = useQuery({
    queryKey: ['level', 'info'],
    queryFn: levelApi.getInfo,
  });
  const streakQuery = useQuery({
    queryKey: ['tasks', 'streak-summary'],
    queryFn: taskApi.getStreakSummary,
  });

  const level = levelQuery.data;
  const streak = streakQuery.data;
  const progress = getProgress(level?.exp, level?.nextExpRequired);
  const progressPercent = Math.round(progress * 100);
  const refreshing = levelQuery.isFetching || streakQuery.isFetching;

  const streakText =
    streak && streak.streakDays > 0 && streak.taskName
      ? `${streak.taskName} 已连续完成 ${streak.streakDays} 次`
      : '今天完成一个任务，就能开启新的连续记录';
  const milestoneText =
    streak && streak.streakDays > 0
      ? streak.nextMilestone
        ? `距离 ${streak.nextMilestone} 次奖励还差 ${streak.remainingToNextMilestone} 次`
        : '已经达成最高连击里程碑，继续保持'
      : '先从第 1 次认真完成开始';

  return (
    <Screen
      title={`欢迎回来，${user?.nickname || user?.username || '小小探索家'}`}
      subtitle="给今天的自己一点掌声，然后继续向前"
      refreshing={refreshing}
      onRefresh={() => {
        levelQuery.refetch();
        streakQuery.refetch();
      }}>
      <Card>
        <Card.Content>
          <View style={styles.quoteCard}>
            <Text style={styles.quoteLabel}>今日鼓励</Text>
            <Text style={styles.quoteText}>{quoteForToday()}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <StatCard
            label="当前等级"
            value={level ? `Lv.${level.level}-${level.subLevel}` : '--'}
            hint={level?.title ?? '正在读取等级'}
          />
        </View>
        <View style={styles.statItem}>
          <StatCard
            label="升级进度"
            value={`${progressPercent}%`}
            hint={level?.nextExpRequired ? '继续积累经验' : '已经满级'}
            tone="green"
          />
        </View>
      </View>

      <Card mode="outlined">
        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>成长能量条</Text>
            <ProgressBar color={colors.success} progress={progress} />
            <Text style={styles.meta}>
              {level
                ? `${level.exp}/${level.nextExpRequired ?? 'MAX'} 经验`
                : '等级信息暂时没有读到，先把今天的小目标完成吧。'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>任务连击</Text>
            <Text style={styles.primaryLine}>{streakText}</Text>
            <Text style={styles.meta}>{milestoneText}</Text>
            {streak?.latestConfirmedDate ? (
              <Text style={styles.meta}>最近确认：{streak.latestConfirmedDate}</Text>
            ) : null}
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>今日行动</Text>
            <Text style={styles.primaryLine}>选一个最容易开始的突触，先完成 10 分钟。</Text>
            <Text style={styles.meta}>
              不用一下子做到完美，只要今天比昨天多认真一点点。
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quoteCard: {
    gap: spacing.sm,
  },
  quoteLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  quoteText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    width: '48%',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  primaryLine: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 23,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
