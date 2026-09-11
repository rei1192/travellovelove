'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import type {Profile} from '@/lib/types'

type Mode='login'|'signup'

function authMessage(message:string){
  const m=message.toLowerCase()
  if(m.includes('invalid login credentials'))return 'メールアドレスまたはパスワードが正しくありません。'
  if(m.includes('email not confirmed'))return 'メールアドレスの確認が完了していません。確認メール内のリンクを開いてください。'
  if(m.includes('user already registered')||m.includes('already been registered'))return 'このメールアドレスはすでに登録されています。ログインをお試しください。'
  if(m.includes('password should be at least'))return 'パスワードは6文字以上で入力してください。'
  if(m.includes('unable to validate email')||m.includes('invalid email'))return 'メールアドレスの形式を確認してください。'
  if(m.includes('rate limit'))return '操作が続いたため、一時的に制限されています。少し時間をおいてからもう一度お試しください。'
  return '処理を完了できませんでした。入力内容を確認して、もう一度お試しください。'
}

export default function AuthPanel(){
  const [mode,setMode]=useState<Mode>('login')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [displayName,setDisplayName]=useState('')
  const [userEmail,setUserEmail]=useState('')
  const [profile,setProfile]=useState<Profile|null>(null)
  const [msg,setMsg]=useState('')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    const sb=getSupabaseClient();if(!sb)return
    void refresh(sb)
    const{data}=sb.auth.onAuthStateChange(()=>void refresh(sb))
    return()=>data.subscription.unsubscribe()
  },[])

  async function refresh(sb:NonNullable<ReturnType<typeof getSupabaseClient>>){
    const {data:{user}}=await sb.auth.getUser()
    setUserEmail(user?.email||'')
    if(!user){setProfile(null);return}
    const {data}=await sb.from('profiles').select('*').eq('id',user.id).single()
    setProfile((data as Profile|null)||null)
    if(data?.display_name)setDisplayName(data.display_name)
  }

  const sb=getSupabaseClient()
  if(!sb)return <div className="message">現在、会員機能の設定を確認中です。</div>
  const client=sb

  async function signUp(){
    setMsg('')
    if(!displayName.trim()){setMsg('表示名を入力してください。');return}
    if(!email.trim()){setMsg('メールアドレスを入力してください。');return}
    if(password.length<6){setMsg('パスワードは6文字以上で入力してください。');return}
    if(password!==confirmPassword){setMsg('確認用パスワードが一致していません。');return}
    setBusy(true)
    const redirectTo=typeof window!=='undefined'?`${window.location.origin}/account`:undefined
    const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{data:{display_name:displayName.trim()},emailRedirectTo:redirectTo}})
    if(error)setMsg(authMessage(error.message))
    else if(data.session)setMsg('会員登録が完了しました。TripNestへようこそ！')
    else setMsg('会員登録を受け付けました。確認メールを送信したので、メール内のリンクを開いて登録を完了してください。')
    setBusy(false)
  }

  async function signIn(){
    setMsg('')
    if(!email.trim()||!password){setMsg('メールアドレスとパスワードを入力してください。');return}
    setBusy(true)
    const{error}=await client.auth.signInWithPassword({email:email.trim(),password})
    setMsg(error?authMessage(error.message):'ログインしました。')
    setBusy(false)
  }

  async function signOut(){await client.auth.signOut();setProfile(null);setMsg('ログアウトしました。')}
  async function saveProfile(){const {data:{user}}=await client.auth.getUser();if(!user)return;setBusy(true);const{error}=await client.from('profiles').update({display_name:displayName.trim()}).eq('id',user.id);setMsg(error?'表示名を更新できませんでした。もう一度お試しください。':'表示名を更新しました。');await refresh(client);setBusy(false)}

  if(userEmail)return <div className="memberPanel"><div className="memberTop"><div className="avatarCircle">{(profile?.display_name||userEmail).slice(0,1).toUpperCase()}</div><div><small>ログイン中</small><h3>{profile?.display_name||'TripNestメンバー'}</h3><span>{userEmail}</span></div></div><div className="coinWallet"><span>保有コイン</span><strong>● {(profile?.coin_balance??0).toLocaleString()}</strong></div><div className="field"><label>表示名</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="表示名"/></div><button className="primary" disabled={busy} onClick={saveProfile}>表示名を保存する</button><div className="quickLinks"><Link href="/coins">コインを追加</Link><Link href="/reservations">予約・旅程</Link><Link href="/saved">保存したホテル</Link><Link href="/map">地図から探す</Link>{profile?.is_admin&&<Link href="/admin">管理画面</Link>}</div><button className="secondary" onClick={signOut}>ログアウト</button>{msg&&<div className="message">{msg}</div>}</div>

  return <div className="authPanel">
    <div className="authIntro"><div className="eyebrow">MEMBERSHIP</div><h2>{mode==='signup'?'TripNestに新規登録':'TripNestにログイン'}</h2><p>{mode==='signup'?'無料会員登録で5,000コインを付与。ホテルの保存、予約、旅程管理を利用できます。':'登録済みのメールアドレスとパスワードでログインしてください。'}</p></div>
    <div className="authTabs"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setMsg('')}}>ログイン</button><button className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setMsg('')}}>新規会員登録</button></div>
    {mode==='signup'&&<div className="field"><label>表示名</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="例：たび好き" autoComplete="nickname"/></div>}
    <div className="field"><label>メールアドレス</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email"/></div>
    <div className="field"><label>パスワード</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="6文字以上" autoComplete={mode==='signup'?'new-password':'current-password'}/></div>
    {mode==='signup'&&<div className="field"><label>パスワード（確認）</label><input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} type="password" placeholder="もう一度入力してください" autoComplete="new-password"/></div>}
    {mode==='login'?<button className="primary" disabled={busy} onClick={signIn}>{busy?'ログイン中...':'ログイン'}</button>:<button className="primary" disabled={busy} onClick={signUp}>{busy?'登録中...':'無料で会員登録する'}</button>}
    {msg&&<div className="message toastMessage">{msg}</div>}
  </div>
}
