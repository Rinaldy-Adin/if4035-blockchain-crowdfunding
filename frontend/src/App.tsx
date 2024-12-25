import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/auth-context.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';
import NewProjectPage from './components/NewProjectPage.tsx';
import { Home } from '@/pages/home.tsx';
import { ProjectDetail } from '@/pages/project-detail.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const queryClient = new QueryClient();

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/project/new',
      element: <NewProjectPage />,
    },
    {
      path: '/project/:address',
      element: <ProjectDetail />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
