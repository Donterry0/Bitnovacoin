# Bitnovacoin — BitNova Demo Crypto Broker Dashboard

BitNova is a single-file, front-end-only demo cryptocurrency broker/trading
dashboard. Everything — HTML, CSS and JavaScript — lives in `index.html`.
There is no backend, database, or real market-data/payment integration:
all balances, prices, trades, deposits and withdrawals are **simulated**
and persisted only in your browser's `localStorage`.

## Running it

No build step or server is required. Just open `index.html` directly in a
web browser (double-click it, or run a simple static server if you prefer):

```bash
python3 -m http.server 8080
# then visit http://localhost:8080/index.html
```

## Features

- **Login / Sign up** — demo authentication stored in `localStorage`, plus
  a one-click "Continue with Demo Account" option (starting demo balance:
  $25,480.00).
- **Dashboard** — total balance, available balance, today's P/L, deposits,
  withdrawals, portfolio value and recent transactions.
- **Markets** — BTC, ETH, SOL, BNB, XRP, ADA, DOGE and USDT with demo
  prices, 24h change, and Buy/Sell actions.
- **Trade** — a demo trading panel with an interactive canvas price chart
  (1H/1D/1W/1M/1Y timeframes), order summary, and simulated order
  execution.
- **Deposit / Withdraw** — demo-only forms with validation, generated
  transaction references/IDs, and clear "no real funds are transferred"
  notices.
- **Transaction history** — filterable by type and status.
- **Portfolio** — holdings, quantities, current value, P/L and an
  allocation breakdown.
- **Profile & Settings** — editable demo profile, dark/light theme,
  currency preference, notification and security toggles, all persisted
  in `localStorage`.
- **Notifications** — generated automatically for deposits, withdrawals,
  trades and security events.
- **Demo Admin Panel** — a separate admin/demo login for viewing demo
  users and transactions, adjusting demo balances, and changing demo
  transaction statuses. No real financial administration is performed.
- **Responsive layout** — sidebar navigation on desktop, bottom navigation
  bar on mobile.

## Important

This project is a **frontend demo only**. It does not contain real
passwords, API keys, private keys, seed phrases or payment credentials,
and it never performs real transfers of funds or cryptocurrency. Before
any real money or user data could be handled, a legitimate backend,
authentication system, database, market-data API and compliant
payment/withdrawal infrastructure would need to be connected.
