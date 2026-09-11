import './globals.css'
import './advanced.css'
import './polish.css'
import Link from 'next/link'
import AppNavigation from '@/components/AppNavigation'

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
          <AppNavigation/>
        </div>
      </body>
    </html>
  )
}
