'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

const items=[
  {href:'/',label:'ホーム',icon:'home'},
  {href:'/map',label:'マップ',icon:'map'},
  {href:'/saved',label:'保存',icon:'heart'},
  {href:'/reservations',label:'予約',icon:'calendar'},
  {href:'/account',label:'アカウント',icon:'user'},
]

function Icon({name}:{name:string}){
  const common={width:21,height:21,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const}
  if(name==='home')return <svg {...common}><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>
  if(name==='map')return <svg {...common}><path d="m3.5 6.5 5-2.5 7 2.5 5-2.5v13.5l-5 2.5-7-2.5-5 2.5z"/><path d="M8.5 4v13.5M15.5 6.5V20"/></svg>
  if(name==='heart')return <svg {...common}><path d="M20.5 8.8c0 5.4-8.5 10.1-8.5 10.1S3.5 14.2 3.5 8.8A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 8.5 1.2Z"/></svg>
  if(name==='calendar')return <svg {...common}><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17"/><path d="M8 13h3M13 13h3M8 16.5h3"/></svg>
  return <svg {...common}><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/></svg>
}

export default function AppNavigation(){
  const pathname=usePathname()
  return <nav className="bottomNav premiumBottomNav" aria-label="メインナビゲーション">
    {items.map(item=>{
      const active=item.href==='/'?pathname===item.href:pathname.startsWith(item.href)
      return <Link key={item.href} href={item.href} className={active?'active':''} aria-current={active?'page':undefined}>
        <span className="navIcon"><Icon name={item.icon}/></span><span>{item.label}</span>
      </Link>
    })}
  </nav>
}
