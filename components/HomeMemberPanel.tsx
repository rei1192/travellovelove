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
  if(!profile)return <section className="homeMemberShell"><div className="joinCard"><div><span className="microLabel">TRIPNEST MEMBER</span><h2>会員登録でもっと便利に。</h2><p>無料会員登録で5,000コインを付与。保存したホテルや予約、旅程を、どの端末からでも確認できます。</p></div><Link href="/account">無料で会員登録</Link></div></section>
  return <section className="homeMemberShell"><div className="memberDashboard"><div className="walletMini"><div><span>こんにちは</span><b>{profile.display_name||'TripNestメンバー'}さん</b></div><div><small>保有コイン</small><strong>● {profile.coin_balance.toLocaleString()}</strong><Link href="/coins" style={{display:'block',fontSize:9,marginTop:5,textDecoration:'none'}}>コインを追加する →</Link></div></div>{trip?<Link href="/reservations" className="nextTripCard"><div><span className="microLabel light">NEXT TRIP</span><h3>{trip.hotels?.name||'次の旅行'}</h3><p>{trip.check_in} → {trip.check_out} ・ {trip.total_nights}泊</p></div><span className="nextTripArrow">›</span></Link>:<div className="noTripCard"><div><span className="microLabel">NEXT TRIP</span><b>次の旅行はまだ決まっていません</b><p>気になるホテルを保存して、次の旅の候補を見つけましょう。</p></div><Link href="/saved">保存したホテルを見る</Link></div>}</div></section>
}
