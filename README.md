# Bitnovacoin — BitNova Crypto Broker Dashboard

BitNova is a multi-page cryptocurrency broker/trading dashboard backed
by **Firebase** (Authentication + Realtime Database). Every balance, trade,
deposit and withdrawal is stored as a value in your Firebase project so it
can persist and sync across devices/browsers.

## Project structure

```
index.html          Landing / login / sign-up page
dashboard.html       Balances, P/L, market snapshot, recent transactions
markets.html         Coin list with Buy/Sell shortcuts
trade.html           Trading panel with canvas price chart
portfolio.html       Holdings, allocation, P/L
transactions.html    Full transaction history with filters
deposit.html         Deposit form
withdraw.html        Withdrawal form
profile.html         Editable profile
settings.html        Theme, currency, notifications, security, logout
admin.html           Admin Panel (requires an admin-provisioned account)
assets/
  styles.css         Shared design system (CSS variables, cards, nav, etc.)
  firebase-config.js Your Firebase Web SDK config
  firebase.js        Firebase init + auth/database helpers (window.BN)
  app.js             Shared coin data, formatting, nav, toast, chart helpers
database.rules.json  Realtime Database security rules
firebase.json         Firebase CLI project config (hosting + database rules)
```

No build tools are required — every page is static HTML/CSS/JS loaded
directly by the browser, with the Firebase SDK pulled in via CDN
`<script>` tags.

## Firebase setup

This repo is already wired to a Firebase project's config in
`assets/firebase-config.js`. To use your **own** Firebase project instead:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Email/Password** and
   **Anonymous** (used for the "Continue with Quick Access Account" button).
3. **Realtime Database** → Create database → start in locked mode.
4. Deploy the included security rules so each signed-in user can only read
   and write their own data:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add            # select your project
   firebase deploy --only database
   ```
   (`database.rules.json` also grants read/write access to any account
   listed under `/admins/{uid}` — see below.)
5. Copy your project's Web SDK config (Project settings → General → Your
   apps → Web app) into `assets/firebase-config.js`.

> **Note:** Firebase Web API keys are not secret. They identify your
> project to Google's servers; actual data access is controlled entirely
> by the security rules in `database.rules.json`, not by hiding this key.

### Granting Admin access

There is no self-service way to become an admin (a real admin role must be
provisioned by the project owner, not granted by the client app). To grant
a signed-up account access to `admin.html`:

1. In the Firebase console, open **Realtime Database**.
2. Find the account's `uid` (Authentication tab lists each user's UID).
3. Add a node: `admins/{uid}` = `true`.

That account can then use "Admin login" on the login page to reach
the Admin Panel.

## Running it locally

Because the app makes `fetch`/SDK calls to Firebase, open it via a local
static server rather than the `file://` protocol:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080/index.html
```

## Features

- **Login / Sign up** — Firebase Authentication (email/password), plus a
  one-click **anonymous quick access account** (starting balance: $25,480.00).
- **Dashboard** — total balance, available balance, today's P/L, deposits,
  withdrawals, portfolio value and recent transactions, updated in real
  time from the Realtime Database.
- **Markets** — BTC, ETH, SOL, BNB, XRP, ADA, DOGE and USDT with live-style
  prices, 24h change, and Buy/Sell actions.
- **Trade** — a trading panel with an interactive canvas price chart
  (1H/1D/1W/1M/1Y timeframes) and order execution that updates your
  Firebase-backed balance, holdings and transaction history.
- **Deposit / Withdraw** — forms with validation and generated
  transaction references/IDs.
- **Transaction history** — filterable by type and status.
- **Portfolio** — holdings, quantities, current value, P/L and an
  allocation breakdown.
- **Profile & Settings** — editable profile, dark/light theme,
  currency preference, notification and security toggles, all persisted
  per-account in the Realtime Database.
- **Notifications** — generated automatically for deposits, withdrawals,
  trades and security events.
- **Admin Panel** — a separate admin login (gated by the
  `admins/{uid}` node above) for viewing all users and transactions,
  adjusting balances, and changing transaction statuses.
- **Responsive layout** — sidebar navigation on desktop, bottom navigation
  bar on mobile.

## Important

This project is a frontend only. It does not contain real passwords, API
keys, private keys, seed phrases or payment credentials beyond the public
Firebase Web config. Before any real money or sensitive user data could be
handled, a legitimate compliance-reviewed backend, KYC/AML process,
market-data API, and payment/withdrawal infrastructure would need to be
connected.
