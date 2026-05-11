import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { useWallet } from './src/hooks/useWallet';

import { PrivyProvider } from '@privy-io/expo';

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';

function MainApp() {
  const { wallet, connect, disconnect, signAndSendTransaction, refreshBalance } =
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

  if (!wallet.connected) {
    return (
      <LoginScreen
        onConnect={handleConnect}
        connecting={wallet.connecting}
      />
    );
  }

  return (
    <ChatScreen
      wallet={wallet}
      onDisconnect={handleDisconnect}
      signAndSendTransaction={signAndSendTransaction}
      refreshBalance={refreshBalance}
    />
  );
}

export default function App() {
  if (!PRIVY_APP_ID) {
    console.warn('[Eject.fi] EXPO_PUBLIC_PRIVY_APP_ID not set in .env — Privy login will fail');
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      scheme="ejectfi"
      config={{
        embedded: {
          solana: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      <MainApp />
    </PrivyProvider>
  );
}
