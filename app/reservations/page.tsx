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
  return <main>
    <section className="pageHero reservationsHero"><div className="eyebrow">MY TRIPS</div><h1>予約</h1><p>次の旅の予定と、これまでの予約をひと目で。</p><div className="tripSummary"><div><b>{rows.filter(r=>r.status==='confirmed').length}</b><span>予約中</span></div><div><b>{rows.length}</b><span>すべて</span></div><div><b>{rows.reduce((s,r)=>s+(r.status==='confirmed'?r.coin_amount:0),0).toLocaleString()}</b><span>利用coin</span></div></div></section>
    <section className="section reservationsSection">{loading?<div className="pageLoading">読み込み中...</div>:rows.length?<div className="reservationList premiumReservationList">{rows.map(r=><article className={'reservationCard premiumReservationCard '+r.status} key={r.id}><div className="reservationVisual"><span className={'status '+r.status}>{r.status==='confirmed'?'予約確定':'キャンセル済み'}</span><small>CONFIRMATION</small><b>{r.confirmation_code||'---'}</b></div><div className="reservationBody"><div className="reservationDate"><div><small>CHECK IN</small><b>{r.check_in}</b></div><span>→</span><div><small>CHECK OUT</small><b>{r.check_out}</b></div></div><h3>{r.hotels?.name||'TripNest Hotel'}</h3><p>{r.total_nights}泊 ・ {r.guests}名</p><div className="reservationPrice"><span>利用コイン</span><strong>● {r.coin_amount.toLocaleString()} coin</strong></div><div className="reservationActions">{r.hotels?.slug&&<Link href={`/hotels/${r.hotels.slug}`}>ホテル詳細</Link>}{r.status==='confirmed'&&<button onClick={()=>cancel(r.id)}>予約をキャンセル</button>}</div></div></article>)}</div>:<div className="empty modernEmpty"><div className="emptyIcon">✦</div><b>予約はまだありません</b><span>実在ホテルから、次の旅を見つけてみましょう。</span><Link className="primaryLink" href="/">ホテルを探す</Link></div>}{msg&&<div className="message centerMessage">{msg}</div>}</section>
  </main>
}
