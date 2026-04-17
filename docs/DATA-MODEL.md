# Data Model

Canonical reference for every persistent entity in Giftfy. The app ships with a **Firestore** backend by default but the model maps cleanly to SQL — see [`db/schema.sql`](../db/schema.sql) and [`db/prisma/schema.prisma`](../db/prisma/schema.prisma).

## Entity Overview

```
profiles (1) ───< celebrations (1) ───< slides
     │                  │
     │                  ├───< replies
     │                  │
     │                  ├───< view_events
     │                  │
     │                  └───< payments
     │                          │
     └──────────────────────────┘

profiles (1) ───< api_keys
```

- A **profile** is created on first sign-in and stores display metadata.
- A **celebration** is one digital gift page, owned by a profile.
- **Slides** belong to a celebration and render the cinematic experience.
- **Replies** are thank-you messages from the recipient (creator-side inbox).
- **View events** power the analytics panel (page views, time per slide, interactions).
- **API keys** are per-user tokens for programmatic access via the MCP server.
- **Payments** are local reconciliation records for Razorpay transactions — keyed by `providerPaymentId` and owned by both the celebration and the profile.

---

## 1. `profiles`

The authenticated user.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | string (uid) | — | Firebase Auth UID or Postgres UUID |
| `email` | string | yes | |
| `fullName` | string | yes | Display name |
| `avatarUrl` | string | yes | |
| `createdAt` | timestamp | — | |

**Firestore:** `/profiles/{userId}`. Rules: read/write only by owner.

**SQL:** `profiles(id TEXT PRIMARY KEY, email TEXT, full_name TEXT, avatar_url TEXT, created_at TIMESTAMPTZ)`

---

## 2. `celebrations`

The central entity. One per digital gift page.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | string | — | Auto-ID / UUID |
| `creatorId` | string (FK → profiles.id) | — | Owner |
| `recipientName` | string | — | |
| `recipientPhotoUrl` | string | yes | Cover photo |
| `photoCount` | int | yes | Count of photos across all slides (denormalized for LP math) |
| `occasion` | enum | — | `birthday` \| `anniversary` \| `graduation` \| `congratulations` \| `custom` |
| `customOccasion` | string | yes | Free-text label when occasion=custom |
| `occasionDate` | date | yes | Drives the reminders widget |
| `slug` | string | — | URL slug, unique within published celebrations |
| `customSlug` | string | yes | Deluxe-tier override (takes precedence over slug) |
| `status` | enum | — | `draft` \| `published` \| `archived` |
| `vibe` | enum | — | `warm` \| `playful` \| `romantic` \| `minimal` |
| `template` | string | — | Slide template key (maps to `src/lib/constants.ts`) |
| `tier` | enum | — | `free` \| `sweet` \| `premium` \| `deluxe` |
| `musicTrackId` | string | yes | Preset track from music-library |
| `customMusicUrl` | string | yes | Uploaded track URL (Premium+) |
| `videoUrl` | string | yes | Uploaded video URL (Premium+) |
| `scheduledRevealAt` | timestamp | yes | Publish-at date (Premium+) |
| `password` | string | yes | Plaintext in demo/test; hash in prod (Deluxe) |
| `expiresAt` | timestamp | yes | Free-tier expiry |
| `viewCount` | int | — | Total page views |
| `uniqueViewers` | int | — | Distinct viewer IDs |
| `firstViewedAt` | timestamp | yes | |
| `chatAnalysis` | json | yes | Pasted WhatsApp chat analysis result |
| `voiceNoteUrl` | string | yes | Creator's voice note |
| `voiceNoteDurationMs` | int | yes | |
| `giftTitle` | string | yes | Optional gift link label |
| `giftUrl` | string | yes | Optional gift link |
| `giftDescription` | string | yes | |
| `createdAt` | timestamp | — | |
| `updatedAt` | timestamp | — | |
| `publishedAt` | timestamp | yes | Sets when `status` → `published` |
| `deletedAt` | timestamp | yes | Soft-delete marker; all reads filter where this is null |

**Firestore:** `/celebrations/{id}`. Rules: public read when `status=published`; create/update/delete by creator only.

**Access patterns:**
- `getMyCreations()` — `WHERE creatorId = ? ORDER BY createdAt DESC`
- `getCelebrationBySlug()` — `WHERE slug = ? AND status = 'published'`
- `isSlugAvailable()` — `WHERE slug = ?`

