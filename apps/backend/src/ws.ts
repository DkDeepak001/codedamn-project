import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import * as fs from 'fs'
import { getTreeNode } from "@sinm/react-file-tree/lib/node";
import { TerminalManager } from "./utils/pty";
import path from 'path'
import chokidar from 'chokidar';


const terminalManager = new TerminalManager()

export const HOME = '/workspace/'
// export const HOME = '/home/dk_deepak_001/dev/packages/workspace/next/'
export function initWs(httpServer: HttpServer) {

  let timer: Date | null = new Date()
  const checkDisconnectStatus = (callback: () => void) => {
    console.log("Checking for disconnecting ")
    if (timer) {
      console.log("User disconnected")
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
    console.log(`host is ${host}`);

    const socketUrl = (socket.handshake.url.split('?')[1].split('&').map(val => {
      return val.split('=')
    }))
    const containerId = socketUrl[0][1]
    const projectId = socketUrl[1][1]

    console.log(containerId, projectId)

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
          // await fetch(`http://34.125.240.204:4000/stop?containerId=${containerId}&projectId=${projectId}`)
        } catch (error) {
          console.log(error)
        }
      });
    }, 4 * 60 * 1000);


    socket.emit("getInitialFiles", {
      rootDir: await getTreeNode(HOME)
    })



    socket.on('getNestedFiles', async ({ uri }: { uri: string }) => {
      const currentDir = uri.replace('file://', '')
      fs.readdir(currentDir, async (err, files) => {
        if (files.length === 0) return
        console.log(files)
        files.map(f => {
          const filePath = path.join(currentDir, f)
          fs.stat(filePath, async (err, stats) => {
            console.log(stats)
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

    socket.on("save", async ({ path, content }: { path: string, content: string }, callback) => {
      try {
        await saveFile({ path, content });
        callback();
      } catch (error) {
        console.log(error)
      }
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
    watchDirRecursive(HOME, socket, async (filePath) => {
      console.log("callback", filePath)

      socket.emit("getInitialFiles", {
        rootDir: await getTreeNode(filePath)
      })

    })



    fs.watch(HOME, async () => {
      socket.emit("getInitialFiles", {
        rootDir: await getTreeNode(HOME)
      })
    });
  });


}

function watchDirRecursive(dir: string, socket: Socket, cb: (uri: string) => Promise<void>) {

  const watcher = chokidar.watch(dir, { persistent: true, ignoreInitial: true, alwaysStat: true, followSymlinks: true });

  // watcher.on('all', async (event, filePath) => {
  //   console.log(`File ${filePath} changed (${event})`);
  //   cb(filePath);
  // });
  //
  watcher.on('error', (error) => {
    console.error('Error watching directory:', error);
  });

  // watcher.on('add', async (newfile) => {
  //   console.log(`New File ${newfile} added`, dir);
  //   const nestedFiles = await getTreeNode(dir)
  //   console.log(nestedFiles)
  //   socket.emit('newFile', { uri: dir, nestedFiles });
  //
  // })

  watcher.on('addDir', async (newDir) => {
    console.log(`New directory ${newDir} added`);
    cb(dir)
    watchDirRecursive(newDir, socket, async (filePath) => {
      const nestedFiles = await getTreeNode(filePath)
      socket.emit('newFile', { uri: filePath, nestedFiles });

    });
  });
}


const saveFile = ({ path, content }: { path: string, content: string }) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, { encoding: "utf8" }, (err) => {
      if (err) {
        console.log("err", err)
        return reject(err)
      }
      resolve(() => { });
    })
  })
}

