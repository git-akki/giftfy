-- ============================================================================
-- Giftfy — Postgres schema (reference implementation)
-- ============================================================================
--
-- This mirrors the Firestore data model (see docs/DATA-MODEL.md) one-to-one
-- so the app can be ported to a SQL backend. To apply:
--
--   createdb giftfy
--   psql giftfy < db/schema.sql
--
-- Tested against Postgres 14+. Uses the built-in pgcrypto extension for
-- gen_random_uuid(); on older Postgres use `uuid-ossp` + `uuid_generate_v4()`.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── ENUM types ─────────────────────────────────────────────────────────────

CREATE TYPE occasion_type AS ENUM (
  'birthday', 'anniversary', 'graduation', 'congratulations', 'custom'
);

CREATE TYPE celebration_status AS ENUM (
  'draft', 'published', 'archived'
);

CREATE TYPE vibe_type AS ENUM (
  'warm', 'playful', 'romantic', 'minimal'
);

CREATE TYPE tier_type AS ENUM (
  'free', 'sweet', 'premium', 'deluxe'
);

CREATE TYPE slide_type AS ENUM (
  'hero', 'traits', 'photo_wall', 'chat_replay', 'letter',
  'voice_note', 'candle_blow', 'gift_reveal', 'thank_you'
);

CREATE TYPE reply_type AS ENUM (
  'text', 'voice', 'emoji'
);

CREATE TYPE event_type AS ENUM (
  'page_view', 'slide_enter', 'slide_exit', 'interaction'
);

-- ─── profiles ────────────────────────────────────────────────────────────────
-- A row is created on first sign-in. `id` equals the auth provider's UID
-- (Firebase Auth UID or Supabase auth.users.id).

CREATE TABLE profiles (
  id          TEXT PRIMARY KEY,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_email_idx ON profiles (email);

-- ─── celebrations ───────────────────────────────────────────────────────────

CREATE TABLE celebrations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id              TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_name          TEXT NOT NULL,
  recipient_photo_url     TEXT,
  photo_count             INTEGER NOT NULL DEFAULT 0,
  occasion                occasion_type NOT NULL,
  custom_occasion         TEXT,
  occasion_date           DATE,
  slug                    TEXT NOT NULL,
  custom_slug             TEXT,
  status                  celebration_status NOT NULL DEFAULT 'draft',
  vibe                    vibe_type NOT NULL DEFAULT 'warm',
  template                TEXT NOT NULL DEFAULT 'classic',
  tier                    tier_type NOT NULL DEFAULT 'free',
  music_track_id          TEXT,
  custom_music_url        TEXT,
  video_url               TEXT,
  scheduled_reveal_at     TIMESTAMPTZ,
  password                TEXT,                 -- hash in production
  expires_at              TIMESTAMPTZ,
  view_count              INTEGER NOT NULL DEFAULT 0,
  unique_viewers          INTEGER NOT NULL DEFAULT 0,
  first_viewed_at         TIMESTAMPTZ,
  chat_analysis           JSONB,
  voice_note_url          TEXT,
  voice_note_duration_ms  INTEGER,
  gift_title              TEXT,
  gift_url                TEXT,
  gift_description        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at            TIMESTAMPTZ,
  deleted_at              TIMESTAMPTZ,           -- soft-delete marker

  CONSTRAINT celebrations_slug_unique UNIQUE (slug)
);

-- Index: dashboard list (WHERE creator_id = ? ORDER BY created_at DESC).
-- Partial index skips soft-deleted rows so the dashboard query touches no
-- dead tuples; every app read must also apply the `deleted_at IS NULL` filter.
CREATE INDEX celebrations_not_deleted_idx
  ON celebrations (creator_id, created_at DESC) WHERE deleted_at IS NULL;

-- Index: public view resolver (WHERE slug = ? AND status = 'published')
CREATE INDEX celebrations_slug_status_idx
  ON celebrations (slug, status);

-- Index: reminders widget scan (WHERE occasion_date IS NOT NULL)
CREATE INDEX celebrations_occasion_date_idx
  ON celebrations (occasion_date) WHERE occasion_date IS NOT NULL;

-- ─── slides ──────────────────────────────────────────────────────────────────

CREATE TABLE slides (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celebration_id    UUID NOT NULL REFERENCES celebrations(id) ON DELETE CASCADE,
  slide_type        slide_type NOT NULL,
  sort_order        INTEGER NOT NULL,
  content           JSONB NOT NULL DEFAULT '{}'::jsonb,
  interactions      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each celebration has a clean ordering
  CONSTRAINT slides_celeb_sort_unique UNIQUE (celebration_id, sort_order)
);

-- Index: render slides in order (WHERE celebration_id = ? ORDER BY sort_order ASC)
CREATE INDEX slides_celeb_order_idx
  ON slides (celebration_id, sort_order ASC);

-- ─── replies ─────────────────────────────────────────────────────────────────

CREATE TABLE replies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celebration_id    UUID NOT NULL REFERENCES celebrations(id) ON DELETE CASCADE,
  reply_type        reply_type NOT NULL,
  text_content      TEXT,
  voice_url         TEXT,
  emoji             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Mirror the Firestore rule: exactly one payload field matches the type.
  CONSTRAINT replies_payload_matches_type CHECK (
    (reply_type = 'text'
      AND text_content IS NOT NULL
      AND length(text_content) BETWEEN 1 AND 500
      AND voice_url IS NULL
      AND emoji IS NULL)
    OR
    (reply_type = 'voice'
      AND voice_url IS NOT NULL
      AND text_content IS NULL
      AND emoji IS NULL)
    OR
    (reply_type = 'emoji'
      AND emoji IS NOT NULL
      AND length(emoji) BETWEEN 1 AND 8
      AND text_content IS NULL
      AND voice_url IS NULL)
  )
);

