import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Download, Feather, Network, Search, Settings } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/shared/lib/utils'
import { useLocaleStore } from '@/stores'
import type { Dictionary } from '@/i18n'

interface AppNavLink {
  to: string
  label: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  end?: boolean
}

function navLinksFor(t: Dictionary): AppNavLink[] {
  return [
    { to: '/', label: t.nav.today, icon: Feather, end: true },
    { to: '/memories', label: t.nav.memories, icon: BookOpen },
    { to: '/search', label: t.nav.search, icon: Search },
    { to: '/graph', label: t.nav.graph, icon: Network },
    { to: '/export', label: t.nav.export, icon: Download },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ]
}

export function AppShell() {
  const t = useLocaleStore((s) => s.dictionary)
  const navLinks = navLinksFor(t)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-lg font-medium tracking-wide text-foreground whitespace-nowrap">
            Life Like Kaleidoscope
          </span>
          {/* Desktop nav — hidden on phones, where the bottom tab bar takes over (#14) */}
          <nav aria-label={t.nav.mainNavigation} className="hidden sm:block">
            <ul className="m-0 flex list-none items-center gap-6 p-0">
              {navLinks.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'font-sans text-sm transition-colors',
                        isActive
                          ? 'font-medium text-foreground'
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

      {/* Bottom padding on phones keeps content clear of the fixed tab bar */}
      <main className="mx-auto max-w-3xl px-6 py-10 pb-28 sm:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar — every target ≥44px (#14) */}
      <nav
        aria-label={t.nav.mainNavigation}
        className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="m-0 grid list-none grid-cols-6 p-0">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-1 py-2 font-sans text-[11px] leading-none transition-colors',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )
                }
              >
                <Icon aria-hidden className="size-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
