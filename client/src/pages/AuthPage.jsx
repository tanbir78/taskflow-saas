import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../providers/AuthProvider';

export default function AuthPage({ mode }) {
  const { login, register, google } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // Handle authentication
  const run = async (fn) => {
    setBusy(true);

    try {
      await fn();
      navigate('/app');
    } catch (e) {
      toast.error(e.message.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form
        className="card bg-base-200 w-full max-w-sm p-6 gap-3"
        onSubmit={(e) => {
          e.preventDefault();

          run(() =>
            (mode === 'login' ? login : register)(email, password)
          );
        }}
      >
        <h1 className="text-2xl font-bold">
          {mode === 'login'
            ? 'Welcome back'
            : 'Create your account'}
        </h1>

        {/* Email input */}
        <input
          className="input input-bordered"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input */}
        <input
          className="input input-bordered"
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login or registration */}
        <button
          className="btn btn-primary"
          disabled={busy}
        >
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        {/* Google authentication */}
        <button
          type="button"
          className="btn btn-outline"
          disabled={busy}
          onClick={() => run(google)}
        >
          Continue with Google
        </button>

        {/* Switch authentication mode */}
        <p className="text-sm text-center">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <Link className="link" to="/register">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Have an account?{' '}
              <Link className="link" to="/login">
                Log in
              </Link>
            </>
          )}
        </p>
      </form>
    </main>
  );
}
