import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, Switch, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../store/auth-store';
import { usePrefs } from '../../store/prefs-store';
import type { RootStackParamList } from '../../navigation/types';
import { IdentityHeader } from '@danbro96/lupira-expo-paper/components/IdentityHeader';
import { VersionLine } from '@danbro96/lupira-expo-diagnostics/VersionLine';
import { spacing, useColors } from '../../ui/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuth(s => s.user);
  const mtgApiUrl = useAuth(s => s.mtgApiUrl);
  const prefs = usePrefs();
  const c = useColors();

  useEffect(() => {
    if (!prefs.loaded) void prefs.load();
  }, [prefs]);

  return (
    <ScrollView>
      <IdentityHeader name={user?.displayName ?? user?.sub ?? 'Not signed in'} sub={user?.displayName ? user.sub : undefined} />
      {user?.isAdmin ? <Text variant="labelMedium" style={[styles.role, { color: c.primary }]}>Admin</Text> : null}

      <List.Subheader>Scanning</List.Subheader>
      <List.Item
        title="Scan tuning"
        description="Auto-capture threshold, score weights, JPEG quality, debug overlay."
        descriptionNumberOfLines={3}
        onPress={() => navigation.navigate('ScanSettings')}
      />

      <List.Subheader>Developer</List.Subheader>
      <List.Item
        title="Enable debug"
        description="Developer tools and the scan debug log"
        right={() => (
          <Switch
            value={prefs.debugEnabled}
            onValueChange={v => void usePrefs.getState().setDebugEnabled(v)}
            accessibilityLabel="Enable debug"
          />
        )}
      />
      {prefs.debugEnabled && (
        <>
          <List.Item
            title="Scan debug log"
            description="Pipeline trace (camera → crop → upload → match) and auto-capture decisions."
            descriptionNumberOfLines={3}
            onPress={() => navigation.navigate('ScanDebugLog')}
          />
          <List.Item title="API" description={mtgApiUrl} descriptionStyle={styles.mono} />
        </>
      )}

      <List.Subheader>About</List.Subheader>
      <VersionLine />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  role: { textAlign: 'center', marginBottom: spacing.sm },
  mono: { fontFamily: 'monospace' },
});
