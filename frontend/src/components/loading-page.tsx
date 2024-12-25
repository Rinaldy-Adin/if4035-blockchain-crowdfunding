import { LoadingIcon } from '@/components/ui/loading-icon.tsx';

export const LoadingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen w-screen">
      <LoadingIcon className="size-20" />
      <p className="text-primary text-2xl font-bold">Please wait...</p>
    </div>
  );
};
