import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy, useWallets, useSolanaWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Shield, Zap, Activity, ShieldAlert, Cpu, Route, Send, TrendingUp, ChevronRight, LogOut, Wifi, BarChart3, Fingerprint, Lock, ArrowRightLeft, Terminal, ArrowDownToLine, ArrowUpFromLine, Copy, Vault } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { checkProtocolHealth } from './utils/sentinel';
import { getSolPrice } from './utils/sentinel';
import './App.css';

const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');

function App() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const solanaWallet = wallets.find((w) => w.walletClientType === 'privy');

  const [balance, setBalance] = useState<number>(0);
  const [solPriceUsd, setSolPriceUsd] = useState<number>(0);
  const [prevSolPrice, setPrevSolPrice] = useState<number>(0);
  const [inputText, setInputText] = useState('');
  const [swarmCount, setSwarmCount] = useState(0);
  const [systemHealth, setSystemHealth] = useState({
    riskLevel: 'LOW',
    dataSource: 'loading',
    networkTps: 0,
  });

  // Get Privy's real transaction signer
  const signTransaction = useCallback(async (tx: Transaction): Promise<Transaction> => {
    if (!solanaWallet) throw new Error('No Privy wallet');
    const provider = await (solanaWallet as any).getEthereumProvider?.() || await (solanaWallet as any).getProvider?.();
    if (provider?.signTransaction) {
      return await provider.signTransaction(tx);
    }
    // Fallback: request method
    return await provider.request({ method: 'signTransaction', params: { transaction: tx } });
  }, [solanaWallet]);
  // Balance refresh function (reusable + passed to useChat)
  const refreshBalance = useCallback(async () => {
    if (solanaWallet?.address) {
      try {
        const bal = await connection.getBalance(new PublicKey(solanaWallet.address));
        setBalance(bal / 1e9);
      } catch (e) {
        console.error(e);
      }
    }
  }, [solanaWallet?.address]);

  const { 
    messages, 
    isTyping, 
    handleChipAction, 
    sendMessage, 
    executeBridge 
  } = useChat(solanaWallet?.address || null, balance, signTransaction, refreshBalance);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch balance on load + auto-refresh every 15s
  useEffect(() => {
    refreshBalance();
    const interval = setInterval(refreshBalance, 15_000);
    return () => clearInterval(interval);
  }, [refreshBalance]);

  // Fetch system health + live SOL price from Pyth
  useEffect(() => {
    if (!authenticated) return;
    const fetchHealth = async () => {
      try {
        const health = await checkProtocolHealth('Kamino');
        setSystemHealth({
          riskLevel: health.riskLevel,
          dataSource: health.dataSource,
          networkTps: health.networkTps,
        });

        // Track previous price for delta calculation
        if (health.solPrice > 0) {
          setPrevSolPrice(prev => prev === 0 ? health.solPrice : solPriceUsd);
          setSolPriceUsd(health.solPrice);
        }

        // Compute dynamic swarm agent count based on API connectivity
        let agents = 0;
        if (health.solPrice > 0) agents++;           // Pyth Oracle
        if (health.networkTps > 0) agents++;          // Helius RPC
        if (health.activity?.dataSource === 'live') agents++; // Helius Activity
        if (health.dataSource === 'live') agents++;   // Solana RPC
        setSwarmCount(agents);
      } catch (error) {
        console.warn('[ChatScreen] Health fetch failed:', error);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const riskColor = systemHealth.riskLevel === 'CRITICAL' ? '#EF4444'
    : systemHealth.riskLevel === 'HIGH' ? '#FF9500'
    : systemHealth.riskLevel === 'MEDIUM' ? '#FFD60A'
    : '#10B981';

  const sentinelColor = systemHealth.dataSource === 'live' ? '#10B981' : '#FFD60A';

  // ─── LOADING ───
  if (!ready) {
    return <div className="loading">INITIALIZING SENTINEL OS...</div>;
  }

  // ─── LOGIN SCREEN ───
  if (!authenticated) {
    return (
      <div className="login-container">
        {/* Network Badge */}
        <div className="network-badge">
          <div className="badge-dot" />
          <span>Devnet</span>
        </div>

        {/* Hero */}
        <div className="login-hero">
          <div className="login-hero-image">
            <img src="/assets/sentinel_hero.png" alt="Sentinel AI" />
          </div>

          <div className="title-wrap">
            <span className="title-light">Eject</span>
            <span className="title-accent">.fi</span>
          </div>

          <p className="login-subtitle">Autonomous DeFi Security</p>

          <p className="login-body">
            AI-powered vault monitoring with predictive risk<br/>
            analysis and zero-knowledge emergency exits.
          </p>

          {/* Feature Pills */}
          <div className="feature-pills">
            <div className="pill">
              <Cpu size={12} />
              <span>AI Swarm</span>
            </div>
            <div className="pill">
              <Lock size={12} />
              <span>ZK Privacy</span>
            </div>
            <div className="pill">
              <ArrowRightLeft size={12} />
              <span>Cross-Chain</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="login-bottom">
          <button className="login-btn" onClick={login}>
            <span>Connect Wallet</span>
            <ChevronRight size={16} />
          </button>
          <div className="partner-row">
            <span>Secured by Privy</span>
            <span className="partner-dot">·</span>
            <span>Powered by LI.FI</span>
          </div>
        </div>
      </div>
    );
  }

  const usd = solPriceUsd > 0 ? (balance * solPriceUsd).toFixed(2) : '—';
  const priceDelta = prevSolPrice > 0 && solPriceUsd > 0
    ? (((solPriceUsd - prevSolPrice) / prevSolPrice) * 100)
    : 0;
  const priceChangeStr = priceDelta >= 0 ? `+${priceDelta.toFixed(2)}%` : `${priceDelta.toFixed(2)}%`;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <img src="/assets/sentinel_hero.png" alt="Eject.fi" className="header-logo" />
          <span className="logo-text">Eject.fi</span>
        </div>
        <div className="header-right">
          {solanaWallet?.address && (
            <button className="copy-addr-btn" onClick={() => {
              navigator.clipboard.writeText(solanaWallet.address);
            }} title="Copy wallet address">
              <Copy size={12} />
              <span>{solanaWallet.address.slice(0, 4)}...{solanaWallet.address.slice(-4)}</span>
            </button>
          )}
          <button className="logout-btn" onClick={logout}>
            <LogOut size={14} />
            <span>Disconnect</span>
          </button>
        </div>
      </header>

      <div className="scroll-content">
        {/* System Status Bar */}
        <div className="system-status-bar">
          <div className="status-badge" style={{ borderColor: `${sentinelColor}33` }}>
            <div className="status-dot-live" style={{ backgroundColor: sentinelColor }} />
            <span style={{ color: sentinelColor }}>
              Sentinel: {systemHealth.dataSource === 'live' ? 'LIVE' : 'SYNC'}
              {systemHealth.networkTps > 0 ? ` · ${Math.round(systemHealth.networkTps)} TPS` : ''}
            </span>
          </div>
          <div className="risk-badge" style={{ 
            borderColor: `${riskColor}33`, 
            background: `${riskColor}0D` 
          }}>
            <span style={{ color: riskColor }}>Risk: {systemHealth.riskLevel}</span>
          </div>
        </div>

        {/* Vault Hero */}
        <div className="vault-hero">
          <div className="vault-label">Portfolio Value</div>
          <div className="vault-usd">${usd}</div>
          <div className="sol-row">
            <span className="sol-value">{balance.toFixed(4)} SOL</span>
            {solPriceUsd > 0 && (
              <div className="change-badge" style={{
                background: priceDelta >= 0 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
              }}>
                <TrendingUp size={10} style={{ color: priceDelta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                <span style={{ color: priceDelta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{priceChangeStr}</span>
              </div>
            )}
          </div>

          <div className="vault-divider" />

          {/* Quick Action Buttons — Deposit / Withdraw / Send / Vault */}
          <div className="wallet-actions">
            <button className="wallet-action-btn deposit" onClick={() => handleChipAction('deposit', 0.1 as any)} disabled={isTyping}>
              <ArrowDownToLine size={16} />
              <span>Deposit</span>
            </button>
            <button className="wallet-action-btn withdraw" onClick={() => handleChipAction('withdraw', 0.05 as any)} disabled={isTyping}>
              <ArrowUpFromLine size={16} />
              <span>Withdraw</span>
            </button>
            <button className="wallet-action-btn send" onClick={() => sendMessage('vault status')} disabled={isTyping}>
              <Vault size={16} />
              <span>Vault</span>
            </button>
          </div>

          <div className="vault-divider" />

          {/* Status Row */}
          <div className="status-row">
            <div className="status-item">
              <Shield size={16} color="#10B981" />
              <span className="status-item-label">Vault</span>
              <span className="status-item-value" style={{ color: '#10B981' }}>Secured</span>
            </div>
            <div className="status-row-divider" />
            <div className="status-item">
              <Cpu size={16} color="#3B82F6" />
              <span className="status-item-label">Swarm</span>
              <span className="status-item-value" style={{ color: '#3B82F6' }}>{swarmCount} Active</span>
            </div>
            <div className="status-row-divider" />
            <div className="status-item">
              <Activity size={16} color={riskColor} />
              <span className="status-item-label">Risk</span>
              <span className="status-item-value" style={{ color: riskColor }}>{systemHealth.riskLevel}</span>
            </div>
          </div>
        </div>

        {/* Action Grid — 2x2 + Full-width Eject */}
        <div className="action-section">
          <div className="action-grid-2x2">
            <button className="bento-card" onClick={() => handleChipAction('deep_scan')} disabled={isTyping}>
              <div className="bento-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
                <BarChart3 size={18} color="#8B5CF6" />
              </div>
              <span className="bento-title">Risk Scan</span>
              <span className="bento-sub">Predict threats</span>
            </button>

            <button className="bento-card" onClick={() => handleChipAction('enable_autopilot')} disabled={isTyping}>
              <div className="bento-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <Zap size={18} color="#F59E0B" />
              </div>
              <span className="bento-title">Autopilot</span>
              <span className="bento-sub">Max yield route</span>
            </button>

            <button className="bento-card" onClick={() => handleChipAction('simulate_deposit')} disabled={isTyping}>
              <div className="bento-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <Route size={18} color="#3B82F6" />
              </div>
              <span className="bento-title">Safe Haven</span>
              <span className="bento-sub">Powered by LI.FI</span>
            </button>

            <button className="bento-card" onClick={() => handleChipAction('deep_scan')} disabled={isTyping}>
              <div className="bento-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <Wifi size={18} color="#10B981" />
              </div>
              <span className="bento-title">Swarm</span>
              <span className="bento-sub">{swarmCount} agents live</span>
            </button>
          </div>

          {/* Emergency Eject — Full Width */}
          <button className="eject-card" onClick={executeBridge} disabled={isTyping}>
            <div className="eject-inner">
              <div className="bento-icon eject-icon-bg">
                <LogOut size={18} color="#EF4444" />
              </div>
              <div className="eject-text">
                <span className="eject-title">Emergency ZK-Eject</span>
                <span className="eject-sub">Private withdrawal · Zero market impact</span>
              </div>
              <ChevronRight size={16} color="#64748B" />
            </div>
          </button>
        </div>

        {/* Agent Console — Terminal */}
        <div className="console-container">
          <div className="console-header">
            <div className="console-header-left">
              <Terminal size={13} color="#64748B" />
              <span>Sentinel Console</span>
            </div>
            <div className="console-header-right">
              <div className="console-dot" style={{ backgroundColor: isTyping ? '#F59E0B' : '#10B981' }} />
              <span style={{ color: isTyping ? '#F59E0B' : '#10B981' }}>
                {isTyping ? 'Analyzing' : 'Online'}
              </span>
            </div>
          </div>
          <div className="console-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`console-msg ${msg.sender}`}>
                <span className="console-prompt">{msg.sender === 'agent' ? '→ ' : '$ '}</span>
                <pre>{msg.text}</pre>
              </div>
            ))}
            {isTyping && (
              <div className="console-msg agent">
                <span className="console-prompt">→ </span>
                <pre className="cursor-blink">▊</pre>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="console-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Command the Sentinel..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" disabled={!inputText.trim() || isTyping}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
