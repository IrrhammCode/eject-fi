/**
 * SwarmStatus — Visualizer for Multi-Agent AI Swarm
 * Shows the status of specialized sub-agents working in the background.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const AGENTS = [
  { id: 'onchain', name: 'On-Chain Oracle', icon: 'link-outline', status: 'active', color: COLORS.accent.green },
  { id: 'social', name: 'Social NLP', icon: 'logo-twitter', status: 'scanning', color: COLORS.accent.blue },
  { id: 'mev', name: 'MEV Shield', icon: 'shield-half-outline', status: 'active', color: COLORS.accent.purple },
];

export function SwarmStatus() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>ACTIVE SWARM (3)</Text>
      <View style={styles.agentRow}>
        {AGENTS.map((agent, index) => (
          <View key={agent.id} style={styles.agentPill}>
            <View style={[styles.iconBg, { backgroundColor: agent.color + '20' }]}>
              <Ionicons name={agent.icon as any} size={14} color={agent.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <View style={styles.statusRow}>
                <Animated.View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: agent.color },
                    agent.status === 'scanning' && { opacity: pulseAnim }
                  ]} 
                />
                <Text style={[styles.statusText, { color: agent.color }]}>
                  {agent.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text.muted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  agentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  agentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.secondary,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    gap: SPACING.xs,
  },
  iconBg: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  agentName: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
