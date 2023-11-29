'use client'
import { getSocket } from '@/lib/socket';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const GameComponent = dynamic(() => import('../../utils/Phaser/Game'),{ssr:false});

export default function Home() {
  const router = useRouter()
 
  //If socket disconnected, forward to main menu
  useEffect(()=>{
    const socket = getSocket()
    socket.on('namespace',(namespace)=>{
      if(namespace === '/'){
        router.push('/')
      }
    })
  },[])

  return (
    <main className="flex flex-col items-center justify-center  overflow-y-hidden gap-2">
      <GameComponent/>
    </main>
  )
}
