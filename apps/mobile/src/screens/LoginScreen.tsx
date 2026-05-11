/**
 * LoginScreen v5.0 — Premium Onboarding
 * 
 * References: Phantom (centered hero), Stripe (trust signals),
 * Linear (typography), Apple (whitespace mastery)
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { LogoContainer } from '../components/EjectLogo';

interface LoginScreenProps {
  onConnect: () => void;
  connecting: boolean;
}

export function LoginScreen({ onConnect, connecting }: LoginScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const bottomFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(bottomFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Network Badge — Top Center */}
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Devnet</Text>
        </View>
      </View>

      {/* Hero Section */}
      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LogoContainer size={72} color={COLORS.accent.violet} />

        <View style={styles.titleWrap}>
          <Text style={styles.title}>Eject</Text>
          <Text style={styles.titleDot}>.fi</Text>
        </View>

        <Text style={styles.subtitle}>Autonomous DeFi Security</Text>

        <Text style={styles.body}>
          AI-powered vault monitoring with predictive risk{'\n'}analysis and zero-knowledge emergency exits.
        </Text>

        {/* Feature pills */}
        <View style={styles.pills}>
          {[
            { icon: 'hardware-chip-outline' as const, label: 'AI Swarm' },
            { icon: 'shield-half-outline' as const, label: 'ZK Privacy' },
            { icon: 'swap-horizontal' as const, label: 'Cross-Chain' },
          ].map((f, i) => (
            <View key={i} style={styles.pill}>
              <Ionicons name={f.icon} size={12} color={COLORS.text.tertiary} />
              <Text style={styles.pillText}>{f.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Bottom CTA */}
      <Animated.View style={[styles.bottom, { opacity: bottomFade }]}>
        <TouchableOpacity
          style={[styles.cta, connecting && styles.ctaDisabled]}
          onPress={onConnect}
          disabled={connecting}
          activeOpacity={0.85}
        >
          {connecting ? (
            <ActivityIndicator size="small" color={COLORS.text.inverse} />
          ) : (
            <>
              <Text style={styles.ctaText}>Connect Wallet</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.text.inverse} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.partnersContainer}>
          <Text style={styles.legal}>Secured by Privy</Text>
          <Text style={styles.legalDot}>·</Text>
          <Text style={styles.legal}>Powered by</Text>
          <Image 
            source={require('../../assets/PNG/logo_lifi_dark.png')} 
            style={styles.lifiLogoFooter} 
            resizeMode="contain" 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },

  topBar: {
    paddingTop: 64,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bg.card,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent.green,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    letterSpacing: 0.8,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 44,
    fontWeight: '300',
    color: COLORS.text.primary,
    letterSpacing: -1,
  },
  titleDot: {
    fontSize: 44,
    fontWeight: '700',
    color: COLORS.accent.violet,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
  },
  body: {
    fontSize: 15,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  pills: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.bg.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text.tertiary,
  },

  bottom: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: 48,
  },
  cta: {
    backgroundColor: COLORS.accent.violet,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    marginBottom: SPACING.lg,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  partnersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.7,
  },
  legal: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  legalDot: {
    fontSize: 12,
    color: COLORS.text.muted,
    opacity: 0.5,
  },
  lifiLogoFooter: {
    width: 38,
    height: 16,
    marginLeft: 2,
  },
});
