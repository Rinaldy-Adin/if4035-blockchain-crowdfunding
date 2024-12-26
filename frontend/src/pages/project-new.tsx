import { Layout } from '@/layouts/layout.tsx';
import NewProjectForm from '@/components/projects/new-project-form.tsx';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const NewProjectPage = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['connectWallet'],
    });
  }, [queryClient]);

  return (
    <Layout
      pageTitle="New Project"
      pageDescription="Kickstart a new project to receive funds from contributors 🚀"
    >
      <NewProjectForm />
    </Layout>
  );
};
