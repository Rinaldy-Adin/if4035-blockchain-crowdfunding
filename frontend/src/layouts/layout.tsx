import ConnectWallet from '@/components/auth/connect-wallet.tsx';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex flex-row sticky top-0 bg-primary backdrop-blur justify-between px-2 lg:px-6 py-2 z-20 items-center">
        <Link to={'/'}>
          <h1 className="font-bold text-white text-lg">Kickstarter</h1>
        </Link>
        <ConnectWallet />
      </header>
      <div className="flex flex-col py-8 px-4 lg:px-16 h-full w-full">
        {children}
      </div>
    </div>
  );
};
