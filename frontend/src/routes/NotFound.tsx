import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-paper-faint">404</p>
      <h1 className="font-display text-5xl font-semibold text-paper">Page not found</h1>
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-widest text-ember hover:text-ember-soft transition-colors"
      >
        ← Return home
      </Link>
    </div>
  )
}
