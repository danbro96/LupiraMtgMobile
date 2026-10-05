import { ScrollView, StyleSheet } from 'react-native';
import { List, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../store/auth-store';
import { APP_VERSION } from '../../config';
import { UPDATE_LABEL } from '@danbro96/lupira-expo-diagnostics/buildInfo';
import type { RootStackParamList } from '../../navigation/types';
import { IdentityHeader } from '@danbro96/lupira-expo-paper/components/IdentityHeader';
import { VersionLine } from '@danbro96/lupira-expo-paper/components/VersionLine';
import { spacing, useColors } from '../../ui/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuth(s => s.user);
  const mtgApiUrl = useAuth(s => s.mtgApiUrl);
  const c = useColors();

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
        title="Scan debug log"
        description="Pipeline trace (camera → crop → upload → match) and auto-capture decisions."
        descriptionNumberOfLines={3}
        onPress={() => navigation.navigate('ScanDebugLog')}
      />
      <List.Item
        title="API"
        description={mtgApiUrl}
        descriptionStyle={styles.mono}
      />

      <List.Subheader>About</List.Subheader>
      <VersionLine app="Lupira MTG" version={APP_VERSION} updateLabel={UPDATE_LABEL} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  role: { textAlign: 'center', marginBottom: spacing.sm },
  mono: { fontFamily: 'monospace' },
});
