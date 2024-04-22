import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import * as fs from 'fs'
import { getTreeNode } from "@sinm/react-file-tree/lib/node";
import { TerminalManager } from "./utils/pty";


const terminalManager = new TerminalManager()

export const HOME = '/workspace'
export function initWs(httpServer: HttpServer) {

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  });

  io.on("connection", async (socket) => {
    socket.emit("getInitialFiles", {
      rootDir: await getTreeNode(HOME)
    })

    socket.on('getNestedFiles', async ({ uri }: { uri: string }) => {
      const nestedFiles = await getTreeNode(uri)
      socket.emit('nestedFiles', { uri, nestedFiles });
    });

    socket.on('loadFile', async ({ uri }: { uri: string }, callback) => {
      const path = uri.split('file://')[1]
      fs.readFile(path, { encoding: "utf8" }, (err, file) => {
        try {
          callback(file)
        } catch (error) {
          console.log(error, err)
        }
      })
    })

    socket.on("requestTerminal", async (userId) => {
      try {
        terminalManager.createPty(socket.id, userId, (data, pid) => {
          socket.emit("terminal", {
            pid,
            data: Buffer.from(data, 'utf8')
          });
        })
      } catch (error) {
        console.log(error)
      }

    })

    socket.on("terminalData", async (tId, data: string) => {
      try {
        terminalManager.write(tId, data)
      } catch (error) {
        console.log(error)
      }
    })
  });


}



