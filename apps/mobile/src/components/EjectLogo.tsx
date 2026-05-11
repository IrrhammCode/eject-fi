/**
 * EjectLogo v5.0 — Refined Brand Mark
 * Clean SVG eject symbol with modern proportions.
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface EjectLogoProps {
  size?: number;
  color?: string;
}

export function EjectLogo({ size = 32, color = COLORS.accent.violet }: EjectLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Upward Triangle (Eject Symbol) */}
      <Path 
        d="M12 4L4 14H20L12 4Z" 
        fill={color}
        opacity={0.15}
      />
      <Path 
        d="M12 4L4 14H20L12 4Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Base Bar */}
      <Path 
        d="M5 18.5H19" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
    </Svg>
  );
}

export function LogoContainer({ size = 64, color = COLORS.accent.violet }) {
  return (
    <View style={[styles.outer, { width: size, height: size }]}>
      <EjectLogo size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 20,
    backgroundColor: COLORS.accent.violetDim,
    borderWidth: 1,
    borderColor: COLORS.accent.violetBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
