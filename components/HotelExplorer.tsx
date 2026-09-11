'use client'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Hotel} from '@/lib/types'

const fallback: Hotel[] = [
  {id:'demo-1',slug:'fukuoka-harbor',name:'Fukuoka Harbor Stay',area:'福岡市',prefecture:'福岡県',city:'福岡市',coin:690,rating:4.7,review_count:128,image_url:'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',amenities:['Wi-Fi','朝食'],description:'福岡の街と海を楽しめる滞在拠点。',featured:true,address:null},
  {id:'demo-2',slug:'sapporo-grand',name:'Sapporo Grand Stay',area:'札幌市',prefecture:'北海道',city:'札幌市',coin:760,rating:4.8,review_count:214,image_url:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',amenities:['Wi-Fi','大浴場'],description:'札幌観光の拠点に便利なシティホテル。',featured:true,address:null}
]

export default function HotelExplorer(){
  const [hotels,setHotels]=useState<Hotel[]>([])
  const [q,setQ]=useState('')
  const [pref,setPref]=useState('すべて')
  const [sort,setSort]=useState('recommended')
  const [favs,setFavs]=useState<string[]>([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{void load()},[])
  async function load(){
    const sb=getSupabaseClient()
    const local=JSON.parse(localStorage.getItem('tripnest-favs')||'[]') as string[]
    if(!sb){setHotels(fallback);setFavs(local);setLoading(false);return}
    const [{data:hotelData},{data:{user}}]=await Promise.all([sb.from('hotels').select('*').eq('is_active',true),sb.auth.getUser()])
    setHotels((hotelData as Hotel[]|null)||fallback)
    if(user){
      const {data}=await sb.from('favorites').select('hotel_id').eq('user_id',user.id)
      const ids=(data||[]).map(x=>x.hotel_id as string)
      setFavs(ids);localStorage.setItem('tripnest-favs',JSON.stringify(ids))
    }else setFavs(local)
    setLoading(false)
  }

  const prefectures=useMemo(()=>['すべて',...Array.from(new Set(hotels.map(h=>h.prefecture))).filter(Boolean)], [hotels])
  const list=useMemo(()=>{
    const term=q.trim().toLowerCase()
    const rows=hotels.filter(h=>(pref==='すべて'||h.prefecture===pref)&&(!term||`${h.name} ${h.area} ${h.prefecture} ${h.city}`.toLowerCase().includes(term)))
    return [...rows].sort((a,b)=>sort==='coin_asc'?a.coin-b.coin:sort==='rating'?Number(b.rating)-Number(a.rating):Number(b.featured)-Number(a.featured)||Number(b.rating)-Number(a.rating))
  },[hotels,q,pref,sort])

  async function toggle(id:string){
    const on=favs.includes(id)
    const next=on?favs.filter(x=>x!==id):[...favs,id]
    setFavs(next);localStorage.setItem('tripnest-favs',JSON.stringify(next))
    const sb=getSupabaseClient();if(!sb)return
    const {data:{user}}=await sb.auth.getUser();if(!user)return
    if(on) await sb.from('favorites').delete().eq('user_id',user.id).eq('hotel_id',id)
    else await sb.from('favorites').upsert({user_id:user.id,hotel_id:id},{onConflict:'user_id,hotel_id'})
  }

  return <>
    <section className="hero heroAdvanced" id="search">
      <div className="eyebrow">TRIPNEST MEMBERSHIP</div>
      <h1>泊まりたいを、<br/>すぐ次の旅へ。</h1>
      <p>全国の宿をコインで探して、保存して、予約まで。会員になるとお気に入りと予約履歴をクラウド同期できます。</p>
      <div className="searchBox"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ホテル名・都市・都道府県"/><button>検索</button></div>
      <div className="heroStats"><div><b>{hotels.length}</b><span>掲載施設</span></div><div><b>5000</b><span>初回コイン</span></div><div><b>24h</b><span>いつでも検索</span></div></div>
    </section>

    <section className="section">
      <div className="sectionTitle"><div><div className="eyebrow">DISCOVER</div><h2>宿を探す</h2></div><span>{loading?'読込中':`${list.length}件`}</span></div>
      <div className="chips">{prefectures.map(x=><button key={x} className={'chip '+(pref===x?'active':'')} onClick={()=>setPref(x)}>{x}</button>)}</div>
      <div className="sortRow"><span>おすすめの宿</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recommended">おすすめ順</option><option value="coin_asc">コインが少ない順</option><option value="rating">評価順</option></select></div>
      {loading?<div className="skeletonGrid"><div/><div/></div>:<div className="grid">{list.map(h=><article className="card hotelCard" key={h.id}>
        <div className="photoWrap"><Link href={`/hotels/${h.slug}`}><img src={h.image_url||fallback[0].image_url!} alt={h.name}/></Link><span className="badge">★ {Number(h.rating).toFixed(1)} <small>({h.review_count})</small></span>{h.featured&&<span className="featured">人気</span>}<button aria-label="お気に入り" className={'favBtn '+(favs.includes(h.id)?'liked':'')} onClick={()=>toggle(h.id)}>{favs.includes(h.id)?'♥':'♡'}</button></div>
        <div className="cardBody"><div className="meta">{h.prefecture}・{h.city}</div><Link href={`/hotels/${h.slug}`} className="hotelTitle">{h.name}</Link><div className="amenityLine">{(h.amenities||[]).slice(0,3).map(a=><span key={a}>{a}</span>)}</div><div className="priceRow"><div className="price"><b>●</b> {h.coin.toLocaleString()} <small>coin / 泊〜</small></div><Link className="detailArrow" href={`/hotels/${h.slug}`}>›</Link></div></div>
      </article>)}</div>}
    </section>

    <section className="section softSection" id="favorites"><div className="sectionTitle"><div><div className="eyebrow">SAVED</div><h2>お気に入り</h2></div><span>{favs.length}件</span></div>{favs.length?<div className="miniGrid">{hotels.filter(h=>favs.includes(h.id)).map(h=><Link className="miniCard" href={`/hotels/${h.slug}`} key={h.id}><img src={h.image_url||fallback[0].image_url!} alt=""/><div><b>{h.name}</b><span>{h.area}・{h.coin.toLocaleString()} coin〜</span></div></Link>)}</div>:<div className="empty"><b>まだ保存した宿はありません</b><span>♡ をタップすると、ここにまとめて表示されます。</span></div>}</section>
  </>
}
