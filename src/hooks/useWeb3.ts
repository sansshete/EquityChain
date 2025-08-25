import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const updateState = useCallback((updates: Partial<Web3State>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      updateState({ error: 'MetaMask is not installed' });
      return;
    }

    try {
      updateState({ isConnecting: true, error: null });

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      updateState({
        provider,
        signer,
        account,
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      return account;

    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      updateState({
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      });
      return null;
    }
  }, [updateState]);

  const disconnectWallet = useCallback(() => {
    updateState({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, [updateState]);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      updateState({ error: error.message || 'Failed to switch network' });
    }
  }, [updateState]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== state.account) {
        connectWallet();
      }
    };

    const handleChainChanged = (chainId: string) => {
      updateState({ chainId: parseInt(chainId, 16) });
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, [state.account, connectWallet, disconnectWallet, updateState]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
      }
    };

    autoConnect();
  }, [connectWallet]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}