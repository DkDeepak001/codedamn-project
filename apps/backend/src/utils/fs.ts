import chokidar from 'chokidar';
import { Socket } from "socket.io";
import { getTreeNode } from "@sinm/react-file-tree/lib/node";
import * as fs from 'fs'

export function watchDirRecursive(dir: string, socket: Socket, cb: (uri: string) => Promise<void>) {

  const watcher = chokidar.watch(dir, {
    persistent: true,
    ignoreInitial: true,
    alwaysStat: true,
    followSymlinks: true,
    ignored: [
      (path) => path.includes('node_modules'),
      (path) => { fs.existsSync(`${dir}/.next`); return path.includes('.next') },
      (path) => { fs.existsSync(`${dir}/.git`); return path.includes('.git') }
    ]
  });

  watcher.on('error', (error) => {
    console.error('Error watching directory:', error);
  });

  watcher.on('add', async (newfile) => {
    console.log(`New File ${newfile} added`, dir);
    cb(dir)

  })

  watcher.on('unlink', async (newfile) => {
    console.log(` File deleted ${newfile} `, dir);
    cb(dir)

  })
  watcher.on('addDir', async (newDir) => {
    console.log(`New directory ${newDir} added`);
    cb(dir)
    watchDirRecursive(newDir, socket, async (filePath) => {
      const nestedFiles = await getTreeNode(filePath)
      socket.emit('newFile', { uri: filePath, nestedFiles });

    });
  });
  watcher.on('unlink', async (newDir) => {
    console.log(`Folder deleted ${newDir} `);
    cb(dir)
    watchDirRecursive(newDir, socket, async (filePath) => {
      const nestedFiles = await getTreeNode(filePath)
      socket.emit('newFile', { uri: filePath, nestedFiles });

    });
  });

}


export const saveFile = ({ path, content }: { path: string, content: string }) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, { encoding: "utf8" }, (err) => {
      if (err) {
        return reject(err)
      }
      resolve(() => { });
    })
  })
}
