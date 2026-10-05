import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth-store';
import { LoginScreen } from '../features/me/LoginScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { ScanSettingsScreen } from '../features/scan/ScanSettingsScreen';
import { ScanDebugLogScreen } from '../features/scan/ScanDebugLogScreen';
import { SelectionScreen } from '../features/scan/SelectionScreen';
import { PickCollectionScreen } from '../features/scan/PickCollectionScreen';
import { PrintingPickerScreen } from '../features/scan/PrintingPickerScreen';
import { CardDetailScreen } from '../features/search/CardDetailScreen';
import { PrintingDetailScreen } from '../features/search/PrintingDetailScreen';
import { CollectionDetailScreen } from '../features/collections/CollectionDetailScreen';
import { useStackScreenOptions } from '@danbro96/lupira-expo-paper/hooks/useStackScreenOptions';
import { useColors } from '../ui/theme';
import { MtgTabs } from './MtgTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth-gated: Login until signed in, then the tabs with every other screen pushed over them.
export function RootStack() {
  const c = useColors();
  const screenOptions = useStackScreenOptions();
  const loaded = useAuth(s => s.loaded);
  const authed = useAuth(s => !!s.token && !!s.user);

  if (!loaded) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {authed ? (
        <>
          <Stack.Screen name="Tabs" component={MtgTabs} options={{ headerShown: false, contentStyle: { paddingBottom: 0 } }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="ScanSettings" component={ScanSettingsScreen} options={{ title: 'Scan tuning' }} />
          <Stack.Screen name="ScanDebugLog" component={ScanDebugLogScreen} options={{ title: 'Scan debug log' }} />
          <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card' }} />
          <Stack.Screen name="PrintingDetail" component={PrintingDetailScreen} options={{ title: 'Printing' }} />
          <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} options={{ title: 'Collection' }} />
          <Stack.Screen name="Selection" component={SelectionScreen} options={{ title: 'Selection' }} />
          <Stack.Screen name="PickCollection" component={PickCollectionScreen} options={{ title: 'Commit to…', presentation: 'modal' }} />
          <Stack.Screen name="PrintingPicker" component={PrintingPickerScreen} options={{ title: 'Find card' }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
