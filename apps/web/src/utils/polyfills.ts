// 1. Core Globals (Already handled in index.ts)

// 2. Library Shims (using require to avoid hoisting)
require('react-native-get-random-values');
require('fast-text-encoding');
require('@ethersproject/shims');

// 3. Additional Runtime Fixes
if (typeof global.setImmediate === 'undefined') {
  // @ts-ignore
  global.setImmediate = (fn) => setTimeout(fn, 0);
}

// 4. Robust Promisify Shim
const util = require('util');
if (util && util.promisify) {
  const originalPromisify = util.promisify;
  util.promisify = (fn: any) => {
    if (typeof fn !== 'function') {
      console.log('[PROMISIFY SHIM] Intercepted non-function:', typeof fn);
      return async () => { throw new Error(`x402: Missing Node function.`); };
    }
    try {
      return originalPromisify(fn);
    } catch (e) {
      console.log('[PROMISIFY SHIM] Original failed for:', fn?.name || 'anonymous');
      throw e;
    }
  };
}

// 5. Zlib Exports
const zlib = require('browserify-zlib');
if (zlib) {
  if (!zlib.inflateRaw) zlib.inflateRaw = (_data: any, cb: any) => cb(new Error('zlib.inflateRaw not supported'));
  if (!zlib.deflateRaw) zlib.deflateRaw = (_data: any, cb: any) => cb(new Error('zlib.deflateRaw not supported'));
}
