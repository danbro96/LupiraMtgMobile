import { describe, expect, it } from 'vitest';
import { isAdminFromTokens } from './isAdminFromTokens';

const jwt = (claims: Record<string, unknown>) => `h.${btoa(JSON.stringify(claims))}.s`;

describe('isAdminFromTokens', () => {
  it('reads the groups from the id token before the access token', () => {
    expect(isAdminFromTokens({ accessToken: jwt({ groups: ['users'] }), idToken: jwt({ groups: ['mtg-admins'] }) })).toBe(true);
  });

  it('falls back to the access token', () => {
    expect(isAdminFromTokens({ accessToken: jwt({ groups: ['users'] }) })).toBe(false);
  });

  it('grants admin for platform-admins', () => {
    expect(isAdminFromTokens({ accessToken: jwt({ groups: ['platform-admins'] }) })).toBe(true);
  });

  it('is not admin without a groups claim', () => {
    expect(isAdminFromTokens({ accessToken: jwt({ sub: 'id-1' }) })).toBe(false);
  });
});
