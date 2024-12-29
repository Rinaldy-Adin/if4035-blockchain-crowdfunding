import { ProjectContributionItem } from '@/interfaces/project';
import { HandCoins } from 'lucide-react';
import dayjs from 'dayjs';

interface ProjectContributionProps {
  contribution: ProjectContributionItem;
}

export const ProjectContributionCard = ({
  contribution,
}: ProjectContributionProps) => {
  return (
    <div className={`p-4 flex gap-4 items-stretch justify-between rounded-lg`}>
      <div className="relative flex w-10">
        <div className="absolute z-10 flex items-center justify-center bg-muted rounded-full size-8 text-primary top-4 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <HandCoins className="w-4 h-full" />
        </div>
        <div className="absolute top-4 left-1/2 w-0 h-4/5 border-dashed border-border border-[1px]" />
      </div>
      <div className="flex flex-col flex-1 border-2 border-dashed rounded-2xl p-4">
        <div className="flex w-full justify-end mb-2 text-sm items-center">
          <p className="text-muted-foreground">
            🕜 {dayjs(contribution.timestamp).format('HH:mm, DD MMMM YYYY')}
          </p>
        </div>
        <h3 className="text-md text-muted-foreground">
          Backer:{' '}
          <span className="font-semibold text-foreground">
            {contribution.backerAddress}
          </span>
        </h3>
        <div className="flex w-full items-center">
          <p className="text-muted-foreground font-light">Amount: </p>
          <p className="font-semibold">💰{contribution.amount} ETH</p>
        </div>
      </div>
    </div>
  );
};
