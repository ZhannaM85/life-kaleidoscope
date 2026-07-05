import type { EntityId } from '@/domain/shared'
import type { Tag, TagRepository } from '@/domain/tag'
import type { LifeKaleidoscopeDb } from './db'

export class IndexedDbTagRepository implements TagRepository {
  private readonly db: LifeKaleidoscopeDb

  constructor(db: LifeKaleidoscopeDb) {
    this.db = db
  }

  async save(tag: Tag): Promise<void> {
    await this.db.tags.put(tag)
  }

  getById(id: EntityId): Promise<Tag | undefined> {
    return this.db.tags.get(id)
  }

  getAll(): Promise<Tag[]> {
    return this.db.tags.orderBy('label').toArray()
  }

  async delete(id: EntityId): Promise<void> {
    await this.db.tags.delete(id)
  }
}
