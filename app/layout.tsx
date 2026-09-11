import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'TripNest',
  description: '旅をもっと自由に楽しむ宿泊アプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="appShell">
          <header className="topbar">
            <Link href="/" className="brand">Trip<span>Nest</span></Link>
            <Link href="/account" className="accountLink">マイページ</Link>
          </header>
          {children}
          <nav className="bottomNav">
            <Link href="/">⌂<span>ホーム</span></Link>
            <Link href="/#search">⌕<span>探す</span></Link>
            <Link href="/#favorites">♡<span>お気に入り</span></Link>
            <Link href="/account">◎<span>アカウント</span></Link>
          </nav>
        </div>
      </body>
    </html>
  )
}
