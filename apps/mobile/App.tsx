import React, { useCallback } from 'react';
import { Alert, TouchableOpacity, Text, View } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { useWallet } from './src/hooks/useWallet';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';

function MainAppContent() {
  const { wallet, connect, disconnect, signAndSendTransaction, refreshBalance, authenticated, signMessage } =
    useWallet();

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (error: any) {
      Alert.alert(
        'Connection Failed',
        error?.message || 'Could not connect. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnect },
      ]
    );
  }, [disconnect]);

  return (
    <View style={{ flex: 1 }}>
      {!wallet.connected ? (
        <LoginScreen
          onConnect={handleConnect}
          connecting={wallet.connecting}
        />
      ) : (
        <ChatScreen
          wallet={wallet}
          onDisconnect={handleDisconnect}
          signAndSendTransaction={signAndSendTransaction}
          refreshBalance={refreshBalance}
        />
      )}

      {authenticated && (
        <View style={{ position: 'absolute', bottom: 100, alignSelf: 'center', gap: 10, zIndex: 100000 }}>
          <TouchableOpacity 
            onPress={async () => {
              try {
                console.log('[Test] Triggering Sign Message...');
                const sig = await signMessage('Test Privy Modal Presence');
                Alert.alert('Success', 'Modal is working! Sig: ' + sig.slice(0, 10));
              } catch (e: any) {
                Alert.alert('Failed', e.message);
              }
            }}
            style={{ backgroundColor: 'rgba(50,255,50,0.2)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#44ff44' }}
          >
            <Text style={{ color: '#44ff44', fontSize: 12, fontWeight: 'bold' }}>TEST PRIVY MODAL (SIGN MESSAGE)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={disconnect}
            style={{ backgroundColor: 'rgba(255,50,50,0.1)', padding: 10, borderRadius: 10 }}
          >
            <Text style={{ color: '#ff4444', fontSize: 12, textAlign: 'center' }}>Stuck? Clear Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function App() {
  if (!PRIVY_APP_ID) {
    console.warn('[Eject.fi] EXPO_PUBLIC_PRIVY_APP_ID not set in .env — Privy login will fail');
  }

  return (
    <SafeAreaProvider>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        clientId={PRIVY_CLIENT_ID}
        config={{
          embedded: {
            solana: {
              createOnLogin: 'all-users',
            },
          },
          solanaClusters: [{
            name: 'devnet',
            rpcUrl: 'https://devnet.helius-rpc.com/?api-key=25670c4c-3555-4582-b560-69be4f754491'
          }]
        }}
        // @ts-ignore - Explicit redirect scheme for mobile stability
        redirectUrl="ejectfi://"
      >
        <MainAppContent />
        <PrivyElements />
      </PrivyProvider>
    </SafeAreaProvider>
  );
}
