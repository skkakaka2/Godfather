import {StyleSheet, View} from 'react-native';
import {Button, Surface, Text} from 'react-native-paper';

import {colors, spacing} from '../theme/theme';
import {shiftDate, todayString} from '../utils/format';

type DatePickerRowProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DatePickerRow({value, onChange}: DatePickerRowProps) {
  const isToday = value === todayString();

  return (
    <View style={styles.wrap}>
      <Button mode="outlined" onPress={() => onChange(shiftDate(value, -1))}>
        前一天
      </Button>
      <Surface mode="flat" style={styles.dateBox}>
        <Text style={styles.date}>{value}</Text>
      </Surface>
      <Button mode="outlined" onPress={() => onChange(shiftDate(value, 1))}>
        后一天
      </Button>
      {!isToday ? (
        <Button mode="contained-tonal" onPress={() => onChange(todayString())}>
          今天
        </Button>
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
  dateBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    minWidth: 116,
    paddingHorizontal: spacing.md,
  },
  date: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
});
