'use client'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'

type Hotel={id:string;name:string;area:string;coin:number;rating:number;image:string}
const hotels:Hotel[]=[
{id:'fukuoka-harbor',name:'Fukuoka Harbor Stay',area:'福岡市',coin:690,rating:4.7,image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'},
{id:'hakata-riverside',name:'Hakata Riverside Hotel',area:'福岡市',coin:780,rating:4.6,image:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80'},
{id:'kumamoto-castle',name:'Kumamoto Castle View',area:'熊本市',coin:840,rating:4.8,image:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80'},
{id:'beppu-onsen',name:'Beppu Onsen Terrace',area:'別府市',coin:980,rating:4.9,image:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'},
{id:'sapporo-grand',name:'Sapporo Grand Stay',area:'札幌市',coin:760,rating:4.6,image:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'},
{id:'okinawa-beach',name:'Okinawa Beach Resort',area:'恩納村',coin:1380,rating:4.9,image:'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'}]

export default function HotelExplorer(){
 const[q,setQ]=useState('');const[favs,setFavs]=useState<string[]>([]);const[area,setArea]=useState('すべて')
 useEffect(()=>{setFavs(JSON.parse(localStorage.getItem('tripnest-favs')||'[]'))},[])
 const list=useMemo(()=>hotels.filter(h=>(area==='すべて'||h.area.includes(area))&&(h.name+h.area).toLowerCase().includes(q.toLowerCase())),[q,area])
 async function toggle(id:string){
  const on=favs.includes(id);const next=on?favs.filter(x=>x!==id):[...favs,id];setFavs(next);localStorage.setItem('tripnest-favs',JSON.stringify(next))
  const sb=getSupabaseClient();if(!sb)return;const {data:{user}}=await sb.auth.getUser();if(!user)return
  if(on) await sb.from('favorites').delete().eq('user_id',user.id).eq('hotel_id',id)
  else await sb.from('favorites').upsert({user_id:user.id,hotel_id:id},{onConflict:'user_id,hotel_id'})
 }
 return <>
  <section className="hero" id="search"><div className="eyebrow">TRAVEL MEMBERSHIP</div><h1>次の旅を、もっと自由に。</h1><p>気になる宿を探して、お気に入り保存。会員登録すると端末をまたいで管理できます。</p><div className="searchBox"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="エリア・ホテル名を検索"/><button>検索</button></div></section>
  <section className="section"><div className="sectionTitle"><h2>おすすめの宿</h2><span>{list.length}件</span></div><div className="chips">{['すべて','福岡','熊本','別府','札幌','恩納'].map(x=><button key={x} className={'chip '+(area===x?'active':'')} onClick={()=>setArea(x)}>{x}</button>)}</div><div className="grid" style={{marginTop:14}}>{list.map(h=><article className="card" key={h.id}><div className="photoWrap"><img src={h.image} alt={h.name}/><span className="badge">★ {h.rating}</span><button className="favBtn" onClick={()=>toggle(h.id)}>{favs.includes(h.id)?'♥':'♡'}</button></div><div className="cardBody"><h3>{h.name}</h3><div className="meta">{h.area} ・ 高評価</div><div className="price"><b>●</b> {h.coin.toLocaleString()} coin〜 / 泊</div></div></article>)}</div></section>
  <section className="section" id="favorites"><div className="sectionTitle"><h2>お気に入り</h2><span>{favs.length}件</span></div>{favs.length?<div className="grid">{hotels.filter(h=>favs.includes(h.id)).map(h=><article className="card" key={h.id}><div className="photoWrap"><img src={h.image} alt={h.name}/></div><div className="cardBody"><h3>{h.name}</h3><div className="meta">{h.area}</div></div></article>)}</div>:<div className="empty">♡ を押した宿がここに表示されます</div>}</section>
 </>
}
