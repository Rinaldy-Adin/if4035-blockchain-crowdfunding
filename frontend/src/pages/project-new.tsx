import { Layout } from '@/layouts/layout.tsx';
import NewProjectForm from '@/components/projects/new-project-form.tsx';

export const NewProjectPage = () => {
  return (
    <Layout
      pageTitle="New Project"
      pageDescription="Kickstart a new project to receive funds from contributors 🚀"
    >
      <NewProjectForm />
    </Layout>
  );
};
