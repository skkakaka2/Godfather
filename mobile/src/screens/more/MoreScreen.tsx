import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Card} from '../../components/Card';
import {Screen} from '../../components/Screen';
import type {RootStackParamList} from '../../navigation/types';
import {useAuthStore} from '../../store/authStore';
import {colors, spacing} from '../../theme/theme';
import {isManagerRole, roleLabel} from '../../utils/format';

type MoreNavigation = NativeStackNavigationProp<RootStackParamList>;

export function MoreScreen() {
  const navigation = useNavigation<MoreNavigation>();
  const user = useAuthStore(state => state.user);
  const clearSession = useAuthStore(state => state.clearSession);
  const manager = isManagerRole(user?.role);

  return (
    <Screen title="我的" subtitle="账户、管理入口和退出登录">
      <Card>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.nickname?.slice(0, 1) || user?.username?.slice(0, 1) || '家'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nickname || user?.username}</Text>
            <Text style={styles.userMeta}>{roleLabel(user?.role)}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <MenuItem label="内啡肽脉冲" onPress={() => navigation.navigate('Endorphins')} />
        {manager ? (
          <>
            <MenuItem label="突触模板" onPress={() => navigation.navigate('Templates')} />
            <MenuItem label="激发审批" onPress={() => navigation.navigate('RedeemOrders')} />
            <MenuItem label="居民管理" onPress={() => navigation.navigate('Users')} />
          </>
        ) : null}
        <MenuItem
          danger
          label="退出登录"
          onPress={() => {
            clearSession();
          }}
        />
      </Card>
    </Screen>
  );
}

function MenuItem({
  label,
  onPress,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Text style={[styles.menuText, danger && styles.dangerText]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  userMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  menuText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerText: {
    color: colors.danger,
  },
  chevron: {
    color: colors.muted,
    fontSize: 24,
  },
});
