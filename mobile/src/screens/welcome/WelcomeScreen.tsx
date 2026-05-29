import { useQuery } from '@tanstack/react-query';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { activityApi, levelApi, storeApi, taskApi } from '../../api';
import { Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme/theme';
import type { Activity, DailyTask, Reward } from '../../types/domain';
import { todayString } from '../../utils/format';

const quotes = [
  '每天进步一点点，未来就会亮一点。',
  '认真完成今天的小任务，就是给明天的自己加能量。',
  '慢慢来，比较快；坚持住，就会看见新的自己。',
  '会学习的人不是从不累，而是累了也知道再迈一小步。',
  '今天写下的一行字、完成的一件事，都会变成成长的证据。',
];

const challenges = [
  '先完成最容易开始的一个突触。',
  '完成后认真检查一遍，再提交。',
  '今天告诉爸爸妈妈一个你新学会的小知识。',
  '选一个你最不想做的任务，只做 5 分钟就好。',
  '把今天的任务写在小纸条上，完成一个划掉一个。',
  '做完任务后给自己一个喜欢的放松方式。',
  '今天挑战比昨天早 10 分钟开始第一个任务。',
];

function quoteForToday() {
  const index = new Date().getDate() % quotes.length;
  return quotes[index];
}

function challengeForToday() {
  const index = new Date().getDate() % challenges.length;
  return challenges[index];
}

function getProgress(exp?: number, nextExpRequired?: number | null) {
  if (!nextExpRequired) {
    return 1;
  }
  return Math.min(exp ?? 0, nextExpRequired) / nextExpRequired;
}

function getGrowthTitle(streakDays: number, hasCompletedToday: boolean) {
  if (streakDays >= 30) return '长期坚持者';
  if (streakDays >= 7) return '一周稳定者';
  if (streakDays >= 3) return '连续起步者';
  if (hasCompletedToday) return '今日已启动';
  return '准备出发';
}

function getTaskStats(tasks?: DailyTask[]) {
  if (!tasks || tasks.length === 0) {
    return { total: 0, completed: 0, pending: 0 };
  }
  const completed = tasks.filter(
    t => t.status === 'COMPLETED' || t.status === 'CONFIRMED',
  ).length;
  const pending = tasks.filter(
    t => t.status === 'PENDING' || t.status === 'REJECTED',
  ).length;
  return { total: tasks.length, completed, pending };
}

function getRecommendedTask(tasks?: DailyTask[]): DailyTask | null {
  if (!tasks) return null;
  const pending = tasks.find(t => t.status === 'PENDING');
  if (pending) return pending;
  const rejected = tasks.find(t => t.status === 'REJECTED');
  return rejected ?? null;
}

const activityTypeLabel: Record<Activity['type'], string> = {
  DISCOUNT: '商城打折',
  SPECIAL_REWARD: '限时特惠',
  BONUS: '加成活动',
};

function getNearestReward(rewards?: Reward[], points?: number) {
  if (!rewards || rewards.length === 0) return null;
  const balance = points ?? 0;
  const available = rewards.filter(r => r.stock === -1 || r.stock > 0);

  const affordable = available.filter(r => r.pointsPrice <= balance);
  if (affordable.length > 0) {
    affordable.sort((a, b) => a.pointsPrice - b.pointsPrice);
    return { type: 'affordable' as const, reward: affordable[0] };
  }

  const unaffordable = available.filter(r => r.pointsPrice > balance);
  if (unaffordable.length > 0) {
    unaffordable.sort((a, b) => a.pointsPrice - b.pointsPrice);
    return {
      type: 'shortfall' as const,
      reward: unaffordable[0],
      gap: unaffordable[0].pointsPrice - balance,
    };
  }

  return null;
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <Card mode="outlined">
      <Card.Content>
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{label}</Text>
          <Text style={styles.meta}>正在读取...</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

function ErrorBlock({ label, message }: { label: string; message: string }) {
  return (
    <Card mode="outlined">
      <Card.Content>
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{label}</Text>
          <Text style={styles.meta}>{message}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

export function WelcomeScreen() {
  const user = useAuthStore(state => state.user);
  const today = todayString();
  const navigation = useNavigation<any>();

  const activitiesQuery = useQuery({
    queryKey: ['activities', 'active'],
    queryFn: activityApi.getActiveActivities,
  });

  const levelQuery = useQuery({
    queryKey: ['level', 'info'],
    queryFn: levelApi.getInfo,
  });

  const streakQuery = useQuery({
    queryKey: ['tasks', 'streak-summary'],
    queryFn: taskApi.getStreakSummary,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'today', today, user?.id],
    queryFn: () => taskApi.list({ taskDate: today, userId: user!.id }),
    enabled: !!user?.id,
  });

  const pointsQuery = useQuery({
    queryKey: ['store', 'points', 'balance'],
    queryFn: storeApi.getBalance,
  });

  const endorphinsQuery = useQuery({
    queryKey: ['store', 'endorphins', 'balance'],
    queryFn: storeApi.getEndorphinBalance,
  });

  const rewardsQuery = useQuery({
    queryKey: ['store', 'rewards', 'ON'],
    queryFn: () => storeApi.getRewards({ status: 'ON' }),
  });

  const level = levelQuery.data;
  const streak = streakQuery.data;
  const tasks = tasksQuery.data;
  const points = pointsQuery.data;
  const endorphins = endorphinsQuery.data;
  const rewards = rewardsQuery.data;

  const taskStats = getTaskStats(tasks);
  const recommendedTask = getRecommendedTask(tasks);
  const neuralReward = getNearestReward(rewards, points);
  const growthTitle = getGrowthTitle(
    streak?.streakDays ?? 0,
    (taskStats?.completed ?? 0) > 0,
  );

  const progress = getProgress(level?.exp, level?.nextExpRequired);
  const progressPercent = Math.round(progress * 100);

  const refreshing =
    levelQuery.isFetching ||
    streakQuery.isFetching ||
    tasksQuery.isFetching ||
    pointsQuery.isFetching ||
    endorphinsQuery.isFetching ||
    rewardsQuery.isFetching ||
    activitiesQuery.isFetching;

  const onRefresh = () => {
    levelQuery.refetch();
    streakQuery.refetch();
    tasksQuery.refetch();
    pointsQuery.refetch();
    endorphinsQuery.refetch();
    rewardsQuery.refetch();
    activitiesQuery.refetch();
  };

  const remainingExp = level?.nextExpRequired
    ? level.nextExpRequired - (level.exp ?? 0)
    : 0;

  return (
    <Screen
      title={`欢迎回来，${user?.nickname || user?.username || '小小探索家'}`}
      subtitle="给今天的自己一点掌声，然后继续向前"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {/* 活动Banner */}
      {!activitiesQuery.isLoading && activitiesQuery.data && activitiesQuery.data.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('ActivityDetail', {
            activityId: activitiesQuery.data[0].id,
          })}
        >
          <Card style={styles.bannerCard}>
            <Card.Content>
              <View style={styles.block}>
                <View style={styles.bannerHeader}>
                  <Text style={styles.bannerTag}>
                    {activityTypeLabel[activitiesQuery.data[0].type]}
                  </Text>
                  <Text style={styles.meta}>点击查看</Text>
                </View>
                <Text style={styles.bannerTitle}>
                  {activitiesQuery.data[0].name}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}

      {/* 第一块：今日鼓励 */}
      <Card>
        <Card.Content>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>今日鼓励</Text>
            <Text style={styles.quoteText}>{quoteForToday()}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* 第二块：今日小目标 */}
      {tasksQuery.isLoading ? (
        <LoadingBlock label="今日小目标" />
      ) : tasksQuery.isError ? (
        <ErrorBlock
          label="今日小目标"
          message="任务数据暂时读不到，先把眼前的事做好。"
        />
      ) : taskStats.total === 0 ? (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>今日小目标</Text>
              <Text style={styles.primaryLine}>
                今天还没有突触，先保持一个轻松的好状态。
              </Text>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>今日小目标</Text>
              <ProgressBar
                color={colors.success}
                progress={
                  taskStats.total > 0
                    ? taskStats.completed / taskStats.total
                    : 0
                }
              />
              <Text style={styles.primaryLine}>
                已完成 {taskStats.completed}/{taskStats.total} 个任务
              </Text>
              {recommendedTask ? (
                <Text style={styles.meta}>
                  先从这个开始：{recommendedTask.name}
                </Text>
              ) : taskStats.pending === 0 ? (
                <Text style={styles.meta}>
                  今天的任务已经全部启动，太棒了。
                </Text>
              ) : null}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 第三块：成长能量条 */}
      {levelQuery.isLoading ? (
        <LoadingBlock label="成长能量条" />
      ) : levelQuery.isError ? (
        <ErrorBlock
          label="成长能量条"
          message="等级信息暂时没有读到，先把今天的小目标完成吧。"
        />
      ) : (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>成长经验</Text>
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <StatCard
                    label="成长称号"
                    value={growthTitle}
                    hint={level?.title ?? ''}
                  />
                </View>
                <View style={styles.statItem}>
                  <StatCard
                    label="等级"
                    value={level ? `Lv.${level.level}-${level.subLevel}` : '--'}
                    hint={`${progressPercent}% 升级进度`}
                    tone="green"
                  />
                </View>
              </View>
              <ProgressBar color={colors.success} progress={progress} />
              <Text style={styles.meta}>
                {level?.nextExpRequired
                  ? `再积累 ${remainingExp} 点经验，就能靠近下一阶段。`
                  : '已经满级，继续保持现在的状态。'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 第四块：能量账户 */}
      <Card mode="outlined">
        <Card.Content>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>能量账户</Text>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <StatCard
                  label="血清素"
                  value={
                    pointsQuery.isLoading
                      ? '--'
                      : pointsQuery.isError
                      ? '??'
                      : `${points ?? 0}`
                  }
                  hint="可以激发多巴胺奖励"
                />
              </View>
              <View style={styles.statItem}>
                <StatCard
                  label="内啡肽"
                  value={
                    endorphinsQuery.isLoading
                      ? '--'
                      : endorphinsQuery.isError
                      ? '??'
                      : `${endorphins ?? 0}`
                  }
                  hint="可以兑换成血清素"
                  tone="green"
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 第五块：下一个多巴胺 */}
      {rewardsQuery.isLoading ? (
        <LoadingBlock label="下一个多巴胺" />
      ) : rewardsQuery.isError ? (
        <ErrorBlock
          label="下一个多巴胺"
          message="奖励信息暂时读不到，晚点再来看看。"
        />
      ) : !neuralReward ? (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>下一个多巴胺</Text>
              <Text style={styles.meta}>多巴胺商城还没有上架奖励。</Text>
            </View>
          </Card.Content>
        </Card>
      ) : neuralReward.type === 'affordable' ? (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>下一个多巴胺</Text>
              <Text style={styles.primaryLine}>
                已经可以激发「{neuralReward.reward.name}」。
              </Text>
              <Text style={styles.meta}>
                需要 {neuralReward.reward.pointsPrice} 血清素
              </Text>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>下一个多巴胺</Text>
              <Text style={styles.primaryLine}>
                距离「{neuralReward.reward.name}」还差 {neuralReward.gap}{' '}
                血清素。
              </Text>
              <Text style={styles.meta}>
                需要 {neuralReward.reward.pointsPrice} 血清素，当前{' '}
                {points ?? 0}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 第六块：连击里程碑 */}
      {streakQuery.isLoading ? (
        <LoadingBlock label="连击里程碑" />
      ) : (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>连击里程碑</Text>
              {streak && streak.streakDays > 0 && streak.taskName ? (
                <>
                  <Text style={styles.primaryLine}>
                    「 {streak.taskName} 」 已连续完成 {streak.streakDays} 次
                  </Text>
                  <Text style={styles.meta}>
                    {streak.nextMilestone
                      ? `距离 ${streak.nextMilestone} 次奖励还差 ${streak.remainingToNextMilestone} 次`
                      : '已经达成最高连击里程碑，继续保持'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.primaryLine}>
                    今天完成一个任务，就能开启新的连续记录。
                  </Text>
                  <Text style={styles.meta}>先从第 1 次认真完成开始</Text>
                </>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 第七块：今日挑战 */}
      <Card mode="outlined">
        <Card.Content>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>今日挑战</Text>
            <Text style={styles.primaryLine}>{challengeForToday()}</Text>
          </View>
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  bannerCard: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  blockTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  quoteText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: spacing.md,
  },
  statItem: {
    width: '48%',
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
