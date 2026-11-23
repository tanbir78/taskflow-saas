
import { Link } from 'react-router-dom';
import {
  Workflow,
  Moon,
  Sun,
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

import { useTheme } from '../providers/ThemeProvider';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Project Management',
    description:
      'Organize projects, manage tasks, and track progress from one central workspace.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Bring your team together with shared workspaces and collaborative workflows.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description:
      'Manage team permissions and keep your workspace organized and secure.',
  },
];

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen overflow-hidden bg-base-100 text-base-content transition-colors duration-300">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-base-300 bg-base-100/90 backdrop-blur-xl">
        <div className="navbar mx-auto max-w-7xl px-4 sm:px-6">

          {/* Logo */}
          <Link
            to="/"
            className="flex flex-1 items-center gap-2 text-xl font-bold text-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content shadow-md">
              <Workflow size={23} />
            </span>

            TaskFlow
          </Link>

          {/* Navigation Actions */}
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

            <Link
              to="/login"
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="btn btn-primary btn-sm rounded-xl px-4"
            >
              Get started
            </Link>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:py-32">

        {/* Background Decoration */}
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl text-center">

          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <CheckCircle2 size={16} />
            Smarter teamwork starts here
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Plan Together.
            <span className="block bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Build Better.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-base-content/70 sm:text-lg">
            Manage projects, organize tasks, and collaborate
            with your team. Everything you need to move
            your work forward, all in one place.
          </p>

          {/* Hero Actions */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              to="/register"
              className="btn btn-primary h-12 w-full rounded-xl px-7 text-base shadow-lg shadow-primary/20 sm:w-auto"
            >
              Create your workspace
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="btn btn-outline h-12 w-full rounded-xl px-7 text-base sm:w-auto"
            >
              Explore your workspace
            </Link>

          </div>

          {/* Trust Text */}
          <p className="mt-6 text-sm text-base-content/50">
            Organize better. Collaborate smarter. Deliver faster.
          </p>

        </div>
      </section>


{/* Features Section */}
<section className="taskflow-features-section border-y border-base-300 px-4 py-20">

  <div className="mx-auto max-w-7xl">

    {/* Section Heading */}
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="text-sm font-bold uppercase tracking-widest text-primary">
        What you get
      </span>

      <h2 className="mt-3 text-3xl font-bold text-base-content sm:text-4xl">
        Everything your team needs
      </h2>

      <p className="mt-4 text-base-content/70">
        Powerful tools to manage your projects and keep
        your team moving in the right direction.
      </p>
    </div>

    {/* Feature Cards */}
    <div className="grid gap-6 md:grid-cols-3">

      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <article
            key={feature.title}
            className="taskflow-feature-card group"
          >
            <div className="taskflow-feature-icon mb-5 group-hover:scale-110">
              <Icon size={24} strokeWidth={2} />
            </div>

            <h3 className="taskflow-feature-title">
              {feature.title}
            </h3>

            <p className="taskflow-feature-description mt-3">
              {feature.description}
            </p>
          </article>
        );
      })}

    </div>
  </div>
</section>


      {/* Call To Action */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-primary/20 bg-primary/10 px-6 py-14 text-center sm:px-12">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to organize your work?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base-content/65">
            Create your workspace and start managing
            projects with TaskFlow.
          </p>

          <Link
            to="/register"
            className="btn btn-primary mt-7 rounded-xl px-7"
          >
            Get started for free
            <ArrowRight size={18} />
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300 px-4 py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">

          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-primary"
          >
            <Workflow size={20} />
            TaskFlow
          </Link>

          <p className="text-center text-xs text-base-content/50">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>

          <Link
            to="/login"
            className="text-sm text-base-content/60 transition-colors hover:text-primary"
          >
            Sign in to your account
          </Link>

        </div>
      </footer>

    </main>
  );
}
