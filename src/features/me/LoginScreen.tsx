import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../store/auth-store';
import { OIDC_REDIRECT_PATH, OIDC_SCHEME, OIDC_SCOPES } from '../../auth/oidcConfig';
import type { TokenSet } from '@danbro96/lupira-expo-oidc/oidc';
import { useOidcLogin } from '@danbro96/lupira-expo-oidc/useOidcLogin';
import { oidc } from '../../auth/oidc';
import { logAuth } from '../../auth/authDebug';
import { Button } from '@danbro96/lupira-expo-paper/components/Button';
import { TextField } from '@danbro96/lupira-expo-paper/components/TextField';
import { toastError } from '@danbro96/lupira-expo-feedback/toast';
import { radii, spacing, useColors, type Palette } from '../../ui/theme';
import { ICONS } from '../../ui/icons';

// Lets the auth redirect dismiss the in-app browser and resolve the pending session.
WebBrowser.maybeCompleteAuthSession();

async function storeSession(tokens: TokenSet) {
  await useAuth.getState().signIn(tokens);
  logAuth('setSession', 'authed=true');
}

export function LoginScreen() {
  const apiUrl = useAuth(s => s.apiUrl);
  const setApiUrl = useAuth(s => s.setApiUrl);

  const { status, error, retry, signIn, redirectUri } = useOidcLogin({
    oidc,
    scopes: OIDC_SCOPES,
    scheme: OIDC_SCHEME,
    path: OIDC_REDIRECT_PATH,
    onTokens: storeSession,
    log: logAuth,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiInput, setApiInput] = useState(apiUrl);
  const [savingApi, setSavingApi] = useState(false);
  const apiDirty = apiInput.trim() !== apiUrl;
  const c = useColors();
  const styles = makeStyles(c);

  const onSignIn = () => {
    signIn().catch((e: unknown) => logAuth('signIn:error', e instanceof Error ? e.message : String(e)));
  };

  const onSaveApi = async () => {
    const url = apiInput.trim();
    if (!url) {
      toastError('API URL required.');
      return;
    }
    setSavingApi(true);
    await setApiUrl(url).finally(() => setSavingApi(false));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <MaterialIcons name={ICONS.layers} size={52} color={c.onPrimary} />
        </View>
        <Text variant="headlineSmall">Lupira MTG</Text>
        <Text style={styles.subtitle}>Sign in with your Lupira account to reach your collections.</Text>

        <Button
          title="Sign in with Authentik"
          onPress={onSignIn}
          disabled={status !== 'ready' || apiDirty}
          loading={status === 'busy'}
          style={styles.button}
          contentStyle={styles.buttonContent}
        />

        {apiDirty ? <Text style={styles.hint}>Save the API URL first, then sign in.</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {status === 'unavailable' ? <Button title="Retry" variant="text" onPress={retry} /> : null}

        <Button
          title={showAdvanced ? 'Hide advanced' : 'Advanced'}
          variant="text"
          onPress={() => setShowAdvanced(v => !v)}
          style={styles.advancedToggle}
        />

        {showAdvanced ? (
          <View style={styles.formGroup}>
            <TextField
              label="API base URL"
              value={apiInput}
              onChangeText={setApiInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://mtg-api.lupira.com"
            />
            <Text style={styles.hint}>Override for dev (e.g. http://192.168.x.x:8080).</Text>
            <Button
              title="Save API URL"
              variant="secondary"
              onPress={() => void onSaveApi()}
              disabled={!apiDirty}
              loading={savingApi}
            />
            <Text style={styles.hint}>redirect: {redirectUri}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    logo: {
      width: 96,
      height: 96,
      borderRadius: radii.lg + 8,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    subtitle: { marginTop: spacing.sm, marginBottom: 28, fontSize: 15, color: c.textMuted, textAlign: 'center' },
    button: { width: '100%', maxWidth: 360, borderRadius: radii.round },
    buttonContent: { paddingVertical: 8 },
    error: { marginTop: spacing.lg, color: c.danger, textAlign: 'center' },
    hint: { marginTop: spacing.md, fontSize: 11, color: c.textDisabled },
    advancedToggle: { marginTop: spacing.lg },
    formGroup: { width: '100%', maxWidth: 360, gap: spacing.sm },
  });
