/**
 * ActionGrid v5.0 — Bento-box Card Grid
 * 
 * References: iOS Control Center (grid), Revolut action cards,
 * Phantom's send/receive/swap buttons
 * 
 * Layout: 2x2 grid for v2.0 features + full-width emergency eject
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ChipAction } from '../types';

interface ActionGridProps {
  onPress: (action: ChipAction) => void;
  disabled?: boolean;
}

export function ActionGrid({ onPress, disabled }: ActionGridProps) {
  return (
    <View style={styles.wrap}>
      {/* 2x2 Grid */}
      <View style={styles.grid}>
        {/* Predictive Scan */}
        <TouchableOpacity 
          style={[styles.card, disabled && styles.disabled]} 
          onPress={() => onPress('check_oracle')}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <View style={[styles.iconCircle, { backgroundColor: COLORS.accent.violetDim }]}>
            <Ionicons name="analytics-outline" size={18} color={COLORS.accent.violet} />
          </View>
          <Text style={styles.cardTitle}>Risk Scan</Text>
          <Text style={styles.cardSub}>Predict threats</Text>
        </TouchableOpacity>

        {/* Yield Autopilot */}
        <TouchableOpacity 
          style={[styles.card, disabled && styles.disabled]} 
          onPress={() => onPress('enable_autopilot')}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <View style={[styles.iconCircle, { backgroundColor: COLORS.accent.goldDim }]}>
            <Ionicons name="flash-outline" size={18} color={COLORS.accent.gold} />
          </View>
          <Text style={styles.cardTitle}>Autopilot</Text>
          <Text style={styles.cardSub}>Max yield route</Text>
        </TouchableOpacity>

        {/* Bridge In (LI.FI) */}
        <TouchableOpacity 
          style={[styles.card, disabled && styles.disabled]} 
          onPress={() => onPress('simulate_deposit')}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <View style={styles.lifiLogoContainer}>
            <Image 
              source={require('../../assets/PNG/logo_lifi_dark.png')} 
              style={styles.lifiLogo} 
              resizeMode="contain" 
            />
          </View>
          <Text style={styles.cardTitle}>Safe Haven</Text>
          <Text style={styles.cardSub}>Powered by LI.FI</Text>
        </TouchableOpacity>

        {/* Swarm Intel */}
        <TouchableOpacity 
          style={[styles.card, disabled && styles.disabled]} 
          onPress={() => onPress('check_oracle')}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <View style={[styles.iconCircle, { backgroundColor: COLORS.accent.greenDim }]}>
            <Ionicons name="git-network-outline" size={18} color={COLORS.accent.green} />
          </View>
          <Text style={styles.cardTitle}>Swarm</Text>
          <Text style={styles.cardSub}>4 agents live</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Eject — Full Width */}
      <TouchableOpacity 
        style={[styles.ejectCard, disabled && styles.disabled]} 
        onPress={() => onPress('stealth_eject')}
        disabled={disabled}
        activeOpacity={0.75}
      >
        <View style={styles.ejectInner}>
          <View style={[styles.iconCircle, styles.ejectIcon]}>
            <Ionicons name="exit-outline" size={18} color={COLORS.danger.primary} />
          </View>
          <View style={styles.ejectText}>
            <Text style={styles.ejectTitle}>Emergency ZK-Eject</Text>
            <Text style={styles.ejectSub}>Private withdrawal · Zero market impact</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    width: '48.5%',
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  lifiLogoContainer: {
    width: 36,
    height: 36,
    marginBottom: SPACING.md,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  lifiLogo: {
    width: 28,
    height: 28,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.text.muted,
  },

  ejectCard: {
    backgroundColor: COLORS.danger.dim,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.danger.border,
    padding: SPACING.lg,
  },
  ejectInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ejectIcon: {
    backgroundColor: COLORS.danger.dim,
  },
  ejectText: {
    flex: 1,
  },
  ejectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger.primary,
    marginBottom: 2,
  },
  ejectSub: {
    fontSize: 12,
    color: COLORS.text.muted,
  },

  disabled: {
    opacity: 0.4,
  },
});
