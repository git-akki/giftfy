# Database Setup

Giftfy ships two interchangeable backend options. Pick one based on what you're comfortable with. The app's TypeScript data model ([docs/DATA-MODEL.md](../docs/DATA-MODEL.md)) is the source of truth and both setups mirror it 1:1.

| Backend | Best for | Setup time |
|---------|----------|------------|
| **Firestore** (default, in-repo) | Google Cloud, serverless, real-time updates out of the box | ~10 min |
| **Postgres** (via `db/schema.sql`) | Classic relational, full SQL control, joins, analytics | ~5 min |
| **Postgres + Prisma** (`db/prisma/schema.prisma`) | TypeScript-first, codegen'd client, migrations | ~5 min |

The current app code uses Firestore. The Postgres paths are drop-in replacements if you want to migrate or build a new backend against the same model. See the [Porting](#porting-the-app-to-postgres) section below.

---

## Option A — Firestore (what ships)

Everything is already set up in repo. Two files matter:

- [`firestore.rules`](../firestore.rules) — security rules
- [`firestore.indexes.json`](../firestore.indexes.json) — composite indexes required by the app's queries

Deploy both:

```bash
firebase deploy --only firestore
```

Or split:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

**Required indexes** (already in `firestore.indexes.json`):

| Collection | Fields | Used by |
|-----------|--------|---------|
| `celebrations` | `creatorId` ASC, `createdAt` DESC | `getMyCreations()` on Dashboard |
| `celebrations` | `slug` ASC, `status` ASC | `getCelebrationBySlug()` on `/c/:slug` |
| `apiKeys` | `userId` ASC, `isActive` ASC | API Keys panel |
| `payments` | `userId` ASC, `createdAt` DESC | `getMyPayments()` reconciliation history |

If you skip the indexes deploy, Firestore will error at runtime with a link to auto-create them. The error is visible in the browser console.

---

## Option B — Postgres (raw SQL)

Clean, minimal, no framework overhead.

### Prerequisites

- Postgres 14+ (the schema uses `gen_random_uuid()` from `pgcrypto`; older Postgres needs `uuid-ossp` and `uuid_generate_v4()`)
- `psql` CLI

### Install

```bash
# Create the database
createdb giftfy

# Apply the schema
psql giftfy < db/schema.sql

# Confirm
psql giftfy -c '\dt'
```

You should see: `profiles`, `celebrations`, `slides`, `replies`, `view_events`, `api_keys`, `payments` and two views (`user_dashboard_summary`, `upcoming_reminders`).

### Connection string for the app

If you wire the app to Postgres, export a standard URL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/giftfy
```

### Typical queries

All the Firestore calls in `src/services/*` have direct SQL equivalents. Samples:

```sql
-- getMyCreations(userId) — soft-deleted rows are hidden
SELECT * FROM celebrations
WHERE creator_id = $1
  AND deleted_at IS NULL
ORDER BY created_at DESC;

-- getCelebrationBySlug(slug)
SELECT * FROM celebrations
WHERE slug = $1
  AND status = 'published'
  AND deleted_at IS NULL
LIMIT 1;

-- getSlides(celebrationId)
SELECT * FROM slides
WHERE celebration_id = $1
ORDER BY sort_order ASC;

-- getReplies(celebrationId)
SELECT * FROM replies
WHERE celebration_id = $1
ORDER BY created_at DESC;

-- getAllMyReplies(userId) — cross-gift inbox
SELECT r.*, c.slug, c.recipient_name, c.occasion
FROM replies r
JOIN celebrations c ON c.id = r.celebration_id
WHERE c.creator_id = $1
ORDER BY r.created_at DESC;

-- upcoming reminders, next 30 days
SELECT * FROM upcoming_reminders
WHERE creator_id = $1
  AND next_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY next_date ASC;

-- Dashboard tier summary (already a view)
SELECT * FROM user_dashboard_summary
WHERE creator_id = $1;

-- getMyPayments(userId)
SELECT p.*, c.recipient_name, c.slug
FROM payments p
JOIN celebrations c ON c.id = p.celebration_id
WHERE p.user_id = $1
ORDER BY p.created_at DESC;
```

---

## Option C — Postgres + Prisma

Best developer experience if you're writing TypeScript. Prisma generates a fully-typed client matching the schema.

### Install

```bash
cd db/prisma
npm init -y
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

This creates a fresh `schema.prisma` and `.env`. **Replace the generated `schema.prisma` with the one in this directory** (overwrite it).

### Configure

Set your connection string in `db/prisma/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/giftfy"
```

### Apply

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Prisma creates all tables, enums, and indexes that match `db/schema.sql` (and more importantly matches [docs/DATA-MODEL.md](../docs/DATA-MODEL.md)).

### Usage from app code

```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// getMyCreations equivalent
const celebrations = await prisma.celebration.findMany({
  where: { creatorId: userId },
  orderBy: { createdAt: 'desc' },
});

// getAllMyReplies equivalent
const replies = await prisma.reply.findMany({
  where: { celebration: { creatorId: userId } },
  include: { celebration: { select: { slug: true, recipientName: true, occasion: true } } },
  orderBy: { createdAt: 'desc' },
});
```

### Caveat

Prisma does **not** support raw SQL `CHECK` constraints in the schema DSL. The `replies_payload_matches_type` constraint from `db/schema.sql` is enforced at the app layer only when you use Prisma. For production you can bolt the check back on with a migration:

```bash
npx prisma migrate dev --create-only --name add_reply_check
# Open the generated SQL file and paste the CHECK constraint from db/schema.sql
npx prisma migrate dev
```

---

## Porting the app to Postgres

The current code calls Firebase directly from `src/services/*`. To port:

1. **Swap the clients** — replace `firebase/firestore` imports with your Postgres client (raw `pg`, Prisma, Kysely, Drizzle, etc.)
2. **Add a thin API layer** — Firestore runs client-side with rules. Postgres needs a server. Put the queries behind HTTP endpoints (the existing `functions/` directory is a good home) and call them from the frontend.
3. **Rewrite Auth if needed** — either keep Firebase Auth (cheap, just verify JWTs server-side) or swap to Supabase/NextAuth/your own.
4. **Storage** — replace Firebase Storage with S3 / R2 / Supabase Storage. The app only stores URLs, so this is purely a deploy swap.

The data-access boundary is intentionally thin: every query lives in `src/services/` (`celebrations.ts`, `slides.ts`, `thank-you.ts`, `analytics.ts`). Port those six files and the rest of the app keeps working.

---

## What's NOT in the SQL schema (by design)

- **Auth tables** — Firebase Auth or Supabase Auth owns this. `profiles.id` is the user UID from whatever auth provider you use.
- **Storage metadata** — photo/voice/music/video binaries live in object storage (Firebase Storage, S3, R2). We store URLs only.
- **Razorpay transaction state** — Razorpay's dashboard is the source of truth for captured/failed/refunded money state. The `payments` table in `schema.sql` mirrors a thin audit record per transaction so creators can reconcile from the app.
- **Audit log** — add if compliance needs it.

---

## Maintenance

- Keep `docs/DATA-MODEL.md` as the source of truth. When you add a field:
  1. Update the doc.
  2. Update `src/lib/types.ts`.
  3. Update `firestore.rules` (if write-path validation needed) + `firestore.indexes.json` (if new query shape).
  4. Update `db/schema.sql` with `ALTER TABLE`.
  5. Update `db/prisma/schema.prisma` and run `prisma migrate dev`.
- Every `services/*` function corresponds to exactly one query shape. If you add a new function, add the corresponding SQL above and wire the index.
