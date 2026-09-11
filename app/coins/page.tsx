'use client'
import Link from 'next/link'
import {useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'

const packs=[
  {id:'starter',price:'¥1,000',coins:'1,000',sub:'まずは気軽に'},
  {id:'standard',price:'¥3,000',coins:'3,200',sub:'200 coin ボーナス'},
  {id:'premium',price:'¥5,000',coins:'5,500',sub:'500 coin ボーナス'},
]

export default function CoinsPage(){
  const [busy,setBusy]=useState(''); const [msg,setMsg]=useState('')
  async function buy(packageId:string){
    const sb=getSupabaseClient();if(!sb){setMsg('Supabase設定が必要です。');return}
    const {data:{session}}=await sb.auth.getSession();if(!session){setMsg('コイン購入にはログインが必要です。');return}
    setBusy(packageId);setMsg('Stripe決済画面を準備しています...')
    const res=await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({packageId})})
    const data=await res.json();setBusy('')
    if(!res.ok||!data.url){setMsg(data.error||'決済を開始できませんでした。');return}
    window.location.href=data.url
  }
  return <main><section className="pageHero coinHero"><div className="eyebrow">TRIPNEST COIN</div><h1>コインを追加</h1><p>ホテル予約に使えるTripNestコイン。Stripeの安全な決済画面で購入できます。</p></section><section className="section"><div className="coinPackGrid">{packs.map((p,i)=><article className={'coinPack '+(i===1?'recommended':'')} key={p.id}>{i===1&&<span className="coinPackBadge">おすすめ</span>}<small>{p.sub}</small><strong>● {p.coins} coin</strong><b>{p.price}</b><button className="primary" disabled={Boolean(busy)} onClick={()=>buy(p.id)}>{busy===p.id?'準備中...':'購入する'}</button></article>)}</div>{msg&&<div className="message toastMessage">{msg}</div>}<div className="coinNotice"><b>決済について</b><span>Stripe Checkoutを利用します。決済完了後、Webhookでコイン残高に自動反映されます。</span><Link href="/account">マイページへ戻る</Link></div></section></main>
}
