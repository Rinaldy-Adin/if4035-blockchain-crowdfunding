import { useAuthContext } from '../../context/auth-context.tsx';

import { Button } from '@/components/ui/button.tsx';
import { HandCoins, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ConnectWallet() {
  const { userAcc, mmLogin } = useAuthContext();

  return (
    <div>
      <div className="flex flex-col items-center space-y-4">
        {userAcc ? (
          <div className='flex gap-4'>
            <Link
              to="/contributions"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 text-primary-foreground hover:bg-blue-500"
            >
              <p className="mr-2">Contribution History</p>
              <HandCoins className="size-6" />
            </Link>
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-primary-foreground font-medium  h-10 px-4 py-2">
              <p className={'mr-2'}>Hello, {userAcc}</p>
              <UserRound className="size-6" />
            </div>
          </div>
        ) : (
          <Button onClick={mmLogin}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
}
