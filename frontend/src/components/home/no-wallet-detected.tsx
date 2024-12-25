import { ReactNode } from 'react';
import { Button } from '@/components/ui/button.tsx';

interface ConnectWalletStepProps {
  step: number;
  description: ReactNode;
}

const ConnectWalletStep = ({ step, description }: ConnectWalletStepProps) => {
  return (
    <div className="flex w-full gap-x-2 items-center text-muted-foreground text-sm">
      <p className="rounded-full bg-primary/20 p-2 flex items-center justify-center size-6">
        {step}
      </p>
      {description}
    </div>
  );
};

const steps: ConnectWalletStepProps[] = [
  {
    step: 1,
    description: (
      <p>
        Install{' '}
        <a href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">
          <Button className="p-0 min-w-0 h-fit min-h-0" variant="link">
            MetaMask extension
          </Button>
        </a>
      </p>
    ),
  },
  {
    step: 2,
    description: <p>Open MetaMask extension on this site</p>,
  },
  {
    step: 3,
    description: (
      <p>
        Click <span className="font-medium">Connect</span>
      </p>
    ),
  },
];

export const NoWalletDetected = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-2">
      <img
        src="/images/no-wallet-illustration.webp"
        className="w-32"
        alt="no-wallet-detected"
      />
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-bold text-primary">
          Oops! No Wallet Detected
        </h2>
        <p className="text-muted-foreground text-sm">
          Ensure you have MetaMask installed and connected to this site site.
        </p>
      </div>
      <div className="my-2 rounded-md bg-secondary py-4 px-8 flex flex-col items-start justify-center gap-2">
        {steps.map((step, index) => {
          return (
            <ConnectWalletStep
              key={index}
              step={index + 1}
              description={step.description}
            />
          );
        })}
      </div>
    </div>
  );
};
