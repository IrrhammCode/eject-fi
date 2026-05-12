import { useState, useEffect, useRef } from 'react';
import { usePrivy, useWallets, useConnectWallet } from '@privy-io/react-auth';
import { useCreateWallet, useWallets as useSolanaWallets, useSignTransaction } from '@privy-io/react-auth/solana';
import { 
  Shield, Zap, Terminal, Send, TrendingUp, 
  ArrowUpFromLine, ArrowDownToLine, LogOut, Copy, Activity, 
  Cpu, BarChart3, Route, Wifi, ChevronRight, Fingerprint, 
  Vault, Lock, ArrowRightLeft, ShieldAlert, Loader2, Wallet
} from 'lucide-react';
import { useChat } from './hooks/useChat';
import { getHeliusStats } from './utils/sentinel';
import { MOCK_WALLET_BALANCE, MOCK_VAULT_BALANCE } from './utils/solana';
import './App.css';

function App() {
  const { login, logout, authenticated, ready, user } = usePrivy();
  const { wallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { connectWallet } = useConnectWallet();
  const { createWallet } = useCreateWallet();
  const { signTransaction } = useSignTransaction();
  const solanaWallet = solanaWallets.find((w: any) => w.walletClientType === 'privy') 
                    || solanaWallets[0] 
                    || wallets.find((w: any) => w.walletClientType === 'privy' && (w as any).chainType === 'solana') 
                    || wallets.find((w: any) => (w as any).chainType === 'solana');

  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(MOCK_WALLET_BALANCE);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [solPriceUsd, setSolPriceUsd] = useState(0);
  const [prevSolPrice, setPrevSolPrice] = useState(0);
  const [swarmCount, setSwarmCount] = useState(3);
  const [systemHealth, setSystemHealth] = useState({
    riskLevel: 'LOW',
    networkTps: 0,
    dataSource: 'sync'
  });

  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [caughtEvmConflict, setCaughtEvmConflict] = useState(false);

  useEffect(() => {
    if (solanaWallet?.address) {
      setSolanaAddress(solanaWallet.address);
    }
  }, [solanaWallet]);

  // Handle Auto-Creation of Solana Wallet
  const hasEvmWallet = user?.linkedAccounts?.some(
    account => account.type === 'wallet' && 
    (account.walletClientType === 'privy' || account.walletClientType === 'privy-v2' || account.connectorType === 'embedded') && 
    account.chainType !== 'solana'
  );

  useEffect(() => {
    if (ready && authenticated && !solanaWallet && !hasEvmWallet && !isCreatingWallet && !caughtEvmConflict) {
      const initWallet = async () => {
        try {
          setIsCreatingWallet(true);
          await createWallet();
        } catch (e: any) {
          console.error('Failed to create Solana wallet', e);
          const errMsg = e?.message || e?.toString() || '';
          if (errMsg.includes('User already has an embedded wallet')) {
            setCaughtEvmConflict(true);
          }
        } finally {
          setIsCreatingWallet(false);
        }
      };
      initWallet();
    }
  }, [ready, authenticated, solanaWallet, hasEvmWallet, caughtEvmConflict]);

  const { 
    messages, 
    isTyping, 
    sendMessage, 
    handleChipAction,
    executeBridge 
  } = useChat(
    solanaAddress, 
    balance,
    solanaWallet,
    signTransaction,
    () => fetchBalance()
  );

  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchBalance = async () => {
    if (!solanaAddress) return;
    // DEMO MOCK: use in-memory state
    setBalance(MOCK_WALLET_BALANCE);
    setVaultBalance(MOCK_VAULT_BALANCE);
  };

  useEffect(() => {
    if (solanaAddress) fetchBalance();
  }, [solanaAddress]);

  // Sync Live Data (Helius + Pyth)
  useEffect(() => {
    const syncData = async () => {
      try {
        const stats = await getHeliusStats();
        
        setPrevSolPrice(_prev => (solPriceUsd > 0 ? solPriceUsd : stats.solPrice));
        setSolPriceUsd(stats.solPrice);
        
        setSystemHealth({
          riskLevel: stats.riskLevel,
          networkTps: stats.tps,
          dataSource: 'live'
        });

        setSwarmCount(stats.tps > 2500 ? 4 : 3);
      } catch (e) {
        setSystemHealth(prev => ({ ...prev, dataSource: 'sync' }));
      }
    };

    syncData();
    const timer = setInterval(syncData, 10000);
    return () => clearInterval(timer);
  }, [solPriceUsd]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    sendMessage(inputText);
    setInputText('');
  };

  const riskColor = systemHealth.riskLevel === 'CRITICAL' ? '#EF4444' : 
                   systemHealth.riskLevel === 'HIGH' ? '#F59E0B' : '#10B981';
  const sentinelColor = systemHealth.dataSource === 'live' ? '#10B981' : '#FFD60A';

  // ─── LOADING ───
  if (!ready) {
    return <div className="loading">INITIALIZING SENTINEL OS...</div>;
  }

  // ─── LOGIN SCREEN ───
  if (!authenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="network-badge">
            <div className="badge-dot" />
            <span>SOLANA DEVNET</span>
          </div>

          <div className="login-hero">
            <div className="login-hero-image">
              <div className="main-shield-glow">
                <Shield size={80} color="#8B5CF6" strokeWidth={1.5} />
              </div>
            </div>
            <div className="title-wrap">
              <span className="title-light">eject</span>
              <span className="title-accent">.fi</span>
            </div>
            <div className="login-subtitle">Capital Rescue Protocol</div>
            <p className="login-body">
              Autonomous AI security for your Solana assets. 
              Predictive monitoring with zero-knowledge emergency exits.
            </p>

            <div className="feature-pills">
              <div className="pill"><Shield size={12} /> 24/7 Sentinel</div>
              <div className="pill"><Zap size={12} /> ZK-Eject</div>
              <div className="pill"><Cpu size={12} /> AI Swarm</div>
            </div>
          </div>

          <div className="login-bottom">
            <button className="login-btn" onClick={login}>
              <Terminal size={20} />
              Connect Wallet
            </button>
            <div className="partner-row">
              <span>Secured by Privy</span>
              <span className="partner-dot">·</span>
              <span>Powered by Helius</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── CREATE WALLET FALLBACK ───
  if (authenticated && !solanaWallet) {
    if (hasEvmWallet || caughtEvmConflict) {
      return (
        <div className="login-container">
          <div className="login-card">
            <div className="network-badge">
              <div className="badge-dot" style={{ background: '#EF4444', boxShadow: '0 0 10px #EF4444' }} />
              <span style={{ color: '#EF4444' }}>EVM WALLET CONFLICT</span>
            </div>

            <div className="login-hero">
              <div className="title-wrap" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>
                <span className="title-light">Action</span>
                <span className="title-accent">&nbsp;Required</span>
              </div>
              <p className="login-body" style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8rem', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                User already has an embedded EVM wallet.
              </p>
              <p className="login-body" style={{ marginTop: '16px' }}>
                Your Google account is already linked to an Ethereum embedded wallet in Privy. Privy does not currently allow automatically creating a second embedded wallet for Solana on the same account.
              </p>
              <p className="login-body" style={{ fontSize: '0.8rem' }}>
                Please connect an external Solana wallet (like Phantom) to continue, or logout and use a completely new email address.
              </p>
            </div>

            <div className="login-bottom">
              <button className="login-btn" onClick={() => connectWallet()}>
                <Wallet size={20} />
                Connect Phantom / Solflare
              </button>
              <button className="logout-btn" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
                <LogOut size={16} /> Logout & Try New Account
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="login-container">
          <div className="login-card">
            <div className="network-badge">
              <div className="badge-dot" style={{ background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <span style={{ color: '#10B981' }}>INITIALIZING PROTOCOL</span>
            </div>
            <div className="login-hero">
              <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: '#6D28D9' }} />
              <p className="login-body" style={{ marginTop: '24px', textAlign: 'center' }}>
                Generating secure Zero-Knowledge Solana Wallet...
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  const totalSol = balance + vaultBalance;
  const usd = solPriceUsd > 0 ? (totalSol * solPriceUsd).toFixed(2) : '—';
  const priceDelta = prevSolPrice > 0 && solPriceUsd > 0
    ? (((solPriceUsd - prevSolPrice) / prevSolPrice) * 100)
    : 0;
  const priceChangeStr = priceDelta >= 0 ? `+${priceDelta.toFixed(2)}%` : `${priceDelta.toFixed(2)}%`;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <div className="header-logo-bg">
            <Shield size={20} color="#8B5CF6" />
          </div>
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
            <span>EXIT</span>
          </button>
        </div>
      </header>

      <div className="main-layout">
        {/* Left Panel: Stats & Controls */}
        <div className="dashboard-panel">
          <div className="panel-content">
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
                <span className="sol-value">{totalSol.toFixed(4)} SOL</span>
                {solPriceUsd > 0 && (
                  <div className="change-badge" style={{
                    background: priceDelta >= 0 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                  }}>
                    {priceDelta >= 0 ? <TrendingUp size={10} color="#10B981" /> : <ShieldAlert size={10} color="#EF4444" />}
                    <span style={{ color: priceDelta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{priceChangeStr}</span>
                  </div>
                )}
              </div>

              {/* Dual Balance Cards */}
              <div className="balance-cards">
                <div className="balance-card">
                  <div className="balance-card-header">
                    <div className="balance-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                      <Wallet size={14} color="#3B82F6" />
                    </div>
                    <span className="balance-card-label">WALLET</span>
                  </div>
                  <div className="balance-card-value">{balance.toFixed(4)}</div>
                  <div className="balance-card-unit">SOL</div>
                </div>
                <div className="balance-card vault-card">
                  <div className="balance-card-header">
                    <div className="balance-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                      <Shield size={14} color="#10B981" />
                    </div>
                    <span className="balance-card-label">VAULT</span>
                  </div>
                  <div className="balance-card-value" style={vaultBalance > 0 ? { color: '#10B981' } : {}}>{vaultBalance.toFixed(4)}</div>
                  <div className="balance-card-unit">SOL</div>
                </div>
              </div>

              <div className="vault-divider" />

              {/* Quick Action Buttons */}
              <div className="wallet-actions">
                <button className="wallet-action-btn deposit" onClick={() => handleChipAction('deposit', 0.1 as any)} disabled={isTyping}>
                  <ArrowDownToLine size={20} />
                  <span>Deposit</span>
                </button>
                <button className="wallet-action-btn withdraw" onClick={() => handleChipAction('withdraw', 0.05 as any)} disabled={isTyping}>
                  <ArrowUpFromLine size={20} />
                  <span>Withdraw</span>
                </button>
                <button className="wallet-action-btn vault" onClick={() => sendMessage('vault status')} disabled={isTyping}>
                  <Vault size={20} />
                  <span>Vault</span>
                </button>
              </div>

              <div className="vault-divider" />

              {/* Status Row */}
              <div className="status-row">
                <div className="status-item">
                  <Shield size={16} color="#10B981" />
                  <span className="status-item-label">Security</span>
                  <span className="status-item-value" style={{ color: '#10B981' }}>Active</span>
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
                  <span className="status-item-label">Health</span>
                  <span className="status-item-value" style={{ color: riskColor }}>Optimal</span>
                </div>
              </div>
            </div>

            {/* Action Grid */}
            <div className="action-section">
              <div className="section-header">
                <Fingerprint size={14} />
                <span>INTELLIGENCE GRID</span>
              </div>
              <div className="action-grid-2x2">
                <button className="bento-card" onClick={() => handleChipAction('deep_scan')} disabled={isTyping}>
                  <div className="bento-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
                    <BarChart3 size={18} color="#8B5CF6" />
                  </div>
                  <span className="bento-title">Deep Scan</span>
                  <span className="bento-sub">Check protocol risk (x402)</span>
                </button>

                <button className="bento-card" onClick={() => handleChipAction('simulate_deposit')} disabled={isTyping}>
                  <div className="bento-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                    <Route size={18} color="#3B82F6" />
                  </div>
                  <span className="bento-title">Safe Haven</span>
                  <span className="bento-sub">Powered by LI.FI</span>
                </button>

                <button className="bento-card" onClick={() => handleChipAction('enable_autopilot')} disabled={isTyping}>
                  <div className="bento-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
                    <Zap size={18} color="#F59E0B" />
                  </div>
                  <span className="bento-title">Autopilot</span>
                  <span className="bento-sub">Jupiter yield swap</span>
                </button>

                <button className="bento-card" onClick={() => sendMessage('swarm status')} disabled={isTyping}>
                  <div className="bento-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                    <Wifi size={18} color="#10B981" />
                  </div>
                  <span className="bento-title">Swarm</span>
                  <span className="bento-sub">{swarmCount} agents live</span>
                </button>
              </div>

              {/* Emergency Eject */}
              <button className="eject-card" onClick={executeBridge} disabled={isTyping}>
                <div className="eject-inner">
                  <div className="bento-icon eject-icon-bg">
                    <ShieldAlert size={20} color="#EF4444" />
                  </div>
                  <div className="eject-text">
                    <span className="eject-title">EMERGENCY ZK-EJECT</span>
                    <span className="eject-sub">Withdraw everything to Base via LI.FI</span>
                  </div>
                  <ChevronRight size={18} color="#EF4444" opacity={0.5} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Agent Console */}
        <div className="console-panel">
          <div className="console-container">
            <div className="console-header">
              <div className="console-header-left">
                <Terminal size={14} />
                <span>SENTINEL COMMAND DECK</span>
              </div>
              <div className="console-header-right" style={{ color: sentinelColor }}>
                <div className="console-dot" style={{ backgroundColor: sentinelColor }} />
                <span>CONNECTED</span>
              </div>
            </div>
            
            <div className="console-body">
              {messages.map((m) => (
                <div key={m.id} className={`console-msg ${m.sender}`}>
                  <span className="console-prompt">{m.sender === 'user' ? '❯' : '●'}</span>
                  <pre>{m.text}</pre>
                </div>
              ))}
              {isTyping && (
                <div className="console-msg agent">
                  <span className="console-prompt">●</span>
                  <pre className="cursor-blink">_</pre>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="console-input" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder={solanaAddress ? "Type a command..." : "Connecting..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping || !solanaAddress}
              />
              <button type="submit" disabled={isTyping || !inputText.trim() || !solanaAddress}>
                <Send size={16} />
              </button>
            </form>
          </div>
          
          <div className="console-footer">
            <div className="footer-item">
              <Lock size={12} />
              <span>Devnet Environment</span>
            </div>
            <div className="footer-item">
              <ArrowRightLeft size={12} />
              <span>ZK-Engine: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
