import { ArrowUpRight, Braces, Database, Download, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const base = import.meta.env.BASE_URL;
const resources = [
  { name: 'Products', path: 'api/products.json', description: 'The complete catalog of 5,000 products.', count: '5,000 records' },
  { name: 'Categories', path: 'api/categories.json', description: 'The four product categories.', count: '4 categories' },
  { name: 'API index', path: 'api/index.json', description: 'A small directory of public data links.', count: 'Endpoint guide' },
];

const mockRoutes = [
  { method: 'GET', path: '/api/products', purpose: 'Search, filter, and sort products' },
  { method: 'GET', path: '/api/products/:id', purpose: 'Product details' },
  { method: 'POST', path: '/api/login', purpose: 'Demo sign in' },
  { method: 'GET', path: '/api/me', purpose: 'Current account' },
  { method: 'POST', path: '/api/orders', purpose: 'Place a demo order' },
  { method: 'GET', path: '/api/orders/:id', purpose: 'Order status' },
];

export default function ApiExplorer() {
  return (
    <main className="api-page">
      <section className="api-hero">
        <div className="container api-hero-inner">
          <div>
            <span className="eyebrow">THE BUG BAZAAR / DEVELOPER DESK</span>
            <h1>Mock API, <em>made clear.</em></h1>
            <p>Explore the public catalog data and the demo store's request contract in one place.</p>
            <a className="button hero-cta" href="#api-data-title">
              Explore endpoints <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="api-hero-art" aria-hidden="true">
            <span className="api-art-label">PUBLIC DATA / 001</span>
            <Braces size={96} strokeWidth={1.2} />
            <span className="api-art-footer">5,000 PRODUCTS <span>↗</span></span>
          </div>
        </div>
      </section>

      <section className="container api-content" aria-labelledby="api-data-title">
        <div className="api-section-heading">
          <div><span className="eyebrow">01 / READY TO USE</span><h2 id="api-data-title">Public data</h2></div>
          <p>Read-only JSON snapshots that you can open or fetch directly.</p>
        </div>
        <div className="api-resource-grid">
          {resources.map(resource => (
            <a className="api-resource" href={`${base}${resource.path}`} target="_blank" rel="noreferrer" key={resource.path}>
              <span className="api-resource-icon"><Database size={20} aria-hidden="true" /></span>
              <span className="api-resource-count">{resource.count}</span>
              <strong>{resource.name}</strong>
              <span className="api-resource-description">{resource.description}</span>
              <code>/{resource.path}</code>
              <ArrowUpRight className="api-resource-arrow" size={20} aria-hidden="true" />
            </a>
          ))}
        </div>

        <div className="api-demo-grid">
          <div className="api-example">
            <div className="api-example-head"><span><span className="api-live-dot" /> EXAMPLE RESPONSE</span><a href={`${base}api/products.json`} target="_blank" rel="noreferrer">View full JSON <ArrowUpRight size={14} /></a></div>
            <pre><code>{`GET /api/products.json\n\n{\n  "total": 5000,\n  "items": [\n    {\n      "id": "gear-1",\n      "name": "Mechanical Keyboard 1",\n      "category": "keyboards",\n      "price": 799,\n      "stock": 0,\n      "rating": 3.5\n    },\n    ...\n  ]\n}`}</code></pre>
          </div>
          <div className="api-note">
            <span className="api-note-icon"><Download size={22} aria-hidden="true" /></span>
            <span className="eyebrow">BUILT FOR SHARING</span>
            <h3>Real links. Simple data.</h3>
            <p>Use these URLs in a browser, fetch request, or API client. Product prices are stored in cents.</p>
            <div className="api-note-divider" />
            <ShieldCheck size={22} aria-hidden="true" />
            <p>The published files are static snapshots. Login, filtering, stock updates, and orders run in the storefront's browser mock.</p>
          </div>
        </div>

        <div className="api-section-heading api-contract-heading">
          <div><span className="eyebrow">02 / STORE CONTRACT</span><h2>In-app mock routes</h2></div>
          <p>These paths describe the demo adapter used by the shop; they are not public HTTP endpoints.</p>
        </div>
        <div className="api-route-list">
          {mockRoutes.map(route => (
            <div className="api-route" key={`${route.method}-${route.path}`}>
              <span className={`api-method ${route.method === 'POST' ? 'api-method-post' : ''}`}>{route.method}</span>
              <code>{route.path}</code>
              <span>{route.purpose}</span>
            </div>
          ))}
        </div>
        <div className="api-bottom-link"><Link to="/">← Back to the shop</Link></div>
      </section>
    </main>
  );
}
