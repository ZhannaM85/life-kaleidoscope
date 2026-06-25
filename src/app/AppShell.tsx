import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'

const navLinks = [
  { to: '/', label: 'Today', end: true },
  { to: '/memories', label: 'Memories' },
  { to: '/search', label: 'Search' },
  { to: '/graph', label: 'Graph' },
  { to: '/export', label: 'Export' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-medium text-foreground tracking-wide">
            Life Kaleidoscope
          </span>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-6 list-none m-0 p-0">
              {navLinks.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'text-sm transition-colors',
                        isActive
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
