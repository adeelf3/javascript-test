# Shared API contract

Prices are integer **cents**. `Product` has `id`, `name`, `price`, `category` (`keyboards | ducks | coffee | stickers`), `stock`, `rating`, `imageUrl`. Errors use `{error:{code,message,details?}}`.

| Method | Endpoint | Success | Errors |
|---|---|---|---|
| GET | `/api/products?search=&category=&sort=&page=` | 200 `{items:Product[],total:number}` | 500 |
| GET | `/api/products/:id` | 200 `Product` | 404 |
| POST | `/api/login` | 200 `{token,user}` | 400,401 |
| GET | `/api/me` | 200 `user` | 401 |
| POST | `/api/orders` | 201 `{id,status:'queued'}` | 400,401,409 |
| GET | `/api/orders/:id` | 200 `{id,status}` | 401,404 |

For stock-only filtering, the mock also accepts `inStock=true`. `X-Force-Error:500` and `?forceError=500` simulate 500; `X-Mock-Delay` or `?delay=...` simulate latency. Orders use `Idempotency-Key` to deduplicate retries. Data is deterministic and held in browser memory.
