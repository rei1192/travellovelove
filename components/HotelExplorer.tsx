'use client'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Hotel} from '@/lib/types'

export default function HotelExplorer(){
  const [hotels,setHotels]=useState<Hotel[]>([])
  const [q,setQ]=useState('')
  const [pref,setPref]=useState('すべて')
  const [sort,setSort]=useState('recommended')
  const [favs,setFavs]=useState<string[]>([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{void load()},[])
  async function load(){
    const sb=getSupabaseClient();const local=JSON.parse(localStorage.getItem('tripnest-favs')||'[]') as string[]
    if(!sb){setFavs(local);setLoading(false);return}
    const [{data:hotelData},{data:{user}}]=await Promise.all([sb.from('hotels').select('*').eq('is_active',true).eq('verified_real',true),sb.auth.getUser()])
    const rows=(hotelData||[]) as Hotel[];setHotels(rows)
    if(user){const {data}=await sb.from('favorites').select('hotel_id').eq('user_id',user.id);const ids=(data||[]).map(x=>x.hotel_id as string);setFavs(ids);localStorage.setItem('tripnest-favs',JSON.stringify(ids))}else setFavs(local)
    setLoading(false)
  }

  const prefectures=useMemo(()=>['すべて',...Array.from(new Set(hotels.map(h=>h.prefecture))).filter(Boolean)], [hotels])
  const list=useMemo(()=>{
    const term=q.trim().toLowerCase();const rows=hotels.filter(h=>(pref==='すべて'||h.prefecture===pref)&&(!term||`${h.name} ${h.area} ${h.prefecture} ${h.city}`.toLowerCase().includes(term)))
    return [...rows].sort((a,b)=>sort==='coin_asc'?a.coin-b.coin:sort==='rating'?Number(b.rating)-Number(a.rating):Number(b.featured)-Number(a.featured)||Number(b.rating)-Number(a.rating))
  },[hotels,q,pref,sort])

  async function toggle(id:string){
    const on=favs.includes(id);const next=on?favs.filter(x=>x!==id):[...favs,id];setFavs(next);localStorage.setItem('tripnest-favs',JSON.stringify(next))
    const sb=getSupabaseClient();if(!sb)return;const {data:{user}}=await sb.auth.getUser();if(!user)return
    if(on)await sb.from('favorites').delete().eq('user_id',user.id).eq('hotel_id',id);else await sb.from('favorites').upsert({user_id:user.id,hotel_id:id},{onConflict:'user_id,hotel_id'})
  }

  return <>
    <section className="hero homeHero" id="search">
      <div className="heroGlow heroGlowOne"/><div className="heroGlow heroGlowTwo"/>
      <div className="heroContent"><div className="eyebrow">REAL HOTELS × SMART TRAVEL</div><h1>次の旅を、<br/>もっと自由に。</h1><p>実在するホテルだけを掲載。ホテル探しから保存、地図での場所確認、予約まで、TripNestひとつで完結します。</p>
      <div className="searchBox premiumSearch"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ホテル名・都市・エリアから探す"/><button>検索</button></div>
      <div className="quickActions"><Link href="/map"><b>◉</b><span>地図から探す</span></Link><Link href="/saved"><b>♡</b><span>保存したホテル</span></Link><Link href="/reservations"><b>✦</b><span>予約を確認</span></Link></div></div>
    </section>

    <section className="section discoverSection"><div className="sectionTitle"><div><div className="eyebrow">DISCOVER</div><h2>ホテルを探す</h2></div><span>{loading?'読み込み中':`${list.length}件`}</span></div>
      <div className="chips premiumChips">{prefectures.map(x=><button key={x} className={'chip '+(pref===x?'active':'')} onClick={()=>setPref(x)}>{x}</button>)}</div>
      <div className="sortRow"><span>並び順</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recommended">おすすめ順</option><option value="coin_asc">必要コインが少ない順</option><option value="rating">評価が高い順</option></select></div>
      {loading?<div className="skeletonGrid"><div/><div/></div>:<div className="grid realHotelGrid">{list.map((h,i)=><article className="card realHotelCard" key={h.id}>
        <div className={'hotelVisual visual'+(i%4)}><div className="hotelVisualTop"><span className="realBadge">✓ 実在するホテル</span>{h.featured&&<span className="featured">人気</span>}</div><div className="hotelVisualBottom"><small>{h.prefecture}・{h.city}</small><strong>{h.name}</strong></div><button aria-label="お気に入り" className={'favBtn '+(favs.includes(h.id)?'liked':'')} onClick={()=>toggle(h.id)}>{favs.includes(h.id)?'♥':'♡'}</button></div>
        <div className="cardBody upgradedCardBody"><div className="ratingLine"><span>★ {Number(h.rating).toFixed(1)}</span><small>{h.review_count?`口コミ ${h.review_count.toLocaleString()}件`:'Googleマップ掲載情報'}</small></div><div className="amenityLine">{(h.amenities||[]).slice(0,3).map(a=><span key={a}>{a}</span>)}</div><div className="priceRow"><div className="price"><b>●</b> {h.coin.toLocaleString()} <small>コイン / 1泊〜</small></div><div className="cardLinks"><a href={h.google_maps_url||'#'} target="_blank" rel="noreferrer">地図</a><Link href={`/hotels/${h.slug}`} className="detailArrow">詳細 ›</Link></div></div></div>
      </article>)}</div>}
    </section>

    <section className="section mapPromo"><div><div className="eyebrow">MAP DISCOVERY</div><h2>地図を見ながら、泊まりたい場所を探せます。</h2><p>Googleマップでホテルの場所を確認しながら、観光地や駅からの距離、移動のしやすさまでチェックできます。</p></div><Link href="/map" className="mapPromoButton">地図から探す →</Link></section>
  </>
}
