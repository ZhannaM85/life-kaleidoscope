# Life Kaleidoscope — Architecture

This document is updated after each issue is completed. It explains what every file does, why it exists, and how the pieces connect.

Product context lives in `PROJECT_BRIEF.md`; the work queue lives in `docs/issues-priority.md`.

---

## System Overview

Life Kaleidoscope is a local-first daily memory journal: one single-word prompt per day, one small memory written about it, accumulated over years into a searchable, connected record of a life. Everything runs in the browser — no backend, no accounts, no telemetry. All data lives in the user's own IndexedDB.

The codebase follows Clean Architecture layering with feature-based folders:

```mermaid
flowchart TD
    subgraph UI ["features/ + app/  (React)"]
        A["Screens<br/>TodayPage, MemoriesPage, ..."]
    end
    subgraph State ["stores/  (Zustand)"]
        B["UI/session state only<br/>drafts, filters, selection"]
    end
    subgraph Domain ["domain/  (pure TS — no React/Zustand/Dexie)"]
        C["Entities<br/>Memory, Prompt, Person, ..."]
        D["Versioning logic<br/>createMemory / editMemory"]
        E["Repository INTERFACES<br/>MemoryRepository, ..."]
    end
    subgraph Infra ["infrastructure/persistence/indexeddb/  (only place Dexie exists)"]
        F["LifeKaleidoscopeDb<br/>Dexie schema"]
        G["IndexedDb*Repository<br/>implementations"]
    end

    A --> B
    B --> E
    A --> D
    G -. implements .-> E
    G --> F
    F --> H[("IndexedDB<br/>in the browser")]

    style Domain fill:#eff6ff,stroke:#3b82f6
    style Infra fill:#fef3c7,stroke:#d97706
    style UI fill:#f0fdf4,stroke:#22c55e
```

**The one dependency rule that matters:** `domain/` imports nothing from React, Zustand, or Dexie. Features and stores talk to persistence only through the repository interfaces, so a future NestJS/PostgreSQL backend means writing `Api*Repository` implementations and swapping one factory call — nothing else changes.

---

## Data Flow — saving and editing a memory

Every save produces an immutable `MemoryVersion` — including the very first. This enforces the brief's hard constraint: **edits preserve history, always**.

```mermaid
sequenceDiagram
    participant UI as Feature screen
    participant V as domain/memory<br/>versioning.ts
    participant R as MemoryRepository<br/>(interface)
    participant I as IndexedDbMemoryRepository
    participant DB as Dexie (IndexedDB)

    Note over UI,DB: First save
    UI->>V: createMemory(draft, deps)
    V-->>UI: { memory, version }  (currentVersionId → version.id)
    UI->>R: create({ memory, version })
    R->>I: (implementation)
    I->>DB: transaction: memories.add + memoryVersions.add

    Note over UI,DB: Edit
    UI->>V: editMemory(current, changes, deps)
    V-->>UI: { memory', version' }  (new version id, input not mutated)
    UI->>R: update({ memory', version' })
    R->>I: (implementation)
    I->>DB: transaction: memoryVersions.add (append-only) + memories.put
    Note over I,DB: add (not put) — reusing an existing<br/>version id throws instead of rewriting history
```

---

## Module Reference

### Domain layer (`src/domain/`)

Pure TypeScript. Unit-testable with no DOM. If a file here ever needs `react`, `zustand`, or `dexie`, the logic belongs in `infrastructure/` or `features/` instead.

#### `src/domain/shared/index.ts`
**Why it exists:** Domain-wide primitives, and the seam that keeps domain logic deterministic in tests.

| Export | Purpose |
|--------|---------|
| `EntityId` | Type alias for entity ids (string; UUIDs at runtime). |
| `IsoDateString` | Type alias for ISO 8601 timestamps. |
| `GenerateId` / `Now` | Function types injected into domain logic (`VersioningDeps`) so tests can supply fixed ids/clocks. |
| `defaultGenerateId()` | `crypto.randomUUID()` — the production id source. |
| `nowIso()` | `new Date().toISOString()` — the production clock. |

