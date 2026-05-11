import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import { BridgeQuote } from '../utils/lifi';

interface LifiWidgetProps {
  quote: BridgeQuote;
  isExecuting: boolean;
  onExecute: () => void;
  status?: 'idle' | 'executing' | 'success' | 'error';
}

/**
 * LI.FI Premium Native Widget
 * Jumper.exchange-inspired design with LI.FI brand guidelines.
 */
export function LifiWidget({ quote, isExecuting, onExecute, status = 'idle' }: LifiWidgetProps) {
  
  // Dummy icons for networks if actual image URIs are not available
  const networkIcons: Record<string, string> = {
    'Solana': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    'Base': 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.png'
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.lifiLogoCircle}>
            <Ionicons name="git-network" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>Powered by LI.FI</Text>
        </View>
        <View style={styles.gasBadge}>
          <Ionicons name="funnel-outline" size={12} color="#A1A1AA" />
          <Text style={styles.gasText}>Fee: ${quote.estimatedFeeUSD}</Text>
        </View>
      </View>

      {/* Main Swap Card */}
      <View style={styles.swapCard}>
        {/* From Section */}
        <View style={styles.assetRow}>
          <View style={styles.assetLeft}>
            <Text style={styles.actionLabel}>From</Text>
            <View style={styles.tokenInfo}>
              <Image source={{ uri: networkIcons[quote.fromChain] || networkIcons['Solana'] }} style={styles.tokenIcon} />
              <Text style={styles.tokenSymbol}>{quote.fromToken}</Text>
              <View style={styles.networkBadge}>
                <Text style={styles.networkBadgeText}>{quote.fromChain}</Text>
              </View>
            </View>
          </View>
          <View style={styles.assetRight}>
            <Text style={styles.amountText}>{quote.fromAmount}</Text>
          </View>
        </View>

        {/* Divider / Connector */}
        <View style={styles.connectorContainer}>
          <View style={styles.connectorLine} />
          <View style={styles.connectorIconWrapper}>
            <Ionicons name="arrow-down" size={14} color="#5C67FF" />
          </View>
          <View style={styles.connectorLine} />
        </View>

        {/* To Section */}
        <View style={styles.assetRow}>
          <View style={styles.assetLeft}>
            <Text style={styles.actionLabel}>To (Estimated)</Text>
            <View style={styles.tokenInfo}>
              <Image source={{ uri: networkIcons[quote.toChain] || networkIcons['Base'] }} style={styles.tokenIcon} />
              <Text style={styles.tokenSymbol}>{quote.toToken}</Text>
              <View style={styles.networkBadge}>
                <Text style={styles.networkBadgeText}>{quote.toChain}</Text>
              </View>
            </View>
          </View>
          <View style={styles.assetRight}>
            <Text style={styles.amountTextActive}>~{quote.estimatedReceive}</Text>
          </View>
        </View>
      </View>

      {/* Route Info (Agent Analysis) */}
      <View style={styles.routeAnalysisContainer}>
        <Text style={styles.analysisTitle}>
          <Ionicons name="sparkles" size={12} color={COLORS.accent.gold} /> Sentinel Routing Analysis
        </Text>
        <View style={styles.routePathBox}>
          <Text style={styles.routeStep}>{quote.fromChain}</Text>
          <Ionicons name="chevron-forward" size={12} color="#71717A" />
          <Text style={styles.routeStepHighlight}>{quote.solver}</Text>
          <Ionicons name="chevron-forward" size={12} color="#71717A" />
          <Text style={styles.routeStep}>{quote.toChain}</Text>
        </View>
        <Text style={styles.routeMetrics}>
          Slippage: 0.5%  •  Time: ~{quote.executionTime}s
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={[
          styles.executeButton, 
          isExecuting && styles.buttonDisabled,
          status === 'success' && styles.buttonSuccess
        ]}
        onPress={onExecute}
        disabled={isExecuting || status === 'success'}
        activeOpacity={0.8}
      >
        {isExecuting ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.executeButtonText}>Signing Transaction...</Text>
          </View>
        ) : status === 'success' ? (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.executeButtonText}>Bridge Initiated</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="flash" size={16} color="#FFFFFF" />
            <Text style={styles.executeButtonText}>Confirm Safe Haven Escape</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0E', // True black base
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#1E1E28',
    marginVertical: SPACING.md,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lifiLogoCircle: {
    backgroundColor: '#5C67FF',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: '#F5F5F7',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141418',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: '#2A2A35',
    gap: 4,
  },
  gasText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.mono,
  },
  swapCard: {
    backgroundColor: '#141418',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetLeft: {
    flex: 1,
  },
  actionLabel: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2A35',
  },
  tokenSymbol: {
    color: '#F5F5F7',
    fontSize: 18,
    fontWeight: '700',
  },
  networkBadge: {
    backgroundColor: '#2A2A35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  networkBadgeText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: '#F5F5F7',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.mono,
  },
  amountTextActive: {
    color: '#3DD68C',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.mono,
  },
  connectorContainer: {
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 10,
  },
  connectorLine: {
    width: 1,
    height: 12,
    backgroundColor: '#2A2A35',
  },
  connectorIconWrapper: {
    backgroundColor: '#1A1A24',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5C67FF',
  },
  routeAnalysisContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  analysisTitle: {
    color: COLORS.accent.gold,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  routePathBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141418',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#2A2A35',
    gap: 8,
  },
  routeStep: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  routeStepHighlight: {
    color: '#5C67FF',
    fontSize: 12,
    fontWeight: '700',
  },
  routeMetrics: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 8,
    fontFamily: FONTS.mono,
  },
  executeButton: {
    backgroundColor: '#5C67FF',
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow('#5C67FF'),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSuccess: {
    backgroundColor: '#3DD68C',
    shadowColor: '#3DD68C',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
