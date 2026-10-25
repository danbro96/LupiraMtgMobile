import { describe, expect, it } from 'vitest';
import { sessionFromTokens } from './sessionFromTokens';

const jwt = (claims: Record<string, unknown>) => `h.${btoa(JSON.stringify(claims))}.s`;

describe('sessionFromTokens', () => {
  it('reads the user from the id token and expires from expiresIn', () => {
    const { session, user } = sessionFromTokens(
      {
        accessToken: jwt({ email: 'access@x' }),
        idToken: jwt({ email: 'a@x', name: 'Ann', groups: ['mtg-admins'] }),
        refreshToken: 'r',
        expiresIn: 60,
      },
      1000,
    );
    expect(session).toEqual({ accessToken: expect.any(String), refreshToken: 'r', expiresAt: 61_000 });
    expect(user).toEqual({ sub: 'a@x', displayName: 'Ann', isAdmin: true });
  });

  it('falls back to the access token, preferred_username and given_name', () => {
    const { user } = sessionFromTokens(
      { accessToken: jwt({ preferred_username: 'ann', given_name: 'A', groups: ['users'] }) },
      0,
    );
    expect(user).toEqual({ sub: 'ann', displayName: 'A', isAdmin: false });
  });

  it('uses sub, an hour lifetime and no admin when claims are sparse', () => {
    const { session, user } = sessionFromTokens({ accessToken: jwt({ sub: 'id-1' }) }, 0);
    expect(session.expiresAt).toBe(3_600_000);
    expect(user).toEqual({ sub: 'id-1', displayName: undefined, isAdmin: false });
  });

  it('grants admin for platform-admins', () => {
    expect(sessionFromTokens({ accessToken: jwt({ groups: ['platform-admins'] }) }, 0).user.isAdmin).toBe(true);
  });
});
