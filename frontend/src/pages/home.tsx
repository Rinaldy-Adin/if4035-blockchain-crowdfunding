import { Layout } from '@/layouts/layout.tsx';
import { ProjectSummary } from '@/interfaces/project';
import { ProjectCard } from '@/components/projects/project-card.tsx';
import { useAuthContext } from '@/context/auth-context.tsx';
import { useEffect, useState } from 'react';
import { getDeployedProjects } from '@/lib/eth/campaignFactory.ts';
import { Link } from 'react-router-dom';
import { NoWalletDetected } from '@/components/home/no-wallet-detected.tsx';
import { LoadingPage } from '@/components/loading-page.tsx';
import { LoadingIcon } from '@/components/ui/loading-icon.tsx';
import { SearchIcon } from 'lucide-react';
import { HeaderCard } from '@/components/home/header-card.tsx';

export const Home = () => {
  const { web3, isLoading: isAuthLoading } = useAuthContext();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        if (web3) {
          const projectSummaries = await getDeployedProjects(web3);
          console.log(projectSummaries);
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

  if (isAuthLoading) {
    return <LoadingPage />;
  }

  if (!web3) {
    return <NoWalletDetected />;
  }

  return (
    <Layout>
      {/* Title Section */}
      <div className="flex flex-col items-center text-center mt-6 mb-4">
        <HeaderCard />
        {/* Search Bar */}
        {/*<div className="w-full max-w-md">*/}
        {/*  <Input*/}
        {/*    placeholder="Search projects..."*/}
        {/*    className="border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"*/}
        {/*  />*/}
        {/*</div>*/}
        {/*  Button new project at right side */}
        <div className="w-full mt-6 flex justify-center items-center text-xl font-semibold">
          <p>
            👇 ...or <span className="text-primary font-bold">Contribute</span>{' '}
            to Projects 👇
          </p>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center gap-2 justify-center">
            <LoadingIcon />
            <p>Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project, id) => (
              <Link to={'/project/' + project.projectAddress} key={id}>
                <ProjectCard project={project} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <SearchIcon />
            <p>No projects found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
