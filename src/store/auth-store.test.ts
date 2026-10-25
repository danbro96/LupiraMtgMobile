import { beforeEach, describe, expect, it, vi } from 'vitest';

// The session mechanics are covered in @danbro96/lupira-expo-oidc; these pin what MTG adds on top.
const secure = vi.hoisted(() => new Map<string, string>());
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (k: string) => secure.get(k) ?? null),
  setItemAsync: vi.fn(async (k: string, v: string) => void secure.set(k, v)),
  deleteItemAsync: vi.fn(async (k: string) => void secure.delete(k)),
}));
vi.mock('react-native', () => ({ AppState: {} }));
vi.mock('expo-auth-session', () => ({}));
vi.mock('@sentry/react-native', () => ({ setUser: vi.fn(), captureMessage: vi.fn() }));
vi.mock('../auth/oidc', () => ({ oidc: { refreshTokens: vi.fn() } }));
vi.mock('../auth/authDebug', () => ({ logAuth: vi.fn() }));

import * as Sentry from '@sentry/react-native';
import { useAuth } from './auth-store';
import { useSelection } from './selection-store';

const jwt = (claims: Record<string, unknown>) => `x.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.x`;

const tokensFor = (email: string, groups: string[] = []) => ({
  accessToken: jwt({ email, name: 'Ann' }),
  idToken: jwt({ email, groups }),
  refreshToken: 'ref-1',
  expiresIn: 3600,
});

beforeEach(async () => {
  vi.clearAllMocks();
  secure.clear();
  await useAuth.getState().clearSession();
  useSelection.setState({ currentSelectionId: null, lastCollectionId: null });
});

describe('sign-in', () => {
  it('stores the session under the lupira.mtg keys and reads admin from the groups claim', async () => {
    await useAuth.getState().signIn(tokensFor('a@x', ['mtg-admins']));

    expect(useAuth.getState()).toMatchObject({ isAdmin: true, user: { sub: 'a@x', name: 'Ann' }, refreshToken: 'ref-1' });
    expect(secure.get('lupira.mtg.refreshToken')).toBe('ref-1');
    expect(secure.get('lupira.mtg.userSub')).toBe('a@x');
    expect(Sentry.setUser).toHaveBeenLastCalledWith({ id: 'a@x' });
  });

  it('keeps admin across a token refresh and drops it on sign-out', async () => {
    await useAuth.getState().signIn(tokensFor('a@x', ['platform-admins']));
    await useAuth.getState().setSession({ accessToken: jwt({ email: 'a@x' }), refreshToken: 'ref-2', expiresIn: 3600 });
    expect(useAuth.getState().isAdmin).toBe(true);

    await useAuth.getState().clearSession();
    expect(useAuth.getState()).toMatchObject({ isAdmin: false, token: null, user: null });
    expect(Sentry.setUser).toHaveBeenLastCalledWith(null);
  });

  it('forgets the previous account’s selection when another account signs in', async () => {
    await useAuth.getState().signIn(tokensFor('a@x'));
    await useAuth.getState().clearSession();
    useSelection.setState({ currentSelectionId: 's-1', lastCollectionId: 'c-1' });

    await useAuth.getState().signIn(tokensFor('a@x'));
    expect(useSelection.getState()).toMatchObject({ currentSelectionId: 's-1', lastCollectionId: 'c-1' });

    await useAuth.getState().clearSession();
    await useAuth.getState().signIn(tokensFor('b@x'));
    expect(useSelection.getState()).toMatchObject({ currentSelectionId: null, lastCollectionId: null });
  });
});

describe('api url', () => {
  it('persists the override and signs out, since a token is minted for one backend', async () => {
    await useAuth.getState().signIn(tokensFor('a@x'));

    await useAuth.getState().setApiUrl('http://192.168.1.2:8080');

    expect(useAuth.getState()).toMatchObject({ apiUrl: 'http://192.168.1.2:8080', authMode: 'oidc', token: null });
    expect(secure.get('lupira.mtg.apiUrl')).toBe('http://192.168.1.2:8080');
  });
});
