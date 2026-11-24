# The Bug Bazaar

React + TypeScript developer-gear storefront, upgraded from Week 1 Bug Bounty Board. **Use the original GitHub repository; do not create a new one.**

## Quick start

Requires Node.js 20+ and npm.

```bash
npm ci
npm run dev
```

Open the local URL Vite prints (usually http://localhost:5173).

## Scripts

- `npm run dev` — local development
- `npm run build` — strict TypeScript check and production build
- `npm run typecheck` — type checking
- `npm run lint` — ESLint
- `npm test` — Vitest suite
- `npm run preview` — preview production build

## Demo account

Email: `demo@bugbazaar.dev`  Password: `demo123`

## Architecture

- `src/data/` — 5,000 deterministic products, API mock and typed client
- `src/App.tsx` — routes and UI (catalog, detail, cart, account, checkout)
- `src/store.ts` — Redux cart/session
- `src/hooks.ts` — reusable hooks
- `src/test/` — automated behavior tests
- `docs/` — API, decisions, architecture, testing, performance, security, review notes

## Environment variables

No environment variables required: this project uses an in-process mock API, not a real payment processor or backend. The mock server is not production-grade authentication or persistence.

The deployed [Mock API explorer](https://adeelf3.github.io/javascript-test/mock-api) presents the read-only [products JSON](https://adeelf3.github.io/javascript-test/api/products.json), [categories JSON](https://adeelf3.github.io/javascript-test/api/categories.json), and [API index](https://adeelf3.github.io/javascript-test/api/index.json). These are shareable data links; interactive login and order requests still run in the browser mock adapter.

## Mock error testing

- `GET /api/products?forceError=500` — server error
- `GET /api/products/not-found` — 404
- `POST /api/login` with missing or incorrect credentials — 400/401
- `GET /api/me` without token — 401
- `POST /api/orders` without token — 401
- `POST /api/orders` with unavailable product `gear-1` — 409
- `POST /api/orders` without valid items — 400
- `GET /api/orders/unknown` with token — 404
- Query parameter `delay=2000` simulates slow responses.

**Note:** The mock API runs in the browser through a typed request adapter, not an HTTP server; `/api/...` routes are logical contract paths, not independently accessible browser endpoints. This is a deliberate demo trade-off and does not fulfill real HTTP integration tests.

## Submission

The Week 1 repository and its original commit are present. The upgrade was pushed to [PR #1](https://github.com/adeelf3/javascript-test/pull/1); [remote CI passed](https://github.com/adeelf3/javascript-test/actions/runs/45216088458), and an [active main ruleset](https://github.com/adeelf3/javascript-test/settings/rules/27917274) requires PRs and the `checks` status. The owner-led ten-minute walkthrough remains to be done. Do not commit `node_modules` or `dist`.

## Verification

The lockfile supports `npm ci`; typecheck, lint, build, and the current 46-test suite pass. Earlier three-run evidence is in [verification](docs/verification.md), with [performance evidence](docs/performance.md). Checkout/order/idempotency state persists in browser localStorage for this demo; the checkout retry key is stored in sessionStorage until success.

Partner reviews and the walkthrough remain pending. See the verification report for the exact scope and evidence gaps.
