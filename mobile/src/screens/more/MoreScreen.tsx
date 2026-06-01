import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import type {ComponentProps} from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Card, List, Text} from 'react-native-paper';

import {Screen} from '../../components/Screen';
import type {RootStackParamList} from '../../navigation/types';
import {useAuthStore} from '../../store/authStore';
import {colors, spacing} from '../../theme/theme';
import {resolveAvatarUrl} from '../../utils/avatar';
import {isManagerRole, roleLabel} from '../../utils/format';

type MoreNavigation = NativeStackNavigationProp<RootStackParamList>;
type ListRightProps = Parameters<
  NonNullable<ComponentProps<typeof List.Item>['right']>
>[0];

function renderChevron(props: ListRightProps) {
  return <List.Icon {...props} icon="chevron-right" />;
}

export function MoreScreen() {
  const navigation = useNavigation<MoreNavigation>();
  const user = useAuthStore(state => state.user);
  const clearSession = useAuthStore(state => state.clearSession);
  const manager = isManagerRole(user?.role);
  const avatarUri = resolveAvatarUrl(user?.avatar);

  return (
    <Screen title="我的" subtitle="账户、管理入口和退出登录">
      <Card>
        <Card.Content>
          <View style={styles.userRow}>
            {avatarUri ? (
              <Avatar.Image size={48} source={{uri: avatarUri}} />
            ) : (
              <Avatar.Text
                label={user?.nickname?.slice(0, 1) || user?.username?.slice(0, 1) || '家'}
                labelStyle={styles.avatarText}
                size={48}
                style={styles.avatar}
              />
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.nickname || user?.username}</Text>
              <Text style={styles.userMeta}>{roleLabel(user?.role)}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Content>
        <MenuItem label="内啡肽脉冲" onPress={() => navigation.navigate('Endorphins')} />
        {manager ? (
          <>
            <MenuItem label="活动管理" onPress={() => navigation.navigate('ActivityManage')} />
            <MenuItem label="突触模板" onPress={() => navigation.navigate('Templates')} />
            <MenuItem label="扫一扫确认" onPress={() => navigation.navigate('RedeemScan')} />
            <MenuItem label="居民管理" onPress={() => navigation.navigate('Users')} />
          </>
        ) : null}
        <MenuItem label="设置" onPress={() => navigation.navigate('Settings')} />
        <MenuItem
          danger
          label="退出登录"
          onPress={() => {
            clearSession();
          }}
        />
        </Card.Content>
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
    <List.Item
      onPress={onPress}
      right={renderChevron}
      title={label}
      titleStyle={[styles.menuText, danger && styles.dangerText]}
    />
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    backgroundColor: colors.primarySoft,
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
  menuText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerText: {
    color: colors.danger,
  },
});
