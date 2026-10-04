import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const to = (...types) => types.map((t) => ({ to: { element: { type: t } } }));
const toFile = (...categories) => categories.map((c) => ({ to: { file: { categories: c } } }));
const platform = (source) => ({ to: { module: { origin: 'external', source } } });
const fromEach = (types, allow) => types.map((t) => ({ from: { element: { type: t } }, allow }));

// Downward-only imports: features import no other feature; only navigation and App compose them.
export default [
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'src/api/generated/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '*.config.mts',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}', 'App.tsx', 'index.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { boundaries, 'react-hooks': reactHooks },
    settings: {
      'boundaries/elements': [
        { type: 'generated', pattern: 'src/api/generated/**' },
        { type: 'api', pattern: 'src/api/**' },
        { type: 'observability', pattern: 'src/observability/**' },
        { type: 'auth', pattern: 'src/auth/**' },
        { type: 'store', pattern: 'src/store/**' },
        { type: 'query', pattern: 'src/query/**' },
        { type: 'ui', pattern: 'src/ui/**' },
        { type: 'navigation', pattern: 'src/navigation/**' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
      ],
      'boundaries/files': [
        { category: 'config', pattern: 'src/config.ts' },
        { category: 'routes', pattern: 'src/navigation/types.ts' },
        { category: 'app', pattern: ['App.tsx', 'index.ts'] },
      ],
      'import/resolver': { typescript: { alwaysTryTypes: true } },
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        policies: [
          { from: { element: { type: 'generated' } }, allow: to('generated', 'api') },
          { from: { element: { type: 'api' } }, allow: to('api', 'generated', 'store', 'observability') },
          { from: { file: { categories: 'config' } }, allow: [] },
          { from: { element: { type: 'observability' } }, allow: to('observability') },
          { from: { element: { type: 'auth' } }, allow: [...to('auth', 'observability'), ...toFile('config')] },
          { from: { element: { type: 'store' } }, allow: [...to('store', 'auth', 'observability'), ...toFile('config')] },
          { from: { element: { type: 'query' } }, allow: to('query') },
          { from: { element: { type: 'ui' } }, allow: [...to('ui', 'observability'), ...toFile('config')] },
          {
            from: { element: { type: 'feature' } },
            allow: [
              { to: { element: { type: 'feature', captured: { feature: '{{ from.element.captured.feature }}' } } } },
              ...to('api', 'generated', 'auth', 'store', 'query', 'ui', 'observability'),
              ...toFile('config', 'routes'),
            ],
          },
          {
            from: { element: { type: 'navigation' } },
            allow: [...to('navigation', 'feature', 'store', 'ui', 'observability'), ...toFile('config')],
          },
          {
            from: { file: { categories: 'app' } },
            allow: [
              ...to('navigation', 'feature', 'api', 'auth', 'store', 'query', 'ui', 'observability'),
              ...toFile('app', 'config'),
            ],
          },
          { allow: [{ to: { module: { origin: ['external', 'core'] } } }] },
          { disallow: [platform('@danbro96/*')] },
          { allow: [platform('@danbro96/lupira-tokens-*')] },
          ...fromEach(['api', 'feature', 'navigation'], [platform('@danbro96/lupira-http')]),
          ...fromEach(['auth', 'store', 'feature'], [platform('@danbro96/lupira-expo-oidc')]),
          ...fromEach(['ui', 'feature', 'navigation'], [
            platform(['@danbro96/lupira-expo-paper', '@danbro96/lupira-expo-feedback', '@danbro96/lupira-expo-diagnostics']),
          ]),
          {
            from: { file: { categories: 'app' } },
            allow: [platform(['@danbro96/lupira-http', '@danbro96/lupira-expo-oidc', '@danbro96/lupira-expo-paper', '@danbro96/lupira-expo-feedback', '@danbro96/lupira-expo-diagnostics'])],
          },
        ],
        checkAllOrigins: true,
      }],
      ...reactHooks.configs['recommended-latest'].rules,
    },
  },
];
