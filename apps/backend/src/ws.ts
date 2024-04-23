import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import * as fs from 'fs'
import { getTreeNode } from "@sinm/react-file-tree/lib/node";
import { TerminalManager } from "./utils/pty";


const terminalManager = new TerminalManager()

// export const HOME = '/workspace'
export const HOME = '/home/dk_deepak_001/dev/packages/workspace/react/'
export function initWs(httpServer: HttpServer) {

  let timer: Date | null = new Date()
  console.log(timer)
  const checkDisconnectStatus = (callback: () => void) => {
    console.log("Checking for disconnecting ")
    if (timer) {
      console.log("User disconnected")
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - timer.getTime();
      if (timeDifference > 3 * 60 * 1000) {
        callback();
      }
    }
  };

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  });


  io.on("connection", async (socket) => {
    timer = null
    socket.on("disconnect", async () => {
      try {
        timer = new Date()
        console.log("user disconnected");
      } catch (error) {
        console.log(error)
      }
    });
    // Check for user disconnected
    setInterval(() => {
      checkDisconnectStatus(async () => {
        try {
          console.log("User disconnected for more than 30 minutes");
          // await fetch(`${process.env.ORCHESTRATOR_URL}/stop?nodeId=${language}-${userId}`)
        } catch (error) {
          console.log(error)
        }
      });
    }, 60 * 1000);


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



