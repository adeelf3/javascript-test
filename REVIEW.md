# Requirement review

Reviewed: 23 November 2026

| Original requirement | Evidence | Result |
| --- | --- | --- |
| fetchBugs on mount, loading and error | App useEffect; DOM tests observed loading, 3 cards on success and server error on failure | Pass |
| BugList and BugCard with stable keys | BugList maps BugCard using key={bug.id}; DOM test counted 3 initial cards | Pass |
| Search title through a derived value | filteredBugs uses filter, not useState; CHECKOUT matched one card and xyz produced empty message | Pass |
| Controlled form, blank validation, immutable add | Controlled title/severity; spaces-only submission rejected; valid submission produced fourth card; spread returns new array | Pass |
| /bugs/:id details | useParams and find; /bugs/4 displayed newly added title and High severity | Pass |
| Unknown URL route | /unknown displayed Page not found; /bugs/999 displayed Bug not found | Pass |
| Retry bonus | Forced failure then successful Retry produced 3 cards | Pass |
| Readable code and walkthrough | Components in separate files; SAMJHO.md explains state, props, routes and memory-only trade-off | Provided; oral explanation still belongs to learner |
| mockApi unchanged | Byte-for-byte comparison with previous project ZIP | Pass |
| Production build | npm run build: 39 modules transformed, exit code 0 | Pass |
| Private repo, commits, push to main and evaluator access | No remote repo or evaluator identity supplied; no push/access performed | Pending |
| Evaluation form and 3-minute walkthrough | Not performed | Pending |
| No AI tools rule | This is AI-assisted work | Not satisfied for the original assessment |

## Fixed during this review

StrictMode can start two mount requests. A stale failed request could leave
an error after the latest request succeeded. App now numbers requests using
useRef and ignores results from older requests. Effect cleanup invalidates
pending requests. A StrictMode test with first failure and second success
confirmed that 3 cards appear with no stale error.

The submit handler also rejects programmatic submits while loading/error,
matching the disabled button behavior.

## Verification scope

Functional checks ran in React with a JSDOM document, including input events,
form submissions and router navigation. Production build passed. A graphical
browser could not launch in this environment, so visual/browser QA is not
claimed. Review code and run npm run dev for manual inspection.

mockApi SHA256:
1129e6f3a79894cb9063c5b514343733ae6073ce153496a8e3139a6c9960e90a

## Known trade-off

New bugs are in memory and reset on reload. Persistence was not required.
The assignment's historical time limit and commit-as-you-go requirement
cannot be reconstructed by this review.
