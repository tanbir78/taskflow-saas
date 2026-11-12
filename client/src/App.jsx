import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AuthProvider from './providers/AuthProvider';
import PrivateRoute from './routes/PrivateRoute';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import AppHome from './pages/AppHome';

// React Query configuration
const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page */}
            <Route
              path="/"
              element={<Landing />}
            />

            {/* Authentication routes */}
            <Route
              path="/login"
              element={<AuthPage mode="login" />}
            />

            <Route
              path="/register"
              element={<AuthPage mode="register" />}
            />

            {/* Protected application route */}
            <Route
              path="/app"
              element={
                <PrivateRoute>
                  <AppHome />
                </PrivateRoute>
              }
            />

            {/* Redirect unknown routes */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </BrowserRouter>

        {/* Toast notifications */}
        <Toaster richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

