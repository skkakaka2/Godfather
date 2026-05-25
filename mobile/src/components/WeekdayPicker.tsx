import {StyleSheet, View} from 'react-native';
import {Chip, Text} from 'react-native-paper';

import {colors, spacing} from '../theme/theme';

export const WEEKDAY_FIELDS = [
  {label: '日', field: 'applicableSun' as const},
  {label: '一', field: 'applicableMon' as const},
  {label: '二', field: 'applicableTue' as const},
  {label: '三', field: 'applicableWed' as const},
  {label: '四', field: 'applicableThu' as const},
  {label: '五', field: 'applicableFri' as const},
  {label: '六', field: 'applicableSat' as const},
];

export type WeekdayValues = {
  applicableSun: number;
  applicableMon: number;
  applicableTue: number;
  applicableWed: number;
  applicableThu: number;
  applicableFri: number;
  applicableSat: number;
};

type WeekdayPickerProps = {
  value: WeekdayValues;
  onChange: (value: WeekdayValues) => void;
};

export function WeekdayPicker({value, onChange}: WeekdayPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>适用星期</Text>
      <View style={styles.row}>
        {WEEKDAY_FIELDS.map(day => {
          const active = value[day.field] === 1;
          return (
            <Chip
              compact
              key={day.field}
              mode={active ? 'flat' : 'outlined'}
              onPress={() =>
                onChange({
                  ...value,
                  [day.field]: active ? 0 : 1,
                })
              }
              selected={active}
              showSelectedCheck={false}
              style={[styles.day, active && styles.active]}
              textStyle={[styles.dayText, active && styles.activeText]}>
              {day.label}
            </Chip>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  day: {
    minWidth: 42,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  activeText: {
    color: '#ffffff',
  },
});
