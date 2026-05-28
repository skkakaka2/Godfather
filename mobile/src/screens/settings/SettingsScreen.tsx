import { useMutation } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import {
  Avatar,
  Button,
  Card,
  List,
  Text,
  TextInput,
} from 'react-native-paper';

import { fileApi, userApi } from '../../api';
import { message } from '../../components/MessageHost';
import { Screen } from '../../components/Screen';
import { API_BASE_URL } from '../../config/env';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme/theme';
import { resolveAvatarUrl } from '../../utils/avatar';
import { roleLabel } from '../../utils/format';

type ListLeftProps = Parameters<
  NonNullable<ComponentProps<typeof List.Item>['left']>
>[0];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '请稍后重试';
}

function renderAppIcon(props: ListLeftProps) {
  return <List.Icon {...props} icon="orbit" />;
}

function renderAccountIcon(props: ListLeftProps) {
  return <List.Icon {...props} icon="account-circle-outline" />;
}

function renderServerIcon(props: ListLeftProps) {
  return <List.Icon {...props} icon="server-network" />;
}

export function SettingsScreen() {
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const getCredentials = useAuthStore(state => state.getCredentials);
  const saveCredentials = useAuthStore(state => state.saveCredentials);
  const clearCredentials = useAuthStore(state => state.clearCredentials);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clearingCredentials, setClearingCredentials] = useState(false);

  useEffect(() => {
    setNickname(user?.nickname ?? '');
  }, [user?.nickname]);

  const profileMutation = useMutation({
    mutationFn: (payload: { nickname: string; avatar?: string }) => {
      if (!user) {
        throw new Error('当前登录信息已失效');
      }

      return userApi.updateUser(user.id, {
        avatar: payload.avatar,
        nickname: payload.nickname,
        role: user.role,
      });
    },
    onSuccess: async updatedUser => {
      setNickname(updatedUser.nickname);
      await setUser(updatedUser);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (asset: Asset) => {
      if (!user) {
        throw new Error('当前登录信息已失效');
      }
      if (!asset.uri) {
        throw new Error('未读取到头像图片');
      }

      const extension = asset.type?.split('/')[1] ?? 'jpg';
      const uploaded = await fileApi.uploadImage({
        name: asset.fileName ?? `avatar-${Date.now()}.${extension}`,
        type: asset.type ?? 'image/jpeg',
        uri: asset.uri,
      });

      return userApi.updateUser(user.id, {
        avatar: uploaded.url,
        nickname: user.nickname,
        role: user.role,
      });
    },
    onError: error => {
      message.error('头像更新失败', getErrorMessage(error));
    },
    onSuccess: async updatedUser => {
      setNickname(updatedUser.nickname);
      await setUser(updatedUser);
      message.success('头像已更新');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onError: error => {
      message.error('修改失败', getErrorMessage(error));
    },
    onSuccess: async (_, variables) => {
      let credentialSyncFailed = false;
      try {
        const saved = await getCredentials();
        if (saved && saved.username === user?.username) {
          await saveCredentials(saved.username, variables.newPassword);
        }
      } catch {
        credentialSyncFailed = true;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      message.success(
        '密码已更新',
        credentialSyncFailed
          ? '保存的登录信息未同步，请下次手动登录'
          : undefined,
      );
    },
  });

  const avatarUri = resolveAvatarUrl(user?.avatar);
  const avatarLabel =
    user?.nickname?.slice(0, 1) || user?.username?.slice(0, 1) || '家';
  const trimmedNickname = nickname.trim();

  const pickAvatar = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return;
    }
    if (result.errorMessage) {
      message.error('选择头像失败', result.errorMessage);
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      message.error('选择头像失败', '未读取到头像图片');
      return;
    }

    avatarMutation.mutate(asset);
  };

  const saveProfile = () => {
    if (!trimmedNickname) {
      message.error('保存失败', '昵称不能为空');
      return;
    }

    profileMutation.mutate(
      { nickname: trimmedNickname },
      {
        onError: error => {
          message.error('保存失败', getErrorMessage(error));
        },
        onSuccess: () => {
          message.success('个人资料已更新');
        },
      },
    );
  };

  const submitPassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error('修改失败', '请填写完整密码信息');
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 32) {
      message.error('修改失败', '新密码长度需为 6-32 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error('修改失败', '两次输入的新密码不一致');
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const clearSavedCredentials = async () => {
    setClearingCredentials(true);
    try {
      await clearCredentials();
      message.success('已清除保存的登录信息');
    } catch (error) {
      message.error('清除失败', getErrorMessage(error));
    } finally {
      setClearingCredentials(false);
    }
  };

  if (!user) {
    return (
      <Screen title="设置" subtitle="账户设置和登录偏好">
        <Card mode="outlined">
          <Card.Content>
            <Text style={styles.emptyText}>
              当前登录信息已失效，请重新登录。
            </Text>
          </Card.Content>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen subtitle="头像、密码和登录偏好">
      <Card mode="outlined">
        <Card.Title title="个人资料" subtitle="头像和显示名称" />
        <Card.Content>
          <View style={styles.section}>
            <View style={styles.profileRow}>
              {avatarUri ? (
                <Avatar.Image size={64} source={{ uri: avatarUri }} />
              ) : (
                <Avatar.Text
                  label={avatarLabel}
                  labelStyle={styles.avatarText}
                  size={64}
                  style={styles.avatar}
                />
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {user.nickname || user.username}
                </Text>
                <Text style={styles.userMeta}>
                  {user.username} · {roleLabel(user.role)}
                </Text>
              </View>
            </View>

            <Button
              icon="image-edit-outline"
              loading={avatarMutation.isPending}
              mode="contained-tonal"
              onPress={pickAvatar}
            >
              更换头像
            </Button>

            <TextInput
              label="昵称"
              mode="outlined"
              onChangeText={setNickname}
              value={nickname}
            />
            <Button
              disabled={!trimmedNickname || profileMutation.isPending}
              icon="content-save-outline"
              loading={profileMutation.isPending}
              mode="contained"
              onPress={saveProfile}
            >
              保存资料
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Title title="账号安全" subtitle="修改登录密码" />
        <Card.Content>
          <View style={styles.section}>
            <TextInput
              label="当前密码"
              mode="outlined"
              onChangeText={setCurrentPassword}
              secureTextEntry
              value={currentPassword}
            />
            <TextInput
              label="新密码"
              mode="outlined"
              onChangeText={setNewPassword}
              secureTextEntry
              value={newPassword}
            />
            <TextInput
              label="确认新密码"
              mode="outlined"
              onChangeText={setConfirmPassword}
              secureTextEntry
              value={confirmPassword}
            />
            <Button
              disabled={passwordMutation.isPending}
              icon="lock-reset"
              loading={passwordMutation.isPending}
              mode="contained"
              onPress={submitPassword}
            >
              修改密码
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Title title="登录偏好" subtitle="管理本机保存的登录信息" />
        <Card.Content>
          <View style={styles.section}>
            <Text style={styles.helpText}>
              清除后不会退出当前账号，只会取消下次自动填充和自动登录。
            </Text>
            <Button
              icon="key-remove"
              loading={clearingCredentials}
              mode="outlined"
              onPress={clearSavedCredentials}
              textColor={colors.danger}
            >
              清除已保存登录信息
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined">
        <Card.Title title="关于应用" subtitle="当前运行信息" />
        <Card.Content>
          <List.Item
            title="突触星球"
            description="家庭自律系统"
            left={renderAppIcon}
          />
          <List.Item
            title="当前账号"
            description={user.username}
            left={renderAccountIcon}
          />
          <List.Item
            title="运行环境"
            description={`${
              __DEV__ ? '开发环境' : '生产环境'
            } · ${API_BASE_URL}`}
            left={renderServerIcon}
          />
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  avatar: {
    backgroundColor: colors.primarySoft,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
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
  helpText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
