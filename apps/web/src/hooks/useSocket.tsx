import { useEffect, useState } from "react";
import { Socket, io, } from "socket.io-client";


type SocketProps = {
  wsUrl: string
  containerId: string,
  projectId: string
}
const useSocket = ({ wsUrl, containerId, projectId }: SocketProps): Socket => {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    const newSocket = io('http://localhost:3001', { query: { containerId, projectId } })
    // if (!wsUrl) return
    // const newSocket = io(wsUrl, {
    //   extraHeaders: {
    //     'Access-Control-Allow-Origin': '*'
    //   },
    //   rejectUnauthorized: false,
    //   query: { containerId, projectId }
    // })

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [wsUrl]);

  return socket as Socket;
}


export default useSocket

