import { Milestone } from '@/interfaces/project';
import { Button } from '@/components/ui/button.tsx';
import { useAuthContext } from '@/context/auth-context.tsx';
import { useMutation } from '@tanstack/react-query';
import { verifyProjectMilestone } from '@/lib/eth/campaign.ts';
import { toast } from '@/hooks/use-toast.ts';

interface MilestoneCardProps {
  milestone: Milestone;
  projectAddress?: string;
  milestoneIndex: number;
}

export const MilestoneCard = ({
  milestone,
  projectAddress,
  milestoneIndex,
}: MilestoneCardProps) => {
  const { web3 } = useAuthContext();

  const verifyMilestoneMutation = useMutation({
    mutationFn: async () => {
      if (!web3 || !projectAddress) {
        throw new Error('No web3 instance found');
      }
      await verifyProjectMilestone(web3, projectAddress, milestoneIndex);
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

  return (
    <div className={`p-4 rounded-lg shadow-md`}>
      <h3 className="text-lg font-bold">{milestone.name}</h3>
      <p className="text-gray-700">{milestone.description}</p>
      <p className="mt-2">
        Goal: <span className="font-semibold">{milestone.goal}</span>
      </p>
      <div className="flex w-full justify-end">
        <Button
          variant="secondary"
          onClick={() => verifyMilestoneMutation.mutate()}
          disabled={verifyMilestoneMutation.isPending}
        >
          {verifyMilestoneMutation.isPending
            ? 'Requesting Verification... 🚀'
            : 'Request Verification 🚀'}
        </Button>
      </div>
    </div>
  );
};
