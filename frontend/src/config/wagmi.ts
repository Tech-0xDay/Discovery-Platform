import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Kaia Testnet (Kairos) configuration
const kaiaTestnet = {
  id: 1001,
  name: 'Kaia Testnet (Kairos)',
  nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://public-en-kairos.node.kaia.io'] },
  },
  blockExplorers: {
    default: { name: 'Kaia Testnet Explorer', url: 'https://kairos.kaiascan.io' },
  },
};

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '00000000000000000000000000000000';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, kaiaTestnet],
  connectors: [
    injected(),
    ...(projectId !== '00000000000000000000000000000000'
      ? [walletConnect({ projectId })]
      : []
    ),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [kaiaTestnet.id]: http(import.meta.env.VITE_KAIA_KAIROS_RPC || 'https://public-en-kairos.node.kaia.io'),
  },
});
