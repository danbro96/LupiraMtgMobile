import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/query/queryClient';
import { RootStack } from './src/navigation/RootStack';
import { useAutoUpdate } from '@danbro96/lupira-expo-diagnostics/useAutoUpdate';
import { useAuth } from './src/store/auth-store';
import { logAuth } from './src/auth/authDebug';
import { ToastHost } from '@danbro96/lupira-expo-paper/components/ToastHost';
import { ConfirmDialogHost } from '@danbro96/lupira-expo-paper/components/ConfirmDialog';
import { navDark, navLight, paperDark, paperLight } from './src/ui/theme';
import { paperSettings } from '@danbro96/lupira-expo-paper/theme/paperSettings';
import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from './src/config';
import { initSentry } from '@danbro96/lupira-expo-diagnostics/initSentry';

initSentry(SENTRY_DSN, {
  // Replays and logs stay on for this app.
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

export default Sentry.wrap(function App() {
  useAutoUpdate();
  const scheme = useColorScheme();

  useEffect(() => {
    useAuth.getState().load().catch((e: unknown) => logAuth('load-error', e instanceof Error ? e.message : String(e)));
    const stopAutoRefresh = useAuth.getState().startAutoRefresh();
    const unsubscribe = useAuth.getState().onSignOut(() => queryClient.clear());
    return () => {
      stopAutoRefresh();
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={scheme === 'dark' ? paperDark : paperLight} settings={paperSettings}>
        <QueryClientProvider client={queryClient}>
          <ConfirmDialogHost>
            <NavigationContainer theme={scheme === 'dark' ? navDark : navLight}>
              <RootStack />
            </NavigationContainer>
          </ConfirmDialogHost>
        </QueryClientProvider>
        <ToastHost />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
});
