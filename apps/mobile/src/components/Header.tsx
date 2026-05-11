/**
 * Header v5.0 — Ultra-clean top bar
 * References: Phantom's minimal header, only brand + wallet
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { WalletState } from '../types';
import { EjectLogo } from './EjectLogo';

interface HeaderProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Header({ wallet, onDisconnect }: HeaderProps) {
  const truncate = (addr: string | null) =>
    addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : 'No Address';

  return (
    <View style={styles.bar}>
      {/* Left: Brand */}
      <View style={styles.brand}>
        <View style={styles.logoBox}>
          <EjectLogo size={14} color={COLORS.accent.violet} />
        </View>
        <Text style={styles.brandName}>Eject<Text style={styles.brandDot}>.fi</Text></Text>
      </View>

      {/* Right: Wallet Info */}
      <View style={styles.rightSection}>
        {wallet.connected ? (
          <TouchableOpacity 
            style={styles.walletPill} 
            onPress={async () => {
              if (wallet.publicKey) {
                try {
                  await Share.share({ message: wallet.publicKey });
                } catch (error) {}
              }
            }}
            onLongPress={onDisconnect}
          >
            <View style={styles.walletDot} />
            <Text style={styles.walletAddr}>{truncate(wallet.publicKey)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Connecting...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60, // Adjusted for iPhone Dynamic Island
    paddingBottom: 15,
    backgroundColor: COLORS.bg.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandDot: {
    color: COLORS.accent.violet,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B23',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  walletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3DD68C',
  },
  walletAddr: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
});
