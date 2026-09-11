'use client'
import Link from 'next/link'
import {useParams,useRouter} from 'next/navigation'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Hotel} from '@/lib/types'

export default function HotelDetailPage(){
  const {slug}=useParams<{slug:string}>(); const router=useRouter()
  const [hotel,setHotel]=useState<Hotel|null>(null); const [loading,setLoading]=useState(true)
  const [checkIn,setCheckIn]=useState(''); const [checkOut,setCheckOut]=useState(''); const [guests,setGuests]=useState(2); const [msg,setMsg]=useState('')
  useEffect(()=>{void load()},[slug])
  async function load(){const sb=getSupabaseClient();if(!sb){setLoading(false);return}const {data}=await sb.from('hotels').select('*').eq('slug',slug).single();setHotel(data as Hotel|null);setLoading(false)}
  const nights=useMemo(()=>{if(!checkIn||!checkOut)return 0;const n=Math.ceil((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000);return Math.max(0,n)},[checkIn,checkOut])
  const total=(hotel?.coin||0)*nights
  async function reserve(){const sb=getSupabaseClient();if(!sb||!hotel)return;setMsg('予約処理中...');const {data:{user}}=await sb.auth.getUser();if(!user){setMsg('予約にはログインが必要です。');return}const {error}=await sb.rpc('create_reservation',{p_hotel_id:hotel.id,p_check_in:checkIn,p_check_out:checkOut,p_guests:guests});if(error){setMsg(error.message);return}router.push('/reservations')}
  if(loading)return <main><div className="pageLoading">読み込み中...</div></main>
  if(!hotel)return <main><section className="panel"><h2>ホテルが見つかりません</h2><Link href="/">ホームへ戻る</Link></section></main>
  return <main>
    <div className="detailHero"><img src={hotel.image_url||''} alt={hotel.name}/><Link href="/" className="backButton">‹</Link><div className="detailOverlay"><span>★ {Number(hotel.rating).toFixed(1)} ({hotel.review_count})</span><h1>{hotel.name}</h1><p>{hotel.prefecture}・{hotel.city}</p></div></div>
    <section className="section detailSection"><div className="eyebrow">ABOUT</div><h2>この宿について</h2><p className="description">{hotel.description||'快適な滞在を楽しめるTripNest掲載施設です。'}</p><div className="amenityGrid">{(hotel.amenities||[]).map(a=><div key={a}>✓ {a}</div>)}</div></section>
    <section className="bookingCard"><div><span>1泊あたり</span><strong>● {hotel.coin.toLocaleString()} coin〜</strong></div><div className="bookingFields"><label>チェックイン<input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)}/></label><label>チェックアウト<input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)}/></label><label>人数<select value={guests} onChange={e=>setGuests(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label></div>{nights>0&&<div className="bookingTotal"><span>{nights}泊・{guests}名</span><b>{total.toLocaleString()} coin</b></div>}<button className="primary" disabled={!checkIn||!checkOut||nights<1} onClick={reserve}>この内容で予約する</button>{msg&&<div className="message">{msg}</div>}<small className="finePrint">予約確定時にコインが差し引かれます。キャンセルすると全額コイン返金されます。</small></section>
  </main>
}
