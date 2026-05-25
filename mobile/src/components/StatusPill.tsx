import {StyleSheet} from 'react-native';
import {Chip} from 'react-native-paper';

import {colors} from '../theme/theme';

type StatusPillProps = {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

export function StatusPill({label, tone = 'default'}: StatusPillProps) {
  return (
    <Chip
      compact
      mode="flat"
      style={[styles.pill, styles[tone]]}
      textStyle={[styles.text, styles[`${tone}Text`]]}>
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
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
