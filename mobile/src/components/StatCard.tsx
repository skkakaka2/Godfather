import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';

import {colors, spacing} from '../theme/theme';

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'blue' | 'green' | 'gold';
};

export function StatCard({label, value, hint, tone = 'blue'}: StatCardProps) {
  return (
    <Card mode="outlined">
      <Card.Content>
      <View style={styles.wrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, styles[tone]]}>{value}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
  },
  value: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
  },
  blue: {
    color: colors.primary,
  },
  green: {
    color: colors.success,
  },
  gold: {
    color: colors.warning,
  },
});
