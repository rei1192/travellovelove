'use client'
import {useEffect,useMemo,useState} from 'react'

type Props={placeId?:string|null;name:string;className?:string;fallbackClass?:string;children?:React.ReactNode}
type Data={configured?:boolean;photoUrl?:string}

const HOTEL_IMAGE_FALLBACKS:Record<string,string>={
  'HOTEL THE FLAG Shinsaibashi':'https://i0.wp.com/chopsticksontheloose.com/wp-content/uploads/2018/09/DSCF9840.jpg?fit=1501%2C1002&ssl=1',
  'Conrad Osaka':'https://pic.k-cdn.media/geoapi/10010043023/picture_1-720x480.jpg',
  'Southwest Grand Hotel':'https://travel.rakuten.co.jp/mytrip/sites/mytrip/files/2024-01/southwestgrand-naha-guide_34_0.jpg',
  'THE BLOSSOM KUMAMOTO':'https://images.trvl-media.com/lodging/60000000/59290000/59288100/59288061/65a0b118.jpg?impolicy=resizecrop&ra=fill&rh=575&rw=575',
  'The Ritz-Carlton, Fukuoka':'https://secure.s.forbestravelguide.com/img/properties/the-ritz-carlton-fukuoka/the-ritz-carlton-fukuoka-exterior.jpg',
  'Grand Hyatt Fukuoka':'https://tenjinsite.jp/upload/topic_photo/700x525_img_tid63435_1.jpg',
  'Sapporo Grand Hotel':'https://res.cloudinary.com/enchanting/c_lfill%2Cq_90%2Cw_400%2Ch_400/artemis-mdm/hotels/c1e53510-82fb-40fc-b7c3-80c1e46978ff.jpg',
  'The Tokyo EDITION, Toranomon':'https://static.wixstatic.com/media/5b317f_0a6cb4030f674a6b945297c1156e7f4a~mv2.jpg/v1/fill/w_980%2Ch_736%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_auto/5b317f_0a6cb4030f674a6b945297c1156e7f4a~mv2.jpg',
  'Hotel Collective':'https://res.cloudinary.com/enchanting/c_lfill%2Cq_90%2Cw_400%2Ch_400/artemis-mdm/d2d74a11-546d-44d6-b457-647f7e16bf21.jpg',
  'Mitsui Garden Hotel Jingugaien Tokyo PREMIER':'https://www.daredemo-tokyo.metro.tokyo.lg.jp/hotel_img/99991_%E4%B8%89%E4%BA%95%E3%82%AC%E3%83%BC%E3%83%87%E3%83%B3%E3%83%9B%E3%83%86%E3%83%AB%E7%A5%9E%E5%AE%AE%E5%A4%96%E8%8B%91%E3%81%AE%E6%9D%9C%E3%83%97%E3%83%AC%E3%83%9F%E3%82%A2_000.jpg',
  'Cross Hotel Sapporo':'https://aw-d.tripcdn.com/images/1mc6z12000egl5hlr00B9.jpg',
  'Mitsui Garden Hotel Fukuoka Gion':'https://trvimg.r10s.jp/share/image_up/172316/origin/51ab710be5b69e87d2e0bf96b5d50bed6de3b6e0.47.9.26.3.jpg?fit=inside%7C888%3A498',
  'Hotel Nikko Kumamoto':'https://nikko-kumamoto.co.jp/en/files/images/home/mv_slide_5.jpg'
}

export default function HotelPhoto({placeId,name,className='',fallbackClass='',children}:Props){
  const fallbackPhoto=useMemo(()=>HOTEL_IMAGE_FALLBACKS[name]||'',[name])
  const [photo,setPhoto]=useState<string>(fallbackPhoto)
  const [loaded,setLoaded]=useState(false)

  useEffect(()=>{
    let active=true
    setPhoto(fallbackPhoto)
    setLoaded(false)
    if(!placeId){setLoaded(true);return}
    fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)
      .then(r=>r.ok?r.json():Promise.reject(new Error('photo lookup failed')))
      .then((d:Data)=>{if(active&&d?.photoUrl)setPhoto(d.photoUrl)})
      .catch(()=>{if(active)setPhoto(fallbackPhoto)})
      .finally(()=>{if(active)setLoaded(true)})
    return()=>{active=false}
  },[placeId,fallbackPhoto])

  return <div className={`${className} ${!photo?fallbackClass:''}`} style={photo?{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.58)),url("${photo}")`,backgroundSize:'cover',backgroundPosition:'center'}:undefined} aria-label={`${name}のホテル画像`}>
    {children}
    {!loaded&&<span className="photoLoading" aria-hidden="true"/>}
  </div>
}
