/**
 * ChatBubble v3.0 — Rich agent message cards
 * 
 * Design: Card-based messages for agent, pill bubbles for user.
 * Agent cards have colored accent bars, severity-based styling,
 * and proper content hierarchy.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

function parseIconMarker(content: string): { icon: string | null; text: string } {
  if (!content) return { icon: null, text: '' };
  const match = content.match(/^\[icon:([a-z-]+)\]\s*/);
  if (match) {
    return { icon: match[1], text: content.slice(match[0].length) };
  }
  return { icon: null, text: content };
}

function getAccentColor(severity?: string): string {
  switch (severity) {
    case 'critical': return COLORS.eject.primary;
    case 'warning': return COLORS.accent.gold;
    default: return COLORS.accent.purple;
  }
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isCritical = message.metadata?.severity === 'critical';
  const isWarning = message.metadata?.severity === 'warning';
  const { icon, text } = isUser
    ? { icon: null, text: message.content }
    : parseIconMarker(message.content);
  const accentColor = getAccentColor(message.metadata?.severity);

  if (message.isTyping) {
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingHeader}>
            <View style={[styles.typingIconBg]}>
              <Ionicons name="ellipsis-horizontal" size={14} color={COLORS.accent.purple} />
            </View>
            <Text style={styles.typingLabel}>Sentinel is thinking...</Text>
          </View>
        </View>
      </View>
    );
  }

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // User messages — clean right-aligned pills
  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{text}</Text>
          <Text style={styles.userTime}>{timeStr}</Text>
        </View>
      </View>
    );
  }

  // Agent messages — rich card with accent bar
  return (
    <View style={styles.agentRow}>
      <View style={[
        styles.agentCard,
        isCritical && styles.criticalCard,
        isWarning && styles.warningCard,
      ]}>
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

        <View style={styles.agentContent}>
          {/* Header */}
          <View style={styles.agentHeader}>
            <View style={[styles.agentIconBg, { backgroundColor: isCritical ? COLORS.eject.dim : COLORS.accent.purpleDim }]}>
              <Ionicons
                name={(icon || 'hardware-chip-outline') as any}
                size={12}
                color={isCritical ? COLORS.eject.primary : COLORS.accent.purple}
              />
            </View>
            <Text style={[styles.agentLabel, isCritical && { color: COLORS.eject.light }]}>
              {isCritical ? 'ALERT' : 'Sentinel'}
            </Text>
            <Text style={styles.agentTime}>{timeStr}</Text>
          </View>

          {/* Message body */}
          <Text style={[
            styles.agentText,
            isCritical && styles.criticalText,
          ]}>
            {text}
          </Text>

          {/* Action badge */}
          {message.metadata?.action && (
            <View style={styles.actionBadge}>
              <Ionicons name="key-outline" size={11} color={COLORS.accent.purple} />
              <Text style={styles.actionText}>Awaiting signature</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── User Messages ─────────────────────────────────
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  userBubble: {
    maxWidth: '75%',
    backgroundColor: COLORS.accent.purpleBright,
    borderRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  userText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '500',
  },
  userTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: SPACING.xs,
    textAlign: 'right',
  },

  // ─── Agent Messages ────────────────────────────────
  agentRow: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  agentCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  criticalCard: {
    borderColor: COLORS.eject.border,
    backgroundColor: COLORS.eject.surface,
  },
  warningCard: {
    borderColor: COLORS.accent.goldBorder,
    backgroundColor: COLORS.accent.goldDim,
  },
  accentBar: {
    width: 3,
    backgroundColor: COLORS.accent.purple,
  },
  agentContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  agentIconBg: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.accent.purpleDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.tertiary,
    flex: 1,
    letterSpacing: 0.3,
  },
  agentTime: {
    fontSize: 10,
    color: COLORS.text.muted,
  },
  agentText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  criticalText: {
    color: COLORS.eject.light,
    fontWeight: '600',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    backgroundColor: COLORS.accent.purpleDim,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.accent.purpleBorder,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent.purple,
  },

  // ─── Typing Indicator ──────────────────────────────
  typingContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  typingBubble: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  typingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingIconBg: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: COLORS.accent.purpleDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },
});
