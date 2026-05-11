/**
 * ChatInput v3.0 — Floating glassmorphic input bar
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    Keyboard.dismiss();
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {/* Command hint icon */}
        <View style={styles.hintIcon}>
          <Ionicons name="terminal-outline" size={16} color={COLORS.text.muted} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ask sentinel anything..."
          placeholderTextColor={COLORS.text.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!disabled}
          multiline={false}
        />

        <TouchableOpacity
          style={[styles.sendBtn, hasText && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!hasText || disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={hasText ? '#FFFFFF' : COLORS.text.muted}
          />
        </TouchableOpacity>
      </View>

      {/* Powered by line */}
      <View style={styles.poweredRow}>
        <Ionicons name="hardware-chip-outline" size={10} color={COLORS.text.muted} />
        <Ionicons name="flash" size={8} color={COLORS.accent.gold} style={{ marginLeft: 4 }} />
        <TextInput
          style={styles.poweredText}
          editable={false}
          value="Powered by x402 Protocol • LI.FI Bridge"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.secondary,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  hintIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sm + 2,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: COLORS.accent.purple,
  },
  poweredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  poweredText: {
    fontSize: 10,
    color: COLORS.text.muted,
    marginLeft: 4,
    padding: 0,
  },
});
