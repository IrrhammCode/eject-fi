// polyfills.js - HARUS DIMUAT PERTAMA KALI SEBELUM YANG LAIN

// --- ERROR TRACER ---
if (global.ErrorUtils) {
  const originalHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((err, isFatal) => {
    console.log('🚨 FATAL ERROR DETECTED 🚨');
    console.log('Message:', err.message);
    console.log('Stack:', err.stack);
    if (originalHandler) originalHandler(err, isFatal);
  });
}
// --------------------

import 'react-native-get-random-values';
import '@ethersproject/shims';

// 1. Polyfill Buffer
global.Buffer = require('buffer').Buffer;

// 2. Polyfill TextEncoder (Dibutuhkan oleh Solana)
const TextEncoding = require('fast-text-encoding');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoding.TextEncoder;
  global.TextDecoder = TextEncoding.TextDecoder;
}

// 3. Polyfill Process (SANGAT PENTING UNTUK MENCEGAH ERROR SLICE/NODE)
if (typeof global.process === 'undefined') {
  global.process = require('process');
}
global.process.env = global.process.env || {};
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production';
// Berikan versi palsu
global.process.version = global.process.version || 'v18.16.0'; 
// Beberapa library node juga mengakses process.versions.node
global.process.versions = global.process.versions || {};
global.process.versions.node = global.process.versions.node || '18.16.0'; 
// Polyfill argv (sangat sering dicek oleh library Node)
global.process.argv = global.process.argv || []; 

// 4. Polyfill Self
if (typeof global.self === 'undefined') {
  global.self = global;
}
