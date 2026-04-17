# Giftfy — Digital Gift Pages

A web app for creating personalized digital gift pages (birthdays, anniversaries, thank-yous) that can be shared via a link. Built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Firebase, and Razorpay.

## Features

- 🎁 **Multi-step builder** — occasion → content → slide editor → preview/publish
- 💝 **Cinematic experience** — typed quotes, hero, traits cards, photo wall, chat replay, letter, candle blow, gift reveal, thank-you reply
- 💳 **4-tier pricing** — Free / Sweet / Premium / Deluxe (real Razorpay test-mode checkout)
- 🔒 **Tier-based feature gating** — photo limits, expiry, music, video, QR, scheduled reveal, custom slug, password protection
- 📊 **Per-gift insights** — views, time per slide, replies
- 💌 **Unified reply inbox** — all thank-you messages across your gifts, filterable, with unread badges
- 🏆 **Gamification** — Love Points, levels, 10 badges (First Giftfy → Giftfy Legend)
- 🔑 **API keys + MCP server** — generate keys to create gifts programmatically
- 🔐 **Firebase Auth** — Google + email/password

## Tech Stack

- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Framer Motion
- **Backend:** Firebase (Auth · Firestore · Storage · Cloud Functions)
- **Payments:** Razorpay (test mode — no real money)
- **Testing:** Vitest
- **Extras:** MCP server (`mcp-server/`), Cloud Functions (`functions/`)

## Prerequisites

- Node.js 18+ and npm (Bun also works — `bun.lock` is regenerated on install)

**For real mode** (persistent data across devices, real payments):
- A Firebase project (free Spark plan is fine)
- A Razorpay account (free, no card needed for test mode)
- Firebase CLI — only if you want to deploy functions/rules:
  ```bash
  npm install -g firebase-tools
  ```

**For demo mode** (no backend — try the full app on your machine in 1 minute):
- Just Node.js. Skip the Firebase and Razorpay sections entirely.

---

## Quick start (demo mode — no backend)

The fastest way to see the app working. Everything runs on localStorage in your browser — no Firebase, no Razorpay, no accounts to create.

