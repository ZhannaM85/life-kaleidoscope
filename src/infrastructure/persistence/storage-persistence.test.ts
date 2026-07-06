import { describe, it, expect, vi, afterEach } from 'vitest'
import { getStorageStatus, requestPersistentStorage } from './storage-persistence'

// jsdom has no StorageManager; stub navigator.storage per test.
function stubNavigatorStorage(storage: Partial<StorageManager> | undefined) {
  Object.defineProperty(navigator, 'storage', {
    value: storage,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  delete (navigator as { storage?: unknown }).storage
})

describe('requestPersistentStorage', () => {
  it('returns false when the Storage API is unavailable', async () => {
    stubNavigatorStorage(undefined)
    await expect(requestPersistentStorage()).resolves.toBe(false)
  })

  it('returns the browser answer when persist() is available', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    stubNavigatorStorage({ persist })
    await expect(requestPersistentStorage()).resolves.toBe(true)
    expect(persist).toHaveBeenCalledOnce()
  })

  it('returns false instead of throwing when persist() rejects', async () => {
    stubNavigatorStorage({ persist: vi.fn().mockRejectedValue(new Error('nope')) })
    await expect(requestPersistentStorage()).resolves.toBe(false)
  })
})

describe('getStorageStatus', () => {
  it('reports all nulls when the Storage API is unavailable', async () => {
    stubNavigatorStorage(undefined)
    await expect(getStorageStatus()).resolves.toEqual({
      persisted: null,
      usage: null,
      quota: null,
    })
  })

  it('reports persistence state and space usage', async () => {
    stubNavigatorStorage({
      persisted: vi.fn().mockResolvedValue(true),
      estimate: vi.fn().mockResolvedValue({ usage: 1234, quota: 5678 }),
    })
    await expect(getStorageStatus()).resolves.toEqual({
      persisted: true,
      usage: 1234,
      quota: 5678,
    })
  })

  it('nulls the fields an empty estimate leaves out', async () => {
    stubNavigatorStorage({
      persisted: vi.fn().mockResolvedValue(false),
      estimate: vi.fn().mockResolvedValue({}),
    })
    await expect(getStorageStatus()).resolves.toEqual({
      persisted: false,
      usage: null,
      quota: null,
    })
  })

  it('keeps persisted() result even when estimate() rejects', async () => {
    stubNavigatorStorage({
      persisted: vi.fn().mockResolvedValue(false),
      estimate: vi.fn().mockRejectedValue(new Error('nope')),
    })
    await expect(getStorageStatus()).resolves.toEqual({
      persisted: false,
      usage: null,
      quota: null,
    })
  })
})
