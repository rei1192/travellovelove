import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'TripNest | 旅をもっと自由に',
  description: '全国の宿を探して、保存して、コインで予約できるトラベルメンバーシップ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="appShell">
          <header className="topbar">
            <Link href="/" className="brand">Trip<span>Nest</span></Link>
            <div className="topActions"><Link href="/reservations" className="ghostLink">予約</Link><Link href="/account" className="accountLink">マイページ</Link></div>
          </header>
          {children}
          <nav className="bottomNav">
            <Link href="/">⌂<span>ホーム</span></Link>
            <Link href="/#search">⌕<span>探す</span></Link>
            <Link href="/#favorites">♡<span>保存</span></Link>
            <Link href="/reservations">▣<span>予約</span></Link>
            <Link href="/account">◎<span>アカウント</span></Link>
          </nav>
        </div>
      </body>
    </html>
  )
}
