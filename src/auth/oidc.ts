import { createOidcClient } from '@danbro96/lupira-expo-oidc/oidc';
import { OIDC_CLIENT_ID, OIDC_ISSUER } from './oidcConfig';
import { REQUEST_TIMEOUT_MS } from '../config';
import { logAuth } from './authDebug';

export const oidc = createOidcClient({ issuer: OIDC_ISSUER, clientId: OIDC_CLIENT_ID, timeoutMs: REQUEST_TIMEOUT_MS, log: logAuth });
