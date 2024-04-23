import { useEffect, useState } from "react";
import { Socket, io, } from "socket.io-client";


const useSocket = (): Socket => {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    // const newSocket = io(`https://user2.terminal.dkdeepak001.com`, {
    // extraHeaders: {
    // 'Access-Control-Allow-Origin': '*'
    // }
    // })

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket as Socket;
}


export default useSocket

