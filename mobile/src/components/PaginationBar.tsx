import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, radius, spacing} from '../theme/theme';

type PaginationBarProps = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
};

export function PaginationBar({page, pageSize, total, onChange}: PaginationBarProps) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  if (total <= pageSize) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        disabled={page <= 1}
        onPress={() => onChange(page - 1)}
        style={[styles.button, page <= 1 && styles.disabled]}>
        <Text style={styles.text}>上一页</Text>
      </Pressable>
      <Text style={styles.info}>
        {page}/{totalPages} · 共 {total} 条
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={page >= totalPages}
        onPress={() => onChange(page + 1)}
        style={[styles.button, page >= totalPages && styles.disabled]}>
        <Text style={styles.text}>下一页</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    color: colors.muted,
    fontSize: 12,
  },
});
