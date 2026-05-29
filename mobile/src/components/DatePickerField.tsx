import DateTimePicker from '@react-native-community/datetimepicker';
import {useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';

import {colors, radius, spacing} from '../theme/theme';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function toDate(s: string): Date {
  if (!s) return new Date();
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePickerField({label, value, onChange}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handleDismiss = () => {
    setOpen(false);
  };

  const handleValueChange = (_: unknown, date: Date) => {
    setOpen(false);
    onChange(formatDate(date));
  };

  return (
    <>
      <TouchableRipple onPress={() => setOpen(true)} style={styles.touchable}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || label}
        </Text>
      </TouchableRipple>
      {open && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onValueChange={handleValueChange}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
  placeholder: {
    color: colors.muted,
  },
});
