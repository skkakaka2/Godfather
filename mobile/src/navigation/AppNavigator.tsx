import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {NavigationContainer} from '@react-navigation/native';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Appbar, BottomNavigation, Text} from 'react-native-paper';

import {EndorphinsScreen} from '../screens/endorphins/EndorphinsScreen';
import {ActivityDetailScreen} from '../screens/activity/ActivityDetailScreen';
import {ActivityManageScreen} from '../screens/activity/ActivityManageScreen';
import {LevelScreen} from '../screens/level/LevelScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {MoreScreen} from '../screens/more/MoreScreen';
import {PointsScreen} from '../screens/points/PointsScreen';
import {RedeemOrdersScreen} from '../screens/redeemOrders/RedeemOrdersScreen';
import {RewardsScreen} from '../screens/rewards/RewardsScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {TaskTemplatesScreen} from '../screens/templates/TaskTemplatesScreen';
import {TasksScreen} from '../screens/tasks/TasksScreen';
import {UsersScreen} from '../screens/users/UsersScreen';
import {WelcomeScreen} from '../screens/welcome/WelcomeScreen';
import {useAuthStore} from '../store/authStore';
import {colors, paperTheme} from '../theme/theme';
import {isManagerRole} from '../utils/format';
import type {MainTabParamList, RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navigationTheme = {
  dark: false,
  colors: {
    background: paperTheme.colors.background,
    border: paperTheme.colors.outline,
    card: paperTheme.colors.surface,
    notification: paperTheme.colors.primary,
    primary: paperTheme.colors.primary,
    text: paperTheme.colors.onSurface,
  },
  fonts: {
    bold: {fontFamily: 'System', fontWeight: '700' as const},
    heavy: {fontFamily: 'System', fontWeight: '800' as const},
    medium: {fontFamily: 'System', fontWeight: '600' as const},
    regular: {fontFamily: 'System', fontWeight: '400' as const},
  },
};

const tabIcons: Record<keyof MainTabParamList, string> = {
  Welcome: 'star-four-points-outline',
  Tasks: 'check-circle-outline',
  Points: 'chart-timeline-variant',
  Level: 'medal-outline',
  Rewards: 'gift-outline',
  More: 'account-circle-outline',
};

const stackScreenOptions = {
  header: (props: NativeStackHeaderProps) => <PaperStackHeader {...props} />,
};

function renderPaperTabBar(props: BottomTabBarProps) {
  return <PaperTabBar {...props} />;
}

export function AppNavigator() {
  const hydrated = useAuthStore(state => state.hydrated);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const restoreSession = useAuthStore(state => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>正在载入家庭数据</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Templates"
              component={TaskTemplatesScreen}
              options={{title: '突触模板'}}
            />
            <Stack.Screen
              name="Endorphins"
              component={EndorphinsScreen}
              options={{title: '内啡肽脉冲'}}
            />
            <Stack.Screen
              name="RedeemOrders"
              component={RedeemOrdersScreen}
              options={{title: '激发审批'}}
            />
            <Stack.Screen
              name="Users"
              component={UsersScreen}
              options={{title: '居民管理'}}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{title: '设置'}}
            />
            <Stack.Screen
              name="ActivityDetail"
              component={ActivityDetailScreen}
              options={{title: '活动详情'}}
            />
            <Stack.Screen
              name="ActivityManage"
              component={ActivityManageScreen}
              options={{title: '活动管理'}}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  const user = useAuthStore(state => state.user);
  const manager = isManagerRole(user?.role);

  return (
    <Tabs.Navigator
      initialRouteName={manager ? 'Tasks' : 'Welcome'}
      screenOptions={{
        headerShown: false,
      }}
      tabBar={renderPaperTabBar}>
      {!manager ? (
        <Tabs.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{title: '欢迎'}}
        />
      ) : null}
      <Tabs.Screen
        name="Tasks"
        component={TasksScreen}
        options={{title: '突触'}}
      />
      <Tabs.Screen
        name="Points"
        component={PointsScreen}
        options={{title: '血清素'}}
      />
      <Tabs.Screen
        name="Level"
        component={LevelScreen}
        options={{title: '等级'}}
      />
      <Tabs.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{title: '商城'}}
      />
      <Tabs.Screen
        name="More"
        component={MoreScreen}
        options={{title: '我的'}}
      />
    </Tabs.Navigator>
  );
}

function PaperStackHeader({
  back,
  navigation,
  options,
  route,
}: NativeStackHeaderProps) {
  const title = options.title ?? route.name;

  return (
    <Appbar.Header elevated mode="small">
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} titleStyle={styles.headerTitle} />
    </Appbar.Header>
  );
}

function PaperTabBar({descriptors, insets, navigation, state}: BottomTabBarProps) {
  const routes = state.routes.map(route => {
    const options = descriptors[route.key].options;
    return {
      key: route.key,
      title: options.title ?? route.name,
      focusedIcon: tabIcons[route.name as keyof MainTabParamList],
      routeName: route.name,
    };
  });

  return (
    <BottomNavigation.Bar
      activeColor={colors.primary}
      inactiveColor={colors.muted}
      labeled
      navigationState={{index: state.index, routes}}
      onTabPress={({route, preventDefault}) => {
        const event = navigation.emit({
          canPreventDefault: true,
          target: route.key,
          type: 'tabPress',
        });

        if (event.defaultPrevented) {
          preventDefault();
          return;
        }

        navigation.navigate(route.routeName);
      }}
      renderIcon={({color, route}) => (
        <MaterialDesignIcons color={color} name={route.focusedIcon as never} size={24} />
      )}
      safeAreaInsets={insets}
      style={styles.tabBar}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
  },
  tabBar: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  headerTitle: {
    fontWeight: '800',
  },
});
