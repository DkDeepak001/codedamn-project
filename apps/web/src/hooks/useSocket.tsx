import { useEffect, useState } from "react";
import { Socket, io, } from "socket.io-client";


const useSocket = (): Socket => {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    // const newSocket = io('http://localhost:3001')
    const newSocket = io(`http://34.16.169.164:30040`, {
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      },
      rejectUnauthorized: false
    })

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket as Socket;
}


export default useSocket

