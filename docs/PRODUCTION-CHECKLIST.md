# Production Checklist

What the sharable codebase already handles, and what you need to add before putting Giftfy in front of real users or real money. Tasks are grouped by severity — ship-blockers first.

## What's already covered

- ✅ **Auth** — Firebase Auth (Google + email/password); `profiles` doc auto-created on first sign-in
- ✅ **Firestore rules** — scoped reads/writes, shape validation for `replies` and `payments`
- ✅ **Password hashing** — celebration passwords stored as PBKDF2-SHA256 (100k iters, 16-byte salt)
- ✅ **Soft-delete** — `celebrations.deletedAt`; reads filter it out
- ✅ **Payments audit** — immutable `payments` collection; deterministic doc IDs prevent duplicates
- ✅ **Tier gating** — feature limits enforced client-side; celebration `tier` + `expiresAt` written server-side
- ✅ **Composite indexes** — every Firestore query has an explicit index entry
- ✅ **Data-model docs** — `docs/DATA-MODEL.md` is the single source of truth, mirrored by SQL + Prisma

---

## Ship-blockers (fix before real money / real users)

### 1. Server-side Razorpay order creation + signature verification

**Current:** Razorpay checkout runs entirely client-side. A user can open devtools, skip `initiatePayment`, and still publish a paid tier because the frontend trusts the tier state.

**Fix:**
1. Add a Cloud Function endpoint `POST /payments/create-order` that calls Razorpay REST API with your **Key Secret** (never ship the secret to the client).
2. On checkout success, send `razorpay_payment_id + razorpay_order_id + razorpay_signature` to `POST /payments/verify` which checks the signature with the Secret.
3. Only after verification: mark the celebration as paid + `status=published` server-side. The client should not be allowed to set `tier=premium` on a celebration.
4. Update Firestore rules: `tier` may only be written by a signed-admin/cloud-function identity, not by the owner. Alternatively, move the whole publish flow into a Cloud Function.

**Effort:** ~1 day. Razorpay's Node SDK makes the signature check a 3-line operation.

### 2. Rate limiting on reply submissions

**Current:** `/celebrations/{id}/replies/create` is open to anyone (recipients are anonymous by design). A bot can spam the creator's inbox without bound.

