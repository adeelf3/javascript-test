import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product, User } from './types';
type Session={token:string|null;user:User|null};
function readCart():CartItem[]{try{return JSON.parse(localStorage.getItem('bazaar-cart')??'[]') as CartItem[];}catch{return [];}}
function readSession():Session{try{return JSON.parse(sessionStorage.getItem('bazaar-session')??'null') as Session??{token:null,user:null};}catch{return {token:null,user:null};}}
const cartSlice=createSlice({name:'cart',initialState:readCart(),reducers:{add:(state,action:PayloadAction<Product>)=>{const p=action.payload;const item=state.find(i=>i.product.id===p.id);if(item){item.quantity=Math.min(p.stock,item.quantity+1);}else if(p.stock>0)state.push({product:p,quantity:1});},remove:(state,action:PayloadAction<string>)=>state.filter(i=>i.product.id!==action.payload),quantity:(state,action:PayloadAction<{id:string;quantity:number}>)=>{const item=state.find(i=>i.product.id===action.payload.id);if(item)item.quantity=Math.max(1,Math.min(item.product.stock,Math.floor(action.payload.quantity)||1));},clear:()=>[],syncStock:(state,action:PayloadAction<{id:string;stock:number}>)=>{const item=state.find(i=>i.product.id===action.payload.id);if(item)item.product.stock=action.payload.stock;}}});
const sessionSlice=createSlice({name:'session',initialState:readSession(),reducers:{signIn:(_state,action:PayloadAction<{token:string;user:User}>)=>action.payload,signOut:():Session=>({token:null,user:null})}});
export const actions={...cartSlice.actions,...sessionSlice.actions};
export const store=configureStore({reducer:{cart:cartSlice.reducer,session:sessionSlice.reducer}});
store.subscribe(()=>{localStorage.setItem('bazaar-cart',JSON.stringify(store.getState().cart));sessionStorage.setItem('bazaar-session',JSON.stringify(store.getState().session));});
export type RootState=ReturnType<typeof store.getState>;export type AppDispatch=typeof store.dispatch;
export const selectCartCount=(s:RootState)=>s.cart.reduce((n,i)=>n+i.quantity,0);
export const selectCartTotal=(s:RootState)=>s.cart.reduce((n,i)=>n+i.quantity*i.product.price,0);
