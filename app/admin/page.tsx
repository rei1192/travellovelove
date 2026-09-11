'use client'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Hotel,Profile} from '@/lib/types'

export default function AdminPage(){
 const[allowed,setAllowed]=useState<boolean|null>(null);const[hotels,setHotels]=useState<Hotel[]>([]);const[reservations,setReservations]=useState(0);const[msg,setMsg]=useState('')
 useEffect(()=>{void load()},[])
 async function load(){const sb=getSupabaseClient();if(!sb){setAllowed(false);return}const{data:{user}}=await sb.auth.getUser();if(!user){setAllowed(false);return}const{data:p}=await sb.from('profiles').select('*').eq('id',user.id).single();const profile=p as Profile|null;if(!profile?.is_admin){setAllowed(false);return}setAllowed(true);const[{data:h},{count:r}]=await Promise.all([sb.from('hotels').select('*').order('created_at',{ascending:false}),sb.from('reservations').select('*',{count:'exact',head:true})]);setHotels((h||[]) as Hotel[]);setReservations(r||0)}
 async function toggleActive(h:Hotel){const sb=getSupabaseClient();if(!sb)return;setMsg('更新中...');const{error}=await sb.from('hotels').update({is_active:!(h as Hotel&{is_active?:boolean}).is_active}).eq('id',h.id);setMsg(error?error.message:'更新しました。');await load()}
 if(allowed===null)return <main><div className="pageLoading">権限確認中...</div></main>
 if(!allowed)return <main><section className="panel"><h2>管理者専用</h2><p>このページを利用する権限がありません。</p></section></main>
 return <main><section className="hero compactHero"><div className="eyebrow">ADMIN</div><h1>管理ダッシュボード</h1><p>掲載施設と予約状況を確認できます。</p></section><section className="section"><div className="adminStats"><div><b>{hotels.length}</b><span>ホテル</span></div><div><b>{reservations}</b><span>予約</span></div></div><div className="sectionTitle"><h2>掲載ホテル</h2></div><div className="adminList">{hotels.map(h=><div key={h.id}><img src={h.image_url||''} alt=""/><div><b>{h.name}</b><span>{h.prefecture}・{h.coin.toLocaleString()} coin</span></div><button onClick={()=>toggleActive(h)}>公開切替</button></div>)}</div>{msg&&<div className="message">{msg}</div>}</section></main>
}
