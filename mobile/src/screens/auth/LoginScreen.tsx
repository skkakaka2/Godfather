import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Button, Card, Checkbox, Text, TextInput} from 'react-native-paper';

import { authApi, userApi } from '../../api';
import { message } from '../../components/MessageHost';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme/theme';

const loginBackImg = require('../../assets/login_backimg.png');

export function LoginScreen() {
  const setSession = useAuthStore(state => state.setSession);
  const setUser = useAuthStore(state => state.setUser);
  const saveCredentials = useAuthStore(state => state.saveCredentials);
  const getCredentials = useAuthStore(state => state.getCredentials);
  const clearCredentials = useAuthStore(state => state.clearCredentials);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    getCredentials().then(creds => {
      if (creds) {
        setUsername(creds.username);
        setPassword(creds.password);
        setRememberMe(true);
      }
    });
  }, [getCredentials]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async data => {
      await setSession(data);
      if (rememberMe) {
        await saveCredentials(username, password);
      } else {
        await clearCredentials();
      }
      const me = await userApi.me().catch(() => data.user);
      await setUser(me);
    },
    onError: error => {
      message.error('登录失败', error.message);
    },
  });

  return (
    <ImageBackground
      resizeMode="cover"
      source={loginBackImg}
      style={styles.page}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.page}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text style={styles.brand}>突触星球</Text>
            <Text style={styles.subtitle}>
              家庭自律系统，助力孩子成长
            </Text>
          </View>

          <Card mode="elevated">
            <Card.Content>
            <View style={styles.form}>
              <TextInput
                autoCapitalize="none"
                label="用户名"
                mode="outlined"
                onChangeText={setUsername}
                placeholder="请输入用户名"
                value={username}
              />
              <TextInput
                label="密码"
                mode="outlined"
                onChangeText={setPassword}
                placeholder="请输入密码"
                secureTextEntry
                value={password}
              />
              <Checkbox.Item
                label="记住我，下次自动登录"
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(v => !v)}
              />
              <Button
                disabled={!username || !password}
                loading={loginMutation.isPending}
                mode="contained"
                onPress={() => loginMutation.mutate({ username, password })}
              >
                登录
              </Button>
            </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  brand: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
});