#### `src/domain/memory/memory.ts`
**Why it exists:** The core entities of the whole product.

| Type | Purpose |
|------|---------|
| `Memory` | One written memory. `approxAge`/`approxYear` are optional — dates are never forced (hard constraint §2). `authoredBy`/`aboutWhom` exist for a future caregiver mode but are inert in the MVP UI. `currentVersionId` points at the latest version. |
| `MemorySnapshot` | `Omit<Memory, 'currentVersionId'>` — a memory's content frozen at one save. |
| `MemoryVersion` | Immutable record of one save: `{ id, memoryId, snapshot, editedAt }`. Never overwritten or deleted by a normal edit. |
| `Photo` | Photo metadata attached to a memory; the binary lives in blob storage under `blobRef`. |

#### `src/domain/memory/versioning.ts`
**Why it exists:** The "edits preserve history" constraint implemented as pure functions, testable without any storage.

| Export | Purpose |
|--------|---------|
| `MemoryDraft` | What the author provides on first write. `aboutWhom` defaults to `authoredBy`; collections default to `[]`. |
| `MemoryEdit` | `Partial` of only the editable fields — id, promptId, authoredBy, createdAt cannot change through an edit. |
| `VersioningDeps` | `{ generateId, now }` — injected id source and clock. |
| `createMemory(draft, deps)` | Returns `{ memory, version }` — the initial version snapshots the memory as first written, so history is complete from save one. |
| `editMemory(current, edit, deps)` | Returns `{ memory, version }` with a fresh version id and `updatedAt`. Does not mutate its input; never touches prior versions. |

#### `src/domain/memory/repository.ts`
**Why it exists:** The contracts persistence must fulfil, defined next to the entities they serve.

| Interface | Key methods |
|-----------|-------------|
| `MemoryRepository` | `create`/`update` take `MemoryWithVersion` and must persist memory + version atomically; `getById`, `getAll` (newest first), `getByPromptId` (annual reflection), `getVersions` (oldest first), `delete` (memory + entire history — distinct from editing). |
| `PhotoRepository` | `save(photo, blob)` atomically, `getById`, `getByMemoryId`, `getBlob(blobRef)`, `delete` (removes metadata + blob together). |

