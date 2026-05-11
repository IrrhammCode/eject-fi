/**
 * AgentConsole v5.0 — Sleek Status Terminal
 * 
 * References: Perplexity (answer rendering), Linear (clean cards),
 * Terminal.app (monospace aesthetics)
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ChatMessage } from '../types';
import { LifiWidget } from './LifiWidget';

interface AgentConsoleProps {
  latestMessage?: ChatMessage;
  isProcessing: boolean;
  onExecuteBridge?: (quote: any) => void;
}

export function AgentConsole({ latestMessage, isProcessing, onExecuteBridge }: AgentConsoleProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const [displayText, setDisplayText] = useState('');

  // Strip icon markers
  const cleanContent = (content: string) => {
    return content.replace(/^\[icon:[a-z-]+\]\s*/, '');
  };

  // Typewriter
  useEffect(() => {
    if (!latestMessage) return;
    
    const text = cleanContent(latestMessage.content);
    setDisplayText('');
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i += 2;
      if (i > text.length) {
        setDisplayText(text);
        clearInterval(interval);
      }
    }, 12);
    
    return () => clearInterval(interval);
  }, [latestMessage?.content]);

  // Processing pulse
  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isProcessing]);

  const statusColor = isProcessing ? COLORS.accent.gold : COLORS.accent.green;
  const statusLabel = isProcessing ? 'Analyzing' : 'Online';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="terminal-outline" size={13} color={COLORS.text.muted} />
          <Text style={styles.headerTitle}>Sentinel Console</Text>
        </View>
        <View style={styles.headerRight}>
          <Animated.View style={[styles.dot, { backgroundColor: statusColor, opacity: pulseAnim }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {displayText ? (
          <>
            <Text style={styles.output}>
              <Text style={styles.prompt}>→ </Text>
              {displayText}
              {isProcessing && <Text style={styles.cursor}>▊</Text>}
            </Text>
            
            {/* Render LI.FI Widget if quoteData exists */}
            {latestMessage?.metadata?.quoteData && (
              <LifiWidget 
                quote={latestMessage.metadata.quoteData} 
                isExecuting={isProcessing} 
                status={latestMessage.metadata.quoteData._status || 'idle'}
                onExecute={() => onExecuteBridge && onExecuteBridge(latestMessage.metadata?.quoteData)} 
              />
            )}
          </>
        ) : (
          <Text style={styles.placeholder}>
            Tap an action above to start a scan…
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    overflow: 'hidden',
    marginBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  body: {
    padding: SPACING.lg,
    minHeight: 100,
  },
  output: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  prompt: {
    color: COLORS.accent.violet,
    fontWeight: '700',
  },
  cursor: {
    color: COLORS.text.tertiary,
  },
  placeholder: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },
});
