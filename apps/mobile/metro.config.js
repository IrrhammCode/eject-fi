const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolverMainFields = ['browser', 'main', 'module'];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve('buffer/'),
  util: require.resolve('util/'),
  zlib: require.resolve('browserify-zlib'),
  stream: require.resolve('stream-browserify'),
  path: require.resolve('path-browserify'),
  events: require.resolve('events/'),
  process: require.resolve('process/browser'),
  crypto: require.resolve('crypto-browserify'),
  vm: require.resolve('vm-browserify'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  url: require.resolve('url/'),
  os: require.resolve('os-browserify/browser'),
  tty: require.resolve('tty-browserify'),
  console: require.resolve('console-browserify'),
  assert: require.resolve('assert/'),
  '@noble/hashes/crypto': require.resolve('@noble/hashes/crypto'),
};

module.exports = config;
