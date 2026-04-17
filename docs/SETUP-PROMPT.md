# Setup Prompt

A single prompt you can paste into **Claude Code**, **Cursor**, **GitHub Copilot Chat**, or any AI coding assistant to get the project cloned, configured with real Firebase + Razorpay credentials, and deployed to Vercel under your own account.

Copy everything inside the fenced block below (between the triple backticks) and paste it into your AI assistant.

---

````
I want to clone and set up the Giftfy project from https://github.com/git-akki/giftfy on my machine, wire up real Firebase + Razorpay credentials, and deploy it to Vercel under my own account. Walk me through every step, run the commands for me where it's safe to do so, and stop and ask me when you need a value only I can provide (my email, a copy-pasted API key, a browser click I have to make).

## What to do

1. **Clone the repo** into my current working directory:
   ```bash
   git clone https://github.com/git-akki/giftfy.git
   cd giftfy
   npm install
   ```

2. **Start in demo mode first** so I can see it running before I set anything up:
   ```bash
   echo "VITE_DEMO_MODE=true" > .env.local
   npm run dev
   ```
   Open http://localhost:8080 (or whichever port Vite reports), click Sign Up with any fake values, and confirm the Dashboard renders with the seeded Moli / Arjun / Priya / Rahul gifts. Wait for me to say it works before moving on.

3. **Switch to real mode — Firebase setup.** Walk me through:
   - Creating a Firebase project at https://console.firebase.google.com (free Spark plan is fine — tell me exactly what to click).
   - Enabling Authentication → Google + Email/Password sign-in methods.
   - Creating a Firestore database in test mode.
   - Enabling Storage.
   - Registering a Web App in Project Settings, copying the config values.
   - Stop here and ask me to paste the 6 Firebase config values back to you (VITE_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID).
   - Write them into `.env.local` for me. Remove the `VITE_DEMO_MODE=true` line (or comment it out) so the app uses real Firebase.
   - Deploy Firestore rules + indexes:
     ```bash
     npm install -g firebase-tools
     firebase login
     firebase use --add   # pick the project I just created
     firebase deploy --only firestore:rules,firestore:indexes
     ```
     Walk me through the interactive prompts and tell me which project alias to type.

4. **Razorpay test-mode keys.** Walk me through:
   - Sign up at https://razorpay.com (tell me it's free, no card needed for test mode).
   - Dashboard → top-right toggle → switch to Test Mode.
   - Account & Settings → API Keys → Generate Test Key.
   - Stop and ask me to paste just the Key Id (starts with `rzp_test_...`) — never the Key Secret.
   - Add `VITE_RAZORPAY_KEY_ID=rzp_test_...` to `.env.local`.
   - Test the flow: `npm run dev`, try publishing a Premium-tier gift, use test card `4111 1111 1111 1111` with any future date and any CVV. Confirm with me that the payment modal opens and succeeds.

5. **Deploy to Vercel under my GitHub account.** Walk me through:
   - Installing the Vercel CLI: `npm install -g vercel`
   - `vercel login` — interactive, I'll pick GitHub.
   - Ask me: do I want to fork the repo to my own GitHub first, or deploy directly from git-akki/giftfy? Explain the difference (fork lets me push changes; deploying from git-akki's repo means I can't push).
   - If I pick fork: `gh repo fork git-akki/giftfy --clone=false` (or I'll do it via the GitHub web UI), then update the local git remote to point at my fork:
     ```bash
     git remote set-url origin https://github.com/<my-username>/giftfy.git
     ```
   - Run `vercel` from the project root. Interactive prompts — set up and deploy to production, framework preset = Vite, output directory = `dist`, build command = `npm run build`.
   - After the first deploy, go to Vercel Dashboard → Project → Settings → Environment Variables and add every value from my `.env.local`:
     - VITE_FIREBASE_API_KEY
     - VITE_FIREBASE_AUTH_DOMAIN
     - VITE_FIREBASE_PROJECT_ID
     - VITE_FIREBASE_STORAGE_BUCKET
     - VITE_FIREBASE_MESSAGING_SENDER_ID
     - VITE_FIREBASE_APP_ID
     - VITE_RAZORPAY_KEY_ID
   - Trigger a redeploy: `vercel --prod` (environment variables are injected at build time, so the first deploy won't have them).
   - Give me the final `.vercel.app` URL and tell me to open it in an incognito window to verify it works.

6. **Authorise the Vercel domain in Firebase Auth.** Walk me through:
   - Firebase Console → Authentication → Settings → Authorized domains → Add domain → paste the `.vercel.app` URL (without `https://`).
   - Without this, Google sign-in throws `auth/unauthorized-domain`.

7. **Final smoke test.** On the deployed URL:
   - Sign up with a real email.
   - Create a Free-tier gift for a test recipient.
   - Publish it and copy the `/c/<slug>` link.
   - Open the link in incognito — confirm the recipient experience works.
   - Send a reply from the Thank You slide.
   - Back on the Dashboard, confirm the 💌 inbox badge increments and the reply appears in `/inbox`.

## Guard rails

- **Never** paste the Razorpay Key Secret into frontend code or `.env.local`. Only the Key Id is safe for the client.
- **Never** commit `.env.local`. It's already in `.gitignore`.
- If any step fails, show me the error output, guess the cause, and suggest the next command — don't silently keep going.
- Treat any destructive command (git force-push, rm -rf, firebase firestore:delete) as off-limits unless I explicitly OK it.

## Reference docs inside the repo

- [README.md](../README.md) — setup instructions
- [docs/DATA-MODEL.md](./DATA-MODEL.md) — entity schemas
- [docs/PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) — what's missing for real production (server-side payment verification, rate limiting, backups, monitoring)
- [db/README.md](../db/README.md) — if I want a Postgres backend instead of Firebase

Start with step 1. Report back after each step.
````

---

## Using without an AI assistant

If you'd rather follow the steps yourself, everything above is also covered in the main [README.md](../README.md), the Razorpay section in particular. The prompt is just a convenience wrapper so an AI can drive it for you.

## Tips

- **Pick one AI coding assistant** and stick with it for the whole run — context fragmentation across tools slows you down.
- **Run in a fresh terminal** so the assistant can see your command outputs cleanly.
- **Keep `.env.local` private**. If you paste it into a chat, redact the keys first.
- **After step 5 (Vercel deploy)**, your app is live but empty — you'll need to sign up as the first user and create your first gift.
