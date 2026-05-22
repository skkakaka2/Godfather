import {StyleSheet, Text, View} from 'react-native';

import {colors, radius, spacing} from '../theme/theme';

type StatusPillProps = {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

export function StatusPill({label, tone = 'default'}: StatusPillProps) {
  return (
    <View style={[styles.pill, styles[tone]]}>
      <Text style={[styles.text, styles[`${tone}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  default: {
    backgroundColor: '#eef2f7',
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  danger: {
    backgroundColor: '#fee2e2',
  },
  info: {
    backgroundColor: '#cffafe',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  defaultText: {
    color: colors.muted,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
  dangerText: {
    color: colors.danger,
  },
  infoText: {
    color: colors.info,
  },
});
