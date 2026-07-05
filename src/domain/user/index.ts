import type { EntityId, GenerateId } from '@/domain/shared'

export interface UserProfile {
  id: EntityId
  displayName: string
  /**
   * UNUSED in MVP. Reserved field only — no access-transfer, verification, or
   * sharing logic is built around this. It exists so a future
   * succession/inheritance feature doesn't require a migration.
   */
  legacyContact?: { name: string; contactInfo: string }
}

export interface UserProfileRepository {
  /** The single MVP user's profile, if one has been created. */
  get(): Promise<UserProfile | undefined>
  save(profile: UserProfile): Promise<void>
}

/**
 * Returns the existing profile or silently creates the default one. The MVP
 * never asks the user to "sign up" — a profile exists so memories have an
 * author id (`authoredBy`), nothing more.
 */
export async function ensureUserProfile(
  repository: UserProfileRepository,
  deps: { generateId: GenerateId }
): Promise<UserProfile> {
  const existing = await repository.get()
  if (existing) return existing
  const profile: UserProfile = { id: deps.generateId(), displayName: '' }
  await repository.save(profile)
  return profile
}