```bash
npm install
echo "VITE_DEMO_MODE=true" > .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), click **Sign Up**, fill any email/name/password, and land on a Dashboard pre-seeded with 4 sample gifts + replies. Everything works — create, publish, view, reply, inbox, Love Points, reminders, tiers, all panels.

**To reset the demo data**, open your browser devtools console on the app and run:
```js
localStorage.clear(); location.reload();
```

### Demo mode limitations

- **Nothing persists across browsers or devices** — it's your localStorage only.
- **Razorpay is skipped** — paid-tier publishes succeed instantly with a fake payment ID.
- **Photos are stored as data URLs** — works but they're large, so 10+ big photos can hit the localStorage 5 MB quota.
- **API Keys panel is hidden** — needs real Firestore.
- **Shareable links (`/c/:slug`) only work on the same browser** — no real server delivering them.

When you're ready for the real thing (persistent, multi-device, real payments), delete `VITE_DEMO_MODE` from `.env.local` and follow the sections below.

---

## Setup (real mode)

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Enable **Authentication** → Sign-in method → turn on **Google** and **Email/Password**
3. Create a **Firestore Database** (start in test mode; production rules are in `firestore.rules`)
4. Enable **Storage**
5. **Project settings → General → Your apps → Web app** → register a web app and copy the config values

### 3. Create a Razorpay account + get test keys

> Razorpay test mode lets the full checkout UI run without ever touching real money. Perfect for demos and college projects.

**Step-by-step:**

1. Go to [razorpay.com](https://razorpay.com) and click **Sign Up** (you only need email + phone — no card, no business info to get test keys)
2. After signing in, you'll land on the Razorpay Dashboard at [dashboard.razorpay.com](https://dashboard.razorpay.com)
3. **Make sure Test Mode is ON.** Look at the top-right corner — there's a toggle. It should say **"Test Mode"** in orange/yellow. If it says "Live Mode", click it and switch to Test.
4. In the left sidebar: **Account & Settings → Website and app settings → API Keys**
   (or go directly to [dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys))
5. Click **Generate Test Key**. A modal shows two values:
   - **Key Id** — starts with `rzp_test_...` (this is safe to expose in the frontend)
   - **Key Secret** — **do not use in the frontend**; only needed for backend/production integration
6. Copy the **Key Id** — you only need this one for the demo

### 4. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Firebase (from step 2)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcd...

# Razorpay (from step 3) — ONLY the Key Id, not the Secret
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> ⚠️ `.env.local` is git-ignored — never commit it. Only `.env.example` (with placeholder values) should land in version control.

If you plan to use the optional MCP server (`mcp-server/`), also set:

```env
GIFTFY_API_URL=https://us-central1-your-project-id.cloudfunctions.net/api/v1
GIFTFY_API_KEY=pk_live_xxxxxxxxxxxxxxxx
```

You generate `GIFTFY_API_KEY` from the in-app **API Keys** panel on the Dashboard.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the landing page. Sign up, create a gift, and try publishing with a paid tier to test the Razorpay flow (next section).

---

## Testing Razorpay payments

Paid tiers trigger Razorpay Checkout at the publish step. In Test Mode, you can use these fake credentials:

### Test cards (any works)

| Type | Number | CVV | Expiry | Result |
|------|--------|-----|--------|--------|
| Success | `4111 1111 1111 1111` | any 3 digits | any future date | ✅ Payment succeeds |
| Success (alt) | `5267 3181 8797 5449` | any 3 digits | any future date | ✅ Payment succeeds |
| Failure | `4000 0000 0000 0002` | any 3 digits | any future date | ❌ Card declined |
| 3D Secure | `4012 0010 3714 1112` | any 3 digits | any future date | 🔐 OTP challenge (use OTP `1234`) |

> Name on card: anything works (e.g., "Test User")

### Test UPI IDs

| UPI ID | Result |
|--------|--------|
| `success@razorpay` | ✅ Payment succeeds |
| `failure@razorpay` | ❌ Payment fails |

### Test wallets / netbanking

Razorpay shows fake wallet and bank options in test mode. Pick any — it simulates the flow and auto-succeeds.

### Verifying a test payment

After a successful test payment:
1. Razorpay shows a success screen in the checkout modal
2. The app creates your gift with the selected tier
3. Check Razorpay Dashboard → **Transactions → Payments** — your test payment appears with status `captured` and a note containing the tier and celebration ID

### Troubleshooting

| Problem | Cause / Fix |
|---------|-------------|
| "Payment not configured" error | `VITE_RAZORPAY_KEY_ID` not set in `.env.local`, or dev server wasn't restarted after editing `.env.local` |
| "Razorpay checkout not loaded" error | Script tag in `index.html` was blocked (ad blocker) or failed to load. Check the network tab for `checkout.razorpay.com/v1/checkout.js` |
| Checkout opens but shows "Oops! Something went wrong" | Your key is a **Live** key (starts `rzp_live_...`) but you don't have a live Razorpay account activated. Switch to Test Mode in the dashboard and regenerate |
| Payment succeeds but tier doesn't save | Firestore rules blocking writes. Check the browser console for permission errors, verify you're signed in |
| Payment modal in Hindi or wrong language | Razorpay auto-detects locale; to force English, edit `src/lib/razorpay.ts` and add `prefill.contact` / `prefill.email` |

### Going to production (not needed for demo)

The current integration is **client-only**, which is fine for Test Mode but **not safe for real money**. For production you must:

1. Generate a **Live Mode** key pair (requires Razorpay KYC: PAN, bank account, business proof)
2. Build a backend endpoint that creates a Razorpay Order using the **Secret Key** server-side (see [docs](https://razorpay.com/docs/payments/server-integration/nodejs/))
3. Pass the returned `order_id` into `Razorpay` checkout options on the client
4. After the `handler` fires, send `razorpay_payment_id` + `razorpay_order_id` + `razorpay_signature` back to your server
5. Server verifies the signature with the Secret Key. Only then mark the gift as paid

The stub in [`src/lib/razorpay.ts`](src/lib/razorpay.ts) has a TODO marking exactly where this would plug in. The existing `functions/` directory already has Cloud Function scaffolding to host the endpoint.

---

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |

## Project Structure

```
.
├── src/                    # React app
│   ├── pages/              # Route components (Dashboard, Builder, Inbox, …)
│   ├── components/         # Feature components (builder, dashboard, landing, experience)
│   ├── hooks/              # Custom hooks
│   ├── contexts/           # React contexts (Auth, Builder)
│   ├── services/           # Firestore + Storage services
│   └── lib/                # tiers, razorpay, gamification, types, utils
├── public/                 # Static assets
├── functions/              # Firebase Cloud Functions (TypeScript)
├── mcp-server/             # Optional MCP server (Model Context Protocol)
├── docs/
│   └── DATA-MODEL.md       # Canonical entity docs (Firestore + SQL mapping)
├── db/
│   ├── README.md           # Setup walkthrough for Postgres / Prisma
│   ├── schema.sql          # Postgres DDL (CREATE TABLE + indexes + views)
│   └── prisma/
│       └── schema.prisma   # Prisma ORM schema
├── firebase.json           # Firebase project config
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Composite indexes required by the app
└── vite.config.ts          # Vite config
```

## Data model & backend

The canonical data model lives in [docs/DATA-MODEL.md](docs/DATA-MODEL.md). The app uses Firestore by default, but the same model is mirrored as a Postgres schema and a Prisma schema so you can port easily. See [db/README.md](db/README.md) for the full walkthrough (raw SQL or Prisma).

## Going to production

Before real money or real users: [docs/PRODUCTION-CHECKLIST.md](docs/PRODUCTION-CHECKLIST.md) — ship-blockers (server-side payment verification, rate limiting, backups), should-haves (monitoring, GDPR, CI/CD), and nice-to-haves in one prioritized list with effort estimates.

## Optional: Cloud Functions & MCP server

Run or deploy the optional pieces separately:

```bash
# Cloud Functions
cd functions && npm install && npm run build

# MCP server
cd mcp-server && npm install && npm run build
```

Deploy functions with `firebase deploy --only functions` (requires Firebase CLI and `firebase login`).

## Deploying the frontend

The frontend is a standard Vite SPA. Any static host works (Firebase Hosting, Vercel, Netlify, GitHub Pages).

Example — Firebase Hosting:

```bash
firebase login
firebase init hosting     # choose "dist" as public dir, SPA = yes
npm run build
firebase deploy --only hosting
```

Remember: any host serving the built app needs the same environment variables set as build-time variables. Most hosts have a UI for this (Vercel: Settings → Environment Variables; Firebase Hosting: inject at build time in CI).

## Pushing to your own GitHub

This project does **not** include a `.git` directory, so you can initialize a fresh repo:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Make sure `.env.local` is **not** committed (it's already in `.gitignore`).

## Notes

- **No API keys or secrets are bundled** with this project. You supply your own via `.env.local`.
- Payments run in Razorpay **Test Mode** — see the Razorpay section above.
- The `.env.local` file and any real credentials are git-ignored.
- Demo mode stores everything in browser localStorage under keys prefixed `giftfy_demo_*`.

## License

Shared as a college project. Use freely for learning and academic purposes.
