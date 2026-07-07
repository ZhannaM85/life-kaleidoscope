import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemory } from '@/domain/memory'
import type { BackupFile } from '@/domain/export'
import {
  createIndexedDbRepositories,
  LifeLikeKaleidoscopeDb,
} from '@/infrastructure/persistence/indexeddb'
import { setRepositories } from '@/stores'
import { ExportPage } from './ExportPage'

let dbCounter = 0
let dbName: string

/** jsdom implements neither createObjectURL nor anchor-click downloads — capture both. */
let downloads: { filename: string; blob: Blob }[]
let pendingBlob: Blob | null

beforeEach(async () => {
  dbName = `export-test-db-${++dbCounter}`
  const repos = createIndexedDbRepositories(dbName)
  setRepositories(repos)

  const prompt = { id: 'prompt-1', word: 'Bicycle', createdAt: '2026-07-01T06:00:00.000Z' }
  await repos.prompts.save(prompt)
  let n = 0
  await repos.memories.create(
    createMemory(
      {
        promptId: prompt.id,
        story: 'The red bicycle leaned against the fence.',
        authoredBy: 'user-1',
      },
      { generateId: () => `id-${++n}`, now: () => '2026-07-01T10:00:00.000Z' }
    )
  )

  downloads = []
  pendingBlob = null
  URL.createObjectURL = vi.fn((blob: Blob) => {
    pendingBlob = blob
    return 'blob:test'
  }) as typeof URL.createObjectURL
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    if (pendingBlob) downloads.push({ filename: this.download, blob: pendingBlob })
    pendingBlob = null
  })
})

afterEach(async () => {
  vi.restoreAllMocks()
  setRepositories(null)
  await new LifeLikeKaleidoscopeDb(dbName).delete()
})

describe('ExportPage', () => {
  it('downloads a JSON backup containing the saved memory and its version', async () => {
    render(<ExportPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Download JSON' }))

    await waitFor(() => expect(downloads).toHaveLength(1))
    expect(downloads[0].filename).toMatch(/^life-like-kaleidoscope-backup-\d{4}-\d{2}-\d{2}\.json$/)

    const backup = JSON.parse(await downloads[0].blob.text()) as BackupFile
    expect(backup.schemaVersion).toBe(1)
    expect(backup.data.memories).toHaveLength(1)
    expect(backup.data.memoryVersions).toHaveLength(1)
    expect(backup.data.memories[0].story).toBe('The red bicycle leaned against the fence.')
  })

  it('downloads a Markdown file with the memory under its word', async () => {
    render(<ExportPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Download Markdown' }))

    await waitFor(() => expect(downloads).toHaveLength(1))
    expect(downloads[0].filename).toMatch(/\.md$/)

    const markdown = await downloads[0].blob.text()
    expect(markdown).toContain('## Bicycle —')
    expect(markdown).toContain('The red bicycle leaned against the fence.')
  })

  it('opens the print dialog on the printable document for PDF', async () => {
    const printWindow = {
      document: { write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    }
    vi.spyOn(window, 'open').mockReturnValue(printWindow as unknown as Window)

    render(<ExportPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Open print view' }))

    await waitFor(() => expect(printWindow.print).toHaveBeenCalled())
    const html = printWindow.document.write.mock.calls[0][0] as string
    expect(html).toContain('The red bicycle leaned against the fence.')
  })

  it('explains when a popup blocker stops the print view', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)

    render(<ExportPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Open print view' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/print view was blocked/)
  })
})
