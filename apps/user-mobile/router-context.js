export const ctx = require.context(
  './app',
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)|(?:\+middleware)|(?:\+native-intent))\.[tj]sx?$)).*\.[tj]sx?$/,
  'sync',
);
