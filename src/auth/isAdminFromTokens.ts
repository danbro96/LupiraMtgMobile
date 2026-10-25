import { decodeJwt, type TokenSet } from '@danbro96/lupira-expo-oidc/oidc';

const ADMIN_GROUPS = ['mtg-admins', 'platform-admins'];

export function isAdminFromTokens(tokens: TokenSet): boolean {
  const groups = decodeJwt(tokens.idToken ?? tokens.accessToken).groups;
  return Array.isArray(groups) && groups.some(g => ADMIN_GROUPS.includes(String(g)));
}
