'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Profile,Reservation} from '@/lib/types'

export default function HomeMemberPanel(){
  const [profile,setProfile]=useState<Profile|null>(null)
  const [trip,setTrip]=useState<Reservation|null>(null)
  const [loaded,setLoaded]=useState(false)
  useEffect(()=>{void load()},[])
  async function load(){
    const sb=getSupabaseClient();if(!sb){setLoaded(true);return}
    const {data:{user}}=await sb.auth.getUser();if(!user){setLoaded(true);return}
    const [{data:p},{data:r}]=await Promise.all([
      sb.from('profiles').select('*').eq('id',user.id).single(),
      sb.from('reservations').select('*,hotels(name,slug,image_url,area)').eq('user_id',user.id).eq('status','confirmed').gte('check_out',new Date().toISOString().slice(0,10)).order('check_in',{ascending:true}).limit(1)
    ])
    setProfile((p as Profile|null)||null)
    setTrip(((r||[])[0] as Reservation|undefined)||null)
    setLoaded(true)
  }
  if(!loaded)return <section className="homeMemberShell"><div className="homeMemberSkeleton"/></section>
  if(!profile)return <section className="homeMemberShell"><div className="joinCard"><div><span className="microLabel">TRIPNEST MEMBER</span><h2>旅の管理を、ひとつに。</h2><p>無料登録で5,000 coin。保存した宿、予約、旅程をどの端末からでも管理できます。</p></div><Link href="/account">無料で始める</Link></div></section>
  return <section className="homeMemberShell"><div className="memberDashboard"><div className="walletMini"><div><span>こんにちは</span><b>{profile.display_name||'TripNest Member'}</b></div><div><small>保有コイン</small><strong>● {profile.coin_balance.toLocaleString()}</strong></div></div>{trip?<Link href="/reservations" className="nextTripCard"><div><span className="microLabel light">NEXT TRIP</span><h3>{trip.hotels?.name||'次の旅行'}</h3><p>{trip.check_in} → {trip.check_out} ・ {trip.total_nights}泊</p></div><span className="nextTripArrow">›</span></Link>:<div className="noTripCard"><div><span className="microLabel">NEXT TRIP</span><b>次の旅はまだ未定です</b><p>気になるホテルを保存して、旅の候補を作りましょう。</p></div><Link href="/saved">保存を見る</Link></div>}</div></section>
}
