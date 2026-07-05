import type { UserProfile, UserProfileRepository } from '@/domain/user'
import type { LifeKaleidoscopeDb } from './db'

export class IndexedDbUserProfileRepository implements UserProfileRepository {
  private readonly db: LifeKaleidoscopeDb

  constructor(db: LifeKaleidoscopeDb) {
    this.db = db
  }

  async get(): Promise<UserProfile | undefined> {
    const profiles = await this.db.userProfiles.toArray()
    return profiles[0]
  }

  async save(profile: UserProfile): Promise<void> {
    await this.db.userProfiles.put(profile)
  }
}
