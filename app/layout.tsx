import './globals.css'
import './advanced.css'
import Link from 'next/link'

export const metadata = {
  title: 'TripNest | 旅をもっと自由に',
  description: '実在ホテルを検索・保存・地図・予約までひとつにまとめたトラベルアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="appShell">
          <header className="topbar">
            <Link href="/" className="brand">Trip<span>Nest</span></Link>
            <div className="topActions"><Link href="/map" className="ghostLink">地図</Link><Link href="/account" className="accountLink">マイページ</Link></div>
          </header>
          {children}
          <nav className="bottomNav premiumBottomNav">
            <Link href="/"><b>⌂</b><span>ホーム</span></Link>
            <Link href="/map"><b>◉</b><span>マップ</span></Link>
            <Link href="/saved"><b>♡</b><span>保存</span></Link>
            <Link href="/reservations"><b>▣</b><span>予約</span></Link>
            <Link href="/account"><b>◎</b><span>アカウント</span></Link>
          </nav>
        </div>
      </body>
    </html>
  )
}
