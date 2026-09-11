import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const PACKAGES: Record<string,{amount:number,coins:number,label:string}> = {
  starter:{amount:1000,coins:1000,label:'1,000 coin'},
  standard:{amount:3000,coins:3200,label:'3,200 coin'},
  premium:{amount:5000,coins:5500,label:'5,500 coin'},
}

export async function POST(req:NextRequest){
  const secret=process.env.STRIPE_SECRET_KEY
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!secret||!url||!key) return NextResponse.json({error:'決済設定が未完了です。'},{status:503})

  const auth=req.headers.get('authorization')||''
  const token=auth.startsWith('Bearer ')?auth.slice(7):''
  if(!token) return NextResponse.json({error:'ログインが必要です。'},{status:401})

  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:{user}}=await supabase.auth.getUser(token)
  if(!user) return NextResponse.json({error:'ログインが必要です。'},{status:401})

  const body=await req.json().catch(()=>({})) as {packageId?:string}
  const pkg=body.packageId?PACKAGES[body.packageId]:undefined
  if(!pkg) return NextResponse.json({error:'無効なコインパックです。'},{status:400})

  const stripe=new Stripe(secret)
  const origin=req.nextUrl.origin
  const session=await stripe.checkout.sessions.create({
    mode:'payment',
    payment_method_types:['card'],
    line_items:[{quantity:1,price_data:{currency:'jpy',unit_amount:pkg.amount,product_data:{name:`TripNest ${pkg.label}`,description:`TripNestで使える${pkg.coins.toLocaleString()}コイン`}}}],
    success_url:`${origin}/coins?status=success`,
    cancel_url:`${origin}/coins?status=cancelled`,
    customer_email:user.email,
    metadata:{user_id:user.id,coins:String(pkg.coins),package_id:body.packageId||''}
  })
  return NextResponse.json({url:session.url})
}
