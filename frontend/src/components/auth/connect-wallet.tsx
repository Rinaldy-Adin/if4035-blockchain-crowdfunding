import { useAuthContext } from '../../context/auth-context.tsx';

import { Button } from '@/components/ui/button.tsx';
import { UserRound } from 'lucide-react';

export default function ConnectWallet() {
  const { userAcc, mmLogin } = useAuthContext();

  return (
    <div>
      <div className="flex flex-col items-center space-y-4">
        {userAcc ? (
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-primary-foreground font-medium  h-10 px-4 py-2">
            <p className={'mr-2'}>Hello, {userAcc}</p>
            <UserRound className="h-4 w-4" />
          </div>
        ) : (
          <Button onClick={mmLogin}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
}
