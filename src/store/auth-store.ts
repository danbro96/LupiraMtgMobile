import * as Sentry from '@sentry/react-native';
import { createAuthStore } from '@danbro96/lupira-expo-oidc/authStore';
import type { TokenSet } from '@danbro96/lupira-expo-oidc/oidc';
import { DEFAULT_MTG_API_URL } from '../config';
import { oidc } from '../auth/oidc';
import { logAuth } from '../auth/authDebug';
import { isAdminFromTokens } from '../auth/isAdminFromTokens';
import { useSelection } from './selection-store';

interface MtgAuth {
  /** From the sign-in's `groups` claim; in memory only (re-read each login). */
  isAdmin: boolean;
  signIn(tokens: TokenSet): Promise<void>;
  setApiUrl(apiUrl: string): Promise<void>;
}

export const useAuth = createAuthStore<MtgAuth>({
  keyPrefix: 'lupira.mtg',
  defaultApiUrl: DEFAULT_MTG_API_URL,
  defaultAuthMode: 'oidc',
  oidc,
  log: logAuth,
  onAccountChange: async () => {
    await Promise.all([useSelection.getState().setCurrent(null), useSelection.getState().setLastCollection(null)]);
  },
  beforeSignOut: reason => {
    if (reason === 'expired') logAuth('logout', 'session expired/revoked');
    useAuth.setState({ isAdmin: false });
  },
  onDefinitiveFailure: e => Sentry.captureMessage(`auth: definitive refresh failure — ${e.message}`, 'warning'),
  extend: (set, get) => ({
    isAdmin: false,
    async signIn(tokens) {
      await get().setSession(tokens);
      set({ isAdmin: isAdminFromTokens(tokens) });
    },
    setApiUrl: apiUrl => get().setBackend({ api: apiUrl }, 'oidc'),
  }),
});

useAuth.subscribe((s, prev) => {
  if (s.user?.sub !== prev.user?.sub) Sentry.setUser(s.user ? { id: s.user.sub } : null);
});
