import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, ApiClientError, readableError } from './data/client';
import { actions, selectCartCount, selectCartTotal, type RootState } from './store';
import { useBackToTop } from './hooks';
import { readMockStockUpdate } from './data/mockServer';
import { startStockFeed } from './data/stockFeed';
import ThemeToggle from './ThemeToggle';
import Shop from './Shop';
import { loginSchema, type LoginFields } from './validation';
const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
function Status({message,onRetry}:{message:string;onRetry?:()=>void}){return <div className="status" role="status"><p>{message}</p>{onRetry&&<button onClick={onRetry} className="button">Try again</button>}</div>}
function Header() {
  const count = useSelector(selectCartCount);
  const session = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  return (
    <header className="header">
      <div className="announcement"><div className="container">THE DESK EDIT <a href={`${import.meta.env.BASE_URL}api/products.json`} target="_blank" rel="noreferrer">View mock API ↗</a></div></div>
      <div className="container nav">
        <Link className="logo" to="/" aria-label="The Bug Bazaar home">
          <span className="logo-mark" aria-hidden="true">{'{ }'}</span>
          <span>THE BUG <strong>BAZAAR</strong></span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>Shop</NavLink>
          <NavLink to="/cart">Cart <span className="cart-count" aria-label={`${count} items`}>{count}</span></NavLink>
          <NavLink to="/account">Account</NavLink>
          {session.token
            ? <button className="text-button" type="button" onClick={() => dispatch(actions.signOut())}>Log out</button>
            : <NavLink to="/login">Log in</NavLink>}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div><strong className="footer-brand">THE BUG BAZAAR</strong><p>Better days begin at your desk.</p></div>
        <div className="footer-links"><Link to="/">Shop all</Link><Link to="/cart">Your cart</Link><a href={`${import.meta.env.BASE_URL}api/products.json`} target="_blank" rel="noreferrer">Public mock API</a></div>
        <small>© 2026 The Bug Bazaar · Demo storefront</small>
      </div>
    </footer>
  );
}
function Details(){const {id=''}=useParams();const [params,setParams]=useSearchParams();const forceError=params.get('forceError')==='500';const dispatch=useDispatch();const query=useQuery({queryKey:['product',id,forceError],queryFn:({signal})=>api.product(id,signal,forceError),retry:(count,e)=>!(e instanceof ApiClientError&&e.status===404)&&count<1});if(query.isLoading)return <main className="container"><Status message="Loading product..."/></main>;if(query.error instanceof ApiClientError&&query.error.status===404)return <NotFound/>;if(query.isError)return <main className="container"><Status message={readableError(query.error)} onRetry={()=>{if(forceError){setParams(prev=>{const next=new URLSearchParams(prev);next.delete('forceError');return next;});}else void query.refetch();}}/></main>;const p=query.data!;return <main className="container detail-page"><Link to="/" className="back-link">← Back to shop</Link><div className="detail-grid"><img src={p.imageUrl} alt={p.name}/><div><span className="eyebrow">{p.category}</span><h1>{p.name}</h1><p className="rating">★ {p.rating.toFixed(1)} / 5</p><p className="detail-price">{money(p.price)}</p><p className="muted">Designed to make your desk a little happier and your debugging sessions a little easier.</p><p>{p.stock>0?`${p.stock} available`:'Currently out of stock'}</p><button className="button" disabled={p.stock===0} onClick={()=>dispatch(actions.add(p))}>Add to cart +</button></div></div></main>}
function Cart(){const cart=useSelector((s:RootState)=>s.cart);const total=useSelector(selectCartTotal);const dispatch=useDispatch();const navigate=useNavigate();return <main className="container page"><span className="eyebrow">YOUR PICKS</span><h1>Your cart</h1>{cart.length===0?<div className="empty"><h2>Your cart is empty</h2><p>Something good is waiting in the shop.</p><Link className="button" to="/">Browse products</Link></div>:<div className="cart-layout"><div className="cart-items">{cart.map(item=><article className="cart-item" key={item.product.id}><img src={item.product.imageUrl} alt=""/><div><Link to={`/products/${item.product.id}`}><strong>{item.product.name}</strong></Link><p>{money(item.product.price)}</p><button className="link-button" onClick={()=>dispatch(actions.remove(item.product.id))}>Remove</button></div><label>Qty<input aria-label={`Quantity for ${item.product.name}`} type="number" min="1" max={item.product.stock} value={item.quantity} onChange={e=>dispatch(actions.quantity({id:item.product.id,quantity:Number(e.target.value)}))}/></label><strong>{money(item.product.price*item.quantity)}</strong></article>)}</div><aside className="summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><strong>{money(total)}</strong></div><p>Shipping calculated at checkout. Demo orders are not charged.</p><button className="button full" onClick={()=>navigate('/checkout')}>Continue to checkout →</button></aside></div>}</main>}
function RequireAuth({children}:{children:ReactNode}){const token=useSelector((s:RootState)=>s.session.token);const location=useLocation();return token?<>{children}</>:<Navigate to="/login" replace state={{from:location.pathname}}/>}
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@bugbazaar.dev', password: 'demo123' },
    reValidateMode: 'onChange',
  });

  async function submit(values: LoginFields) {
    setServerError('');
    try {
      const session = await api.login(values.email.trim(), values.password);
      dispatch(actions.signIn(session));
      navigate((location.state as { from?: string } | null)?.from ?? '/account', { replace: true });
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.status === 400) {
        const details = cause.details ?? {};
        if (details.email) setFieldError('email', { message: details.email });
        if (details.password) setFieldError('password', { message: details.password });
        if (details.email || details.password) return;
      }
      setServerError(readableError(cause));
    }
  }

  return (
    <main className="container page auth-page">
      <div className="form-card">
        <span className="eyebrow">YOUR SPACE</span>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to keep your checkout moving.</p>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && <p id="login-email-error" className="field-error" role="alert">{errors.email.message}</p>}
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />
          {errors.password && <p id="login-password-error" className="field-error" role="alert">{errors.password.message}</p>}
          {serverError && <p className="form-error" role="alert">{serverError}</p>}
          <button className="button full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Log in'}</button>
        </form>
        <div className="demo-note">
          <strong>Try the demo</strong>
          <span>demo@bugbazaar.dev / demo123</span>
        </div>
      </div>
    </main>
  );
}
function Account(){const token=useSelector((s:RootState)=>s.session.token)!;const query=useQuery({queryKey:['me',token],queryFn:()=>api.me(token)});const dispatch=useDispatch();useEffect(()=>{if(query.error instanceof ApiClientError&&query.error.status===401)dispatch(actions.signOut());},[query.error,dispatch]);return <main className="container page"><span className="eyebrow">YOUR ACCOUNT</span><h1>Account</h1>{query.isLoading?<Status message="Loading account..."/>:query.isError?<Status message={readableError(query.error)} onRetry={()=>void query.refetch()}/>:<div className="form-card"><h2>Hello, {query.data?.name}</h2><p>{query.data?.email}</p><p className="muted">Thanks for shopping with The Bug Bazaar.</p></div>}</main>}
function Checkout() {
  const cart = useSelector((state: RootState) => state.cart);
  const token = useSelector((state: RootState) => state.session.token)!;
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef<{ fingerprint: string; value: string } | null>(null);

  async function place() {
    if (busy || !cart.length) return;
    setBusy(true);
    setError('');
    const fingerprint = JSON.stringify(cart.map(item => ({
      id: item.product.id,
      quantity: item.quantity,
    })));

    if (key.current?.fingerprint !== fingerprint) {
      let saved: { fingerprint: string; value: string } | null = null;
      try {
        saved = JSON.parse(sessionStorage.getItem('bazaar-checkout-key') ?? 'null') as { fingerprint: string; value: string } | null;
      } catch {
        saved = null;
      }
      key.current = saved?.fingerprint === fingerprint
        ? saved
        : { fingerprint, value: crypto.randomUUID() };
      try {
        sessionStorage.setItem('bazaar-checkout-key', JSON.stringify(key.current));
      } catch {
        // Checkout can still run if browser storage is unavailable.
      }
    }

    try {
      const order = await api.order(
        cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        token,
        key.current.value,
      );
      dispatch(actions.clear());
      try {
        sessionStorage.removeItem('bazaar-checkout-key');
      } catch {
        // Storage is optional for this demo.
      }
      await client.invalidateQueries({ queryKey: ['products'] });
      await client.invalidateQueries({ queryKey: ['product'] });
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (cause) {
      setError(readableError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container page">
      <span className="eyebrow">ALMOST THERE</span>
      <h1>Checkout</h1>
      {cart.length === 0
        ? <Status message="Your cart is empty." />
        : (
          <div className="form-card">
            <h2>Review your order</h2>
            {cart.map(item => (
              <p key={item.product.id}>
                {item.quantity} x {item.product.name} - {money(item.quantity * item.product.price)}
              </p>
            ))}
            <hr />
            <h2>Total: {money(total)}</h2>
            <p className="muted">This is a demo store. No payment is collected.</p>
            {error && <p role="alert" className="form-error">{error}</p>}
            <button disabled={busy} className="button full" onClick={() => void place()}>
              {busy ? 'Placing order...' : 'Place order'}
            </button>
          </div>
        )}
    </main>
  );
}
function Confirmation(){const {id=''}=useParams();const token=useSelector((s:RootState)=>s.session.token)!;const query=useQuery({queryKey:['order',id],queryFn:()=>api.getOrder(id,token)});return <main className="container page confirmation"><span className="eyebrow">ORDER CONFIRMATION</span>{query.isLoading?<Status message="Loading your order..."/>:query.isError?<Status message={readableError(query.error)} onRetry={()=>void query.refetch()}/>:<><div className="success-icon">✓</div><h1>Order placed!</h1><p>Order <strong>{query.data?.id}</strong> is {query.data?.status}. Thanks for shopping with us.</p><Link className="button" to="/">Back to shop</Link></>}</main>}
function NotFound(){return <main className="container page empty"><span className="eyebrow">404 / NOT FOUND</span><h1>Looks like a broken link.</h1><p>This page isn't in our repository.</p><Link className="button" to="/">Return to shop</Link></main>}
class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(error:Error,info:ErrorInfo){console.error('Unexpected UI error',error,info.componentStack);}render(){return this.state.failed?<main className="container page empty" role="alert"><h1>Something went wrong</h1><p>We logged the error. Refresh to try again.</p><button className="button" onClick={()=>window.location.reload()}>Reload page</button></main>:this.props.children;}}
function LiveStock() {
  const client = useQueryClient();
  const dispatch = useDispatch();

  useEffect(() => startStockFeed(readMockStockUpdate, update => {
    dispatch(actions.syncStock(update));
    void client.invalidateQueries({ queryKey: ['products'] });
    void client.invalidateQueries({ queryKey: ['product', update.id] });
  }), [client, dispatch]);

  return null;
}
export default function App(){const top=useBackToTop();return <ErrorBoundary><Header/><LiveStock/><Routes><Route path="/" element={<Shop/>}/><Route path="/products/:id" element={<Details/>}/><Route path="/cart" element={<Cart/>}/><Route path="/login" element={<Login/>}/><Route path="/account" element={<RequireAuth><Account/></RequireAuth>}/><Route path="/checkout" element={<RequireAuth><Checkout/></RequireAuth>}/><Route path="/orders/:id" element={<RequireAuth><Confirmation/></RequireAuth>}/><Route path="*" element={<NotFound/>}/></Routes><Footer/>{top&&<button className="to-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top">↑</button>}</ErrorBoundary>}
