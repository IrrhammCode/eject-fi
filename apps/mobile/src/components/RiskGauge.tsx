/**
 * RiskGauge — Visual risk meter for AI Sentinel status
 * 
 * Displays a compact horizontal gauge showing current protocol risk level.
 * Animates smoothly between risk states.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface RiskGaugeProps {
  utilization: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'LOW': return COLORS.accent.green;
    case 'MEDIUM': return COLORS.accent.gold;
    case 'HIGH': return COLORS.eject.light;
    case 'CRITICAL': return COLORS.eject.primary;
    default: return COLORS.accent.green;
  }
}

function getRiskIcon(level: string): string {
  switch (level) {
    case 'LOW': return 'shield-checkmark';
    case 'MEDIUM': return 'warning-outline';
    case 'HIGH': return 'alert-circle-outline';
    case 'CRITICAL': return 'alert';
    default: return 'shield-checkmark';
  }
}

export function RiskGauge({ utilization, riskLevel }: RiskGaugeProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const color = getRiskColor(riskLevel);
  const icon = getRiskIcon(riskLevel);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: utilization / 100,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [utilization]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBg, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={12} color={color} />
          </View>
          <Text style={styles.label}>Protocol Health</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
          <Text style={[styles.levelText, { color }]}>{riskLevel}</Text>
        </View>
      </View>

      {/* Gauge bar */}
      <View style={styles.gaugeTrack}>
        <Animated.View style={[styles.gaugeFill, { width: fillWidth, backgroundColor: color }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Utilization</Text>
        <Text style={[styles.footerValue, { color }]}>{utilization.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 24,
    height: 24,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Gauge
  gaugeTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bg.elevated,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});
