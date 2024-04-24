import { useEffect, useRef } from "react";
interface useKeyArgs {
  key: string,
  cb: () => void
}

export function useKey({ key, cb }: useKeyArgs) {
  const callback = useRef<(event: KeyboardEvent) => void>(cb);

  useEffect(() => {
    callback.current = cb;
  }, [cb]);

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.code === key) {
        callback.current(event);
      } else if (key === 'ctrls' && event.key === 's' && event.ctrlKey) {
        event.preventDefault()
        callback.current(event);
      }
    }

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener("keydown", handle);
  }, [key]);
}


