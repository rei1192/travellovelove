'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Reservation} from '@/lib/types'

export default function ReservationsPage(){
  const [rows,setRows]=useState<Reservation[]>([]); const [loading,setLoading]=useState(true); const [msg,setMsg]=useState('')
  useEffect(()=>{void load()},[])
  async function load(){const sb=getSupabaseClient();if(!sb){setLoading(false);return}const {data:{user}}=await sb.auth.getUser();if(!user){setMsg('ログインすると予約履歴を確認できます。');setLoading(false);return}const {data,error}=await sb.from('reservations').select('*,hotels(name,slug,image_url,area)').eq('user_id',user.id).order('created_at',{ascending:false});if(error)setMsg(error.message);else setRows((data||[]) as Reservation[]);setLoading(false)}
  async function cancel(id:string){const sb=getSupabaseClient();if(!sb)return;if(!confirm('この予約をキャンセルしますか？コインは返金されます。'))return;setMsg('キャンセル処理中...');const {error}=await sb.rpc('cancel_reservation',{p_reservation_id:id});if(error)setMsg(error.message);else{setMsg('キャンセルしました。');await load()}}
  return <main><section className="hero compactHero"><div className="eyebrow">MY TRIPS</div><h1>予約履歴</h1><p>これからの旅も、過去の予約もここでまとめて確認できます。</p></section><section className="section">{loading?<div className="pageLoading">読み込み中...</div>:rows.length?<div className="reservationList">{rows.map(r=><article className="reservationCard" key={r.id}>{r.hotels?.image_url&&<img src={r.hotels.image_url} alt=""/>}<div className="reservationBody"><div className="statusRow"><span className={'status '+r.status}>{r.status==='confirmed'?'予約確定':'キャンセル済み'}</span><small>{r.confirmation_code||'---'}</small></div><h3>{r.hotels?.name||'TripNest Hotel'}</h3><p>{r.check_in} → {r.check_out} ・ {r.total_nights}泊 ・ {r.guests}名</p><strong>● {r.coin_amount.toLocaleString()} coin</strong><div className="reservationActions">{r.hotels?.slug&&<Link href={`/hotels/${r.hotels.slug}`}>ホテルを見る</Link>}{r.status==='confirmed'&&<button onClick={()=>cancel(r.id)}>キャンセル</button>}</div></div></article>)}</div>:<div className="empty"><b>予約はまだありません</b><span>気になる宿を見つけて、最初の旅を予約してみましょう。</span><Link className="primaryLink" href="/">宿を探す</Link></div>}{msg&&<div className="message">{msg}</div>}</section></main>
}
