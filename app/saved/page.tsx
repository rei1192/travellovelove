'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Hotel} from '@/lib/types'

export default function SavedPage(){
  const [hotels,setHotels]=useState<Hotel[]>([])
  const [loading,setLoading]=useState(true)
  const [message,setMessage]=useState('')

  useEffect(()=>{void load()},[])
  async function load(){
    const sb=getSupabaseClient()
    if(!sb){setLoading(false);return}
    const {data:{user}}=await sb.auth.getUser()
    if(!user){setMessage('ログインすると保存したホテルをどの端末からでも確認できます。');setLoading(false);return}
    const {data,error}=await sb.from('favorites').select('hotel_id,hotels(*)').eq('user_id',user.id).order('created_at',{ascending:false})
    if(error)setMessage(error.message)
    else setHotels((data||[]).map((row:any)=>row.hotels).filter(Boolean) as Hotel[])
    setLoading(false)
  }

  return <main>
    <section className="pageHero savedHero"><div className="eyebrow">SAVED PLACES</div><h1>保存したホテル</h1><p>あとで行きたい宿を、旅の候補としてまとめて管理。</p></section>
    <section className="section">
      {loading?<div className="pageLoading">読み込み中...</div>:hotels.length?<div className="savedGrid">{hotels.map(h=><Link href={`/hotels/${h.slug}`} className="savedCard" key={h.id}><div className="savedVisual"><span className="realBadge">実在ホテル</span><div><small>{h.prefecture}・{h.city}</small><strong>{h.name}</strong></div></div><div className="savedCardBody"><span>★ {Number(h.rating).toFixed(1)} {h.review_count?`(${h.review_count.toLocaleString()})`:''}</span><b>{h.coin.toLocaleString()} coin〜</b></div></Link>)}</div>:<div className="empty modernEmpty"><div className="emptyIcon">♡</div><b>まだ保存したホテルはありません</b><span>ホームの♡を押すと、ここにまとめて表示されます。</span><Link href="/" className="primaryLink">ホテルを探す</Link></div>}
      {message&&<div className="message centerMessage">{message}</div>}
    </section>
  </main>
}
