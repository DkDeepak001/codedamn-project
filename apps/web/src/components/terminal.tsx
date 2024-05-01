import { useEffect, useRef } from "react"
import { Terminal } from '@xterm/xterm'
import { Socket } from "socket.io-client";
import { FitAddon } from '@xterm/addon-fit'

const fitAddon = new FitAddon();
function ab2str(buf: ArrayBuffer): string {
  //@ts-ignore
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
export const XTerminal = ({ socket }: { socket: Socket }) => {

  const terminalRef = useRef<HTMLDivElement>(null);
  const XtermRef = useRef<Terminal>(null)

  useEffect(() => {
    if (!terminalRef.current || !socket) {
      return;
    }

    let terminalId: string | null = null;

    socket.emit("requestTerminal", "userId");
    socket.on("terminal", terminalHandler);

    const term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      cursorStyle: "block",
      scrollOnUserInput: true,
      rows: 14,
      theme: {
        background: '#020817'
      }

    });

    //@ts-ignore
    XtermRef.current = term

    term.reset()
    term.loadAddon(fitAddon);
    term.open(terminalRef.current)
    fitAddon.fit();

    function terminalHandler({ data, pid }: { data: ArrayBuffer, pid: string }) {
      terminalId = pid;
      term.write(ab2str(data));
      term.scrollToBottom()
    }

    term.onData((data: string) => {
      console.log(data);
      socket.emit('terminalData', terminalId, data);
    });

    socket.emit('terminalData', {
      data: '\n'
    });


  }, [terminalRef, socket])

  return <div ref={terminalRef} className="mb-5" />
}
