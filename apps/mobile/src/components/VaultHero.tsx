/**
 * VaultHero v5.0 — Balance + Status
 * 
 * References: Phantom balance display (massive number, center),
 * Revolut (change indicator), Apple Wallet (clean hierarchy)
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface VaultHeroProps {
  balance: number | null;
  solPriceUsd: number;
  onAction: (action: any) => void;
  disabled?: boolean;
}

export function VaultHero({ balance, solPriceUsd, onAction, disabled }: VaultHeroProps) {
  const sol = balance ?? 0;
  const usd = solPriceUsd > 0 ? (sol * solPriceUsd).toFixed(2) : '—';

  return (
    <View style={styles.container}>
      {/* Balance */}
      <Text style={styles.usdLabel}>Portfolio Value</Text>
      <Text style={styles.usdValue}>${usd}</Text>
      
      <View style={styles.solRow}>
        <Text style={styles.solValue}>{sol.toFixed(4)} SOL</Text>
        <View style={styles.changeBadge}>
          <Ionicons name="trending-up" size={10} color={COLORS.accent.green} />
          <Text style={styles.changeText}>+2.4%</Text>
        </View>
      </View>

      {/* Action Buttons — Unified with Web */}
      <View style={styles.actionRow}>
        <ActionButton 
          icon="add-circle-outline" 
          label="Deposit" 
          onPress={() => onAction('deposit')}
          disabled={disabled}
        />
        <ActionButton 
          icon="remove-circle-outline" 
          label="Withdraw" 
          onPress={() => onAction('withdraw')}
          disabled={disabled}
        />
        <ActionButton 
          icon="shield-outline" 
          label="Vault" 
          onPress={() => onAction('vault_status')}
          disabled={disabled}
        />
        <ActionButton 
          icon="send-outline" 
          label="Transfer" 
          onPress={() => onAction('transfer')}
          disabled={disabled}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Status Row */}
      <View style={styles.statusRow}>
        <StatusItem 
          icon="shield-checkmark-outline" 
          label="Vault"
          value="Secured" 
          color={COLORS.accent.green} 
        />
        <View style={styles.statusDivider} />
        <StatusItem 
          icon="hardware-chip-outline" 
          label="Swarm"
          value="3 Active" 
          color={COLORS.accent.blue} 
        />
        <View style={styles.statusDivider} />
        <StatusItem 
          icon="pulse-outline" 
          label="Risk"
          value="Low" 
          color={COLORS.accent.green} 
        />
      </View>
    </View>
  );
}

function ActionButton({ icon, label, onPress, disabled }: {
  icon: any; label: string; onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity 
      style={[styles.actionBtn, disabled && { opacity: 0.5 }]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.actionIconWrap}>
        <Ionicons name={icon} size={20} color={COLORS.text.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatusItem({ icon, label, value, color }: {
  icon: any; label: string; value: string; color: string;
}) {
  return (
    <View style={styles.statusItem}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  usdLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.muted,
    marginBottom: SPACING.xs,
  },
  usdValue: {
    fontSize: 40,
    fontWeight: '300',
    color: COLORS.text.primary,
    letterSpacing: -1.5,
    marginBottom: SPACING.xs,
  },
  solRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  solValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.tertiary,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.accent.greenDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent.green,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    paddingHorizontal: 4,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border.subtle,
    marginVertical: SPACING.xl,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.text.muted,
    letterSpacing: 0.3,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border.subtle,
  },
});
