import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { TodayPage } from '@/features/daily-prompt/TodayPage'
import { MemoriesPage } from '@/features/memory-entry/MemoriesPage'
import { MemoryDetailPage } from '@/features/memory-entry/MemoryDetailPage'
import { MemoryEditPage } from '@/features/memory-entry/MemoryEditPage'
import { SearchPage } from '@/features/search/SearchPage'
import { GraphPage } from '@/features/memory-graph/GraphPage'
import { ExportPage } from '@/features/export/ExportPage'
import { SettingsPage } from '@/app/SettingsPage'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <TodayPage /> },
        { path: 'memories', element: <MemoriesPage /> },
        { path: 'memories/:id', element: <MemoryDetailPage /> },
        { path: 'memories/:id/edit', element: <MemoryEditPage /> },
        { path: 'search', element: <SearchPage /> },
        { path: 'graph', element: <GraphPage /> },
        { path: 'export', element: <ExportPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ],
  // Follows the `base` in vite.config.ts so routes match under the
  // GitHub Pages subpath.
  { basename: import.meta.env.BASE_URL },
)

export function App() {
  return <RouterProvider router={router} />
}
