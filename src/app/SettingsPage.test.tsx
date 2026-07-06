import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SettingsPage } from './SettingsPage'
import { getStorageStatus } from '@/infrastructure/persistence/storage-persistence'

vi.mock('@/infrastructure/persistence/storage-persistence', () => ({
  getStorageStatus: vi.fn(),
}))

const mockedGetStorageStatus = vi.mocked(getStorageStatus)

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  mockedGetStorageStatus.mockReset()
})

describe('SettingsPage', () => {
  it('shows storage protection and space used when persistence is granted', async () => {
    mockedGetStorageStatus.mockResolvedValue({
      persisted: true,
      usage: 2 * 1024 * 1024,
      quota: 500 * 1024 * 1024,
    })
    renderSettings()

    expect(await screen.findByText(/On — this browser has agreed/)).toBeInTheDocument()
    expect(screen.getByText('2.0 MB of 500 MB available')).toBeInTheDocument()
    // Granted persistence — no backup suggestion needed.
    expect(screen.queryByText('A gentle suggestion')).not.toBeInTheDocument()
  })

  it('stays calm when the browser reports nothing', async () => {
    mockedGetStorageStatus.mockResolvedValue({ persisted: null, usage: null, quota: null })
    renderSettings()

    const answers = await screen.findAllByText("This browser doesn't say.")
    expect(answers).toHaveLength(2)
    expect(screen.queryByText('A gentle suggestion')).not.toBeInTheDocument()
  })

  it('suggests backing up when persistence is not granted, dismissibly', async () => {
    mockedGetStorageStatus.mockResolvedValue({ persisted: false, usage: 1024, quota: null })
    renderSettings()

    expect(await screen.findByText('A gentle suggestion')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Export page' })).toHaveAttribute('href', '/export')

    await userEvent.click(screen.getByRole('button', { name: 'Okay, noted' }))
    expect(screen.queryByText('A gentle suggestion')).not.toBeInTheDocument()
  })

  it('remembers the dismissal across visits', async () => {
    mockedGetStorageStatus.mockResolvedValue({ persisted: false, usage: null, quota: null })
    const first = renderSettings()
    await userEvent.click(await screen.findByRole('button', { name: 'Okay, noted' }))
    first.unmount()

    renderSettings()
    expect(await screen.findByText(/Not granted yet/)).toBeInTheDocument()
    expect(screen.queryByText('A gentle suggestion')).not.toBeInTheDocument()
  })
})
