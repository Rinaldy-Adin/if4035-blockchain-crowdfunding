import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';

interface AuthContextType {
  userAcc: string | null;
  mmLogin: () => Promise<void>;
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
    const fetchAccounts = async () => {
      if (!window?.ethereum) return;

      try {
        const accounts: string[] = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };

    fetchAccounts();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!window?.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null); // No accounts connected
      } else {
        setAddress(accounts[0]);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const contextValue: AuthContextType = {
    userAcc: address,
    mmLogin: connectWallet,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
