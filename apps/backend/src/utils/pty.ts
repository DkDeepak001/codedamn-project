//@ts-ignore => someone fix this
import { fork, IPty } from 'node-pty';
import { HOME } from '../ws';

const SHELL = "bash";

export class TerminalManager {
  private sessions: { [id: string]: { terminal: IPty, userId: string; } } = {};

  constructor() {
    this.sessions = {};
  }

  createPty(id: string, userId: string, onData: (data: string, id: string) => void) {
    let term = fork(SHELL, [], {
      cols: 100,
      name: 'xterm',
      cwd: HOME
    });

    term.on('data', (data: string) => {
      console.log(data)
      onData(data, id)
    });
    this.sessions[id] = {
      terminal: term,
      userId
    };
    term.on('exit', () => {
      delete this.sessions[term.pid];
    });
    return term;
  }

  write(terminalId: string, data: string) {
    this.sessions[terminalId]?.terminal.write(data);
  }

  clear(terminalId: string) {
    this.sessions[terminalId].terminal.kill();
    delete this.sessions[terminalId];
  }
}

