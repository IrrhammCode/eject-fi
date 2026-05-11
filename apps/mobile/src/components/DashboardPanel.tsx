/**
 * DashboardPanel v4.0 — Unified Premium Control Center
 * 
 * Replaces the scattered Balance, Risk, and Swarm cards with a single,
 * highly elegant and cohesive dashboard header.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface DashboardPanelProps {
  balance: number | null;
  utilization: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const SOL_PRICE_USD = 168.42;

export function DashboardPanel({ balance, utilization, riskLevel }: DashboardPanelProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const solBalance = balance ?? 0;
  const usdValue = (solBalance * SOL_PRICE_USD).toFixed(2);

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'LOW': return COLORS.accent.green;
      case 'MEDIUM': return COLORS.accent.gold;
      case 'HIGH': return COLORS.eject.light;
      case 'CRITICAL': return COLORS.eject.primary;
      default: return COLORS.accent.green;
    }
  };
  const riskColor = getRiskColor();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Top Row: Title & Risk Pill */}
      <View style={styles.topRow}>
        <Text style={styles.sectionTitle}>VAULT SECURITY</Text>
        <View style={[styles.riskPill, { borderColor: riskColor + '30', backgroundColor: riskColor + '10' }]}>
          <Animated.View style={[styles.riskDot, { backgroundColor: riskColor, opacity: pulseAnim }]} />
          <Text style={[styles.riskText, { color: riskColor }]}>{riskLevel} RISK</Text>
        </View>
      </View>

      {/* Center: Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceValue}>{solBalance.toFixed(4)} <Text style={styles.balanceCurrency}>SOL</Text></Text>
        <Text style={styles.usdValue}>≈ ${usdValue} USD</Text>
      </View>

      <View style={styles.divider} />

      {/* Bottom Row: Autopilot & Swarm */}
      <View style={styles.bottomRow}>
        
        {/* Autopilot Status */}
        <View style={styles.metricItem}>
          <View style={styles.metricIconBg}>
            <Ionicons name="rocket-outline" size={12} color={COLORS.accent.gold} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Autopilot Yield</Text>
            <Text style={styles.metricValue}>MarginFi <Text style={{color: COLORS.accent.green}}>10.2%</Text></Text>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        {/* Swarm Status */}
        <View style={styles.metricItem}>
          <View style={styles.metricIconBg}>
            <Ionicons name="hardware-chip-outline" size={12} color={COLORS.accent.blue} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Active Swarm</Text>
            <View style={styles.swarmRow}>
              <Text style={styles.metricValue}>3 Agents</Text>
              <View style={styles.agentDots}>
                <View style={[styles.dot, { backgroundColor: COLORS.accent.green }]} />
                <View style={[styles.dot, { backgroundColor: COLORS.accent.blue }]} />
                <View style={[styles.dot, { backgroundColor: COLORS.accent.purple }]} />
              </View>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.bg.primary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text.muted,
    letterSpacing: 1.5,
  },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  balanceSection: {
    marginBottom: SPACING.lg,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '400', // Elegance over bulk
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.tertiary,
  },
  usdValue: {
    fontSize: 13,
    color: COLORS.text.muted,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border.subtle,
    marginBottom: SPACING.lg,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.bg.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.text.muted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border.subtle,
    marginHorizontal: SPACING.md,
  },
  swarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agentDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
