import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import * as fs from 'fs'
import { getTreeNode } from "@sinm/react-file-tree/lib/node";
import { TerminalManager } from "./utils/pty";
import path from 'path'
import { saveFile, watchDirRecursive } from "./utils/fs";

const terminalManager = new TerminalManager()

// export const HOME = '/workspace/'
export const HOME = '/home/dk_deepak_001/dev/packages/workspace/node/'

export function initWs(httpServer: HttpServer) {

  let timer: Date | null = new Date()

  const checkDisconnectStatus = (callback: () => void) => {
    if (timer) {
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - timer.getTime();
      if (timeDifference > 20 * 60 * 1000) {
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

    const host = socket.handshake.headers.host;

    const containerId = socket.handshake.query.containerId;
    const projectId = socket.handshake.query.projectId;


    console.log(`host is ${host} ${containerId} ${projectId}`);

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
          await fetch(`http://34.125.240.204:4000/stop?containerId=${containerId}&projectId=${projectId}`)
        } catch (error) {
          console.log(error)
        }
      });
    }, 4 * 60 * 1000);



    socket.emit("getInitialFiles", {
      rootDir: await getTreeNode(HOME)
    })

    // Watch only Root Dir
    fs.watch(HOME, async () => {
      socket.emit("getInitialFiles", {
        rootDir: await getTreeNode(HOME)
      })
    });


    socket.on('getNestedFiles', async ({ uri }: { uri: string }) => {
      const currentDir = uri.replace('file://', '')
      fs.readdir(currentDir, async (err, files) => {
        if (files?.length === 0) return
        files?.map(f => {
          const filePath = path.join(currentDir, f)
          fs.stat(filePath, async () => {
            const nestedFiles = await getTreeNode(currentDir)
            socket.emit('nestedFiles', { uri, nestedFiles });
          })
        })

      })
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


    socket.on('createNew', ({ fileName, uri }: { fileName: string, uri: string }) => {
      const fullPath = path.join(uri.replace("file://", ''), fileName)
      const paths = fullPath.split("/")
      let tmp: string = ""
      paths.map((p) => {
        if (tmp !== '') {
          console.log(path.extname(p), "extname", p)
          if (path.extname(p) !== '') {
            const fileLoc = `${tmp}${p}`
            console.log(fileLoc)
            if (!fs.existsSync(fileLoc)) {
              console.log("create file", fileLoc)
              fs.writeFileSync(fileLoc, '')
            }
          } else {
            const dirLoc = `${tmp}${p}`
            if (!fs.existsSync(dirLoc)) {
              console.log("create folder", dirLoc)
              fs.mkdirSync(dirLoc)
            }
          }
        }
        tmp += `${p}/`
      })
    })

    socket.on('delete', ({ uri }: { uri: string }) => {
      try {
        const loc = uri.replace('file://', '')
        if (fs.existsSync(loc)) {
          fs.rmSync(loc, { recursive: true })
        }
      } catch (error) {

      }
    })


    socket.on("save", async ({ path, content }: { path: string, content: string }, callback) => {
      try {
        await saveFile({ path, content });
        callback();
      } catch (error) {
        console.log(error)
      }
    })



    watchDirRecursive(HOME, socket, async (filePath) => {
      console.log("callback", filePath)
      socket.emit("getInitialFiles", {
        rootDir: await getTreeNode(filePath)
      })
    })



    //Terminal Events 
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





