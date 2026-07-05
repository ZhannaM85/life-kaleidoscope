import {
  createIndexedDbRepositories,
  type Repositories,
} from '@/infrastructure/persistence/indexeddb'

/**
 * The app-wide persistence handle. Stores and features only ever see the
 * `Repositories` bundle of domain interfaces — this module is the single
 * place that decides which implementation backs them (IndexedDB today, a
 * remote API someday). Lazy so importing a store never touches IndexedDB.
 */
let instance: Repositories | null = null

export function getRepositories(): Repositories {
  if (!instance) instance = createIndexedDbRepositories()
  return instance
}

/** Test seam: swap in repositories backed by a fresh (fake) database. */
export function setRepositories(repositories: Repositories | null): void {
  instance = repositories
}
