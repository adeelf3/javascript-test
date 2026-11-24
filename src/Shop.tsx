import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, readableError } from './data/client';
import { cardImages } from './data/products';
import { useDebounce } from './hooks';
import { actions } from './store';
import type { Category, Product, ProductFilters } from './types';

const money = (cents: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(cents / 100);

const categories: { id: Category; label: string; note: string }[] = [
  { id: 'keyboards', label: 'Keyboards', note: 'Make every keystroke count' },
  { id: 'ducks', label: 'Desk companions', note: 'Talk through the tricky bits' },
  { id: 'coffee', label: 'Coffee', note: 'Fuel for the next commit' },
  { id: 'stickers', label: 'Stickers', note: 'A little personality for your setup' },
];

function validPage(raw: string | null) {
  const page = Number(raw ?? 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();

  return (
    <article className="product-card">
      <Link className="product-image" to={`/products/${product.id}`}>
        <img loading="lazy" src={cardImages[product.category]} alt={product.name} />
        {product.stock === 0 && <span className="sold-out">Sold out</span>}
      </Link>
      <div className="product-info">
        <span className="eyebrow">{product.category}</span>
        <Link className="product-title" to={`/products/${product.id}`}>
          {product.name}
        </Link>
        <div className="product-meta">
          <strong>{money(product.price)}</strong>
          <span aria-label={`Rated ${product.rating} out of 5`}>★ {product.rating.toFixed(1)}</span>
        </div>
        <div className="product-bottom">
          <small>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</small>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => dispatch(actions.add(product))}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} aria-hidden="true" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const filters: ProductFilters = useMemo(() => ({
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    priceBand: params.get('priceBand') ?? '',
    minRating: Number(params.get('minRating') ?? 0) || 0,
    sort: params.get('sort') ?? '',
    page: validPage(params.get('page')),
    inStock: params.get('inStock') === 'true',
  }), [params]);
  const [input, setInput] = useState(filters.search);
  const debounced = useDebounce(input, 300);

  useEffect(() => setInput(filters.search), [filters.search]);
  useEffect(() => {
    if (debounced === filters.search) return;
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (debounced) next.set('search', debounced);
      else next.delete('search');
      next.delete('page');
      return next;
    }, { replace: true });
  }, [debounced, filters.search, setParams]);

  const update = (key: string, value: string) => {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  const forceError = params.get('forceError') === '500';
  const query = useQuery({
    queryKey: ['products', filters, forceError],
    queryFn: ({ signal }) => api.products(filters, signal, forceError),
  });
  const total = query.data?.total ?? 0;

  useEffect(() => {
    if (!query.data) return;
    const lastPage = Math.max(1, Math.ceil(query.data.total / 24));
    if (filters.page <= lastPage) return;
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (lastPage === 1) next.delete('page');
      else next.set('page', String(lastPage));
      return next;
    }, { replace: true });
  }, [filters.page, query.data, setParams]);

  const selectCategory = (category: Category) => {
    update('category', category);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearFilters = () => {
    setInput('');
    setParams({});
  };

  const retry = () => {
    if (forceError) {
      setParams(previous => {
        const next = new URLSearchParams(previous);
        next.delete('forceError');
        return next;
      });
    } else void query.refetch();
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="hero-label">THE BUG BAZAAR / EDITION 01</span>
            <h1>Build your<br /><em>better desk.</em></h1>
            <p>Thoughtful gear for the hours you spend making things. Find your next everyday favourite.</p>
            <a href="#products" className="button hero-cta">Shop the collection <ArrowUpRight size={18} aria-hidden="true" /></a>
            <span className="hero-aside">DESIGNED FOR THE DAILY DEBUG</span>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <img src={cardImages.keyboards} alt="" />
            <div className="hero-feature"><span>FEATURED / 01</span><strong>Desk essentials</strong><small>Find your flow <ArrowRight size={14} /></small></div>
          </div>
        </div>
      </section>

      <section className="container category-section" aria-labelledby="category-title">
        <div className="section-heading">
          <div><span className="eyebrow">EXPLORE THE EDIT</span><h2 id="category-title">Shop by category</h2></div>
          <p>Small things that make the workday better.</p>
        </div>
        <div className="category-grid">
          {categories.map(category => (
            <button className="category-card" key={category.id} type="button" onClick={() => selectCategory(category.id)}>
              <img src={cardImages[category.id]} alt="" loading="lazy" />
              <span className="category-card-copy"><strong>{category.label}</strong><small>{category.note}</small></span>
              <ArrowUpRight size={22} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <main className="container shop-section" id="products">
        <div className="section-heading shop-heading">
          <div><span className="eyebrow">THE FULL COLLECTION</span><h2>Find your next favourite</h2></div>
          <p>Good tools, good ideas, good days.</p>
        </div>
        <div className="filters" aria-label="Product filters">
          <label className="search-label">Search products
            <input value={input} onChange={event => setInput(event.target.value)} placeholder="Try coffee, keyboards, ducks..." type="search" />
          </label>
          <label>Category
            <select value={filters.category} onChange={event => update('category', event.target.value)}>
              <option value="">All categories</option><option value="keyboards">Keyboards</option><option value="ducks">Rubber ducks</option><option value="coffee">Coffee</option><option value="stickers">Stickers</option>
            </select>
          </label>
          <label>Price
            <select value={filters.priceBand} onChange={event => update('priceBand', event.target.value)}>
              <option value="">Any price</option><option value="under-25">Under $25</option><option value="25-75">$25 to $75</option><option value="75-plus">$75 and up</option>
            </select>
          </label>
          <label>Rating
            <select value={filters.minRating || ''} onChange={event => update('minRating', event.target.value)}>
              <option value="">Any rating</option><option value="4">4 stars & up</option><option value="4.5">4.5 stars & up</option>
            </select>
          </label>
          <label>Sort by
            <select value={filters.sort} onChange={event => update('sort', event.target.value)}>
              <option value="">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option><option value="name">Name: A to Z</option>
            </select>
          </label>
          <label className="check-filter"><input type="checkbox" checked={filters.inStock} onChange={event => update('inStock', event.target.checked ? 'true' : '')} /> In stock only</label>
        </div>
        <div className="results-bar">
          <span>{query.isLoading ? 'Loading products...' : `${total.toLocaleString()} products found`}</span>
          <button className="link-button" type="button" onClick={clearFilters}>Clear filters ×</button>
        </div>
        {query.isLoading ? <div className="status" role="status">Loading the collection...</div>
          : query.isError ? <div className="status" role="status"><p>{readableError(query.error)}</p><button className="button" onClick={retry}>Try again</button></div>
            : query.data?.items.length === 0 ? <div className="status" role="status">No products match those filters. Try a different search.</div>
              : <div className="product-grid">{query.data?.items.map(product => <ProductCard key={product.id} product={product} />)}</div>}
        <div className="pagination">
          <button disabled={filters.page <= 1} onClick={() => update('page', String(filters.page - 1))}>← Previous</button>
          <span>Page {filters.page} of {Math.max(1, Math.ceil(total / 24))}</span>
          <button disabled={filters.page * 24 >= total} onClick={() => update('page', String(filters.page + 1))}>Next →</button>
        </div>
      </main>
    </>
  );
}
