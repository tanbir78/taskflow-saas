
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Workflow,
  Moon,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

export default function AuthPage({ mode }) {
  const { login, register, google } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';

  // Handle authentication
  const run = async (fn) => {
    setBusy(true);

    try {
      await fn();
      navigate('/app');
    } catch (error) {
      toast.error(
        error.message.replace('Firebase: ', '')
      );
    } finally {
      setBusy(false);
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    run(() =>
      (isLogin ? login : register)(email, password)
    );
  };

  return (
    <main className="auth-page relative grid min-h-screen place-items-center px-4 py-24">

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-50 border-b border-base-300 bg-base-100/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* TaskFlow Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
              <Workflow size={22} />
            </span>

            TaskFlow
          </Link>

          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-ghost btn-square btn-sm rounded-xl"
              title={
                isDark
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* Back to Home */}
            <Link
              to="/"
              className="btn btn-ghost btn-sm gap-2 rounded-xl"
            >
              <ArrowLeft size={16} />

              <span className="hidden sm:inline">
                Back to Home
              </span>
            </Link>

          </div>
        </div>
      </header>

      {/* Authentication Form */}
      <form
        onSubmit={handleSubmit}
        className="auth-card relative z-10 w-full max-w-sm space-y-5 p-6 sm:p-8"
      >

        {/* Form Heading */}
        <div className="text-center">
          <h1 className="auth-heading text-2xl font-bold">
            {isLogin
              ? 'Welcome back'
              : 'Create your account'}
          </h1>

          <p className="auth-description mt-2 text-sm leading-6">
            {isLogin
              ? 'Log in to continue to your workspace.'
              : 'Get started with TaskFlow today.'}
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="auth-label text-sm">
            Email address
          </label>

          <input
            className="auth-input h-11 px-4"
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="auth-label text-sm">
            Password
          </label>

          <input
            className="auth-input h-11 px-4"
            type="password"
            required
            minLength={6}
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </div>

        {/* Login or Sign Up */}
        <button
          type="submit"
          className="btn btn-primary h-11 w-full rounded-xl font-semibold shadow-sm transition-all hover:shadow-lg hover:shadow-primary/20"
          disabled={busy}
        >
          {busy
            ? 'Please wait...'
            : isLogin
              ? 'Log in'
              : 'Create account'}
        </button>

        {/* Divider */}
        <div className="divider my-1 text-xs opacity-60">
          OR CONTINUE WITH
        </div>

        {/* Google Authentication */}
        <button
          type="button"
          className="auth-google-btn btn h-11 w-full rounded-xl font-semibold"
          disabled={busy}
          onClick={() => run(google)}
        >
          Continue with Google
        </button>

        {/* Switch Authentication Mode */}
        <p className="text-center text-sm">
          {isLogin ? (
            <>
              <span className="auth-description">
                Don't have an account?{' '}
              </span>

              <Link
                to="/register"
                className="font-semibold text-primary hover:underline"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <span className="auth-description">
                Already have an account?{' '}
              </span>

              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Log in
              </Link>
            </>
          )}
        </p>

      </form>

      {/* Footer */}
      <footer className="auth-footer absolute bottom-5 text-center text-xs">
        © {new Date().getFullYear()} TaskFlow. All rights reserved.
      </footer>

    </main>
  );
}
