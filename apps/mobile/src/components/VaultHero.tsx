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
  vaultBalance?: number | null;
  solPriceUsd: number;
  onAction: (action: any) => void;
  disabled?: boolean;
}

export function VaultHero({ balance, vaultBalance, solPriceUsd, onAction, disabled }: VaultHeroProps) {
  const sol = balance ?? 0;
  const vault = vaultBalance ?? 0;
  const totalSol = sol + vault;
  const usd = solPriceUsd > 0 ? (totalSol * solPriceUsd).toFixed(2) : '—';

  return (
    <View style={styles.container}>
      {/* Total Portfolio */}
      <Text style={styles.usdLabel}>Portfolio Value</Text>
      <Text style={styles.usdValue}>${usd}</Text>
      
      <View style={styles.solRow}>
        <Text style={styles.solValue}>{totalSol.toFixed(4)} SOL</Text>
        <View style={styles.changeBadge}>
          <Ionicons name="trending-up" size={10} color={COLORS.accent.green} />
          <Text style={styles.changeText}>+2.4%</Text>
        </View>
      </View>

      {/* Dual Balance Cards */}
      <View style={styles.balanceCards}>
        {/* Wallet Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardHeader}>
            <View style={[styles.balanceIcon, { backgroundColor: COLORS.accent.blueDim }]}>
              <Ionicons name="wallet-outline" size={14} color={COLORS.accent.blue} />
            </View>
            <Text style={styles.balanceCardLabel}>Wallet</Text>
          </View>
          <Text style={styles.balanceCardValue}>{sol.toFixed(4)}</Text>
          <Text style={styles.balanceCardUnit}>SOL</Text>
        </View>

        {/* Vault Balance */}
        <View style={[styles.balanceCard, styles.vaultCard]}>
          <View style={styles.balanceCardHeader}>
            <View style={[styles.balanceIcon, { backgroundColor: COLORS.accent.greenDim }]}>
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.accent.green} />
            </View>
            <Text style={styles.balanceCardLabel}>Vault</Text>
          </View>
          <Text style={[styles.balanceCardValue, vault > 0 && { color: COLORS.accent.green }]}>{vault.toFixed(4)}</Text>
          <Text style={styles.balanceCardUnit}>SOL</Text>
        </View>
      </View>

      {/* Action Buttons */}
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
          value={vault > 0 ? 'Funded' : 'Empty'}
          color={vault > 0 ? COLORS.accent.green : COLORS.text.muted} 
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

  balanceCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  vaultCard: {
    borderColor: `${COLORS.accent.green}30`,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  balanceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceCardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  balanceCardUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text.muted,
    marginTop: 2,
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
