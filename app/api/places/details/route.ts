import { NextRequest, NextResponse } from 'next/server'

export async function GET(req:NextRequest){
  const key=process.env.GOOGLE_MAPS_API_KEY
  const placeId=req.nextUrl.searchParams.get('placeId')
  if(!placeId) return NextResponse.json({error:'placeId is required'},{status:400})
  if(!key) return NextResponse.json({configured:false})

  const fields=['id','displayName','rating','userRatingCount','googleMapsUri','websiteUri','nationalPhoneNumber','formattedAddress','photos'].join(',')
  const res=await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,{
    headers:{'X-Goog-Api-Key':key,'X-Goog-FieldMask':fields},
    next:{revalidate:3600}
  })
  if(!res.ok) return NextResponse.json({error:'Google Places request failed'},{status:res.status})
  const data=await res.json()
  const photoName=data.photos?.[0]?.name as string|undefined
  let photoUrl:string|undefined
  if(photoName){
    const photoRes=await fetch(`https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(key)}`)
    if(photoRes.ok){const p=await photoRes.json();photoUrl=p.photoUri}
  }
  return NextResponse.json({configured:true,...data,photoUrl})
}
