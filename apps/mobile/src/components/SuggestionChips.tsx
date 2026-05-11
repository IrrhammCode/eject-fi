/**
 * SuggestionChips v3.0 — Premium action buttons
 * 
 * Design: Icon-led chips with subtle gradient fills,
 * the EJECT button has a glowing red accent.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ChipAction } from '../types';

interface ChipConfig {
  id: ChipAction;
  label: string;
  icon: any;
  variant: 'blue' | 'purple' | 'danger' | 'gold' | 'stealth';
}

const CHIPS: ChipConfig[] = [
  {
    id: 'enable_autopilot' as ChipAction,
    label: 'Autopilot',
    icon: 'rocket' as const,
    variant: 'gold' as const,
  },
  {
    id: 'check_oracle' as ChipAction,
    label: 'Risk Scan',
    icon: 'scan-outline' as const,
    variant: 'purple' as const,
  },
  {
    id: 'stealth_eject' as ChipAction,
    label: 'ZK-EJECT',
    icon: 'eye-off-outline' as const,
    variant: 'stealth' as const,
  },
];

interface SuggestionChipsProps {
  onPress: (action: ChipAction) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onPress, disabled }: SuggestionChipsProps) {
  return (
    <View style={styles.container}>
      {CHIPS.map((chip) => {
        const isDanger = chip.variant === 'danger';
        const isBlue = chip.variant === 'blue';
        const isGold = chip.variant === 'gold';
        const isStealth = chip.variant === 'stealth';
        
        return (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.chip,
              isDanger && styles.dangerChip,
              isBlue && styles.blueChip,
              isGold && styles.goldChip,
              isStealth && styles.stealthChip,
              disabled && styles.disabledChip,
            ]}
            onPress={() => onPress(chip.id)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <View style={[
              styles.chipIcon,
              isDanger && styles.dangerIcon,
              isBlue && styles.blueIcon,
              isGold && styles.goldIcon,
              isStealth && styles.stealthIcon,
            ]}>
              <Ionicons
                name={chip.icon}
                size={14}
                color={isDanger ? COLORS.eject.primary : isBlue ? COLORS.accent.blue : isGold ? COLORS.accent.gold : isStealth ? COLORS.text.secondary : COLORS.accent.purple}
              />
            </View>
            <Text style={[
              styles.chipLabel,
              isDanger && styles.dangerLabel,
              isBlue && styles.blueLabel,
              isGold && styles.goldLabel,
              isStealth && styles.stealthLabel,
            ]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.bg.primary,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    backgroundColor: COLORS.bg.secondary,
  },
  blueChip: {
    borderColor: COLORS.accent.blueBorder,
    backgroundColor: COLORS.accent.blueDim,
  },
  goldChip: {
    borderColor: COLORS.accent.goldBorder,
    backgroundColor: COLORS.accent.goldDim,
  },
  stealthChip: {
    borderColor: COLORS.border.strong,
    backgroundColor: '#000000',
    borderStyle: 'dashed',
  },
  dangerChip: {
    borderColor: COLORS.eject.border,
    backgroundColor: COLORS.eject.surface,
  },
  chipIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: COLORS.accent.purpleDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueIcon: {
    backgroundColor: COLORS.accent.blueDim,
  },
  goldIcon: {
    backgroundColor: COLORS.accent.goldDim,
  },
  stealthIcon: {
    backgroundColor: COLORS.bg.tertiary,
  },
  dangerIcon: {
    backgroundColor: COLORS.eject.dim,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.3,
  },
  blueLabel: {
    color: COLORS.accent.blue,
  },
  goldLabel: {
    color: COLORS.accent.gold,
  },
  stealthLabel: {
    color: COLORS.text.secondary,
    fontFamily: 'Menlo',
  },
  dangerLabel: {
    color: COLORS.eject.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disabledChip: {
    opacity: 0.4,
  },
});
