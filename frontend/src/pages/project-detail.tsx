import { Layout } from '@/layouts/layout.tsx';
import { Project } from '@/interfaces/project';
import { useAuthContext } from '@/context/auth-context.tsx';
import { useEffect, useState } from 'react';
import { getProjectDetail } from '@/lib/eth/campaign.ts';
import { useParams } from 'react-router-dom';
import { Progress } from '@/components/ui/progress.tsx';
import { Button } from '@/components/ui/button.tsx';
import { MilestoneCard } from '@/components/projects/milestone-card.tsx';

export const ProjectDetail = () => {
  const { web3 } = useAuthContext();
  const { address } = useParams();
  const [project, setProject] = useState<Project>();
  const [totalGoal, setTotalGoal] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        if (web3 && address) {
          const projectDetail = await getProjectDetail(web3, address);
          console.log(projectDetail);
          if (isMounted) {
            setProject(projectDetail);
            setTotalGoal(
              projectDetail.milestones.reduce(
                (acc, milestone) => acc + milestone.goal,
                0
              )
            );
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching project:', error);
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [web3, address]);

  if (loading) {
    return <p>Loading projects...</p>;
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
                Total Funds: {project?.totalFund}
              </span>{' '}
              /<span className="text-gray-800"> Total Goals: {totalGoal}</span>
            </p>
          </div>
          <Button className="w-full">Contribute</Button>
        </div>

        {/* Milestones */}
        <div className="flex flex-col gap-6 w-full">
          {project?.milestones.map((milestone, index) => (
            <MilestoneCard
              key={index}
              milestone={milestone}
              projectAddress={address}
              milestoneIndex={index}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};
