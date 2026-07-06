/**
 * Browser storage persistence (navigator.storage).
 *
 * IndexedDB is "best-effort" by default: under storage pressure the browser
 * may evict it without the user doing anything. For a decades-long archive
 * that silent-eviction case is unacceptable, so we ask the browser to mark
 * this origin's storage as persistent. This does NOT protect against the
 * user explicitly clearing site data — export/import (#11/#16) cover that.
 *
 * Everything here is best-effort and never throws: the Storage API is
 * missing in non-secure contexts and some browsers, and a failed call must
 * never break app bootstrap or the Settings screen.
 */

/** What the browser reports about this origin's storage. */
export interface StorageStatus {
  /** Whether storage is persistent; `null` when the browser won't say. */
  persisted: boolean | null
  /** Bytes used by this origin; `null` when unavailable. */
  usage: number | null
  /** Bytes available to this origin; `null` when unavailable. */
  quota: number | null
}

function storageManager(): StorageManager | undefined {
  // Optional chain the whole way down: `navigator.storage` is absent in
  // non-secure contexts, and individual methods vary by browser.
  return typeof navigator === 'undefined' ? undefined : navigator.storage
}

/**
 * Ask the browser to protect this origin's storage from eviction.
 * Idempotent — safe to call on every app start; browsers may prompt or
 * auto-grant based on engagement. Returns whether persistence is granted.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  const storage = storageManager()
  if (typeof storage?.persist !== 'function') return false
  try {
    return await storage.persist()
  } catch {
    return false
  }
}

/** Read the current persistence state and space usage, quietly. */
export async function getStorageStatus(): Promise<StorageStatus> {
  const storage = storageManager()
  const status: StorageStatus = { persisted: null, usage: null, quota: null }

  if (typeof storage?.persisted === 'function') {
    try {
      status.persisted = await storage.persisted()
    } catch {
      // leave null — the browser wouldn't say
    }
  }

  if (typeof storage?.estimate === 'function') {
    try {
      const estimate = await storage.estimate()
      status.usage = estimate.usage ?? null
      status.quota = estimate.quota ?? null
    } catch {
      // leave nulls
    }
  }

  return status
}
