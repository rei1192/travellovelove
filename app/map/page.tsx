'use client'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Hotel} from '@/lib/types'

export default function MapPage(){
  const [hotels,setHotels]=useState<Hotel[]>([])
  const [selected,setSelected]=useState<Hotel|null>(null)
  const [q,setQ]=useState('')
  useEffect(()=>{void load()},[])
  async function load(){const sb=getSupabaseClient();if(!sb)return;const {data}=await sb.from('hotels').select('*').eq('is_active',true).eq('verified_real',true).order('featured',{ascending:false});const rows=(data||[]) as Hotel[];setHotels(rows);setSelected(rows[0]||null)}
  const list=useMemo(()=>hotels.filter(h=>!q||`${h.name} ${h.prefecture} ${h.city} ${h.area}`.toLowerCase().includes(q.toLowerCase())),[hotels,q])
  const query=selected?encodeURIComponent(`${selected.name} ${selected.address||selected.city}`):''
  return <main>
    <section className="pageHero mapHero"><div className="eyebrow">GOOGLE MAPS</div><h1>地図から探す</h1><p>実在するホテルだけを表示。場所を確認して、そのままGoogleマップで経路検索できます。</p><div className="searchBox mapSearch"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ホテル名・都市で検索"/></div></section>
    <section className="mapWorkspace">
      <div className="mapPane">{selected?<iframe title={`${selected.name} map`} src={`https://www.google.com/maps?q=${query}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>:<div className="mapPlaceholder">ホテルを選択してください</div>}</div>
      <div className="mapList">{list.map(h=><button key={h.id} onClick={()=>setSelected(h)} className={'mapHotel '+(selected?.id===h.id?'selected':'')}><div><span className="realBadge">実在</span><small>{h.prefecture}・{h.city}</small><b>{h.name}</b><em>★ {Number(h.rating).toFixed(1)} ・ {h.coin.toLocaleString()} coin〜</em></div><span className="chev">›</span></button>)}</div>
    </section>
    {selected&&<section className="mapSelected"><div><div className="eyebrow">SELECTED HOTEL</div><h2>{selected.name}</h2><p>{selected.address}</p><div className="mapActions"><Link href={`/hotels/${selected.slug}`} className="primaryLink">ホテル詳細</Link><a href={selected.google_maps_url||`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noreferrer" className="secondaryLink">Googleマップで開く ↗</a></div></div></section>}
  </main>
}
