import { useState } from 'react';
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
    mutationFn: () => {
      return unwrap(api.post('/workspaces', { name }));
    },

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
    <main className="max-w-3xl mx-auto p-6">
      {/* Page header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Your workspaces
        </h1>

        <button
          className="btn btn-ghost"
          onClick={logout}
        >
          Log out
        </button>
      </header>

      {/* Create workspace form */}
      <form
        className="join mb-6 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <input
          className="input input-bordered join-item flex-1"
          required
          minLength={2}
          placeholder="New workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          className="btn btn-primary join-item"
          disabled={create.isPending}
        >
          Create
        </button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <span className="loading loading-spinner" />
      )}

      {/* Error state */}
      {error && (
        <p className="text-error">
          Could not load workspaces.
        </p>
      )}

      {/* Empty state */}
      {data?.length === 0 && (
        <p className="opacity-70">
          No workspaces yet — create your first one above.
        </p>
      )}

      {/* Workspace list */}
      <ul className="space-y-2">
        {data?.map((w) => (
          <li
            key={w._id}
            className="card bg-base-200 p-4 flex-row justify-between"
          >
            <span>{w.name}</span>

            <span className="badge badge-secondary">
              {w.role}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}


