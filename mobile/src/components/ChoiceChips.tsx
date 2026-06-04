import {StyleSheet, View} from 'react-native';
import {Chip} from 'react-native-paper';

import {spacing} from '../theme/theme';

export type ChoiceChipItem = {
  label: string;
  value: string;
};

type ChoiceChipsProps = {
  options: ChoiceChipItem[];
  value: string;
  onChange: (value: string) => void;
};

export function ChoiceChips({options, value, onChange}: ChoiceChipsProps) {
  return (
    <View style={styles.wrap}>
      {options.map(option => {
        const active = option.value === value;
        return (
          <Chip
            compact
            key={option.value}
            mode={active ? 'flat' : 'outlined'}
            onPress={() => onChange(option.value)}
            selected={active}
            showSelectedCheck={false}>
            {option.label}
          </Chip>
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
});
