# Performance evidence — 23 November 2026

Lighthouse 12.8.2 ran in headless Chrome against the production Vite preview at `http://127.0.0.1:4173`, with mobile defaults. Each result is one audit, so scores can vary. The older `lighthouse-home.json` used the Vite development server and is excluded from this comparison.

| Production route | Performance | Accessibility | FCP | LCP |
|---|---:|---:|---:|---:|
| Home baseline | 87 | 100 | 3044 ms | 3044 ms |
| Home after fixes | 97 | 100 | 1979 ms | 2176 ms |
| Cart, empty | 97 | 100 | 1964 ms | 2146 ms |
| Login | 97 | 100 | 1965 ms | 2152 ms |

The two largest baseline opportunities were render-blocking font loading (estimated **1632 ms** savings) and oversized product images (**414,455 wasted bytes**). We self-hosted WOFF2 fonts and used smaller local WebP images for cards, retaining larger detail images. The after audit estimated **600 ms** render-blocking savings and **143,823 wasted image bytes**. These are Lighthouse opportunity estimates, not isolated A/B experiments. Both fixes together raised home performance 87→97 and reduced LCP 3044→2176 ms.

The catalog seeds 5,000 products but renders only 24 per page; filtering is debounced by 300 ms and query data cached for 30 seconds. Virtualization was considered and skipped because a page contains at most 24 cards. Filter/race behavior is tested, but a separate interaction-latency profile was not recorded.

Reports: [baseline](evidence/lighthouse-production-home-baseline.json), [after](evidence/lighthouse-production-home-after.json), [cart](evidence/lighthouse-production-cart.json), [login](evidence/lighthouse-production-login.json).
