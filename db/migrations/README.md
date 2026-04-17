# Database Migrations

Forward-only, numbered SQL files. Apply them in order against a Postgres database. If you use Prisma, let `prisma migrate` manage migrations instead — do not mix the two.

## Naming

```
NNN_short_description.sql
```

- `NNN` is a 3-digit, monotonically increasing integer (`001`, `002`, …). Never reuse a number.
- `short_description` is `snake_case`, a few words max, describing the change.
- One migration per logical change. Don't bundle unrelated schema changes.

## Rules

- **Forward-only.** Never edit an applied migration. If you need to undo something, write a new migration that reverses it.
- **Idempotent where possible.** Use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` (Postgres 9.6+) so re-running a file doesn't crash.
- **Wrap in a transaction.** Each file should be one `BEGIN; … COMMIT;` so partial failures roll back cleanly. (Exception: `CREATE INDEX CONCURRENTLY` can't run inside a transaction — put those in a dedicated file.)
- **Keep migrations small.** A 500-line migration is hard to review and hard to revert.
- **Don't `DROP` production data without a plan.** Pair destructive migrations with a 2-step deploy (add new col, backfill, flip reads, drop old col in a later migration).

## Running

Apply all pending:

```bash
# Naive sequential apply
for f in db/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f" || { echo "Failed on $f"; exit 1; }
done
```

Or use a migration tool: [node-pg-migrate](https://github.com/salsita/node-pg-migrate), [sqlx migrate](https://github.com/launchbadge/sqlx), [dbmate](https://github.com/amacneil/dbmate), [Flyway](https://flywaydb.org/). Each tracks applied migrations in a metadata table so reruns are safe.

## Tracking applied migrations

A basic pattern (if you don't use a dedicated tool):

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Each migration ends with `INSERT INTO schema_migrations (version) VALUES ('001');` so future runs can skip applied migrations.

## Current migrations

| # | File | What it does |
|---|------|--------------|
| 001 | [`001_init.sql`](./001_init.sql) | Initial schema — all enums, tables, indexes, CHECK constraints, views (mirror of `db/schema.sql`) |

## Relationship to `db/schema.sql`

`db/schema.sql` is the **current full-schema snapshot** — handy for a fresh-database setup in one shot. Migrations in this folder are the **incremental history** used to evolve existing databases. They should always agree:

- When adding a column, write the migration first, then update `db/schema.sql` to match.
- When editing `db/schema.sql` directly (e.g. fixing a typo), open a matching migration file to apply the change to existing databases.

If you find drift between the two, the migrations are authoritative — but fix `schema.sql` immediately so it stays useful for fresh installs.

## Prisma users

If you're on the Prisma path (`db/prisma/schema.prisma`), ignore this folder and use:

```bash
npx prisma migrate dev --name <short_description>
```

Prisma creates its own `prisma/migrations/` folder and manages them itself. Don't run raw SQL migrations from this directory against a Prisma-managed database — it breaks the drift detection.