**Indexes:**
- `(creator_id, created_at DESC) WHERE deleted_at IS NULL` — dashboard list (partial, Postgres only; Firestore filters client-side)
- `(slug, status)` — public view resolution
- `slug` — uniqueness check

**Soft-delete.** `deleteCelebration()` does **not** remove the row — it sets `deletedAt = now()` and leaves the data in place. Every read path (`getMyCreations`, `getCelebration`, `getCelebrationBySlug`, dashboard summary, upcoming-reminders view) filters on `deletedAt IS NULL` so deleted gifts vanish from the UI while preserving the underlying data for restore, GDPR export, or audit. Child records (slides, replies, view events) are left untouched; they're joined from the parent, so hiding the parent hides them too. Slug uniqueness (`isSlugAvailable`) intentionally still counts soft-deleted rows — we don't re-issue a slug held by a deleted celebration during the retention window.

---

## 3. `slides`

Subcollection of celebrations. One per cinematic step.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | string | — | |
| `celebrationId` | string (FK) | — | |
| `slideType` | enum | — | `hero` \| `traits` \| `photo_wall` \| `chat_replay` \| `letter` \| `voice_note` \| `candle_blow` \| `gift_reveal` \| `thank_you` |
| `sortOrder` | int | — | Ordering within the celebration |
| `content` | json | — | Type-specific payload (messages, photos, text) |
| `interactions` | json | — | Type-specific behavior flags |
| `createdAt` | timestamp | — | |
| `updatedAt` | timestamp | — | |

**Firestore:** `/celebrations/{celebrationId}/slides/{slideId}`.

**Indexes:**
- `(celebration_id, sort_order ASC)` — ordered render

**SQL:** `ON DELETE CASCADE` from celebrations.

---

## 4. `replies`

Subcollection — recipient's thank-you messages.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | string | — | |
| `celebrationId` | string (FK) | — | |
| `replyType` | enum | — | `text` \| `voice` \| `emoji` |
| `textContent` | string | yes | Present when replyType=text, ≤500 chars |
| `voiceUrl` | string | yes | Present when replyType=voice |
| `emoji` | string | yes | ≤8 chars, present when replyType=emoji |
| `createdAt` | timestamp | — | |

**Firestore:** `/celebrations/{celebrationId}/replies/{replyId}`. Rules: anyone can create (anonymous senders), owner can read.

**Validation (enforced in `firestore.rules` + SQL CHECK):**
- Exactly one of `textContent` / `voiceUrl` / `emoji` is set based on `replyType`.
- `textContent` length 1..500.
- `voiceUrl` must be a Firebase Storage URL (or your storage CDN).
- `emoji` length ≤ 8.

**Indexes:**
- `(celebration_id, created_at DESC)` — inbox query per gift

---

## 5. `view_events`

Subcollection — raw analytics stream.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | string | — | |
| `celebrationId` | string (FK) | — | |
| `viewerId` | string | yes | nanoid(16) stored in viewer's localStorage |
| `slideId` | string (FK) | yes | Null for `page_view` |
| `eventType` | enum | — | `page_view` \| `slide_enter` \| `slide_exit` \| `interaction` |
| `durationMs` | int | yes | Present on `slide_exit` |
| `action` | string | yes | Free-text action name for `interaction` |
| `createdAt` | timestamp | — | |

**Firestore:** `/celebrations/{celebrationId}/viewEvents/{eventId}`. Rules: anyone can create, only owner can read.

**Indexes:**
- `(celebration_id, created_at ASC)` — insights aggregation

---

## 6. `api_keys`

Top-level collection. User-generated tokens for the MCP server.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | string | — | |
| `userId` | string (FK) | — | Owner |
| `keyHash` | string | — | SHA-256 of full key |
| `keyHint` | string | — | Last 4 chars for display |
| `name` | string | — | Human label |
| `isActive` | boolean | — | Soft-delete flag |
| `createdAt` | timestamp | — | |
| `lastUsedAt` | timestamp | yes | Updated on validated request |

**Firestore:** `/apiKeys/{id}`. Rules: owner can CRUD, server uses `keyHash` as the primary lookup.

**Access patterns:**
- List active keys: `WHERE userId = ? AND isActive = true`
- Verify request: `WHERE keyHash = ? AND isActive = true`

**Indexes:**
- `(user_id, is_active)` — list-active-keys
- `key_hash UNIQUE` — auth lookup

---

## 7. `payments`

