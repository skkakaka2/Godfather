import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {DashboardScreen} from '../screens/dashboard/DashboardScreen';
import {EndorphinsScreen} from '../screens/endorphins/EndorphinsScreen';
import {LevelScreen} from '../screens/level/LevelScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {MoreScreen} from '../screens/more/MoreScreen';
import {PointsScreen} from '../screens/points/PointsScreen';
import {RedeemOrdersScreen} from '../screens/redeemOrders/RedeemOrdersScreen';
import {RewardsScreen} from '../screens/rewards/RewardsScreen';
import {TaskTemplatesScreen} from '../screens/templates/TaskTemplatesScreen';
import {TasksScreen} from '../screens/tasks/TasksScreen';
import {UsersScreen} from '../screens/users/UsersScreen';
import {useAuthStore} from '../store/authStore';
import {colors} from '../theme/theme';
import {isManagerRole} from '../utils/format';
import type {MainTabParamList, RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

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
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.background},
          headerTintColor: colors.primary,
          headerTitleStyle: {fontWeight: '800'},
        }}>
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
      initialRouteName={manager ? 'Dashboard' : 'Tasks'}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
      }}>
      {manager ? (
        <Tabs.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{title: '概览', tabBarIcon: TabIcon('概')}}
        />
      ) : null}
      <Tabs.Screen
        name="Tasks"
        component={TasksScreen}
        options={{title: '突触', tabBarIcon: TabIcon('突')}}
      />
      <Tabs.Screen
        name="Points"
        component={PointsScreen}
        options={{title: '血清素', tabBarIcon: TabIcon('血')}}
      />
      <Tabs.Screen
        name="Level"
        component={LevelScreen}
        options={{title: '等级', tabBarIcon: TabIcon('级')}}
      />
      <Tabs.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{title: '商城', tabBarIcon: TabIcon('商')}}
      />
      <Tabs.Screen
        name="More"
        component={MoreScreen}
        options={{title: '我的', tabBarIcon: TabIcon('我')}}
      />
    </Tabs.Navigator>
  );
}

function TabIcon(label: string) {
  return ({color}: {color: string}) => (
    <Text style={[styles.tabIcon, {color}]}>{label}</Text>
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
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: 16,
    fontWeight: '900',
  },
});