#### `src/domain/prompt/` (`prompt.ts`, `repository.ts`)
**Why it exists:** The daily single-word cue is its own aggregate — prompts are issued over time and the same word can recur (that recurrence powers Epic 9's annual reflection).

| Export | Purpose |
|--------|---------|
| `Prompt` | `{ id, word, createdAt }`. |
| `PromptRepository` | `save`, `getById`, `getAll` (oldest first), `getByWord` — every issuance of a word, for the reflection callback. |

#### `src/domain/person/index.ts` · `src/domain/place/index.ts` · `src/domain/tag/index.ts`
**Why they exist:** First-class graph nodes from day one (per the brief, retrofitting stable ids later is expensive). Each file holds the entity plus its repository interface: `save`, `getById`, `getAll`, `delete`.

#### `src/domain/user/index.ts`
**Why it exists:** `UserProfile` for the single MVP user. `legacyContact` is a reserved schema field only — no succession/sharing logic is built around it (deliberate; see brief §4). `UserProfileRepository` is `get()`/`save()` — singleton semantics, no id lookup needed.

---

### Persistence layer (`src/infrastructure/persistence/indexeddb/`)

The only folder allowed to import Dexie.

#### `db.ts`
**Why it exists:** Single definition of the IndexedDB schema.

| Table | Indexes | Notes |
|-------|---------|-------|
| `prompts` | `id, word, createdAt` | `word` non-unique — same word can be issued in different years. |
| `memories` | `id, promptId, createdAt, updatedAt, *peopleIds, *placeIds, *tagIds` | Multi-entry indexes ready for search (Epic 6) and the graph (Epic 8). |
| `memoryVersions` | `id, memoryId, editedAt` | Append-only by convention, enforced in the repository. |
| `people` / `places` / `tags` | `id, name` / `id, name` / `id, label` | |
| `photos` | `id, memoryId` | |
| `photoBlobs` | `blobRef` | Stores `{ bytes: ArrayBuffer, type }`, **not** `Blob` — Blobs don't survive IndexedDB structured cloning reliably (notably older Safari). |
| `userProfiles` | `id` | Holds the single MVP profile. |

The constructor takes an optional db name so tests can isolate databases per test.

#### `memory-repository.ts` — `IndexedDbMemoryRepository`
**Why it exists:** Implements `MemoryRepository` with the versioning guarantees pushed down to the storage level.

Key decision: `update()` inserts the version with Dexie's `add` (not `put`) inside a read-write transaction — an id collision with an existing version **throws** instead of silently rewriting history. `delete()` removes the memory and its versions in one transaction.

#### `photo-repository.ts` — `IndexedDbPhotoRepository`
**Why it exists:** Implements `PhotoRepository`. Converts `Blob → ArrayBuffer` on save and reconstructs a `Blob` (with original mime type) on read, hiding the storage-portability workaround from the domain interface. Save and delete keep metadata and bytes consistent in a single transaction.

#### `prompt-repository.ts` / `person-repository.ts` / `place-repository.ts` / `tag-repository.ts` / `user-profile-repository.ts`
**Why they exist:** Straightforward implementations of their domain interfaces. Ordering conventions: prompts by `createdAt`, people/places by `name`, tags by `label`.

#### `index.ts`
**Why it exists:** The composition point for the whole persistence layer.

| Export | Purpose |
|--------|---------|
| `Repositories` | Interface bundling all seven repository interfaces — what the app "sees". |
| `createIndexedDbRepositories(dbName?)` | Builds one `LifeKaleidoscopeDb` and wires all seven implementations around it. A future remote backend replaces this one factory. |
| Class re-exports | Individual repositories, mainly for tests. |

---

### App shell & routing (`src/app/`, `src/App.tsx`)

| File | Purpose |
|------|---------|
| `src/App.tsx` | `createBrowserRouter` with all eight routes from brief §6 (`/`, `/memories`, `/memories/:id`, `/memories/:id/edit`, `/search`, `/graph`, `/export`, `/settings`) nested under `AppShell`. |
| `src/app/AppShell.tsx` | Responsive shell (reworked in #3/#14). Desktop (`sm+`): header with title + horizontal text nav. Phones: header shows the title only; navigation moves to a **fixed bottom tab bar** — six icon+label tabs (lucide icons), each ≥56px tall, `env(safe-area-inset-bottom)` padding, `main` gets `pb-28` so content clears the bar. Only one nav is in the accessibility tree at a time (the other is `display:none`). Verified at 390×844: no overflow, no clipping. |
| `src/features/*/…Page.tsx`, `src/app/SettingsPage.tsx` | One placeholder screen per route, in their future feature homes. |

`index.html` (updated in #15): title "Life Kaleidoscope", `theme-color` matching the paper background, and `public/favicon.svg` — a hand-drawn quiet notebook mark (ivory page, clay margin line, three trailing ink lines). Deliberately not literal kaleidoscope imagery (brief §2). The leftover bolt-logo `favicon.svg`/`icons.svg` from scaffolding were replaced/removed.

---

### Design system (`src/shared/ui/`) — added in #3

shadcn-style primitives, hand-written (new-york style, React 19 ref-as-prop, no `forwardRef`). Default button/input height is 44px — tap-target minimum as a design-system default rather than a per-screen fix. Prose inherits the serif body font; UI chrome (labels, buttons, nav) uses `font-sans`.

| File | Exports | Notes |
|------|---------|-------|
| `button.tsx` | `Button`, `buttonVariants` | cva variants: `default/secondary/outline/ghost/destructive`, sizes `sm/default/lg/icon`. Defaults to `type="button"`. |
| `card.tsx` | `Card` + `Header/Title/Description/Content/Footer` | Standard shadcn card family on the paper palette. |
| `text-field.tsx` | `TextField` | Labeled input with `hint`/`error`; wires `aria-invalid` + `aria-describedby`. Ids from `useId`. |
| `textarea.tsx` | `Textarea` | Same labeled-field pattern, serif prose area for memory writing. |
| `photo-upload.tsx` | `PhotoUpload` | Dashed drop-well `<label>` wrapping an `sr-only` native file input — keyboard/SR users get the real control. Resets after each pick; `onSelect(File[])`. |
| `empty-state.tsx` | `EmptyState` | Calm empty screen (icon/title/description/action) — deliberately no guilt copy. |
| `page-header.tsx` | `PageHeader` | `h1` + description + right-aligned action slot. |
| `PlaceholderPage.tsx` | `PlaceholderPage` | Now a thin wrapper over `EmptyState`. |
| `index.ts` | Barrel for all of the above. | |

---

### Shared (`src/shared/`)

| File | Purpose |
|------|---------|
| `lib/utils.ts` | `cn()` — `clsx` + `tailwind-merge`, the standard shadcn class-merging helper. |

`src/index.css` holds the theme: warm paper palette (oklch ivory/ink CSS variables mapped to Tailwind v4 `@theme inline` tokens, from Epic 0) plus, added in #3, `--font-serif` (Charter/Sitka/Cambria/Georgia stack — body default) and `--font-sans` (warm system sans for UI chrome). System stacks only — no webfont downloads, consistent with privacy-first.

---

### Tests

| File | Covers |
|------|--------|
| `src/domain/memory/versioning.test.ts` | Pure versioning logic: initial version on create, snapshot shape (no `currentVersionId`), defaults, no-mutation guarantee, edit chains, optional dates. |
| `src/infrastructure/persistence/indexeddb/repositories.test.ts` | All repositories against `fake-indexeddb`: round-trips, version append + tamper rejection, delete-with-history, prompt lookup by word, photo blob round-trip, singleton profile. Fresh db per test. |
| `src/shared/lib/utils.test.ts` | `cn()` behaviour. |
| `src/shared/ui/shared-ui.test.tsx` | Added in #3. Primitives via RTL: click/disabled `Button`, label association + error ARIA on `TextField`/`Textarea`, file selection through `PhotoUpload`, `EmptyState`/`PageHeader` render. |
| `src/app/AppShell.test.tsx` | Added in #3/#14. Shell renders title + outlet; every route present in both desktop nav and mobile tab bar. |

Test stack: Vitest + jsdom + `fake-indexeddb` (dev dependency). 31 tests as of Epic 2.

**Browser verification:** `playwright-core` (dev dependency, added with #3) drives the built app in the system's Edge/Chrome (`channel:` launch — no browser binaries downloaded). Used for per-epic runtime verification: viewport checks at 390×844 and 1280×800, favicon/response checks, screenshots.

---

## Tooling

| Piece | Notes |
|-------|-------|
| Vite 8 + React 19 + TS strict | `verbatimModuleSyntax` and `erasableSyntaxOnly` are on — use `import type`, no constructor parameter properties or enums. |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Theme tokens in `src/index.css` (`@theme` / `@theme inline`). |
| Path alias | `@/ → src/` (vite.config.ts, vitest.config.ts, tsconfig.app.json). |
| Scripts | `dev`, `build` (tsc + vite), `test` / `test:watch` / `test:coverage`, `lint` (oxlint), `format` (prettier), `type-check`. |

---

## Status

```mermaid
flowchart LR
    subgraph Done ["✅ Done"]
        E0["#1 Epic 0 — Scaffold & tooling"]
        E1["#2 Epic 1 — Domain model & persistence"]
        E2["#3 Epic 2 — Design system & shell"]
        B14["#14 Mobile nav bug"]
        B15["#15 Favicon"]
    end
    subgraph Next ["⏭ Next"]
        E3["#4 Epic 3 — Daily Prompt (Tier 3)"]
        DS["#17 → #11 → #16 Data safety (Tier 4)"]
    end
    Done --> Next
```

See `docs/issues-priority.md` for the full ordered queue.
