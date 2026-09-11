'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Profile} from '@/lib/types'

export default function AuthPanel(){
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [displayName,setDisplayName]=useState('')
  const [userEmail,setUserEmail]=useState('');const [profile,setProfile]=useState<Profile|null>(null);const [msg,setMsg]=useState('');const [busy,setBusy]=useState(false)
  useEffect(()=>{const sb=getSupabaseClient();if(!sb)return;void refresh(sb);const{data}=sb.auth.onAuthStateChange(()=>void refresh(sb));return()=>data.subscription.unsubscribe()},[])
  async function refresh(sb:NonNullable<ReturnType<typeof getSupabaseClient>>){const {data:{user}}=await sb.auth.getUser();setUserEmail(user?.email||'');if(!user){setProfile(null);return}const {data}=await sb.from('profiles').select('*').eq('id',user.id).single();setProfile((data as Profile|null)||null);if(data?.display_name)setDisplayName(data.display_name)}
  const sb=getSupabaseClient();if(!sb)return <div className="message">Supabase環境変数が未設定です。</div>;const client=sb
  async function signUp(){setBusy(true);setMsg('登録処理中...');const{error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName||email.split('@')[0]}}});setMsg(error?error.message:'登録しました。確認メールが届いた場合は認証してください。');setBusy(false)}
  async function signIn(){setBusy(true);setMsg('ログイン中...');const{error}=await client.auth.signInWithPassword({email,password});setMsg(error?error.message:'ログインしました。');setBusy(false)}
  async function signOut(){await client.auth.signOut();setProfile(null);setMsg('ログアウトしました。')}
  async function saveProfile(){const {data:{user}}=await client.auth.getUser();if(!user)return;setBusy(true);const{error}=await client.from('profiles').update({display_name:displayName}).eq('id',user.id);setMsg(error?error.message:'プロフィールを更新しました。');await refresh(client);setBusy(false)}
  if(userEmail)return <div className="memberPanel"><div className="memberTop"><div className="avatarCircle">{(profile?.display_name||userEmail).slice(0,1).toUpperCase()}</div><div><small>ログイン中</small><h3>{profile?.display_name||'TripNest Member'}</h3><span>{userEmail}</span></div></div><div className="coinWallet"><span>保有コイン</span><strong>● {(profile?.coin_balance??0).toLocaleString()}</strong></div><div className="field"><label>表示名</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="表示名"/></div><button className="primary" disabled={busy} onClick={saveProfile}>プロフィールを保存</button><div className="quickLinks"><Link href="/reservations">予約履歴を見る</Link><Link href="/#favorites">お気に入りを見る</Link>{profile?.is_admin&&<Link href="/admin">管理画面</Link>}</div><button className="secondary" onClick={signOut}>ログアウト</button>{msg&&<div className="message">{msg}</div>}</div>
  return <div className="authPanel"><div className="authIntro"><div className="eyebrow">MEMBERSHIP</div><h2>TripNestメンバーになる</h2><p>登録すると5,000コインからスタート。お気に入り同期、予約、予約履歴が使えます。</p></div><div className="field"><label>表示名</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="例：たび好き"/></div><div className="field"><label>メールアドレス</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com"/></div><div className="field"><label>パスワード</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="6文字以上"/></div><button className="primary" disabled={busy||!email||password.length<6} onClick={signIn}>ログイン</button><button className="secondary" disabled={busy||!email||password.length<6} onClick={signUp}>新規会員登録</button>{msg&&<div className="message">{msg}</div>}</div>
}
