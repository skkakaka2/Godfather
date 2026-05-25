import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {colors, spacing} from '../theme/theme';

type EmptyStateProps = {
  title?: string;
};

export function EmptyState({title = '暂无数据'}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  text: {
    color: colors.muted,
    fontSize: 14,
  },
});
