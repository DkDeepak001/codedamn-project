import { useEffect, useState } from "react";
import { Socket, io, } from "socket.io-client";


type SocketProps = {
  wsUrl: string
  containerId: string
}
const useSocket = ({ wsUrl, containerId }: SocketProps): Socket => {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    if (!wsUrl) return
    // const newSocket = io('http://localhost:3001', { query: { containerId } })
    const newSocket = io(wsUrl, {
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      },
      rejectUnauthorized: false,
      query: { containerId }
    })

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [wsUrl]);

  return socket as Socket;
}


export default useSocket

