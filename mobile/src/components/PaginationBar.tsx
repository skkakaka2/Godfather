import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

import {colors, spacing} from '../theme/theme';

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
      <Button
        disabled={page <= 1}
        mode="outlined"
        onPress={() => onChange(page - 1)}
        compact>
        上一页
      </Button>
      <Text style={styles.info}>
        {page}/{totalPages} · 共 {total} 条
      </Text>
      <Button
        disabled={page >= totalPages}
        mode="outlined"
        onPress={() => onChange(page + 1)}
        compact>
        下一页
      </Button>
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
  info: {
    color: colors.muted,
    fontSize: 12,
  },
});
