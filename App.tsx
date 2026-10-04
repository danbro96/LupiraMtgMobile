import { useEffect, useState } from 'react';
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
import { ToastHost } from '@danbro96/lupira-expo-paper/components/ToastHost';
import { ConfirmDialogHost } from '@danbro96/lupira-expo-paper/components/ConfirmDialog';
import { navDark, navLight, paperDark, paperLight } from './src/ui/theme';
import { paperSettings } from '@danbro96/lupira-expo-paper/theme/paperSettings';
import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from './src/config';
import { UPDATE_CHANNEL, UPDATE_ID } from '@danbro96/lupira-expo-diagnostics/buildInfo';

Sentry.init({
  dsn: SENTRY_DSN,

  // Attaches IP address, cookies and user to every event.
  sendDefaultPii: true,

  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});
Sentry.setTag('update_id', UPDATE_ID ?? 'none');
Sentry.setTag('update_channel', UPDATE_CHANNEL ?? 'none');

export default Sentry.wrap(function App() {
  useAutoUpdate();
  const [ready, setReady] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    void (async () => {
      await useAuth.getState().load();
      // Renew a still-valid-but-near-expiry token before the first request; a transient failure
      // keeps the session (the mutator's 401 path is the reactive safety net).
      await useAuth.getState().refreshIfNeeded();
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

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
