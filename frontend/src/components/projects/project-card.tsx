import { Card } from '@/components/ui/card.tsx';
import { ProjectSummary } from '@/interfaces/project';
import { Progress } from '@/components/ui/progress.tsx';

export const ProjectCard = ({ project }: { project: ProjectSummary }) => {
  return (
    <Card className="w-full overflow-hidden rounded-xl shadow-md">
      {/* Image Container with Progress Bar Overlay */}
      <div className="relative w-full h-[240px]">
        <img
          src={'/sample.jpeg'}
          className="w-full h-full object-cover"
          alt={project.name}
        />
        {/* Progress Bar Overlay */}
        <Progress
          value={(project.totalFunds / project.totalGoals) * 100}
          className="absolute bottom-0 left-0 w-full"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col p-4">
        <h3 className="font-bold text-lg mb-1">{project.name}</h3>
        <p className="line-clamp-2 text-gray-600 text-sm mb-2">
          {project.backersCount} contributor(s)
        </p>
        <p className="text-sm text-gray-800 font-medium">
          {project.totalFunds} out of {project.totalGoals}
        </p>
      </div>
    </Card>
  );
};
