/**
 * Eject.fi — Wallet Hook v5.0 (Bulletproof Demo Version)
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { PublicKey, Transaction, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { usePrivy, useLoginWithOAuth, useEmbeddedSolanaWallet } from '@privy-io/expo';
import * as LocalAuthentication from 'expo-local-authentication';
import { WalletState } from '../types';
import { MOCK_WALLET_BALANCE } from '../utils/solana';

const SOLANA_RPC = process.env.EXPO_PUBLIC_SOLANA_RPC || 'https://devnet.helius-rpc.com/?api-key=25670c4c-3555-4582-b560-69be4f754491';
const connection = new Connection(SOLANA_RPC, 'confirmed');

export function useWallet() {
  const privy = usePrivy();
  const solanaWallet = useEmbeddedSolanaWallet();
  
  // Ambil data dengan lebih aman
  const user = privy.user;
  const isReady = privy.ready !== undefined ? privy.ready : true; // Fallback jika undefined
  const authenticated = privy.authenticated !== undefined ? privy.authenticated : !!user;

  // Diagnostic logs — hanya saat status berubah
  useEffect(() => {
    if (isReady) {
      console.log('[WALLET-DEBUG] Status Update:', {
        authenticated,
        hasUser: !!user,
        wallets: solanaWallet.wallets?.length || 0
      });
    }
  }, [isReady, authenticated, !!user, solanaWallet.wallets?.length]);

  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: null,
    connecting: false,
  });

  const fetchBalance = useCallback(async (pubkey: string) => {
    // DEMO MOCK: Selalu kembalikan saldo palsu agar simulasi terlihat nyata
    return MOCK_WALLET_BALANCE;
  }, []);

  const refreshBalance = useCallback(async () => {
    if (wallet.publicKey) {
      const balance = await fetchBalance(wallet.publicKey);
      if (balance !== null) setWallet(prev => ({ ...prev, balance }));
    }
  }, [wallet.publicKey, fetchBalance]);

  // Efek untuk sinkronisasi state dompet
  useEffect(() => {
    const embeddedWallet = solanaWallet.wallets?.[0];
    const walletAddress = embeddedWallet?.address || (user?.linked_accounts?.find((a: any) => a.chainType === 'solana') as any)?.address;
    
    if (walletAddress && walletAddress !== wallet.publicKey) {
      console.log('[Wallet] Auto-connecting to address:', walletAddress);
      setWallet(prev => ({ 
        ...prev, 
        connected: true, 
        publicKey: walletAddress, 
        connecting: false 
      }));
      fetchBalance(walletAddress).then(b => { 
        if (b !== null) setWallet(prev => ({ ...prev, balance: b })); 
      });
    }
  }, [user, solanaWallet.wallets, wallet.publicKey]);

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction): Promise<string> => {
      console.log('[Wallet] [MOCK] Starting signAndSendTransaction process...');
      
      // Berpura-pura memproses transaksi (1.5 detik)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Buat signature palsu yang terlihat seperti aslinya
      const fakeSignature = '4k' + Array.from({length: 85}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      console.log('[Wallet] [MOCK] SUCCESS! Fake Signature:', fakeSignature);
      
      // Pura-pura saldo berkurang/bertambah sedikit (opsional, tapi kita panggil refreshBalance saja)
      refreshBalance();
      
      return fakeSignature;
    },
    [refreshBalance]
  );

  const signMessage = useCallback(async (message: string): Promise<string> => {
    console.log('[Wallet] [MOCK] Triggering signMessage...');
    
    // Berpura-pura memproses pesan (1 detik)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fakeSignature = '5J' + Array.from({length: 85}, () => Math.floor(Math.random()*16).toString(16)).join('');
    return fakeSignature;
  }, []);

  const { login: loginWithOAuth } = useLoginWithOAuth();

  const connect = useCallback(async () => {
    setWallet(prev => ({ ...prev, connecting: true }));
    try { 
      console.log('[Wallet] Cleaning up old sessions...');
      try { await privy.logout(); } catch (e) {} // Force clear
      
      console.log('[Wallet] Initiating fresh Google Login...');
      await loginWithOAuth({ provider: 'google' }); 
    } catch (e: any) { 
      console.error('[Wallet] Login failed:', e);
      setWallet(prev => ({ ...prev, connecting: false })); 
    }
  }, [loginWithOAuth, privy]);

  const disconnect = useCallback(async () => {
    try { await privy.logout(); } catch (e) {}
    setWallet({ connected: false, publicKey: null, balance: null, connecting: false });
  }, [privy]);

  return { wallet, connect, disconnect, signAndSendTransaction, refreshBalance, authenticated, signMessage };
}
