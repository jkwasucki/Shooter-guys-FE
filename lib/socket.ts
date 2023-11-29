import { io, Socket } from 'socket.io-client';

let socket:Socket = io(`https://shooter-guys-backend-final.onrender.com`, { transports: ['websocket'] });

export function getSocket(){
    return socket
}

export function initializeSocket(url:string){
    socket = io(url,{transports:['websocket']})
}

// https://shooter-guys-backend-final.onrender.com