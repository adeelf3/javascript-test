# AI usage log

1. **Prompt:** Upgrade Week 1 React Bug Bounty Board to the PDF's typed developer-gear storefront. **Kept:** React Router, beginner-friendly page structure. **Changed:** replaced JS components with TypeScript and a new product model because bugs and products have different contracts.
2. **Prompt:** Implement a deterministic 5,000-product mock contract with errors. **Kept:** typed mock request adapter and deliberate error triggers. **Changed:** order retries use an idempotency key to prevent duplicate orders.
3. **Prompt:** Build checkout, cart, tests and documentation. **Kept:** Redux Toolkit and behavior-oriented tests. **Changed:** persisted mock idempotency across reload and measured production Lighthouse results; kept demo authentication and remote CI limitations explicit.

**AI mistake / risk caught:** an in-process mock may look like an HTTP backend but does not expose actual `/api` HTTP endpoints. README and architecture explicitly describe this limitation. Another earlier gap was claiming the test and performance work existed without executing it; current command logs and Lighthouse JSON provide observed results. **Not delegated to AI:** real partner review comments, the owner's PR submission and the owner's explanation during the walkthrough.
