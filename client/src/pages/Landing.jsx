import { Link } from 'react-router-dom';
export default function Landing() {
  return (
    <main className="min-h-screen">
      {/* Navigation bar */}
      <nav className="navbar max-w-6xl mx-auto">
        <span className="flex-1 text-xl font-bold text-primary">
          TaskFlow
        </span>

        <Link to="/login" className="btn btn-ghost">
          Log in
        </Link>

        <Link to="/register" className="btn btn-primary">
          Get started
        </Link>
      </nav>

      {/* Hero section */}
      <section className="max-w-3xl mx-auto text-center py-24 px-4">
        <h1 className="text-5xl font-bold">
          Plan Together.{' '}
          <span className="text-primary">
            Build Better.
          </span>
        </h1>

        <p className="mt-4 text-base-content/70">
          Multi-workspace project management with Kanban boards,
          real-time collaboration, and team roles.
        </p>

        <Link
          to="/register"
          className="btn btn-primary mt-8"
        >
          Create your workspace
        </Link>
      </section>
    </main>
  );
}
