import AuthPanel from '@/components/AuthPanel'

export default function AccountPage(){
  return <main><section className="hero"><div className="eyebrow">MY TRIPNEST</div><h1>マイページ</h1><p>会員登録・ログインすると、お気に入りをSupabaseに保存できます。</p></section><section className="panel"><h2>アカウント</h2><AuthPanel/></section><section className="panel"><h2>予約履歴</h2><div className="empty">予約機能は次のアップデートで接続します</div></section></main>
}