Top-level collection. Local reconciliation records for Razorpay transactions.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | string | — | |
| `userId` | string (FK → profiles.id) | — | Creator who paid |
| `celebrationId` | string (FK → celebrations.id) | — | Gift that was paid for |
| `tier` | enum | — | `sweet` \| `premium` \| `deluxe` (free never produces a record) |
| `amountPaise` | int | — | INR minor units (price × 100). Must be > 0 |
| `currency` | string | — | `'INR'` today |
| `provider` | enum | — | `razorpay` \| `demo` |
| `providerPaymentId` | string | — | `razorpay_payment_id` (or `demo-pay-...` in demo mode). Unique per `(provider, providerPaymentId)` in SQL |
| `status` | enum | — | `captured` \| `failed` \| `refunded`. Only `captured` is a valid create state |
| `createdAt` | timestamp | — | |

**Firestore:** `/payments/{paymentId}`. Rules: create allowed only when `request.auth.uid == userId` and the payload passes `isValidPayment` validation; read-only for the owner. No update/delete — records are immutable audit entries.

**Access patterns:**
- `getMyPayments()` — `WHERE userId = ? ORDER BY createdAt DESC`

**Indexes:**
- `(user_id, created_at DESC)` — owner's transaction history
- `(celebration_id)` — join from a celebration page (SQL only)
- `(provider, provider_payment_id)` UNIQUE — prevents double-writes on retry (SQL only)

**Source of truth:** Razorpay's dashboard remains authoritative for money state. This table is a creator-facing audit log and the foundation for future refund flows. Best-effort write: if `createPaymentRecord()` throws during publish, the publish still succeeds and only logs to `console.error`.

**Payments outlive soft-deletes of their celebration by design.** When a creator deletes a gift, the celebration row is tagged with `deletedAt` (soft-delete) but the matching payment row stays intact — financial records must not disappear just because the creator removed the UI artifact. Hard-deleting the celebration row in SQL cascades the payment rows with it; if you want to preserve them, run a soft-delete sweep instead (`UPDATE celebrations SET deleted_at = NOW() WHERE …`). A future `getMyPayments()` dashboard card should note when a linked celebration is soft-deleted rather than hiding the row.

**SQL:** `ON DELETE CASCADE` from both `profiles` and `celebrations` (applies only to hard-deletes).

---

## Enums (authoritative)

```
occasion: birthday | anniversary | graduation | congratulations | custom
status:   draft | published | archived
vibe:     warm | playful | romantic | minimal
tier:     free | sweet | premium | deluxe
slide_type: hero | traits | photo_wall | chat_replay | letter
          | voice_note | candle_blow | gift_reveal | thank_you
reply_type: text | voice | emoji
event_type: page_view | slide_enter | slide_exit | interaction
payment_provider: razorpay | demo
payment_status:   captured | failed | refunded
```

## State machines

**Celebration status:** `draft → published → archived` (no skipping; `archived` is terminal for billing).

**Tier:** `free ← sweet ← premium ← deluxe` (upgrade-only at publish time; no downgrade path implemented).

---

## Backend pieces NOT modeled here

- **Firebase Auth** — owns the user identity. `profiles` is a projection of the Auth user.
- **Firebase Storage / S3** — holds photo, voice note, music, and video binaries. Only URLs are stored in the DB.
- **Razorpay transaction state** — Razorpay's dashboard is authoritative for captured/failed/refunded money state. We mirror a thin audit record per transaction in the `payments` table (section 7) so creators can see their purchase history in-app.

---

## Migrating off Firestore → SQL

Paths are equivalent:

| Firestore path | SQL table | Relationship |
|----------------|-----------|--------------|
| `/profiles/{uid}` | `profiles` | |
| `/celebrations/{id}` | `celebrations` | `creator_id` FK → `profiles.id` |
| `/celebrations/{id}/slides/{slideId}` | `slides` | `celebration_id` FK → `celebrations.id` |
| `/celebrations/{id}/replies/{replyId}` | `replies` | `celebration_id` FK → `celebrations.id` |
| `/celebrations/{id}/viewEvents/{eventId}` | `view_events` | `celebration_id` FK → `celebrations.id` |
| `/apiKeys/{id}` | `api_keys` | `user_id` FK → `profiles.id` |
| `/payments/{id}` | `payments` | `user_id` FK → `profiles.id`, `celebration_id` FK → `celebrations.id` |

See [`db/README.md`](../db/README.md) for setup instructions (Postgres DDL + Prisma ORM).