-- Index: inbox per-gift (WHERE celebration_id = ? ORDER BY created_at DESC)
CREATE INDEX replies_celeb_created_idx
  ON replies (celebration_id, created_at DESC);

-- Optional index for a future cross-gift inbox query keyed on creator:
--   SELECT r.* FROM replies r JOIN celebrations c ON c.id = r.celebration_id
--   WHERE c.creator_id = ? ORDER BY r.created_at DESC;
-- The PK + celebrations_not_deleted_idx already support this.

-- ─── view_events ─────────────────────────────────────────────────────────────

CREATE TABLE view_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celebration_id    UUID NOT NULL REFERENCES celebrations(id) ON DELETE CASCADE,
  viewer_id         TEXT,
  slide_id          UUID REFERENCES slides(id) ON DELETE SET NULL,
  event_type        event_type NOT NULL,
  duration_ms       INTEGER,
  action            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT view_events_slide_exit_has_duration CHECK (
    event_type <> 'slide_exit' OR duration_ms IS NOT NULL
  ),
  CONSTRAINT view_events_interaction_has_action CHECK (
    event_type <> 'interaction' OR action IS NOT NULL
  )
);

-- Index: insights aggregation (WHERE celebration_id = ? ORDER BY created_at ASC)
CREATE INDEX view_events_celeb_created_idx
  ON view_events (celebration_id, created_at ASC);

-- Index: unique-viewer counting for a celebration
CREATE INDEX view_events_celeb_viewer_idx
  ON view_events (celebration_id, viewer_id);

-- ─── api_keys ────────────────────────────────────────────────────────────────

CREATE TABLE api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key_hash     TEXT NOT NULL,                  -- SHA-256 of the full key
  key_hint     TEXT NOT NULL,                  -- Last 4 chars for UI
  name         TEXT NOT NULL DEFAULT 'Default',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  CONSTRAINT api_keys_hash_unique UNIQUE (key_hash)
);

-- Index: list a user's active keys
CREATE INDEX api_keys_user_active_idx
  ON api_keys (user_id, is_active);

-- ─── Triggers (updated_at) ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER celebrations_touch_updated_at
  BEFORE UPDATE ON celebrations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER slides_touch_updated_at
  BEFORE UPDATE ON slides
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─── payments ───────────────────────────────────────────────────────────────
-- Local reconciliation record for Razorpay transactions. Razorpay's dashboard
-- remains source of truth — this table lets the creator audit purchases in-app
-- and makes refund flows possible later.

CREATE TYPE payment_provider AS ENUM ('razorpay', 'demo');
CREATE TYPE payment_status AS ENUM ('captured', 'failed', 'refunded');

CREATE TABLE payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  celebration_id       UUID NOT NULL REFERENCES celebrations(id) ON DELETE CASCADE,
  tier                 tier_type NOT NULL,
  amount_paise         INTEGER NOT NULL CHECK (amount_paise > 0),
  currency             TEXT NOT NULL DEFAULT 'INR',
  provider             payment_provider NOT NULL,
  provider_payment_id  TEXT NOT NULL,
  status               payment_status NOT NULL DEFAULT 'captured',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payments_provider_id_unique UNIQUE (provider, provider_payment_id)
);

CREATE INDEX payments_user_created_idx ON payments (user_id, created_at DESC);
CREATE INDEX payments_celebration_idx ON payments (celebration_id);

-- ─── Useful views ───────────────────────────────────────────────────────────

-- Dashboard summary: tier distribution + reply counts per user
CREATE VIEW user_dashboard_summary AS
SELECT
  c.creator_id,
  COUNT(*) FILTER (WHERE c.tier = 'free')      AS free_count,
  COUNT(*) FILTER (WHERE c.tier = 'sweet')     AS sweet_count,
  COUNT(*) FILTER (WHERE c.tier = 'premium')   AS premium_count,
  COUNT(*) FILTER (WHERE c.tier = 'deluxe')    AS deluxe_count,
  COUNT(*) FILTER (WHERE c.status = 'published') AS published_count,
  COALESCE(SUM(c.view_count), 0)               AS total_views,
  (SELECT COUNT(*) FROM replies r
    JOIN celebrations cc ON cc.id = r.celebration_id
    WHERE cc.creator_id = c.creator_id
      AND cc.deleted_at IS NULL)               AS total_replies
FROM celebrations c
WHERE c.deleted_at IS NULL
GROUP BY c.creator_id;

-- Upcoming reminders (next 30 days), computed server-side.
CREATE VIEW upcoming_reminders AS
SELECT
  c.id AS celebration_id,
  c.creator_id,
  c.recipient_name,
  c.occasion,
  c.custom_occasion,
  c.slug,
  make_date(
    EXTRACT(YEAR FROM CURRENT_DATE)::int
      + CASE WHEN (make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int,
                             EXTRACT(MONTH FROM c.occasion_date)::int,
                             EXTRACT(DAY FROM c.occasion_date)::int) < CURRENT_DATE)
             THEN 1 ELSE 0 END,
    EXTRACT(MONTH FROM c.occasion_date)::int,
    EXTRACT(DAY FROM c.occasion_date)::int
  ) AS next_date
FROM celebrations c
WHERE c.occasion_date IS NOT NULL
  AND c.status = 'published'
  AND c.deleted_at IS NULL;
