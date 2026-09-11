'use client'
import Link from 'next/link'
import {useParams,useRouter} from 'next/navigation'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import GooglePlaceLive from '@/components/GooglePlaceLive'
import type {Hotel} from '@/lib/types'

export default function HotelDetailPage(){
  const {slug}=useParams<{slug:string}>(); const router=useRouter()
  const [hotel,setHotel]=useState<Hotel|null>(null); const [loading,setLoading]=useState(true)
  const [checkIn,setCheckIn]=useState(''); const [checkOut,setCheckOut]=useState(''); const [guests,setGuests]=useState(2); const [msg,setMsg]=useState('')
  useEffect(()=>{void load()},[slug])
  async function load(){const sb=getSupabaseClient();if(!sb){setLoading(false);return}const {data}=await sb.from('hotels').select('*').eq('slug',slug).single();setHotel(data as Hotel|null);setLoading(false)}
  const nights=useMemo(()=>{if(!checkIn||!checkOut)return 0;const n=Math.ceil((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000);return Math.max(0,n)},[checkIn,checkOut])
  const total=(hotel?.coin||0)*nights
  async function reserve(){const sb=getSupabaseClient();if(!sb||!hotel)return;setMsg('予約処理中...');const {data:{user}}=await sb.auth.getUser();if(!user){setMsg('予約にはログインが必要です。マイページからログインしてください。');return}const {error}=await sb.rpc('create_reservation',{p_hotel_id:hotel.id,p_check_in:checkIn,p_check_out:checkOut,p_guests:guests});if(error){setMsg(error.message);return}router.push('/reservations')}
  async function share(){if(!hotel)return;const url=window.location.href;if(navigator.share){await navigator.share({title:hotel.name,text:`${hotel.name} - TripNest`,url})}else{await navigator.clipboard.writeText(url);setMsg('ホテルのURLをコピーしました。')}}
  if(loading)return <main><div className="pageLoading">読み込み中...</div></main>
  if(!hotel)return <main><section className="panel"><h2>ホテルが見つかりません</h2><Link href="/">ホームへ戻る</Link></section></main>
  const mapQuery=encodeURIComponent(`${hotel.name} ${hotel.address||hotel.city}`)
  const directionUrl=`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}${hotel.google_place_id?`&destination_place_id=${encodeURIComponent(hotel.google_place_id)}`:''}`
  return <main>
    <section className="detailHero premiumDetailHero"><Link href="/" className="backButton">‹</Link><button className="shareButton" onClick={share}>↗</button><div className="detailBadgeRow"><span className="realBadge">{hotel.featured?'✦ プレミアム':'おすすめ'}</span>{hotel.featured&&<span className="featured">人気</span>}</div><div className="detailOverlay"><span>★ {Number(hotel.rating).toFixed(1)} {hotel.review_count?`(${hotel.review_count.toLocaleString()}件)`:''}</span><h1>{hotel.name}</h1><p>{hotel.prefecture}・{hotel.city}・{hotel.area}</p></div></section>
    <section className="section detailSection"><div className="eyebrow">ABOUT</div><h2>このホテルについて</h2><p className="description">{hotel.description||'TripNestがおすすめするホテルです。'}</p><div className="amenityGrid">{(hotel.amenities||[]).map(a=><div key={a}>✓ {a}</div>)}</div><GooglePlaceLive placeId={hotel.google_place_id}/></section>
    <section className="section mapDetailSection"><div className="sectionTitle"><div><div className="eyebrow">LOCATION</div><h2>Googleマップ</h2></div></div><div className="detailMap"><iframe title={`${hotel.name} map`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div><div className="addressCard"><div><b>{hotel.address||`${hotel.prefecture}${hotel.city}`}</b>{hotel.phone&&<span>{hotel.phone}</span>}</div><a href={hotel.google_maps_url||`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">Googleマップ ↗</a></div><div className="locationActions"><a href={directionUrl} target="_blank" rel="noreferrer">現在地から経路</a>{hotel.phone&&<a href={`tel:${hotel.phone.replace(/[^+\d]/g,'')}`}>ホテルに電話</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`restaurants near ${hotel.name} ${hotel.city}`)}`} target="_blank" rel="noreferrer">周辺の飲食店</a></div></section>
    <section className="bookingCard premiumBooking"><div className="bookingTop"><div><span>1泊あたり</span><strong>● {hotel.coin.toLocaleString()} coin〜</strong></div><span className="secureBadge">TripNest予約</span></div><div className="bookingFields"><label>チェックイン<input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)}/></label><label>チェックアウト<input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)}/></label><label>人数<select value={guests} onChange={e=>setGuests(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label></div>{nights>0&&<div className="bookingTotal"><span>{nights}泊・{guests}名</span><b>{total.toLocaleString()} coin</b></div>}<button className="primary" disabled={!checkIn||!checkOut||nights<1} onClick={reserve}>この内容で予約する</button>{msg&&<div className="message toastMessage">{msg}</div>}<small className="finePrint">予約確定時にコインが差し引かれます。キャンセル時はコイン返金されます。</small></section>
  </main>
}
