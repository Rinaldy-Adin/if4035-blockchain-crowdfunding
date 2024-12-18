import { Layout } from '@/layouts/layout.tsx';
import { Project } from '@/interfaces/project';
import { ProjectCard } from '@/components/projects/project-card.tsx';
import { Input } from '@/components/ui/input.tsx';

export const Home = () => {
  const projects: Project[] = [
    {
      name: 'Project 1',
      description: 'This is project 1',
      milestones: [
        {
          name: 'Milestone 1',
          description: 'This is milestone 1',
          target: 1000,
        },
        {
          name: 'Milestone 2',
          description: 'This is milestone 2',
          target: 2000,
        },
      ],
      totalFund: 500,
    },
    {
      name: 'Project 2',
      description: 'This is project 2',
      milestones: [
        {
          name: 'Milestone 1',
          description: 'This is milestone 1',
          target: 1000,
        },
        {
          name: 'Milestone 2',
          description: 'This is milestone 2',
          target: 2000,
        },
      ],
      totalFund: 1500,
    },
  ];
  return (
    <Layout>
      {/* Title Section */}
      <div className="flex flex-col items-center text-center mt-6 mb-4">
        <h1 className="text-3xl font-bold mb-4">Project Kickstarter</h1>
        {/* Search Bar */}
        <div className="w-full max-w-md">
          <Input
            placeholder="Search projects..."
            className="border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {projects.map((project, id) => (
          <ProjectCard key={id} project={project} />
        ))}
      </div>
    </Layout>
  );
};