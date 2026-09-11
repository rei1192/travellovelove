'use client'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'

export default function AuthPanel(){
 const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[userEmail,setUserEmail]=useState('');const[msg,setMsg]=useState('')
 useEffect(()=>{const sb=getSupabaseClient();if(!sb)return;sb.auth.getUser().then(({data})=>setUserEmail(data.user?.email||''));const{data}=sb.auth.onAuthStateChange((_e,s)=>setUserEmail(s?.user?.email||''));return()=>data.subscription.unsubscribe()},[])
 const sb=getSupabaseClient()
 if(!sb)return <div className="message">Supabase環境変数が未設定です。</div>
 async function signUp(){setMsg('処理中...');const{error}=await sb.auth.signUp({email,password});setMsg(error?error.message:'確認メールを送信しました。')}
 async function signIn(){setMsg('処理中...');const{error}=await sb.auth.signInWithPassword({email,password});setMsg(error?error.message:'ログインしました。')}
 async function signOut(){await sb.auth.signOut();setMsg('ログアウトしました。')}
 if(userEmail)return <><p><b>{userEmail}</b> でログイン中</p><button className="secondary" onClick={signOut}>ログアウト</button><div className="message">{msg}</div></>
 return <><div className="field"><label>メールアドレス</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com"/></div><div className="field"><label>パスワード</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="8文字以上推奨"/></div><button className="primary" onClick={signIn}>ログイン</button><button className="secondary" onClick={signUp}>新規会員登録</button><div className="message">{msg}</div></>
}
