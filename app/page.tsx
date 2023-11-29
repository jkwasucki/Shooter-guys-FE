'use client'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client';
import { getSocket, initializeSocket } from '@/lib/socket';



export default function Play() {
        
        const router = useRouter()
        const [tab,setTab] = useState("main")
        const [prevRoom,setPrevRoom] = useState<string | null>('')
        const [credentials,setCredentials] = useState({
            name:"",
            passcode:""
        })

        const socket = getSocket()

        useEffect(()=>{
            let prevRoom = sessionStorage.getItem('prevRoom')
            setPrevRoom(prevRoom)
        },[])

        function reconnect(roomId:string){
            socket.emit('joinGame', undefined, undefined,roomId);
            socket.on('roomFound',(roomId)=>{
                socket.disconnect();
                
               initializeSocket(`https://shooter-guys-backend-final.onrender.com/${roomId}`);

                //Set roomId reference in storage for reconnecting purposes
                sessionStorage.setItem("prevRoom",roomId)
                router.push('/play');
            })
            socket.on('roomNotFound',()=>{
                sessionStorage.removeItem("prevRoom")
                setPrevRoom(null)
            })
        }

        function joinGame() {
            if (credentials.passcode.length > 1 && credentials.name.length > 1) {
                socket.emit('joinGame', credentials.name, credentials.passcode,undefined);
                socket.on('roomFound',(roomId)=>{
                    socket.disconnect();
                    
                    initializeSocket(`https://shooter-guys-backend-final.onrender.com/${roomId}`);

                    //Set roomId reference in storage for reconnecting purposes
                    sessionStorage.setItem("prevRoom",roomId)
                    router.push('/play');
                })
                
            }
        }
    
        function createGame() {
            if (credentials.passcode.length > 1 && credentials.name.length > 1) {
                socket.emit('createGame', credentials.name, credentials.passcode);
                
                socket.on('gameCreated', (roomId) => {
                    //Disconnect from the default Io
                    socket.disconnect();

                    // Reconnect to the namespace associated with the created game
                    initializeSocket(`https://shooter-guys-backend-final.onrender.com/${roomId}`);


                    //Set roomId reference in storage for reconnecting purposes
                    sessionStorage.setItem("prevRoom",roomId)
                    router.push('/play')
                });
            }
        }

    return (
        <div className='w-screen h-screen flex items-center justify-center bg-[#50303c] select-none'>
            {tab === 'main' && 
                <>
                    <img src='/menu_box.png' className='absolute w-[300px] h-[400px]'/>
                    <div className='gap-5 relative w-[300px] h-[400px] flex flex-col items-center justify-center p-5'>
                        {prevRoom && 
                        <div 
                            onClick={()=>reconnect(prevRoom)} 
                            className='absolute z-10 top-[60px] left-[53%] transform -translate-x-1/2 w-[200px] h-[80px]'
                        >
                            <button className='absolute flex items-center justify-center inset-0 border-[5px] border-black bg-green-800 hover:bg-green-500 group  w-[90%] h-[80%] rounded-xl p-3'>
                                <p className='text-2xl font-bold text-slate-300 group-hover:text-black'>
                                    RECONNECT
                                </p>
                            </button>
                        </div>}
                        <motion.div 
                            initial={{ x: '300%' }}
                            animate={{ x: '-50%' }}
                            transition={{ duration: 0.5,type:'spring' }}
                            className={`absolute ${prevRoom ? 'top-[-60px]' : 'top-[-30px]'} left-1/2 transform -translate-x-1/2  w-[500px] h-[150px]`}
                        >
                            <img
                                src='/ws.png'
                            />
                        </motion.div>
                        <div className='absolute top-2/3 right-[-170px] w-[250px] h-[250px] z-10 rotate-[-50deg]'>
                            <img
                                src='/weapon_rifle.png'
                            />
                        </div>
                        <div className='absolute top-2/3 left-[-170px] w-[250px] h-[250px] z-10 rotate-[50deg]'>
                            <img
                                src='/weapon_rifle_hr.png'
                            />
                        </div>
                        <button 
                            onClick={()=>setTab("join")} 
                            className='text-xl font-bold z-2 hover:bg-[#eec39a] bg-[#d9a066] w-full h-[50px] rounded-md border-[3px] border-black'
                        >
                            JOIN GAME
                        </button>
                        <button 
                            onClick={()=>setTab("create")} 
                            className='p-2 text-xl font-bold z-2 hover:bg-[#eec39a] bg-[#d9a066] w-full h-[50px] rounded-md border-[3px]  border-black outline-none no-underline'
                        >
                            CREATE GAME
                        </button>
                    </div>
                </>
            }
            {tab === 'create' &&
                <>
                    <img 
                        src='/menu_box.png' 
                        className='absolute z-9 w-[300px] h-[400px]'
                    />
                    <div className='absolute z-[999] w-[300px] h-[400px] flex flex-col items-center justify-start mt-12'>
                        <p className='relative top-[-40px] left-0 flex justify-center inset-0 text-4xl text-[#eec39a] font-bold z-1'> 
                            - CREATE GAME - 
                        </p>

                        <div className='flex flex-col items-center'>
                            <p className='text-[#eec39a] font-bold'>
                                CREATE 
                                <span className='text-2xl'>ROOM NAME</span>
                            </p>
                            <input 
                                onChange={(e)=>setCredentials((prev)=>({...prev,name:e.target.value}))} 
                                className='p-2 text-xl font-bold hover:bg-[#eec39a] bg-[#d9a066] w-full h-[50px] rounded-md border-[3px]  border-black outline-none no-underline'
                            />
                        </div>
                        <div className='flex flex-col items-center'>
                            <p className='text-[#eec39a] font-bold'>
                                CREATE <span className='text-2xl'>PASSCODE</span>
                            </p>
                            <input 
                                onChange={(e)=>setCredentials((prev)=>({...prev,passcode:e.target.value}))} 
                                type='text' 
                                className='text-white p-2 text-xl font-bold hover:bg-[#eec39a] bg-[#d9a066] w-full h-[50px] rounded-md border-[3px]  border-black outline-none no-underline'
                            />
                        </div>
                        <button 
                            onClick={createGame} 
                            className='text-xl font-bold z-2 hover:bg-[#eec39a] bg-[#d9a066] w-1/2 h-[50px] rounded-md border-[3px]  border-black'
                        >
                            ENTER
                        </button>
                    </div>
                </>
            }
            {tab === 'join' &&
                <>
                    <img 
                        src='/menu_box.png' 
                        className='absolute z-9 w-[300px] h-[400px]'
                    />
                    <div className='absolute z-[999] w-[300px] h-[400px] flex flex-col items-center justify-start mt-12'>
                        <p className='relative top-[-40px] left-0 flex justify-center inset-0 text-4xl text-[#eec39a] font-bold z-1'>
                             - JOIN GAME - 
                        </p>
                        <div className='flex flex-col items-center'>
                            <p className='text-[#eec39a] font-bold'>
                                ENTER 
                                <span className='text-2xl'>ROOM NAME</span>
                            </p>
                            <input 
                                onChange={(e)=>setCredentials((prev)=>({...prev,name:e.target.value}))} 
                                className='p-2 text-xl font-bold hover:bg-[#eec39a] bg-[#d9a066] w-full h-[50px] rounded-md border-[3px]  border-black outline-none no-underline'
                            />
                        </div>
                        <div className='flex flex-col items-center'>
                            <p className='text-[#eec39a] font-bold'>
                                ENTER 
                                <span className='text-2xl'>PASSCODE</span>
                            </p>
                            <input 
                                onChange={(e)=>setCredentials((prev)=>({...prev,passcode:e.target.value}))} 
                                type='text' 
                                className='text-white p-2 text-xl font-bold hover:bg-[#eec39a] bg-[#d9a066] w-full h-[50px] rounded-md border-[3px]  border-black outline-none no-underline'
                            />
                        </div>
                        <button 
                            onClick={joinGame} 
                            className='text-xl font-bold z-2 hover:bg-[#eec39a] bg-[#d9a066] w-1/2 h-[50px] rounded-md border-[3px]  border-black'
                        >
                            ENTER
                        </button>
                    </div>
                </>
            }
            </div>
    
    )
}
