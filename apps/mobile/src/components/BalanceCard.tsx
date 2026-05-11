/**
 * BalanceCard v3.0 — Glassmorphic portfolio card
 * 
 * Design: Gradient border glow, USD conversion, 
 * shield status row, cross-chain indicator
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface BalanceCardProps {
  balance: number | null;
}

const SOL_PRICE_USD = 168.42; // Mock price

export function BalanceCard({ balance }: BalanceCardProps) {
  const solBalance = balance ?? 0;
  const usdValue = (solBalance * SOL_PRICE_USD).toFixed(2);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Top row: Label + badges */}
        <View style={styles.topRow}>
          <Text style={styles.label}>Vault Balance</Text>
          <View style={styles.badges}>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Live</Text>
            </View>
            <View style={styles.chainBadge}>
              <Ionicons name="git-network-outline" size={10} color={COLORS.accent.blue} />
              <Text style={styles.chainText}>Base</Text>
            </View>
          </View>
        </View>

        {/* Balance display */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceValue}>{solBalance.toFixed(4)}</Text>
          <Text style={styles.balanceCurrency}> SOL</Text>
        </View>
        <Text style={styles.usdValue}>≈ ${usdValue} USD</Text>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Autopilot Strategy Row */}
        <View style={styles.autopilotRow}>
          <View style={styles.autopilotHeader}>
            <Ionicons name="rocket" size={14} color={COLORS.accent.gold} />
            <Text style={styles.autopilotTitle}>AUTOPILOT YIELD</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>OPTIMIZING</Text>
            </View>
          </View>
          
          <View style={styles.routeRow}>
            <View style={styles.protocolNode}>
              <Text style={styles.protocolText}>Kamino</Text>
              <Text style={styles.apyText}>8.5% APY</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color={COLORS.text.muted} />
            <View style={[styles.protocolNode, styles.activeNode]}>
              <Text style={[styles.protocolText, {color: COLORS.accent.gold}]}>MarginFi</Text>
              <Text style={[styles.apyText, {color: COLORS.accent.gold}]}>10.2% APY</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.accent.purpleBorder,
    ...SHADOWS.subtle,
  },
  container: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.tertiary,
    letterSpacing: 0.3,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent.greenDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accent.greenBorder,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent.green,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent.green,
    letterSpacing: 0.3,
  },
  chainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent.blueDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accent.blueBorder,
  },
  chainText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent.blue,
    letterSpacing: 0.3,
  },

  // Balance
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  balanceCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    marginLeft: 4,
  },
  usdValue: {
    fontSize: 14,
    color: COLORS.text.muted,
    marginTop: SPACING.xxs,
    letterSpacing: 0.2,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border.subtle,
    marginVertical: SPACING.lg,
  },

  // Autopilot
  autopilotRow: {
    backgroundColor: COLORS.bg.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  autopilotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  autopilotTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.accent.gold,
    letterSpacing: 1,
    flex: 1,
  },
  liveBadge: {
    backgroundColor: COLORS.accent.goldDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  liveText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.accent.gold,
    letterSpacing: 0.5,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bg.secondary,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  protocolNode: {
    alignItems: 'center',
    flex: 1,
  },
  activeNode: {
    backgroundColor: COLORS.accent.goldDim,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  protocolText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.secondary,
  },
  apyText: {
    fontSize: 10,
    color: COLORS.accent.green,
    fontWeight: '600',
    marginTop: 2,
  },
});
