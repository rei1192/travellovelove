'use client'
import {useEffect,useState} from 'react'

type PlaceData={configured?:boolean;rating?:number;userRatingCount?:number;websiteUri?:string;googleMapsUri?:string;nationalPhoneNumber?:string;formattedAddress?:string;photoUrl?:string;displayName?:{text?:string}}

export default function GooglePlaceLive({placeId}:{placeId?:string|null}){
  const [data,setData]=useState<PlaceData|null>(null)
  const [loading,setLoading]=useState(Boolean(placeId))
  useEffect(()=>{if(!placeId){setLoading(false);return}fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`).then(r=>r.json()).then(setData).catch(()=>setData(null)).finally(()=>setLoading(false))},[placeId])
  if(!placeId)return null
  if(loading)return <div className="livePlaceCard"><span>Google Placesを確認中...</span></div>
  if(!data?.configured)return <div className="livePlaceCard muted"><b>Google Places連携準備済み</b><span>APIキーを設定すると最新評価・写真・公式サイトを自動表示します。</span></div>
  return <div className="livePlaceCard">
    {data.photoUrl&&<img src={data.photoUrl} alt={data.displayName?.text||'Hotel'}/>}<div className="livePlaceBody"><div><small>LIVE FROM GOOGLE</small><b>★ {data.rating?.toFixed(1)||'-'} <span>{data.userRatingCount?`${data.userRatingCount.toLocaleString()}件`:''}</span></b></div>{data.formattedAddress&&<p>{data.formattedAddress}</p>}<div className="livePlaceActions">{data.googleMapsUri&&<a href={data.googleMapsUri} target="_blank" rel="noreferrer">Googleマップ</a>}{data.websiteUri&&<a href={data.websiteUri} target="_blank" rel="noreferrer">公式サイト</a>}</div></div>
  </div>
}
