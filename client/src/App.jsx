
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { Toaster } from 'sonner';

import AuthProvider from './providers/AuthProvider';
import ThemeProvider from './providers/ThemeProvider';

import PrivateRoute from './routes/PrivateRoute';
import AppLayout from './layouts/AppLayout';

import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import AppHome from './pages/AppHome';
import WorkspacePage from './pages/WorkspacePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />

              <Route
                path="/login"
                element={<AuthPage mode="login" />}
              />

              <Route
                path="/register"
                element={<AuthPage mode="register" />}
              />

              <Route
                path="/app"
                element={
                  <PrivateRoute>
                    <AppLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<AppHome />} />

                <Route
                  path="workspaces/:workspaceId"
                  element={<WorkspacePage />}
                />
              </Route>

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </BrowserRouter>

          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
