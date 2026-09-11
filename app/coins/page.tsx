'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'

const packs=[
  {id:'starter',price:'¥1,000',coins:'1,000',sub:'まずは気軽に',url:'https://buy.stripe.com/test_14AbJ27S14Poalt0N7a3u00'},
  {id:'standard',price:'¥3,000',coins:'3,200',sub:'200 coin ボーナス',url:'https://buy.stripe.com/test_6oU9AU2xHgy6altdzTa3u01'},
  {id:'premium',price:'¥5,000',coins:'5,500',sub:'500 coin ボーナス',url:'https://buy.stripe.com/test_9B65kE5JTfu21OX7bva3u02'},
]

export default function CoinsPage(){
  const [busy,setBusy]=useState(''); const [msg,setMsg]=useState('')
  useEffect(()=>{const s=new URLSearchParams(window.location.search).get('status');if(s==='success')setMsg('テスト決済が完了しました。コイン残高はWebhook処理後に反映されます。');if(s==='cancelled')setMsg('決済をキャンセルしました。')},[])
  async function buy(packageId:string){
    const sb=getSupabaseClient();if(!sb){setMsg('Supabase設定が必要です。');return}
    const {data:{user}}=await sb.auth.getUser();if(!user){setMsg('コイン購入にはログインが必要です。');return}
    const pack=packs.find(p=>p.id===packageId);if(!pack)return
    setBusy(packageId);setMsg('Stripeのテスト決済画面へ移動します...')
    const params=new URLSearchParams({client_reference_id:user.id})
    if(user.email)params.set('prefilled_email',user.email)
    window.location.href=`${pack.url}?${params.toString()}`
  }
  return <main><section className="pageHero coinHero"><div className="eyebrow">TRIPNEST COIN</div><h1>コインを追加</h1><p>ホテル予約に使えるTripNestコイン。Stripe Checkoutで安全に決済できます。</p><div className="testModePill">TEST MODE・実際の請求は発生しません</div></section><section className="section"><div className="coinPackGrid">{packs.map((p,i)=><article className={'coinPack '+(i===1?'recommended':'')} key={p.id}>{i===1&&<span className="coinPackBadge">おすすめ</span>}<small>{p.sub}</small><strong>● {p.coins} coin</strong><b>{p.price}</b><button className="primary" disabled={Boolean(busy)} onClick={()=>buy(p.id)}>{busy===p.id?'移動中...':'テスト購入'}</button></article>)}</div>{msg&&<div className="message toastMessage">{msg}</div>}<div className="coinNotice"><b>決済について</b><span>現在はStripeテストモードです。決済完了イベントは署名検証後、Webhook経由でSupabaseのコイン残高へ反映されます。同じ決済が再送されても二重加算されません。</span><Link href="/account">マイページへ戻る</Link></div></section></main>
}
