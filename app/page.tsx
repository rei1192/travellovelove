import Link from 'next/link'
import HotelExplorer from '@/components/HotelExplorer'
import HomeMemberPanel from '@/components/HomeMemberPanel'

export default function Home(){
  return <main>
    <HotelExplorer/>
    <HomeMemberPanel/>
    <section className="promo premiumPromo"><div className="eyebrow" style={{color:'#8de6f7'}}>TRIPNEST MEMBER</div><h2>ホテル探しから予約まで、<br/>ひとつのアプリで。</h2><p>実在するホテルを探して、気になる宿を保存。Googleマップで場所を確認し、そのまま予約できます。会員登録すると、コイン残高や予約内容、旅程もまとめて管理できます。</p><div className="promoActions"><Link href="/account" className="primaryLink">無料で会員登録</Link><Link href="/map" className="secondaryLink">地図からホテルを探す</Link></div></section>
  </main>
}
