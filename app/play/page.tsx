'use client'
import PhaserGame from '@/utils/Phaser/Game'
import { socket } from '../page';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter()

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