**Fix (pick one):**
- **Easy:** Cloud Function wrapping `addDoc`. Use Firestore counters keyed by viewer IP (from `X-Forwarded-For`) + hour bucket. Reject after N replies per hour.
- **Better:** App Check (Firebase's attestation). Drops 99% of bot traffic without you writing code.
- **Best:** Both — App Check + an IP-bucket counter for verified clients.

**Effort:** App Check is ~2 hours (one SDK init + Firestore rule gate). Cloud Function rate limit ~4 hours.

### 3. Row-level security if you move to Postgres

**Current:** The SQL schema has no RLS. Firestore rules enforce per-user access but that logic does not exist in the Postgres port.

**Fix (Supabase-style RLS sample):**

```sql
ALTER TABLE celebrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read own" ON celebrations
  FOR SELECT USING (auth.uid() = creator_id OR status = 'published');

CREATE POLICY "owner can mutate own" ON celebrations
  FOR ALL USING (auth.uid() = creator_id);
```

Mirror this for `slides`, `replies`, `view_events`, `api_keys`, `payments`. See [db/README.md](../db/README.md) for the porting outline.

**Effort:** ~2 hours.

### 4. Backups

**Current:** Firestore auto-backups only on the paid Blaze plan; the free Spark plan has no automatic backups. Postgres setups have no backup configured.

**Fix:**
- **Firebase Spark:** manually export to GCS weekly with `gcloud firestore export gs://your-bucket/$(date +%Y%m%d)`. Automate with a Cloud Scheduler job.
- **Firebase Blaze:** enable PITR (Point-in-Time Recovery) — 7-day retention, one-click.
- **Postgres:** `pg_dump` in a daily cron to S3/R2/Backblaze. Script at `scripts/backup.sh` (not yet in repo). Test the restore path at least once.

**Effort:** ~1 hour.

---

## Should-have (fix within the first month)

### 5. Error + performance monitoring

**Pick one:** Sentry (free tier handles ~5k errors/month), Logtail, or Cloudflare-native if you're there.

- Wire `@sentry/react` at `src/main.tsx`. Auto-captures unhandled promise rejections and React error boundaries.
- Instrument the publish flow and payment flow specifically — they're the critical paths.
- Create alerts for: 5xx from Cloud Functions, Razorpay `payment.failed` webhooks, Firestore permission errors above 1/min.

**Effort:** ~2 hours.

### 6. Uptime + health checks

- Frontend: plug deployed URL into [UptimeRobot](https://uptimerobot.com) (free for 50 monitors, 5-min interval). Alert on 3-consecutive failures.
- Cloud Functions health endpoint: `functions/src/routes/health.ts` returning `{ status: 'ok', firestore: boolean, razorpay: boolean }`. Ping it from UptimeRobot.

**Effort:** ~30 min.

### 7. GDPR / data export + deletion

- "Export my data" button in dashboard → calls a Cloud Function that aggregates every celebration + slide + reply + payment row for the user and returns a JSON/ZIP download.
- "Delete my account" button → soft-deletes the profile row, schedules a hard-delete of all child records after 30 days, revokes all Firebase Auth sessions.

**Effort:** ~1 day.

### 8. Razorpay webhooks for async events

**Current:** Only the success handler fires. Refunds, disputes, failed-after-success events are invisible.

**Fix:**
- Register a webhook at `https://dashboard.razorpay.com/app/webhooks` pointing at `POST /webhooks/razorpay` on your Cloud Functions.
- Verify the signature (header `X-Razorpay-Signature` against `webhook_secret`).
- On `payment.refunded`: update `payments.status = 'refunded'`, clear the tier on the celebration (downgrade to free).
- On `payment.failed`: log + alert; this shouldn't happen after `captured` but is possible via chargeback.

**Effort:** ~4 hours.

### 9. CI/CD

- GitHub Actions workflow at `.github/workflows/ci.yml`: install → `npm run lint` → `npm test` → `npm run build`. Fail the PR on any red.
- Branch protection on `main`: require green CI + 1 approval before merge.
- Auto-deploy `main` to staging (Firebase Hosting preview channel or Vercel preview). Manual promote to production.

**Effort:** ~2 hours for CI, ~2 hours for the deploy pipeline.

### 10. Structured logging

Replace `console.log` / `console.error` scattered across the codebase with a tiny logger that JSON-formats and tags entries with `userId`, `celebrationId`, and a correlation ID. Easier to grep in Cloud Logging / Datadog.

**Effort:** ~3 hours (the tedious part is touching every `console.*` call site).

---

## Nice-to-haves

### 11. Audit log table

A generic `audit_events` table capturing: who, what action, what target, when, metadata. Powers "who deleted this?" and compliance reports. Add if you get a compliance ask or an incident.

### 12. Feature flags

LaunchDarkly, GrowthBook (self-hosted), or a 20-line in-house `feature_flags` table. Useful for gradual rollouts of premium features.

### 13. A11y pass

The experience side uses custom interaction patterns (swipe, shake, tilt). Run an axe scan, add ARIA labels to slide navigation, support keyboard-only navigation through slides, confirm screen-reader pronounces the recipient name correctly.

### 14. Internationalization

Strings are hardcoded in English. Wrap them in an i18n layer (react-i18next or FormatJS) if you target non-English markets. Hindi/Hinglish support was in the planning docs.

### 15. Performance budget

Current bundle: **~1.15 MB** (pre-gzip), 322 KB gzipped. Vite warns at 500 KB. Code-split Dashboard/Builder into lazy chunks. Target < 200 KB gzipped for the initial landing-page bundle.

### 16. Incident runbooks

Short `.md` files per incident type: "Razorpay payments failing", "Firestore over quota", "Cloud Function deploy broken". Each has: detection, blast radius, fix, post-mortem template. Lives in `docs/runbooks/`.

---

## Pre-launch smoke test

A 10-minute manual pass before each release:

- [ ] Sign up with a fresh email, create a free gift, publish, open the `/c/:slug` link in an incognito window.
- [ ] Upgrade to Premium via Razorpay test card `4111 1111 1111 1111`. Check a payment row exists in the `payments` collection matching the Razorpay dashboard entry.
- [ ] Password-protect a gift, try 2 wrong passwords + 1 correct. Confirm the hashed value in Firestore is `pbkdf2$100000$...`.
- [ ] Delete a gift from the dashboard. Confirm it disappears from the list but `deletedAt` is set in the DB.
- [ ] Recipient sends a thank-you reply; creator sees the unread badge on Dashboard, then the message in `/inbox`.
- [ ] Break something intentionally (unplug the network mid-publish). Confirm the cancel cleanup leaves no orphaned storage blobs.
- [ ] View the Lighthouse audit on the landing page; must score ≥90 on Performance + Accessibility.

## Owner per area

Empty on purpose — fill in before go-live so on-call paging has a clear target.

| Area | Primary owner | Backup |
|------|---------------|--------|
| Payments + Razorpay | | |
| Firebase Auth + Firestore | | |
| Frontend / Vite build | | |
| Infrastructure / CI / backups | | |
| Security / incident response | | |
