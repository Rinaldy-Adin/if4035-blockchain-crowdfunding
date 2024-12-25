import { cn } from '@/lib/utils.ts';

interface PageTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}
export const PageTitle = ({ title, description }: PageTitleProps) => {
  return (
    <div className={cn('flex flex-col items-start text-start gap-y-1')}>
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
};
