import {Layout} from '@/layouts/layout.tsx';
import {Project} from '@/interfaces/project';
import {useAuthContext} from "@/context/auth-context.tsx";
import {useEffect, useState} from "react";
import {getProjectDetail} from "@/eth/campaign.ts";
import {useParams} from "react-router-dom";
import {Progress} from "@/components/ui/progress.tsx";
import {Button} from "@/components/ui/button.tsx";

export const ProjectDetail = () => {
  const {web3} = useAuthContext();
  const {address} = useParams();
  const [project, setProject] = useState<Project>();
  const [totalGoal, setTotalGoal] = useState(0)
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        if (web3 && address) {
          const projectDetail = await getProjectDetail(web3, address);

          if (isMounted) {
            setProject(projectDetail);
            setTotalGoal(projectDetail.milestones.reduce((acc, milestone) => acc + milestone.goal, 0))
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching project:", error);
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

      <div className={"flex flex-col md:flex-row gap-8"}>
        <div className="w-full space-y-4">
          <div className="relative h-[480px]">
            <img
              src={'/sample.jpeg'}
              className="w-full h-full object-cover"
              alt={project?.name}
            />
            {/* Progress Bar Overlay */}
            <Progress
              value={(project?.totalFund / totalGoal) * 100}
              className="absolute bottom-0 left-0 w-full"
            />
          </div>
          {/* Funds vs Goals */}
          <div className="text-center">
            <p className="text-lg">
              <span className="font-semibold text-green-600">Total Funds: {project?.totalFund}</span> /
              <span
                className="text-gray-800"> Total Goals: {totalGoal}</span>
            </p>
          </div>
          <Button className="w-full">Contribute</Button>
        </div>

        {/* Milestones */}
        <div className="flex flex-col gap-6 w-full">
          {project?.milestones.map((milestone, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-md ${
                milestone.achieved >= milestone.goal
                  ? "bg-green-100 border border-green-300"
                  : "bg-red-100 border border-red-300"
              }`}
            >
              <h3 className="text-lg font-bold">{milestone.name}</h3>
              <p className="text-gray-700">{milestone.description}</p>
              <p className="mt-2">
                Goal: <span className="font-semibold">{milestone.goal}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

    </Layout>
  );
};
