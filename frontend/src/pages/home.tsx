import { Layout } from '@/layouts/layout.tsx';
import { ProjectSummary } from '@/interfaces/project';
import { ProjectCard } from '@/components/projects/project-card.tsx';
import { useAuthContext } from '@/context/auth-context.tsx';
import { useEffect, useState } from 'react';
import { getDeployedProjects } from '@/eth/campaignFactory.ts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';

export const Home = () => {
  const { web3 } = useAuthContext();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        if (web3) {
          const projectSummaries = await getDeployedProjects(web3);

          if (isMounted) {
            setProjects(projectSummaries);
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching projects:', error);
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [web3]);

  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <Layout>
      {/* Title Section */}
      <div className="flex flex-col items-center text-center mt-6 mb-4">
        <h1 className="text-3xl font-bold mb-4">Project Kickstarter</h1>
        {/* Search Bar */}
        {/*<div className="w-full max-w-md">*/}
        {/*  <Input*/}
        {/*    placeholder="Search projects..."*/}
        {/*    className="border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"*/}
        {/*  />*/}
        {/*</div>*/}
        {/*  Button new project at right side */}
        <div className="w-full flex justify-end">
          <Link to="/project/new">
            <Button>New Project</Button>
          </Link>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {projects.map((project, id) => (
          <Link to={'/project/' + project.projectAddress} key={id}>
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>
    </Layout>
  );
};
