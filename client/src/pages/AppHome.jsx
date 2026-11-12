
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, unwrap } from '../api/client';
import { useAuth } from '../providers/AuthProvider';

export default function AppHome() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');

  // Fetch workspaces
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => unwrap(api.get('/workspaces')),
  });

  // Create a new workspace
  const create = useMutation({
    mutationFn: () => unwrap(api.post('/workspaces', { name })),

    onSuccess: () => {
      setName('');

      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      toast.success('Workspace created');
    },

    onError: (e) => {
      toast.error(e.response?.data?.message || 'Failed');
    },
  });

  return (
    <main className="min-h-screen bg-base-100">
      <div className="max-w-5xl mx-auto p-6">
        {/* Page header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Your Workspaces
            </h1>

            <p className="text-sm text-base-content/60 mt-1">
              Manage your teams and projects in one place.
            </p>
          </div>

          <button
            className="btn btn-ghost"
            onClick={logout}
          >
            Log out
          </button>
        </header>

        {/* Create workspace form */}
        <form
          className="join mb-8 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <input
            className="input input-bordered join-item flex-1"
            required
            minLength={2}
            maxLength={80}
            placeholder="New workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="btn btn-primary join-item"
            disabled={create.isPending}
          >
            {create.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="text-error">
            Could not load workspaces.
          </p>
        )}

        {/* Empty state */}
        {data?.length === 0 && (
          <div className="card bg-base-200 p-8 text-center">
            <h2 className="font-bold text-lg">
              No workspaces yet
            </h2>

            <p className="text-sm text-base-content/60 mt-2">
              Create your first workspace to get started.
            </p>
          </div>
        )}

        {/* Workspace cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map((workspace) => (
            <Link
              key={workspace._id}
              to={`/app/workspaces/${workspace._id}`}
              className="card bg-base-200 border border-base-300 p-5 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  {workspace.name}
                </h2>

                <span className="badge badge-secondary capitalize">
                  {workspace.role}
                </span>
              </div>

              <p className="text-sm text-base-content/60 mt-3">
                Open workspace dashboard →
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
