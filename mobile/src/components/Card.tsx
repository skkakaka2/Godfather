import type {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {colors, radius, spacing} from '../theme/theme';

type CardProps = {
  children: ReactNode;
};

export function Card({children}: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
