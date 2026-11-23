
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  X,
  BriefcaseBusiness,
  ShieldCheck,
  Users,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';

import { api, unwrap } from '../api/client';

const initialFormData = {
  name: '',
  description: '',
  color: '#00B894',
  status: 'planning',
  priority: 'medium',
};

const statusStyles = {
  planning: 'project-status-planning',
  active: 'project-status-active',
  'on-hold': 'project-status-on-hold',
  completed: 'project-status-completed',
  archived: 'project-status-archived',
};

const priorityStyles = {
  low: 'project-priority-low',
  medium: 'project-priority-medium',
  high: 'project-priority-high',
  urgent: 'project-priority-urgent',
};

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Fetch workspace information
  const {
    data: workspace,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () =>
      unwrap(api.get(`/workspaces/${workspaceId}`)),
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
      setFormData(initialFormData);
      setShowForm(false);

      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      toast.success('Project created successfully');
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to create project'
      );
    },
  });

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.name.trim().length < 2) {
      toast.error('Project name must be at least 2 characters');
      return;
    }

    createProject.mutate();
  };

  // Reset project form
  const resetForm = () => {
    setFormData(initialFormData);
    setShowForm(false);
  };

  // Workspace loading state
  if (workspaceLoading) {
    return (
      <main className="workspace-page grid min-h-[70vh] place-items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </main>
    );
  }

  // Workspace error state
  if (workspaceError || !workspace) {
    return (
      <main className="workspace-page min-h-screen p-6">
        <div className="workspace-panel mx-auto max-w-6xl rounded-2xl p-8">
          <p className="font-medium text-error">
            Could not load workspace information.
          </p>

          <Link
            to="/app"
            className="btn btn-primary mt-4 rounded-xl"
          >
            <ArrowLeft size={17} />
            Back to Workspaces
          </Link>
        </div>
      </main>
    );
  }

  const projects = projectsData?.items || [];
  const totalProjects = projectsData?.total ?? projects.length;

  const canCreateProject =
    workspace.role !== 'guest' &&
    workspace.role !== 'member';

  return (
    <main className="workspace-page min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Back Navigation */}
        <Link
          to="/app"
          className="workspace-back-link inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={17} />
          Back to Workspaces
        </Link>

        {/* Workspace Header */}
        <section className="workspace-panel rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div className="flex items-start gap-4">
              <div className="workspace-icon-box flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                <BriefcaseBusiness size={27} />
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Workspace
                </p>

                <h1 className="workspace-heading break-words text-2xl font-bold tracking-tight sm:text-3xl">
                  {workspace.name}
                </h1>

                <p className="workspace-description mt-2 max-w-2xl text-sm leading-6">
                  {workspace.description ||
                    'Welcome to your workspace.'}
                </p>
              </div>
            </div>

            <span className="workspace-role-badge self-start capitalize sm:self-center">
              <ShieldCheck size={15} />
              {workspace.role}
            </span>

          </div>
        </section>

        {/* Workspace Overview */}
        <section>
          <div className="mb-5">
            <h2 className="workspace-heading text-xl font-bold">
              Workspace Overview
            </h2>

            <p className="workspace-description mt-1 text-sm">
              A quick overview of your workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Total Projects */}
            <article className="workspace-stat-card">
              <div>
                <p className="workspace-description text-sm font-medium">
                  Total Projects
                </p>

                <h3 className="workspace-heading mt-3 text-3xl font-bold">
                  {totalProjects}
                </h3>
              </div>

              <div className="workspace-icon-box">
                <FolderKanban size={24} />
              </div>
            </article>

            {/* Workspace Role */}
            <article className="workspace-stat-card">
              <div>
                <p className="workspace-description text-sm font-medium">
                  Your Role
                </p>

                <h3 className="workspace-heading mt-3 text-2xl font-bold capitalize">
                  {workspace.role}
                </h3>
              </div>

              <div className="workspace-icon-box workspace-icon-purple">
                <ShieldCheck size={24} />
              </div>
            </article>

            {/* Workspace Status */}
            <article className="workspace-stat-card sm:col-span-2 lg:col-span-1">
              <div>
                <p className="workspace-description text-sm font-medium">
                  Workspace Status
                </p>

                <h3 className="workspace-heading mt-3 text-2xl font-bold">
                  Active
                </h3>
              </div>

              <div className="workspace-icon-box workspace-icon-blue">
                <Users size={24} />
              </div>
            </article>

          </div>
        </section>

        {/* Projects Section */}
        <section>

          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="workspace-heading text-xl font-bold sm:text-2xl">
                Your Projects
              </h2>

              <p className="workspace-description mt-1 text-sm">
                Manage and organize your workspace projects.
              </p>
            </div>

            {canCreateProject && (
              <button
                type="button"
                className="btn btn-primary rounded-xl"
                onClick={() =>
                  setShowForm((previous) => !previous)
                }
              >
                {showForm ? (
                  <>
                    <X size={18} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Project
                  </>
                )}
              </button>
            )}
          </div>

          {/* Project Creation Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="workspace-panel mb-8 space-y-5 rounded-2xl p-6 sm:p-8"
            >
              <div>
                <h3 className="workspace-heading text-lg font-bold">
                  Create New Project
                </h3>

                <p className="workspace-description mt-1 text-sm">
                  Add a new project to your workspace.
                </p>
              </div>

              {/* Project Name */}
              <div className="space-y-2">
                <label
                  htmlFor="project-name"
                  className="workspace-label"
                >
                  Project Name
                </label>

                <input
                  id="project-name"
                  type="text"
                  name="name"
                  className="workspace-form-control"
                  placeholder="e.g. MochiMart E-commerce"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="project-description"
                  className="workspace-label"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  name="description"
                  className="workspace-form-control min-h-28 resize-y py-3"
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={3}
                />
              </div>

              {/* Project Options */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="space-y-2">
                  <label
                    htmlFor="project-status"
                    className="workspace-label"
                  >
                    Status
                  </label>

                  <select
                    id="project-status"
                    name="status"
                    className="workspace-form-control"
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

                <div className="space-y-2">
                  <label
                    htmlFor="project-priority"
                    className="workspace-label"
                  >
                    Priority
                  </label>

                  <select
                    id="project-priority"
                    name="priority"
                    className="workspace-form-control"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="project-color"
                    className="workspace-label"
                  >
                    Project Color
                  </label>

                  <input
                    id="project-color"
                    type="color"
                    name="color"
                    className="workspace-color-input"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  className="btn btn-ghost rounded-xl"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-xl"
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Projects Loading */}
          {projectsLoading && (
            <div className="workspace-state-card flex justify-center rounded-2xl py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}

          {/* Projects Error */}
          {projectsError && (
            <div className="workspace-state-card rounded-2xl p-6 text-center">
              <p className="font-semibold text-error">
                Could not load projects.
              </p>

              <p className="workspace-description mt-2 text-sm">
                Please refresh the page and try again.
              </p>
            </div>
          )}

          {/* Empty Projects */}
          {!projectsLoading &&
            !projectsError &&
            projects.length === 0 && (
              <div className="workspace-state-card rounded-2xl border-dashed px-6 py-16 text-center">
                <div className="workspace-icon-box mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <FolderKanban size={30} />
                </div>

                <h3 className="workspace-heading mt-5 text-lg font-bold">
                  No projects yet
                </h3>

                <p className="workspace-description mx-auto mt-2 max-w-md text-sm leading-6">
                  Create your first project to get started
                  and organize your team's work.
                </p>

                {canCreateProject && (
                  <button
                    type="button"
                    className="btn btn-primary mt-6 rounded-xl"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={18} />
                    Create Your First Project
                  </button>
                )}
              </div>
            )}

          {/* Project Cards */}
          {!projectsLoading &&
            !projectsError &&
            projects.length > 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {projects.map((project) => (
                  <article
                    key={project._id}
                    className="workspace-project-card group"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="h-12 w-1.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              project.color || '#00B894',
                          }}
                        />

                        <div className="min-w-0">
                          <h3 className="workspace-heading truncate text-lg font-bold transition-colors group-hover:text-primary">
                            {project.name}
                          </h3>

                          <p className="workspace-muted mt-1 truncate text-xs">
                            {project.slug || 'Project'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`project-status-badge ${
                          statusStyles[project.status] ||
                          'project-status-default'
                        }`}
                      >
                        {project.status || 'planning'}
                      </span>

                    </div>

                    {/* Project Description */}
                    <p className="workspace-description mt-5 min-h-12 text-sm leading-6">
                      {project.description ||
                        'No description provided.'}
                    </p>

                    {/* Project Details */}
                    <div className="workspace-project-footer mt-6 flex flex-wrap items-center justify-between gap-3 pt-4">

                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="workspace-muted"
                        />

                        <span className="workspace-muted text-xs">
                          Priority
                        </span>

                        <span
                          className={`project-priority-badge ${
                            priorityStyles[project.priority] ||
                            'project-priority-low'
                          }`}
                        >
                          {project.priority || 'low'}
                        </span>
                      </div>

                      <span className="workspace-muted flex items-center gap-1.5 text-xs">
                        <Users size={15} />
                        {project.members?.length || 0} Members
                      </span>

                    </div>
                  </article>
                ))}

              </div>
            )}

        </section>
      </div>
    </main>
  );
}
