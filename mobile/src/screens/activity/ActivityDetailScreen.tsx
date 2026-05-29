import {useQuery} from '@tanstack/react-query';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {activityApi} from '../../api';
import {Screen} from '../../components/Screen';
import {colors, spacing} from '../../theme/theme';
import type {Activity} from '../../types/domain';

function formatCountdown(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return '已结束';
  const hours = Math.floor(diff / 3600000);
  if (hours > 24) return `${Math.floor(hours / 24)}天${hours % 24}小时`;
  if (hours > 0) return `${hours}小时`;
  const minutes = Math.floor(diff / 60000);
  return `${minutes}分钟`;
}

function DiscountContent({activity}: {activity: Activity}) {
  return (
    <>
      <Text style={styles.highlight}>
        全场 {activity.discountRate! * 10} 折
      </Text>
      <Text style={styles.meta}>
        活动期间所有奖励兑换价格统一打折
      </Text>
    </>
  );
}

function SpecialRewardContent({activity}: {activity: Activity}) {
  return (
    <>
      {activity.rewardImage ? (
        <Card.Cover source={{uri: activity.rewardImage}} style={styles.cover} />
      ) : null}
      <Text style={styles.highlight}>{activity.rewardName}</Text>
      <Text style={styles.meta}>
        血清素价格：{activity.rewardPointsPrice}
      </Text>
      {activity.rewardStock != null && (
        <Text style={styles.meta}>
          剩余库存：{activity.rewardStock}
        </Text>
      )}
      {activity.rewardDescription ? (
        <Text style={styles.meta}>{activity.rewardDescription}</Text>
      ) : null}
    </>
  );
}

function BonusContent({activity}: {activity: Activity}) {
  const label = activity.bonusType === 'POINTS' ? '血清素' : '经验';
  return (
    <>
      <Text style={styles.highlight}>
        {label} ×{activity.bonusMultiplier}
      </Text>
      <Text style={styles.meta}>
        活动期间完成任务获得 {activity.bonusMultiplier} 倍{label}
      </Text>
    </>
  );
}

export function ActivityDetailScreen({route}: {route: any}) {
  const {activityId} = route.params as {activityId: string};

  const query = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activityApi.getActivityDetail(activityId),
  });

  if (query.isLoading) {
    return (
      <Screen title="活动详情">
        <Text style={styles.meta}>正在加载...</Text>
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen title="活动详情">
        <Text style={styles.meta}>活动信息暂时读不到</Text>
      </Screen>
    );
  }

  const activity = query.data;

  return (
    <Screen title={activity.name}>
      {activity.bannerImage ? (
        <Card.Cover source={{uri: activity.bannerImage}} style={styles.cover} />
      ) : null}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{activity.name}</Text>
          {activity.description ? (
            <Text style={styles.meta}>{activity.description}</Text>
          ) : null}
          <View style={styles.countdownRow}>
            <Text style={styles.countdown}>
              剩余 {formatCountdown(activity.endTime)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.block}>
            {activity.type === 'DISCOUNT' && <DiscountContent activity={activity} />}
            {activity.type === 'SPECIAL_REWARD' && <SpecialRewardContent activity={activity} />}
            {activity.type === 'BONUS' && <BonusContent activity={activity} />}
          </View>
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cover: {
    marginBottom: spacing.md,
    height: 180,
  },
  block: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  highlight: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  countdownRow: {
    marginTop: spacing.sm,
  },
  countdown: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
