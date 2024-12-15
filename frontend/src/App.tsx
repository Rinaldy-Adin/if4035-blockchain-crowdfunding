import './App.css';
import Profile from './components/Profile.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/auth-context.tsx';
import { Toaster } from '@/components/ui/toaster.tsx';
import NewProjectPage from './components/NewProjectPage.tsx';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Profile />,
    },
    {
      path: '/project/new',
      element: <NewProjectPage />,
    },
  ]);

  return (
    <AuthProvider>
      <Toaster />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
