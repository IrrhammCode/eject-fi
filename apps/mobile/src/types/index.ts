export type MessageRole = 'user' | 'agent' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  isTyping?: boolean;
  metadata?: {
    txSignature?: string;
    action?: string;
    severity?: 'info' | 'warning' | 'critical';
    quoteData?: any;
  };
}

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number | null;
  connecting: boolean;
}

export type ChipAction = 'simulate_deposit' | 'check_oracle' | 'confirm_eject' | 'stealth_eject' | 'enable_autopilot';

export interface SuggestionChip {
  id: ChipAction;
  label: string;
  icon: string;
  variant: 'default' | 'danger';
}
