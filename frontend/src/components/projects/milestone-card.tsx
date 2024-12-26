import { Milestone } from '@/interfaces/project';
import { Button } from '@/components/ui/button.tsx';
import { useAuthContext } from '@/context/auth-context.tsx';
import { useMutation } from '@tanstack/react-query';
import { verifyProjectMilestone } from '@/lib/eth/campaign.ts';
import { toast } from '@/hooks/use-toast.ts';
import { useEffect, useMemo } from 'react';
import { CheckIcon, Clock1Icon, FlagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';

interface MilestoneCardProps {
  milestone: Milestone;
  projectAddress?: string;
  milestoneIndex: number;
  projectManager?: string;
}

export const MilestoneCard = ({
  milestone,
  projectAddress,
  milestoneIndex,
  projectManager,
}: MilestoneCardProps) => {
  const { web3, userAcc } = useAuthContext();

  useEffect(() => {
    console.log('userAcc', userAcc);
    console.log('projectManager', projectManager);
    console.log('projectAddress', projectAddress);
  }, [userAcc, projectManager]);

  const verifyMilestoneMutation = useMutation({
    mutationFn: async () => {
      if (!web3 || !projectAddress) {
        throw new Error('No web3 instance found');
      }
      console.log(web3, projectAddress, milestoneIndex);
      await verifyProjectMilestone(
        web3,
        projectAddress,
        milestoneIndex,
        userAcc
      );
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        description: `Error verifying milestone: ${err}`,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Milestone ${milestoneIndex} verified successfully!`,
      });
    },
  });

  const isVerificationAllowed = useMemo(() => {
    const date = new Date(Number(milestone.lastVerificationRequest) * 1000);
    const now = new Date();
    const hoursDifference = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    return (
      hoursDifference > 24 &&
      !milestone.verified &&
      !verifyMilestoneMutation.isPending
    );
  }, [milestone.lastVerificationRequest, milestone.verified]);

  return (
    <div
      className={`p-4 flex gap-4 items-start justify-between lg:min-w-[300px] rounded-lg`}
    >
      <div className="relative flex h-full w-10">
        <div className="absolute z-10 flex items-center justify-center bg-muted rounded-full size-8 text-primary top-4 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <FlagIcon className="w-4 h-full" />
        </div>
        <div className="absolute top-4 left-1/2 w-0 h-full border-dashed border-border border-[1px]" />
      </div>
      <div className="flex flex-col flex-1 border-2 border-dashed rounded-2xl p-4">
        <div className="flex w-full justify-between items-center">
          <h3 className="text-lg font-bold">{milestone.name}</h3>
          <div className="flex gap-2 items-center">
            {milestone.verified ? (
              <Badge className="flex gap-2 items-center bg-green-100 text-green-600 font-medium">
                <CheckIcon className="size-4" /> Completed
              </Badge>
            ) : (
              <Badge className="flex gap-2 items-center bg-yellow-100 text-yellow-600 font-medium">
                <Clock1Icon className="size-4" />
                Completion Pending
              </Badge>
            )}
          </div>
        </div>
        <p className="text-gray-700">{milestone.description}</p>
        <div className="flex w-full justify-between items-center">
          <p className="mt-2 text-muted-foreground font-light">Goal</p>
          <p className="font-semibold">💰{milestone.goal} ETH</p>
        </div>
        <div className="flex w-full justify-between items-center">
          <p className="mt-2 text-muted-foreground font-light">Withdrawn</p>
          <p className="font-semibold text-green-600">
            💰{milestone.achieved || 0} ETH
          </p>
        </div>
        {userAcc?.toLowerCase() == projectManager?.toLowerCase() && (
          <div className="flex w-full gap-2 mt-8 justify-end">
            <Button
              variant="outline"
              onClick={() => verifyMilestoneMutation.mutate()}
              disabled={!isVerificationAllowed}
            >
              {verifyMilestoneMutation.isPending
                ? 'Requesting Verification... 🚀'
                : 'Request Verification 🚀'}
            </Button>
            <Button variant="secondary" disabled={!milestone.verified}>
              Withdraw Funds 💳
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
