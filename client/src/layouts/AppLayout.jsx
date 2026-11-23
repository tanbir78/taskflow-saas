
import { LogOut, Moon, Sun, Workflow } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

export default function AppLayout() {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Unable to log out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
              <Workflow size={21} />
            </span>

            <span className="text-lg font-bold">
              TaskFlow
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-36 truncate text-sm opacity-70 sm:block">
              {user?.displayName || user?.email}
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm btn-square"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm gap-2"
              title="Log out"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
