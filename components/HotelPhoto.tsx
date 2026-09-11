'use client'
import {useEffect,useState} from 'react'

type Props={placeId?:string|null;name:string;className?:string;fallbackClass?:string;children?:React.ReactNode}
type Data={configured?:boolean;photoUrl?:string}

export default function HotelPhoto({placeId,name,className='',fallbackClass='',children}:Props){
  const [photo,setPhoto]=useState<string>('')
  const [loaded,setLoaded]=useState(false)
  useEffect(()=>{
    let active=true
    if(!placeId){setLoaded(true);return}
    fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)
      .then(r=>r.json())
      .then((d:Data)=>{if(active&&d?.photoUrl)setPhoto(d.photoUrl)})
      .catch(()=>{})
      .finally(()=>{if(active)setLoaded(true)})
    return()=>{active=false}
  },[placeId])
  return <div className={`${className} ${!photo?fallbackClass:''}`} style={photo?{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.55)),url("${photo}")`,backgroundSize:'cover',backgroundPosition:'center'}:undefined} aria-label={name}>
    {children}
    {!loaded&&<span className="photoLoading" aria-hidden="true"/>}
  </div>
}
