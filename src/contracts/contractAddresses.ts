// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Ethereum Mainnet
  1: {
    crowdfundingFactory: '0x0000000000000000000000000000000000000000', // Deploy and update
  },
  // Ethereum Sepolia Testnet
  11155111: {
    crowdfundingFactory: '0x0000000000000000000000000000000000000000', // Deploy and update
  },
  // Polygon Mainnet
  137: {
    crowdfundingFactory: '0x0000000000000000000000000000000000000000', // Deploy and update
  },
  // Polygon Mumbai Testnet
  80001: {
    crowdfundingFactory: '0x0000000000000000000000000000000000000000', // Deploy and update
  },
  // Local development
  31337: {
    crowdfundingFactory: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Hardhat default
  },
};

export const SUPPORTED_NETWORKS = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia Testnet',
  137: 'Polygon Mainnet',
  80001: 'Polygon Mumbai',
  31337: 'Localhost',
};

export const getContractAddress = (chainId: number, contract: string) => {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return addresses[contract as keyof typeof addresses];
};