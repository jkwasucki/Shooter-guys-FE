'use client'
import PhaserGame from '@/utils/Phaser/Game'
import { getSocket } from '@/lib/socket';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter()
  const socket = getSocket()
  //If socket disconnected, forward to main menu
  useEffect(()=>{
    socket.on('namespace',(namespace)=>{
      if(namespace === '/'){
        router.push('/')
      }
    })
  },[])

  return (
    <main className="flex flex-col items-center justify-center  overflow-y-hidden gap-2">
      <PhaserGame/>
    </main>
  )
}
