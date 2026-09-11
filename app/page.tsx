import Link from 'next/link'
import HotelExplorer from '@/components/HotelExplorer'
import HomeMemberPanel from '@/components/HomeMemberPanel'

export default function Home(){
  return <main>
    <HotelExplorer/>
    <HomeMemberPanel/>
    <section className="promo premiumPromo"><div className="eyebrow" style={{color:'#8de6f7'}}>TRIPNEST MEMBER</div><h2>探す、保存する、予約する。<br/>旅をひとつの流れに。</h2><p>実在ホテルを中心に、Googleマップで場所を確認しながら候補を保存。会員ならコイン予約と旅程管理までまとめて使えます。</p><div className="promoActions"><Link href="/account" className="primaryLink">無料で始める</Link><Link href="/map" className="secondaryLink">地図から探す</Link></div></section>
  </main>
}
