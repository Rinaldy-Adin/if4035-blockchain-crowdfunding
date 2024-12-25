import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Web3 } from 'web3';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  userAcc: string | null;
  web3: Web3 | null;
  isLoading: boolean;
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

  const { isLoading } = useQuery({
    queryFn: async () => {
      try {
        if (!window?.ethereum) {
          return;
        }

        const accounts = (await window.ethereum.request({
          method: 'eth_requestAccounts',
        })) as string[];

        if (accounts.length === 0) {
          return;
        }

        setAddress(accounts[0]);
      } catch (error) {
        console.error('error', error);
      }
    },
    queryKey: ['connectWallet'],
  });

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
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  }, [address]);

  const contextValue: AuthContextType = {
    userAcc: address,
    web3,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
