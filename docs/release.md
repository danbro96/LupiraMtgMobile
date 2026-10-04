# Lupira MTG — release & distribution

EAS build → Play Console internal testing. Package `com.lupira.mtg`, project
`danbro96/lupiramtg`; EAS owns the upload key, Play signs.

## Versioning

- `eas.json`: `appVersionSource: remote` + `production.autoIncrement` — EAS owns `versionCode`.
- `expo.version` in `app.json` is the only human version (`package.json` stays `0.0.0`).
- Settings shows `<version> · dev | embedded | OTA <id>`; Sentry events carry `update_id` and
  `update_channel` tags.

## Native release

Push to `release/android` (`.github/workflows/mobile-release.yml`): typecheck + tests → `eas build
--profile production --auto-submit` to the Play internal track → tag
`android/v<version>+<versionCode>`.

```bash
git push origin main:release/android
```

Needs an `EXPO_TOKEN` repo secret and the Play service-account key linked in EAS credentials.
The first release is manual (Play's API cannot create it): upload the AAB from
`eas build --profile production --platform android`, add testers, share the opt-in link.

Sideloadable APK: `eas build --profile preview --platform android`.

## OTA update (JS-only)

Run the **mobile-ota** workflow (branch `production` or `preview`, plus a message): typecheck +
tests, `expo export --source-maps`, `eas update`, then the source maps go to Sentry (needs a
`SENTRY_AUTH_TOKEN` repo secret). Running apps check on launch and on foreground (max once per
5 min) and reload immediately (`useAutoUpdate`). A native change alters the fingerprint and needs
a native release instead.
