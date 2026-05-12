import { useWallets } from '@privy-io/react-auth/solana';

function Test() {
  const { wallets } = useWallets();
  console.log(wallets[0]);
}
