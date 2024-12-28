import { Layout } from '@/layouts/layout.tsx';
import { Project } from '@/interfaces/project';
import { useAuthContext } from '@/context/auth-context.tsx';
import { useEffect, useState } from 'react';
import { getProjectDetail } from '@/lib/eth/campaign.ts';
import { useParams } from 'react-router-dom';
import { Progress } from '@/components/ui/progress.tsx';
import { Button } from '@/components/ui/button.tsx';
import { MilestoneCard } from '@/components/projects/milestone-card.tsx';
import { LoadingPage } from '@/components/loading-page.tsx';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import CurrencyInput from 'react-currency-input-field';
import { MS_DECIMAL_LIMIT } from '@/components/projects/new-project-form';
import { contributeToProject } from '@/lib/eth/campaignFactory';

export const ProjectDetail = () => {
  const { web3, userAcc } = useAuthContext();
  const { address } = useParams();
  const [project, setProject] = useState<Project>();
  const [totalGoal, setTotalGoal] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isContribExpanded, setContribExpanded] = useState<boolean>(false);
  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [contributionError, setContributionError] = useState<string>("");

  const fetchProject = async () => {
    try {
      if (web3 && address) {
        const projectDetail = await getProjectDetail(web3, address);
        console.log(projectDetail);
        setProject(projectDetail);
        setTotalGoal(
          projectDetail.milestones.reduce(
            (acc, milestone) => acc + milestone.goal,
            0
          )
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchProject();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3, address]);

  const contributeToProjectMutation = useMutation({
    mutationFn: async (amountStr: string) => {
      if (web3 && userAcc && address) {
        await contributeToProject(
          web3,
          address,
          amountStr,
          userAcc,
        );
      }
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: 'Unexpected Error Occurred 😰',
        description: `Error contributing to project: ${err}`,
      });
      fetchProject();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Successfully contributed to ${project?.name}!`,
      });
      fetchProject();
      setContributionError("");
      setContribExpanded(false);
      setContributionAmount("");
    },
  });

  const onSubmitContribution = async (amountStr: string) => {
    if (web3 && userAcc && project) {
      const balanceInWei = await web3.eth.getBalance(userAcc);
      const balanceInEther = parseFloat(web3.utils.fromWei(balanceInWei, "ether"));

      if (balanceInEther < parseFloat(amountStr)) {
        setContributionError("Insufficient balance for contribution");
        return
      }

      const totalFund = parseFloat(web3.utils.fromWei(project.totalFund, "ether"));
      if (totalFund + parseFloat(amountStr) > totalGoal) {
        setContributionError("Total contributions must not exceed total goal");
        return
      }

      contributeToProjectMutation.mutate(amountStr);
    }
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Layout>
      {/* Title Section */}
      <div className="flex flex-col items-center text-center mt-6 mb-4">
        <h1 className="text-3xl font-bold mb-4">{project?.name}</h1>
        <div className="w-full max-w-md">
          <p>{project?.description}</p>
        </div>
      </div>

      <div className={'flex flex-col md:flex-row gap-8'}>
        <div className="w-full space-y-4">
          <div className="relative h-[480px]">
            <img
              src={
                project?.imageCid
                  ? `https://${project?.imageCid}.ipfs.w3s.link`
                  : '/images/no-image.jpg'
              }
              className="w-full h-full object-cover"
              alt={project?.name}
            />
            {/* Progress Bar Overlay */}
            <Progress
              value={Math.floor(((project?.totalFund || 0) / totalGoal) * 100)}
              className="absolute bottom-0 left-0 w-full"
            />
          </div>
          {/* Funds vs Goals */}
          <div className="text-center">
            <p className="text-lg">
              <span className="font-semibold text-green-600">
                Total Funds: {web3?.utils.fromWei(project?.totalFund ?? 0, 'ether')}
              </span>{' '}
              /<span className="text-gray-800"> Total Goals: {totalGoal}</span>
            </p>
          </div>
          {isContribExpanded ? (
            <div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">ETH</p>
                <CurrencyInput
                  className="flex h-9 flex-1 rounded-2xl border border-input bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  placeholder="Enter your milestone goal here"
                  decimalsLimit={MS_DECIMAL_LIMIT}
                  value={contributionAmount}
                  onValueChange={(value) => {
                    setContributionAmount(value ?? "");
                  }}
                />
                <Button onClick={() => { onSubmitContribution(contributionAmount) }}>Contribute</Button>
              </div>
              {contributionError && (<p className='text-sm text-destructive'>{contributionError}</p>)}
            </div>
          ) : (
            <Button onClick={() => { setContribExpanded(true) }} className="w-full">Contribute</Button>
          )}
        </div>

        {/* Milestones */}
        <div className="flex flex-col w-full">
          {project?.milestones.map((milestone, index) => (
            <MilestoneCard
              key={index}
              milestone={milestone}
              projectAddress={address}
              milestoneIndex={index}
              projectManager={project?.manager}
            />
          ))}
        </div>
      </div>
    </Layout >
  );
};
