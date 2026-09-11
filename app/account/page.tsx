import Link from 'next/link'
import AuthPanel from '@/components/AuthPanel'

export default function AccountPage(){
  return <main><section className="hero compactHero"><div className="eyebrow">MY TRIPNEST</div><h1>マイページ</h1><p>会員情報、コイン、予約、お気に入りをひとつに。</p></section><section className="panel premiumPanel"><AuthPanel/></section><section className="section"><div className="sectionTitle"><h2>メニュー</h2></div><div className="menuGrid"><Link href="/reservations"><b>予約履歴</b><span>予約番号・日程・キャンセル</span></Link><Link href="/#favorites"><b>お気に入り</b><span>保存したホテルを確認</span></Link><Link href="/"><b>宿を探す</b><span>全国のホテルを検索</span></Link></div></section></main>
}
