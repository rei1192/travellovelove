'use client'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Hotel} from '@/lib/types'

export default function MapPage(){
  const [hotels,setHotels]=useState<Hotel[]>([]);const [selected,setSelected]=useState<Hotel|null>(null);const [q,setQ]=useState('');const [pref,setPref]=useState('すべて')
  useEffect(()=>{void load()},[])
  async function load(){const sb=getSupabaseClient();if(!sb)return;const {data}=await sb.from('hotels').select('*').eq('is_active',true).eq('verified_real',true).order('featured',{ascending:false});const rows=(data||[]) as Hotel[];setHotels(rows);setSelected(rows[0]||null)}
  const prefectures=useMemo(()=>['すべて',...Array.from(new Set(hotels.map(h=>h.prefecture)))],[hotels])
  const list=useMemo(()=>hotels.filter(h=>(pref==='すべて'||h.prefecture===pref)&&(!q||`${h.name} ${h.prefecture} ${h.city} ${h.area}`.toLowerCase().includes(q.toLowerCase()))),[hotels,q,pref])
  const query=selected?encodeURIComponent(`${selected.name} ${selected.address||selected.city}`):''
  const destination=selected?`https://www.google.com/maps/dir/?api=1&destination=${query}${selected.google_place_id?`&destination_place_id=${encodeURIComponent(selected.google_place_id)}`:''}`:'#'
  const nearby=(term:string)=>selected?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${term} near ${selected.name} ${selected.city}`)}`:'#'
  return <main>
    <section className="pageHero mapHero"><div className="eyebrow">GOOGLE MAPS</div><h1>地図からホテルを探す</h1><p>実在ホテルの位置を確認して、経路や周辺スポットまでそのままGoogleマップへ。</p><div className="searchBox mapSearch"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ホテル名・都市で検索"/></div><div className="chips mapChips">{prefectures.map(x=><button key={x} className={'chip '+(pref===x?'active':'')} onClick={()=>setPref(x)}>{x}</button>)}</div></section>
    <section className="mapWorkspace">
      <div className="mapPane">{selected?<iframe title={`${selected.name} map`} src={`https://www.google.com/maps?q=${query}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>:<div className="mapPlaceholder">ホテルを選択してください</div>}</div>
      <div className="mapListHeader"><b>{list.length}件</b><span>ホテルを選択</span></div><div className="mapList">{list.map(h=><button key={h.id} onClick={()=>setSelected(h)} className={'mapHotel '+(selected?.id===h.id?'selected':'')}><div><span className="realBadge">実在</span><small>{h.prefecture}・{h.city}</small><b>{h.name}</b><em>★ {Number(h.rating).toFixed(1)} ・ {h.coin.toLocaleString()} coin〜</em></div><span className="chev">›</span></button>)}</div>
    </section>
    {selected&&<section className="mapSelected premiumMapSelected"><div className="mapSelectedTop"><div><div className="eyebrow">SELECTED HOTEL</div><h2>{selected.name}</h2><p>{selected.address}</p></div><div className="mapRating"><b>★ {Number(selected.rating).toFixed(1)}</b><span>{selected.review_count?`${selected.review_count.toLocaleString()}件`:''}</span></div></div><div className="mapActions"><Link href={`/hotels/${selected.slug}`} className="primaryLink">ホテル詳細</Link><a href={destination} target="_blank" rel="noreferrer" className="secondaryLink">現在地から経路 ↗</a><a href={selected.google_maps_url||`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noreferrer" className="secondaryLink">Googleマップ ↗</a></div><div className="nearbyLinks"><span>周辺を探す</span><a href={nearby('レストラン')} target="_blank" rel="noreferrer">🍽 レストラン</a><a href={nearby('駅')} target="_blank" rel="noreferrer">🚉 駅</a><a href={nearby('コンビニ')} target="_blank" rel="noreferrer">🛒 コンビニ</a></div></section>}
  </main>
}
