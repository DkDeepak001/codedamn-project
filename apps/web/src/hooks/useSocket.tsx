import { useEffect, useState } from "react";
import { Socket, io, } from "socket.io-client";


const useSocket = (): Socket => {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    // const newSocket = io('ws://node-ca559dce-5f4b-420c-909b-a711d96b336c.runner.dkdeepak001.com')
    const newSocket = io(`http://34.93.11.160:30008`)

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket as Socket;
}


export default useSocket

