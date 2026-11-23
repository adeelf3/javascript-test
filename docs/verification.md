# Verification report — 23 November 2026

The nine-page The Bug Bazaar PDF is the acceptance source. The handover Markdown supplied context and a checklist; its instructions to a future agent are document content, not the user's request. The PDF permits the in-process mock API used here.

## Executed evidence

- `npm run typecheck`, `npm run lint`, and `npm run build`: all exit 0. Build uses Vite 5.4.21. Rollup emitted only third-party Zod comment warnings.
- Clean `npm ci`: exit 0 in an isolated temp folder using this lockfile. The running dev server locked esbuild in the live Windows workspace.
- `npm test`: three separate full runs, each **5 files, 39 tests passed**: [run 1](evidence/test-run-1.txt), [run 2](evidence/test-run-2.txt), [run 3](evidence/test-run-3.txt).
- Manual browser at `http://localhost:5173/login`: invalid login displayed inline and announced errors; demo login reached Account. A shared `/?search=Debug&category=ducks` URL restored both filters and displayed 313 matching products.
- Production Lighthouse accessibility: home, cart and login each **100**. Home performance improved **87 → 97**; [method and reports](performance.md).
- Local Git remote points to the original GitHub repository. Before the submission push, local HEAD and remote main were both `deb30b7`; the submission branch and CI status must be checked on GitHub.

## PDF acceptance checklist

Status means local evidence, not an evaluator score. Partial means evidence or a subcriterion remains.

### Day 1

- **D1-1 Pass locally:** README scripts, ESLint and clean install. An independent teammate clone under five minutes was not observed.
- **D1-2 Pass for permitted mock:** typed contract, six logical endpoints, 5,000 products, triggerable 400/401/404/409/500. Calls return status/body in process, not network HTTP. See [API contract](api-contract.md).
- **D1-3 Pass:** strict TypeScript, typed contract/statuses, typecheck.
- **D1-4 Pass:** `src/data/client.ts` centralizes requests.

### Day 2

- **D2-1 Pass:** accessible catalog/detail, keyboard controls, stock and cents display.
- **D2-2 Pass:** search, category, stock, sort, count, clear, URL refresh/share/Back; browser and integration tests.
- **D2-3 Pass:** list/detail loading, empty, success, 404 and retryable 500. `?forceError=500` triggers a 500.
- **D2-4 Pass:** abort/cleanup and Back to Top; hook/integration tests.
- **D2-5 Pass:** three typed reusable hooks: debounce, local storage and Back to Top.
- **D2-6 Pass:** delayed out-of-order search test shows latest result wins.

### Day 3

- **D3-1 Pass:** Redux Toolkit cart/session with count/total selectors.
- **D3-2 Pass for demo:** stock bounds, persistent cart, checkout/confirmation, named 409, client retry key and persisted mock order/stock/idempotency state. Reload test proves one order and one stock decrement. Persistence is browser-local.
- **D3-3 Pass for demo:** protected routes, return destination, double-submit guard and centralized 401 sign-out. See [auth](auth.md).
- **D3-4 Pass:** field-level 400, 401 logout, 404, named 409, 500 retry and safe copy.
- **D3-5 Pass:** TanStack Query 30-second stale window and post-order invalidation.

### Day 4

- **D4-1 Pass on measured routes:** production mobile Lighthouse accessibility 100 on home/cart/login; alert roles announce form errors. No manual screen-reader audit.
- **D4-2 Partial:** self-hosted fonts and smaller WebP cards improved home metrics; one baseline and one after audit measure the combined effect. The PDF asks for before/after measurements for each fix, and separate per-fix timing was not captured. See [performance](performance.md).
- **D4-3 Pass:** 24 cards per page from 5,000 seeded products; virtualization skipped with rationale in [performance](performance.md).
- **D4-4 Pass for simulated feed:** polling changes stock, retries a simulated interruption every fifth read with backoff, and cleans its timer. Real network transport/reconnect was not tested.
- **D4-5 Pass:** 39 behavioral tests cover cart, hooks, auth, filters, checkout and 409, passed three times.
- **D4-6 Partial:** local workflow defines npm ci/lint/typecheck/test/build; no observed remote CI, branch protection or merge blocking.
- **D4-7 Partial:** Error Boundary fallback and console logging; three monitoring events documented. No remote telemetry.

### Day 5

- **D5-1 Pass:** [architecture and data-flow diagram](ARCHITECTURE.md).
- **D5-2 Pass:** three patterns with source locations in architecture document.
- **D5-3 Pass as design exercise:** [queue/payment/inventory/email and idempotency](orders.md); no deployed queue claimed.
- **D5-4 Pass:** [six-term glossary](glossary.md) with store examples.
- **D5-5 Pending:** user confirmed no partner assigned; no partner architecture to review.
- **D5-6 Pending:** no partner PR or review comments. [Template](peer-review-template.md) is not a review.
- **D5-7 Pass as written record:** [AI use log](ai-notes.md).
- **D5-8 Partial:** [reflection](reflection.md) has provisional ratings; owner must validate in walkthrough.
- **D5-9 Pending at verification:** no per-task commit series or observed ten-minute walkthrough. Existing first-commit history is preserved; PR and remote CI status must be checked on GitHub.

## Outstanding external work

Assign a partner for D5-5/D5-6; review real partner artifacts and reply on the project's PR. Verify remote CI, configure required checks and perform the walkthrough. The full PDF cannot yet be marked complete.
