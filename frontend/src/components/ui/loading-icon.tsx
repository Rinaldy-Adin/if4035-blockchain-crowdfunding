import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

type LoadingIconProps = React.HTMLAttributes<HTMLDivElement>;

export const LoadingIcon = ({ className }: LoadingIconProps) => {
  return (
    <LoaderCircle
      className={cn('animate-spin size-4 text-primary', className)}
    />
  );
};
