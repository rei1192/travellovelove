import Link from 'next/link'
import HotelExplorer from '@/components/HotelExplorer'

export default function Home(){
  return <main><HotelExplorer/><section className="promo"><div className="eyebrow" style={{color:'#8de6f7'}}>TRIPNEST MEMBER</div><h2>旅を、会員体験に。</h2><p>新規登録で5,000コイン。ホテル検索、お気に入り同期、コイン予約、予約履歴までひとつのアカウントで管理できます。</p><Link href="/account" className="primaryLink" style={{background:'#fff',color:'#111',marginTop:16}}>無料で始める</Link></section></main>
}
