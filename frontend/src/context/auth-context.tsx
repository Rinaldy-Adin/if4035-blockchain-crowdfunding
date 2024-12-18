import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Web3 } from 'web3';

interface AuthContextType {
  userAcc: string | null;
  mmLogin: () => Promise<void>;
  web3: Web3 | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const connectWallet = async () => {
    if (!window?.ethereum) {
      alert('No wallet found. Please install MetaMask.');
      return;
    }

    try {
      const accounts = await window.ethereum.request<string[]>({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        alert('No authorized account found');
      }

      setAddress(accounts[0]);
    } catch (error) {
      console.error('error', error);
    }
  };

  // Fetch connected account on load
  useEffect(() => {
    connectWallet();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!window?.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
      } else {
        setAddress(accounts[0]);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  useEffect(() => {
    if (address) {
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);
    }
  }, [address]);

  const contextValue: AuthContextType = {
    userAcc: address,
    mmLogin: connectWallet,
    web3,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
