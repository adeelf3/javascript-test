import { seedProducts } from './products';
import type { ApiError, Order, ProductFilters, User } from '../types';
type SavedMockState = { stock: Record<string, number>; orders: Order[]; idempotency: [string, string][] };
function readSavedState(): SavedMockState {
  try {
    const raw = localStorage.getItem('bazaar-mock-state');
    if (raw) return JSON.parse(raw) as SavedMockState;
  } catch { /* Storage is optional for the demo. */ }
  return { stock: {}, orders: [], idempotency: [] };
}
const saved = readSavedState();
const products = seedProducts();
products.forEach(product => {
  const stock = saved.stock?.[product.id];
  if (Number.isInteger(stock) && stock >= 0) product.stock = stock;
});
const orders = new Map<string,Order>((saved.orders ?? []).map(order => [order.id, order]));
const idempotency = new Map<string,string>(saved.idempotency ?? []);
function persistMockState() {
  try {
    localStorage.setItem('bazaar-mock-state', JSON.stringify({
      stock: saved.stock,
      orders: [...orders.values()],
      idempotency: [...idempotency.entries()],
    } satisfies SavedMockState));
  } catch { /* The in-memory mock remains usable. */ }
}
const user: User = { id:'dev-1', name:'Demo Developer', email:'demo@bugbazaar.dev' };
const token = 'demo-session-token';
export type MockResponse = { status: number; body: unknown };
const error = (status:number,code:string,message:string,details?:Record<string,string>):MockResponse => ({status,body:{error:{code,message,details}} satisfies ApiError});
const wait = (ms:number) => new Promise<void>(resolve=>setTimeout(resolve,ms));
const requireAuth = (headers: Headers): boolean => headers.get('Authorization')===`Bearer ${token}`;
export async function handleMockRequest(url:URL,method:string,headers:Headers,body:unknown):Promise<MockResponse> {
  const forced = url.searchParams.get('forceError') ?? headers.get('X-Force-Error');
  const delay = Number(url.searchParams.get('delay') ?? headers.get('X-Mock-Delay') ?? 180);
  await wait(Math.min(Math.max(delay,0),3500));
  if(forced==='500') return error(500,'SERVER_ERROR','Temporary service interruption');
  if(url.pathname==='/api/products' && method==='GET') {
    const f:ProductFilters={search:url.searchParams.get('search')??'',category:url.searchParams.get('category')??'',sort:url.searchParams.get('sort')??'',page:Math.max(1,Number(url.searchParams.get('page')??1)),inStock:url.searchParams.get('inStock')==='true'};
    const filtered=products.filter(p=>(!f.category||p.category===f.category)&&(!f.inStock||p.stock>0)&&p.name.toLowerCase().includes(f.search.toLowerCase()));
    if(f.sort==='price-asc')filtered.sort((a,b)=>a.price-b.price); if(f.sort==='price-desc')filtered.sort((a,b)=>b.price-a.price); if(f.sort==='rating')filtered.sort((a,b)=>b.rating-a.rating);
    return {status:200,body:{items:filtered.slice((f.page-1)*24,f.page*24),total:filtered.length}};
  }
  const productMatch=url.pathname.match(/^\/api\/products\/([^/]+)$/);
  if(productMatch && method==='GET') { const product=products.find(p=>p.id===productMatch[1]); return product?{status:200,body:product}:error(404,'NOT_FOUND','Product not found'); }
  if(url.pathname==='/api/login'&&method==='POST') {const b=body as {email?:string;password?:string}|null; if(!b?.email||!b.password)return error(400,'VALIDATION','Missing credentials',{email:!b?.email?'Email is required':'',password:!b?.password?'Password is required':''}); if(b.email!==user.email||b.password!=='demo123')return error(401,'INVALID_LOGIN','Invalid credentials');return {status:200,body:{token,user}};}
  if(url.pathname==='/api/me'&&method==='GET')return requireAuth(headers)?{status:200,body:user}:error(401,'UNAUTHORIZED','Sign in required');
  if(url.pathname==='/api/orders'&&method==='POST') {
    if(!requireAuth(headers))return error(401,'UNAUTHORIZED','Sign in required');
    const b=body as {items?:{productId:string;quantity:number}[]}|null;
    if(!Array.isArray(b?.items)||!b.items.length)return error(400,'VALIDATION','Cart is empty',{items:'Add an item to your cart'});
    const key=headers.get('Idempotency-Key'); if(!key)return error(400,'VALIDATION','Missing idempotency key',{key:'A unique checkout key is required'});
    const existing=idempotency.get(key);if(existing)return {status:201,body:orders.get(existing)};
    for(const item of b.items){const p=products.find(p=>p.id===item.productId);if(!p||!Number.isInteger(item.quantity)||item.quantity<1)return error(400,'VALIDATION','Invalid order item',{items:'Check the product and quantity'});if(p.stock<item.quantity||forced==='409')return error(409,'OUT_OF_STOCK',`${p.name} is out of stock`,{productId:p.id,productName:p.name});}
    for(const item of b.items){const p=products.find(p=>p.id===item.productId);if(p)updateMockStock(p.id,p.stock-item.quantity);}
    const order:Order={id:`BB-${String(orders.size+1).padStart(5,'0')}`,status:'queued'};orders.set(order.id,order);idempotency.set(key,order.id);persistMockState();return {status:201,body:order};
  }
  const orderMatch=url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if(orderMatch&&method==='GET'){if(!requireAuth(headers))return error(401,'UNAUTHORIZED','Sign in required');const order=orders.get(orderMatch[1]);return order?{status:200,body:order}:error(404,'NOT_FOUND','Order not found');}
  return error(404,'NOT_FOUND','Endpoint not found');
}
export function updateMockStock(id:string,stock:number){const p=products.find(p=>p.id===id);if(p){p.stock=stock;saved.stock[id]=stock;persistMockState();}}
export function getMockProducts(){return products;}
let stockPollCount=0;
export async function readMockStockUpdate():Promise<{id:string;stock:number}>{
  stockPollCount+=1;
  if(stockPollCount%5===0)throw new Error('Simulated stock feed interruption');
  const product=products[Math.floor(Math.random()*products.length)];
  const stock=Math.max(0,product.stock+(Math.random()<.5?-1:1));
  updateMockStock(product.id,stock);
  return {id:product.id,stock};
}
