import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ToastProvider } from '@/shared/components/feedback/Toast';
import { DataProvider } from './providers/DataProvider';
import { router } from './routes';

export function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </DataProvider>
  );
}
