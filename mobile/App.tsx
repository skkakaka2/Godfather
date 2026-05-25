import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import type {ComponentProps} from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MessageHost } from './src/components/MessageHost';
import { AppNavigator } from './src/navigation/AppNavigator';
import { paperTheme } from './src/theme/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

type PaperIconProps = Parameters<
  NonNullable<NonNullable<ComponentProps<typeof PaperProvider>['settings']>['icon']>
>[0];

function renderPaperIcon({
  color,
  name,
  size,
}: PaperIconProps) {
  return <MaterialDesignIcons color={color ?? paperTheme.colors.onSurface} name={name as never} size={size} />;
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider
            theme={paperTheme}
            settings={{
              icon: renderPaperIcon,
            }}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={paperTheme.colors.background}
            />
            <AppNavigator />
            <MessageHost />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
});

export default App;
