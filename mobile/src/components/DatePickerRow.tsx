import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, radius, spacing} from '../theme/theme';
import {shiftDate, todayString} from '../utils/format';

type DatePickerRowProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DatePickerRow({value, onChange}: DatePickerRowProps) {
  const isToday = value === todayString();

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(shiftDate(value, -1))}
        style={styles.button}>
        <Text style={styles.buttonText}>前一天</Text>
      </Pressable>
      <Text style={styles.date}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(shiftDate(value, 1))}
        style={styles.button}>
        <Text style={styles.buttonText}>后一天</Text>
      </Pressable>
      {!isToday ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(todayString())}
          style={styles.todayButton}>
          <Text style={styles.todayText}>今天</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  date: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    minWidth: 108,
    textAlign: 'center',
  },
  todayButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  todayText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
