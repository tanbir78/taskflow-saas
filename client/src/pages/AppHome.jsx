
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  FolderKanban,
  Plus,
  ArrowUpRight,
  BriefcaseBusiness,
  LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';

import { api, unwrap } from '../api/client';

export default function AppHome() {
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
    mutationFn: () =>
      unwrap(api.post('/workspaces', { name: name.trim() })),

    onSuccess: () => {
      setName('');

      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      toast.success('Workspace created successfully');
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to create workspace'
      );
    },
  });

  const workspaces = Array.isArray(data) ? data : [];

  // Handle workspace creation
  const handleSubmit = (event) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      toast.error('Workspace name must be at least 2 characters');
      return;
    }

    create.mutate();
  };

  return (
    <main className="workspace-page min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <LayoutGrid size={17} />
              <span>WORKSPACE MANAGEMENT</span>
            </div>

            <h1 className="workspace-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Your Workspaces
            </h1>

            <p className="workspace-description mt-2 text-sm sm:text-base">
              Manage your teams and projects in one place.
            </p>
          </div>

          <div className="workspace-count-card flex items-center gap-3 rounded-xl border px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FolderKanban size={21} />
            </div>

            <div>
              <p className="workspace-muted text-xs">
                Total Workspaces
              </p>

              <p className="workspace-heading text-xl font-bold">
                {isLoading ? '—' : workspaces.length}
              </p>
            </div>
          </div>
        </header>

        {/* Create Workspace */}
        <section className="workspace-create-panel rounded-2xl border p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Plus size={21} />
            </div>

            <div>
              <h2 className="workspace-heading font-bold">
                Create a Workspace
              </h2>

              <p className="workspace-description text-sm">
                Start a new space for your team.
              </p>
            </div>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <input
              className="workspace-input h-12 min-w-0 flex-1 rounded-xl px-4 text-sm outline-none"
              required
              minLength={2}
              maxLength={80}
              placeholder="Enter a workspace name..."
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />

            <button
              type="submit"
              className="btn btn-primary h-12 min-h-12 rounded-xl px-6 font-semibold shadow-sm"
              disabled={create.isPending || name.trim().length < 2}
            >
              {create.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Workspace
                </>
              )}
            </button>
          </form>
        </section>

        {/* Workspace Section Header */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="workspace-heading text-xl font-bold">
                Your Teams
              </h2>

              <p className="workspace-description mt-1 text-sm">
                Select a workspace to open its dashboard.
              </p>
            </div>

            <span className="workspace-muted hidden text-sm sm:block">
              {workspaces.length} workspace(s)
            </span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="workspace-state-card flex min-h-52 items-center justify-center rounded-2xl border">
              <div className="text-center">
                <span className="loading loading-spinner loading-lg text-primary" />

                <p className="workspace-description mt-4 text-sm">
                  Loading your workspaces...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="workspace-state-card rounded-2xl border p-8 text-center">
              <p className="font-semibold text-error">
                Could not load workspaces.
              </p>

              <p className="workspace-description mt-2 text-sm">
                Please check your connection and try again.
              </p>

              <button
                type="button"
                className="btn btn-primary btn-sm mt-5 rounded-lg"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ['workspaces'],
                  })
                }
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading &&
            !error &&
            workspaces.length === 0 && (
              <div className="workspace-state-card rounded-2xl border border-dashed p-10 text-center sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <BriefcaseBusiness size={30} />
                </div>

                <h3 className="workspace-heading mt-5 text-lg font-bold">
                  No workspaces yet
                </h3>

                <p className="workspace-description mx-auto mt-2 max-w-sm text-sm leading-6">
                  Create your first workspace to start
                  organizing your team's projects and tasks.
                </p>
              </div>
            )}

          {/* Workspace Cards */}
          {!isLoading &&
            !error &&
            workspaces.length > 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {workspaces.map((workspace) => (
                  <Link
                    key={workspace._id}
                    to={`/app/workspaces/${workspace._id}`}
                    className="workspace-card group relative block overflow-hidden rounded-2xl border p-5 sm:p-6"
                  >
                    {/* Hover Accent */}
                    <div className="absolute left-0 top-0 h-full w-1 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="workspace-card-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                          <BriefcaseBusiness size={23} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="workspace-heading truncate text-base font-bold transition-colors group-hover:text-primary sm:text-lg">
                            {workspace.name}
                          </h3>

                          <p className="workspace-muted mt-1 text-xs">
                            Team Workspace
                          </p>
                        </div>
                      </div>

                      <span
                        className={`workspace-role-badge shrink-0 capitalize ${
                          workspace.role === 'owner'
                            ? 'workspace-role-owner'
                            : workspace.role === 'manager'
                              ? 'workspace-role-manager'
                              : workspace.role === 'guest'
                                ? 'workspace-role-guest'
                                : 'workspace-role-member'
                        }`}
                      >
                        {workspace.role}
                      </span>

                    </div>

                    <div className="workspace-card-footer mt-5 flex items-center justify-between border-t pt-4">
                      <span className="workspace-description text-sm font-medium">
                        Open workspace dashboard
                      </span>

                      <ArrowUpRight
                        size={19}
                        className="text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                ))}

              </div>
            )}
        </section>

      </div>
    </main>
  );
}
