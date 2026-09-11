'use client'
import Link from 'next/link'
import {useParams,useRouter} from 'next/navigation'
import {useEffect,useMemo,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import GooglePlaceLive from '@/components/GooglePlaceLive'
import HotelPhoto from '@/components/HotelPhoto'
import type {Hotel} from '@/lib/types'

export default function HotelDetailPage(){
  const {slug}=useParams<{slug:string}>(); const router=useRouter()
  const [hotel,setHotel]=useState<Hotel|null>(null); const [loading,setLoading]=useState(true)
  const [checkIn,setCheckIn]=useState(''); const [checkOut,setCheckOut]=useState(''); const [guests,setGuests]=useState(2); const [msg,setMsg]=useState('')
  useEffect(()=>{void load()},[slug])
  async function load(){const sb=getSupabaseClient();if(!sb){setLoading(false);return}const {data}=await sb.from('hotels').select('*').eq('slug',slug).single();setHotel(data as Hotel|null);setLoading(false)}
  const nights=useMemo(()=>{if(!checkIn||!checkOut)return 0;const n=Math.ceil((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000);return Math.max(0,n)},[checkIn,checkOut])
  const total=(hotel?.coin||0)*nights
  async function reserve(){const sb=getSupabaseClient();if(!sb||!hotel)return;setMsg('予約処理中...');const {data:{user}}=await sb.auth.getUser();if(!user){setMsg('予約にはログインが必要です。マイページからログインしてください。');return}const {error}=await sb.rpc('create_reservation',{p_hotel_id:hotel.id,p_check_in:checkIn,p_check_out:checkOut,p_guests:guests});if(error){setMsg(error.message);return}router.push('/reservations')}
  async function share(){if(!hotel)return;const url=window.location.href;if(navigator.share){await navigator.share({title:hotel.name,text:`${hotel.name} - TripNest`,url})}else{await navigator.clipboard.writeText(url);setMsg('ホテルのURLをコピーしました。')}}
  if(loading)return <main><div className="pageLoading">読み込み中...</div></main>
  if(!hotel)return <main><section className="panel"><h2>ホテルが見つかりません</h2><Link href="/">ホームへ戻る</Link></section></main>

  const mapQuery=encodeURIComponent(`${hotel.name} ${hotel.address||hotel.city}`)
  const directionUrl=`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}${hotel.google_place_id?`&destination_place_id=${encodeURIComponent(hotel.google_place_id)}`:''}`
  const amenities=hotel.amenities||[]
  const locationLabel=[hotel.prefecture,hotel.city,hotel.area].filter(Boolean).join('・')
  const facts=[
    {label:'評価',value:`★ ${Number(hotel.rating).toFixed(1)}`},
    {label:'口コミ',value:hotel.review_count?`${hotel.review_count.toLocaleString()}件`:'確認中'},
    {label:'1泊',value:`${hotel.coin.toLocaleString()} coin〜`},
    {label:'エリア',value:hotel.area||hotel.city||hotel.prefecture},
  ]

  const hasAmenity=(word:string)=>amenities.some(a=>a.toLowerCase().includes(word.toLowerCase()))
  const wellness=hasAmenity('スパ')||hasAmenity('温泉')||hasAmenity('大浴場')||hasAmenity('プール')||hasAmenity('フィットネス')
  const food=hasAmenity('朝食')||hasAmenity('レストラン')||hasAmenity('ラウンジ')||hasAmenity('バー')
  const family=hasAmenity('プール')||hasAmenity('ファミリー')||hasAmenity('ベビ')||hasAmenity('キッズ')
  const highRated=Number(hotel.rating)>=4.5
  const manyReviews=(hotel.review_count||0)>=1000

  const appealCards=[
    {icon:'★',title:'選ばれる理由',text:highRated?`評価 ${Number(hotel.rating).toFixed(1)}。宿泊先選びで重視したい評価面でも注目しやすいホテルです。`:`評価 ${Number(hotel.rating).toFixed(1)}。口コミとあわせてホテル選びの参考にできます。`},
    {icon:'⌖',title:'立地をチェック',text:`${locationLabel||'周辺エリア'}に位置。詳細ページの地図から観光地や駅、周辺のお店との距離を確認できます。`},
    {icon:'✦',title:'滞在の充実度',text:amenities.length?`${amenities.slice(0,3).join('・')}など、${amenities.length}項目の設備・サービス情報を掲載しています。`:'設備・サービス情報は順次更新しています。'},
  ]

  const stayTypes=[
    wellness&&{title:'ホテル時間を楽しみたい人',text:'スパ・プール・フィットネスなどの設備情報があり、観光だけでなくホテルで過ごす時間も組み込みやすい滞在先です。'},
    food&&{title:'食事も楽しみたい人',text:'朝食・レストラン・ラウンジなどの設備情報があり、ホテル内での食事時間も旅の楽しみにできます。'},
    family&&{title:'家族旅行を考えている人',text:'ファミリー滞在で使いやすい設備を確認できます。人数や旅程に合わせてチェックしてみてください。'},
    manyReviews&&{title:'口コミ数も重視したい人',text:`口コミ ${hotel.review_count.toLocaleString()}件。多くの利用者評価を参考にしながら比較したい人にも向いています。`},
    {title:'立地を見て選びたい人',text:`${hotel.city||hotel.prefecture}での観光や移動ルートを地図で確認しながら、旅程に合うか判断できます。`},
  ].filter(Boolean).slice(0,3) as {title:string;text:string}[]

  const introText=hotel.description||`${hotel.name}は、${locationLabel||'便利なエリア'}でホテル選びをする人にチェックしてほしいTripNest掲載ホテルです。評価は★${Number(hotel.rating).toFixed(1)}${hotel.review_count?`、口コミは${hotel.review_count.toLocaleString()}件`:''}。立地・設備・料金をまとめて比較しながら、自分の旅に合う滞在先か確認できます。`

  return <main>
    <HotelPhoto placeId={hotel.google_place_id} name={hotel.name} className="detailHero premiumDetailHero" fallbackClass="detailHeroFallback">
      <Link href="/" className="backButton" aria-label="戻る">‹</Link>
      <button className="shareButton" onClick={share} aria-label="共有">↗</button>
      <div className="detailBadgeRow"><span className="realBadge">{hotel.featured?'✦ プレミアム':'おすすめ'}</span>{hotel.featured&&<span className="featured">人気</span>}</div>
      <div className="detailOverlay"><span>★ {Number(hotel.rating).toFixed(1)} {hotel.review_count?`(${hotel.review_count.toLocaleString()}件)`:''}</span><h1>{hotel.name}</h1><p>{locationLabel}</p></div>
    </HotelPhoto>

    <section className="section detailIntroSection">
      <div className="detailFactGrid">{facts.map(f=><div className="detailFact" key={f.label}><span>{f.label}</span><strong>{f.value}</strong></div>)}</div>
      <div className="detailQuickLinks"><a href="#about">ホテル概要</a><a href="#facilities">設備</a><a href="#location">アクセス</a><a href="#booking">予約</a></div>
    </section>

    <section className="section detailSection hotelAboutEnhanced" id="about">
      <div className="eyebrow">WHY STAY HERE</div>
      <h2>{hotel.name}の魅力</h2>
      <p className="aboutLead">{introText}</p>

      <div className="appealCardGrid">{appealCards.map(card=><div className="appealCard" key={card.title}><span className="appealIcon">{card.icon}</span><div><b>{card.title}</b><p>{card.text}</p></div></div>)}</div>

      <div className="stayFitBlock">
        <div className="stayFitHeading"><div><span>STAY STYLE</span><h3>こんな滞在におすすめ</h3></div><small>TripNestチェックポイント</small></div>
        <div className="stayFitGrid">{stayTypes.map((item,i)=><div className="stayFitItem" key={item.title}><span>{String(i+1).padStart(2,'0')}</span><div><b>{item.title}</b><p>{item.text}</p></div></div>)}</div>
      </div>

      {amenities.length>0&&<div className="aboutAmenityPreview"><span>主な設備</span><div>{amenities.slice(0,5).map(a=><b key={a}>{a}</b>)}</div></div>}
      <GooglePlaceLive placeId={hotel.google_place_id}/>
    </section>

    <section className="section detailSection detailFacilities" id="facilities">
      <div className="eyebrow">FACILITIES</div><div className="detailSectionHeading"><div><h2>設備・サービス</h2><p>宿泊前に確認しておきたい主な設備です。</p></div><span>{amenities.length?`${amenities.length}項目`:'情報更新中'}</span></div>
      {amenities.length?<div className="amenityGrid detailedAmenityGrid">{amenities.map(a=><div key={a}><span className="amenityCheck">✓</span><b>{a}</b></div>)}</div>:<div className="detailEmptyInfo">設備情報は現在更新中です。詳細はホテル公式情報もあわせてご確認ください。</div>}
    </section>

    <section className="section mapDetailSection" id="location">
      <div className="sectionTitle"><div><div className="eyebrow">LOCATION</div><h2>場所・アクセス</h2></div></div>
      <div className="locationSummary"><div><span>所在地</span><b>{hotel.address||`${hotel.prefecture}${hotel.city}${hotel.area||''}`}</b></div>{hotel.phone&&<div><span>電話番号</span><b>{hotel.phone}</b></div>}</div>
      <div className="detailMap"><iframe title={`${hotel.name} map`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div>
      <div className="addressCard"><div><b>{hotel.address||`${hotel.prefecture}${hotel.city}`}</b>{hotel.phone&&<span>{hotel.phone}</span>}</div><a href={hotel.google_maps_url||`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">Googleマップ ↗</a></div>
      <div className="locationActions"><a href={directionUrl} target="_blank" rel="noreferrer">現在地から経路</a>{hotel.phone&&<a href={`tel:${hotel.phone.replace(/[^+\d]/g,'')}`}>ホテルに電話</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`restaurants near ${hotel.name} ${hotel.city}`)}`} target="_blank" rel="noreferrer">周辺の飲食店</a></div>
    </section>

    <section className="section beforeBookingSection">
      <div className="eyebrow">BEFORE YOU BOOK</div><h2>予約前に確認</h2>
      <div className="beforeBookingGrid"><div><span>料金</span><b>1泊 {hotel.coin.toLocaleString()} coin〜</b><p>選択する宿泊日数に応じて合計コインが変わります。</p></div><div><span>人数</span><b>1〜6名で選択</b><p>人数を選んで予約内容を確認できます。</p></div><div><span>立地</span><b>{locationLabel}</b><p>地図から周辺環境や移動ルートを確認できます。</p></div></div>
    </section>

    <section className="bookingCard premiumBooking" id="booking"><div className="bookingTop"><div><span>1泊あたり</span><strong>● {hotel.coin.toLocaleString()} coin〜</strong></div><span className="secureBadge">TripNest予約</span></div><div className="bookingFields"><label>チェックイン<input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)}/></label><label>チェックアウト<input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)}/></label><label>人数<select value={guests} onChange={e=>setGuests(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label></div>{nights>0&&<div className="bookingTotal"><span>{nights}泊・{guests}名</span><b>{total.toLocaleString()} coin</b></div>}<button className="primary" disabled={!checkIn||!checkOut||nights<1} onClick={reserve}>この内容で予約する</button>{msg&&<div className="message toastMessage">{msg}</div>}<small className="finePrint">予約確定時にコインが差し引かれます。キャンセル時はコイン返金されます。</small></section>
  </main>
}
