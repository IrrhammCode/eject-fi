
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors, defaultSolanaRpcsPlugin } from '@privy-io/react-auth/solana';
import App from './App.tsx';
import './index.css';

const solanaConnectors = toSolanaWalletConnectors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#6D28D9', // Violet-700
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        embeddedWallets: {
          ethereum: { createOnLogin: 'off' },
          solana: { createOnLogin: 'off' }
        },
        plugins: [
          (defaultSolanaRpcsPlugin as any)()
        ],
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
);
