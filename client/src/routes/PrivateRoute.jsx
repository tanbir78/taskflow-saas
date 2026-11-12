import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  // Allow authenticated users to access the route
  // Redirect unauthenticated users to the login page
  return user ? (
    children
  ) : (
    <Navigate
      to="/login"
      state={{ from: location }}
      replace
    />
  );
}
