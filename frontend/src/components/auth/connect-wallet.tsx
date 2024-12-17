import { useAuthContext } from '../../context/auth-context.tsx';

import { Button } from '@/components/ui/button.tsx';

export default function ConnectWallet() {
  const { userAcc, mmLogin } = useAuthContext();

  return (
    <div>
      <div className="flex flex-col items-center space-y-4">
        {userAcc ? (
          <div>
            <p>Connected with {userAcc}</p>
          </div>
        ) : (
          <Button onClick={mmLogin}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
}
