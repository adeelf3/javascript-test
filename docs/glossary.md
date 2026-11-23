# Architecture glossary

- **Latency:** time from a product search request to results appearing; a 2-second delay is high latency.
- **Idempotency:** sending the same checkout request twice creates one order, not two.
- **Horizontal scaling:** add more API servers to serve more shoppers instead of making one server bigger.
- **CDN:** geographically distributed servers deliver product images faster to shoppers.
- **Cache invalidation:** after checkout reduces stock, mark cached product data stale so the new stock is fetched.
- **Eventual consistency:** after an order is queued, inventory and confirmation emails may update later rather than instantly.
