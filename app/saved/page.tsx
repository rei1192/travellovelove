'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import HotelPhoto from '@/components/HotelPhoto'
import type {Hotel} from '@/lib/types'

export default function SavedPage(){
  const [hotels,setHotels]=useState<Hotel[]>([])
  const [loading,setLoading]=useState(true)
  const [message,setMessage]=useState('')

  useEffect(()=>{void load()},[])
  async function load(){
    const sb=getSupabaseClient();if(!sb){setLoading(false);return}
    const {data:{user}}=await sb.auth.getUser()
    if(!user){setMessage('ログインすると保存したホテルをどの端末からでも確認できます。');setLoading(false);return}
    const {data,error}=await sb.from('favorites').select('hotel_id,hotels(*)').eq('user_id',user.id).order('created_at',{ascending:false})
    if(error)setMessage(error.message);else setHotels((data||[]).map((row:any)=>row.hotels).filter(Boolean) as Hotel[])
    setLoading(false)
  }
  async function remove(hotel:Hotel){
    const sb=getSupabaseClient();if(!sb)return
    const {data:{user}}=await sb.auth.getUser();if(!user)return
    setHotels(v=>v.filter(h=>h.id!==hotel.id));localStorage.setItem('tripnest-favs',JSON.stringify(hotels.filter(h=>h.id!==hotel.id).map(h=>h.id)))
    const {error}=await sb.from('favorites').delete().eq('user_id',user.id).eq('hotel_id',hotel.id)
    if(error){setMessage(error.message);await load()}else setMessage(`${hotel.name} を保存から外しました。`)
  }

  return <main>
    <section className="pageHero savedHero"><div className="eyebrow">SAVED PLACES</div><h1>保存したホテル</h1><p>気になるホテルを並べて、次の旅をゆっくり選べます。</p><div className="savedHeroMeta"><span>{hotels.length}件保存中</span><Link href="/map">地図で見る →</Link></div></section>
    <section className="section">
      {loading?<div className="pageLoading">読み込み中...</div>:hotels.length?<div className="savedGrid">{hotels.map((h,i)=><article className="savedCard premiumSavedCard" key={h.id}><Link href={`/hotels/${h.slug}`} className="savedPhotoLink"><HotelPhoto placeId={h.google_place_id} name={h.name} className="savedVisual" fallbackClass={'savedVisual'+(i%4)}><span className="realBadge">{h.featured?'✦ プレミアム':'おすすめ'}</span><div><small>{h.prefecture}・{h.city}</small><strong>{h.name}</strong></div></HotelPhoto></Link><div className="savedCardBody stacked"><div className="savedFacts"><span>★ {Number(h.rating).toFixed(1)} {h.review_count?`(${h.review_count.toLocaleString()})`:''}</span><b>● {h.coin.toLocaleString()} coin〜</b></div><div className="savedActions"><a href={h.google_maps_url||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name} ${h.address||h.city}`)}`} target="_blank" rel="noreferrer">Googleマップ</a><Link href={`/hotels/${h.slug}`}>詳細を見る</Link><button onClick={()=>remove(h)}>保存解除</button></div></div></article>)}</div>:<div className="empty modernEmpty"><div className="emptyIcon">♡</div><b>まだ保存したホテルはありません</b><span>ホームの♡を押すと、ここにまとめて表示されます。</span><Link href="/" className="primaryLink">ホテルを探す</Link></div>}
      {message&&<div className="message centerMessage toastMessage">{message}</div>}
    </section>
  </main>
}
