import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, radius, spacing} from '../theme/theme';

export type OptionItem = {
  label: string;
  value: string;
};

type OptionTabsProps = {
  options: OptionItem[];
  value: string;
  onChange: (value: string) => void;
};

export function OptionTabs({options, value, onChange}: OptionTabsProps) {
  return (
    <View style={styles.wrap}>
      {options.map(option => {
        const active = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, active && styles.active]}>
            <Text style={[styles.text, active && styles.activeText]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  activeText: {
    color: '#ffffff',
  },
});
