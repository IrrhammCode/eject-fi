/**
 * ChatScreen v6.0 — "Sentinel Control Deck" (Production)
 * 
 * All status indicators are now wired to live Sentinel + Helius data.
 * No hardcoded values.
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';
import { WalletState } from '../types';
import { useChat } from '../hooks/useChat';
import { checkProtocolHealth, ProtocolHealth } from '../utils/sentinel';

import { Header } from '../components/Header';
import { VaultHero } from '../components/VaultHero';
import { ActionGrid } from '../components/ActionGrid';
import { AgentConsole } from '../components/AgentConsole';
import { ChatInput } from '../components/ChatInput';

interface ChatScreenProps {
  wallet: WalletState;
  onDisconnect: () => void;
  signAndSendTransaction: (tx: any) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

export function ChatScreen({
  wallet,
  onDisconnect,
  signAndSendTransaction,
  refreshBalance,
}: ChatScreenProps) {
  const { messages, isProcessing, handleChipAction, executeBridge, sendMessage } = useChat(
    wallet,
    signAndSendTransaction,
    refreshBalance
  );

  // --- Live System Status ---
  const [systemHealth, setSystemHealth] = useState<{
    riskLevel: string;
    dataSource: string;
    networkTps: number;
  }>({
    riskLevel: 'LOW',
    dataSource: 'loading',
    networkTps: 0,
  });
  const [solPriceUsd, setSolPriceUsd] = useState<number>(0);

  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Animate the status dot pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Fetch live system health on mount + every 60s
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await checkProtocolHealth('Kamino');
        setSystemHealth({
          riskLevel: health.riskLevel,
          dataSource: health.dataSource,
          networkTps: health.networkTps,
        });
        if (health.solPrice > 0) {
          setSolPriceUsd(health.solPrice);
        }
      } catch (error) {
        console.warn('[ChatScreen] Health fetch failed:', error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Get only the latest agent message for the terminal console
  const latestAgentMessage = [...messages].reverse().find(m => m.role === 'agent');

  // Dynamic colors based on live risk level
  const riskColor = systemHealth.riskLevel === 'CRITICAL' ? COLORS.danger.primary
    : systemHealth.riskLevel === 'HIGH' ? '#FF9500'
    : systemHealth.riskLevel === 'MEDIUM' ? '#FFD60A'
    : COLORS.accent.green;

  const sentinelColor = systemHealth.dataSource === 'live' 
    ? COLORS.accent.green 
    : '#FFD60A';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Header
        wallet={wallet}
        onConnect={() => {}}
        onDisconnect={onDisconnect}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* System Health Pulse — LIVE from Sentinel + Helius */}
        <View style={styles.systemStatusContainer}>
          <View style={[styles.statusBadge, { borderColor: `${sentinelColor}20` }]}>
            <Animated.View style={[
              styles.statusDot, 
              { backgroundColor: sentinelColor, opacity: pulseAnim }
            ]} />
            <Text style={[styles.statusLabel, { color: sentinelColor }]}>
              Sentinel: {systemHealth.dataSource === 'live' ? 'LIVE' : 'SYNC'}
              {systemHealth.networkTps > 0 ? ` · ${systemHealth.networkTps} TPS` : ''}
            </Text>
          </View>
          <View style={[styles.panicBadge, { 
            borderColor: `${riskColor}20`,
            backgroundColor: `${riskColor}08`,
          }]}>
            <Text style={[styles.panicLabel, { color: riskColor }]}>
              Risk: {systemHealth.riskLevel}
            </Text>
          </View>
        </View>

        {/* Massive Balance & Assurance */}
        <VaultHero 
          balance={wallet.balance} 
          vaultBalance={wallet.vaultBalance}
          solPriceUsd={solPriceUsd} 
          onAction={handleChipAction}
          disabled={isProcessing}
        />

        {/* Bento Box Control Center */}
        <ActionGrid 
          onPress={handleChipAction} 
          disabled={isProcessing} 
        />

        {/* Live Hacker Terminal Output */}
        <AgentConsole 
          latestMessage={latestAgentMessage} 
          isProcessing={isProcessing} 
          onExecuteBridge={executeBridge}
        />
      </ScrollView>

      {/* Unified Input System — Mirroring Web terminal input */}
      <ChatInput onSend={sendMessage} disabled={isProcessing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  systemStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 214, 140, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(61, 214, 140, 0.15)',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    color: COLORS.accent.green,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  panicBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  panicLabel: {
    color: COLORS.text.tertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
