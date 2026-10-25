import { decodeJwt, type TokenSet } from '@danbro96/lupira-expo-oidc/oidc';
import type { AuthUser, Session } from '../../store/auth-store';

const ADMIN_GROUPS = ['mtg-admins', 'platform-admins'];

function isAdminFromClaims(claims: Record<string, unknown>): boolean {
  const groups = claims.groups;
  return Array.isArray(groups) && groups.some(g => ADMIN_GROUPS.includes(String(g)));
}

export function sessionFromTokens(tokens: TokenSet, now: number): { session: Session; user: AuthUser } {
  const claims = decodeJwt(tokens.idToken ?? tokens.accessToken);
  const sub =
    (claims.email as string) ?? (claims.preferred_username as string) ?? (claims.sub as string) ?? '';
  const displayName = (claims.name as string) ?? (claims.given_name as string) ?? undefined;
  return {
    session: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: now + (tokens.expiresIn ?? 3600) * 1000,
    },
    user: { sub, displayName, isAdmin: isAdminFromClaims(claims) },
  };
}
