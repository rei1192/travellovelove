import Link from 'next/link'
import AuthPanel from '@/components/AuthPanel'

export default function AccountPage(){
  return <main><section className="hero compactHero accountHero"><div className="eyebrow">MY TRIPNEST</div><h1>マイページ</h1><p>会員情報や保有コイン、保存したホテル、予約内容をまとめて確認できます。</p></section><section className="panel premiumPanel"><AuthPanel/></section><section className="section"><div className="sectionTitle"><div><div className="eyebrow">YOUR TRAVEL</div><h2>メニュー</h2></div></div><div className="menuGrid premiumMenu"><Link href="/coins"><b>● コインを追加</b><span>Stripeの決済画面から安全に購入できます</span></Link><Link href="/reservations"><b>✦ 予約・旅程</b><span>予約内容、日程、経路、キャンセルを確認</span></Link><Link href="/saved"><b>♡ 保存したホテル</b><span>気になるホテルをまとめて確認・比較</span></Link><Link href="/map"><b>⌖ 地図から探す</b><span>ホテルの場所や周辺スポットをGoogleマップで確認</span></Link><Link href="/"><b>⌕ ホテルを探す</b><span>実在するホテルから次の宿を探す</span></Link></div></section></main>
}
