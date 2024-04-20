import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import * as fs from 'fs'
import { getTreeNode } from "@sinm/react-file-tree/lib/node";

export function initWs(httpServer: HttpServer) {

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  });

  io.on("connection", async (socket) => {
    socket.emit("getInitialFiles", {
      rootDir:await getTreeNode("/home/dk_deepak_001/dev/packages/workspace/react/")
    })

    socket.on('getNestedFiles', async ({ uri }: { uri: string }) => {
      const nestedFiles =await getTreeNode(uri)
      socket.emit('nestedFiles', { uri, nestedFiles });
    });

  });
}



