
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, unwrap } from '../api/client';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#00B894',
    status: 'planning',
    priority: 'medium',
  });

  // Fetch workspace information
  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => unwrap(api.get(`/workspaces/${workspaceId}`)),
    enabled: Boolean(workspaceId),
  });

  // Fetch workspace projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () =>
      unwrap(api.get(`/workspaces/${workspaceId}/projects`)),
    enabled: Boolean(workspaceId),
  });

  // Create a new project
  const createProject = useMutation({
    mutationFn: () =>
      unwrap(
        api.post(
          `/workspaces/${workspaceId}/projects`,
          formData
        )
      ),

    onSuccess: () => {
      setFormData({
        name: '',
        description: '',
        color: '#00B894',
        status: 'planning',
        priority: 'medium',
      });

      setShowForm(false);

      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      toast.success('Project created successfully');
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to create project'
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject.mutate();
  };

  if (workspaceLoading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </main>
    );
  }

  if (workspaceError || !workspace) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-error">
          Could not load workspace information.
        </p>

        <Link to="/app" className="btn btn-primary mt-4">
          Back to Workspaces
        </Link>
      </main>
    );
  }

  const projects = projectsData?.items || [];

  return (
    <main className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto p-6">

        {/* Navigation */}
        <div className="mb-6">
          <Link to="/app" className="link link-hover text-sm">
            ← Back to Workspaces
          </Link>
        </div>

        {/* Workspace header */}
        <section className="card bg-base-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {workspace.name}
              </h1>

              <p className="text-base-content/70 mt-2">
                {workspace.description || 'Welcome to your workspace.'}
              </p>
            </div>

            <span className="badge badge-primary badge-lg">
              {workspace.role}
            </span>
          </div>
        </section>

        {/* Dashboard overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="card bg-base-200 p-5">
            <p className="text-sm text-base-content/70">
              Total Projects
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {projectsData?.total ?? 0}
            </h2>
          </div>

          <div className="card bg-base-200 p-5">
            <p className="text-sm text-base-content/70">
              Your Role
            </p>

            <h2 className="text-2xl font-bold mt-2 capitalize">
              {workspace.role}
            </h2>
          </div>
        </section>

        {/* Projects heading */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold">
              Your Projects
            </h2>

            <p className="text-sm text-base-content/60 mt-1">
              Manage and organize your workspace projects.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowForm((previous) => !previous)}
            disabled={
              workspace.role === 'guest' ||
              workspace.role === 'member'
            }
          >
            {showForm ? 'Cancel' : '+ Create Project'}
          </button>
        </section>

        {/* Project creation form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="card bg-base-200 p-6 gap-4 mb-8"
          >
            <h3 className="text-lg font-bold">
              Create New Project
            </h3>

            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Project Name
                </span>
              </label>

              <input
                type="text"
                name="name"
                className="input input-bordered w-full"
                placeholder="e.g. MochiMart E-commerce"
                value={formData.name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Description
                </span>
              </label>

              <textarea
                name="description"
                className="textarea textarea-bordered w-full"
                placeholder="Describe your project..."
                value={formData.description}
                onChange={handleChange}
                maxLength={2000}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Status
                  </span>
                </label>

                <select
                  name="status"
                  className="select select-bordered w-full"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Priority
                  </span>
                </label>

                <select
                  name="priority"
                  className="select select-bordered w-full"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Project Color
                  </span>
                </label>

                <input
                  type="color"
                  name="color"
                  className="input input-bordered w-full p-1"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createProject.isPending}
              >
                {createProject.isPending
                  ? 'Creating...'
                  : 'Create Project'}
              </button>
            </div>
          </form>
        )}

        {/* Project list */}
        {projectsLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        )}

        {projectsError && (
          <p className="text-error py-4">
            Could not load projects. Please try again.
          </p>
        )}

        {!projectsLoading && !projectsError && projects.length === 0 && (
          <div className="card bg-base-200 p-10 text-center">
            <div className="text-4xl mb-3">📁</div>

            <h3 className="text-lg font-bold">
              No projects yet
            </h3>

            <p className="text-base-content/60 mt-2">
              Create your first project to get started.
            </p>
          </div>
        )}

        {!projectsLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <article
                key={project._id}
                className="card bg-base-200 p-5 border border-base-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-10 rounded-full"
                      style={{
                        backgroundColor: project.color,
                      }}
                    />

                    <div>
                      <h3 className="font-bold text-lg">
                        {project.name}
                      </h3>

                      <p className="text-xs text-base-content/60 mt-1">
                        {project.slug}
                      </p>
                    </div>
                  </div>

                  <span className="badge badge-secondary capitalize">
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-base-content/70 mt-4">
                  {project.description || 'No description provided.'}
                </p>

                <div className="flex justify-between items-center mt-5">
                  <span className="text-xs text-base-content/60 capitalize">
                    Priority: {project.priority}
                  </span>

                  <span className="badge badge-outline">
                    {project.members?.length || 0} Members
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
