import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req:NextRequest){
  const webhookSecret=process.env.STRIPE_WEBHOOK_SECRET
  const webhookToken=process.env.TRIPNEST_WEBHOOK_TOKEN
  const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!webhookSecret||!webhookToken||!supabaseUrl||!publishableKey) return NextResponse.json({error:'Webhook not configured'},{status:503})

  const signature=req.headers.get('stripe-signature')
  if(!signature) return NextResponse.json({error:'Missing signature'},{status:400})

  const stripe=new Stripe('sk_test_placeholder')
  let event:Stripe.Event
  try{
    event=stripe.webhooks.constructEvent(await req.text(),signature,webhookSecret)
  }catch{
    return NextResponse.json({error:'Invalid signature'},{status:400})
  }

  if(event.type==='checkout.session.completed'){
    const session=event.data.object as Stripe.Checkout.Session
    if(session.payment_status==='paid'){
      const userId=session.client_reference_id
      const coins=Number(session.metadata?.coins||0)
      if(userId&&coins>0){
        const supabase=createClient(supabaseUrl,publishableKey,{auth:{persistSession:false,autoRefreshToken:false}})
        const {error}=await supabase.rpc('credit_coin_purchase_webhook',{
          p_webhook_token:webhookToken,
          p_user_id:userId,
          p_stripe_session_id:session.id,
          p_stripe_payment_intent:typeof session.payment_intent==='string'?session.payment_intent:'',
          p_amount_jpy:session.amount_total||0,
          p_coins:coins
        })
        if(error) return NextResponse.json({error:error.message},{status:500})
      }
    }
  }
  return NextResponse.json({received:true})
}
