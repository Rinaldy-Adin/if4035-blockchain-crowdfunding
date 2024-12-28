import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router-dom';

export const HeaderCard = () => {
  return (
    <div className="relative rounded-2xl p-8 bg-gradient-to-br from-[#4adede] via-primary to-[#1f2f98] w-full  text-left">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-2 text-primary-foreground">
          <h1 className="text-3xl font-bold text-white">
            Crowdfund Your Projects Easily 💰
          </h1>
          <p className="text-lg">
            A decentralized platform for creators to launch their{' '}
            <span className="font-semibold">projects</span>
          </p>
          <Link to="/project/new">
            <Button
              variant="secondary"
              className="animate-pulse text-primary rounded-2xl font-bold"
            >
              Kickstart Now!
            </Button>
          </Link>
        </div>
      </div>
      <img
        src="/images/landing-page-rocket.webp"
        className="absolute -top-12 right-2 -translate-y-2 lg:w-72 hidden md:block"
        alt="rocket"
      />
    </div>
  );
};
