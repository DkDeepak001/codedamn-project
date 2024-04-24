import { ExternalLink, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import Iframe from 'react-iframe'

type OutputProps = {
  url: string
}

export const Output = ({ url }: OutputProps) => {
  const [localUrl, setLoacalurl] = useState(url)
  const [key, setKey] = useState(0);
  const [loadingIframe, setLoadingIframe] = useState(true)

  const refreshIframe = () => {
    setLoadingIframe(true)
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div className='h-screen' >
      <div className='w-full h-[5%]  flex flex-row justify-evenly items-center'>
        <RefreshCcw size={16} onClick={refreshIframe} className='cursor-pointer' />
        <div className='w-3/4 h-3/4 rounded-sm text-sm text-foreground/50'>
          <input
            className='w-full h-full  px-2 py-1 rounded-sm '
            value={localUrl}
            onChange={(e) => setLoacalurl(e.target.value)}
          />
        </div>
        <ExternalLink
          size={16}
          onClick={() => window.open(localUrl, '_blank')}
          className='cursor-pointer'
        />
      </div>
      {loadingIframe && <div className='flex flex-1 items-center justify-center h-full w-full '>Loading...</div>}
      <Iframe
        key={key.toString()}
        onLoad={() => setLoadingIframe(false)}
        url={localUrl}
        id="iframe"
        className="h-[95%] w-full bg-black"
        display="block"
        sandbox={['allow-popups-to-escape-sandbox', 'allow-presentation', 'allow-pointer-lock', 'allow-scripts', 'allow-same-origin', 'allow-presentation', 'allow-forms', 'allow-modals', 'allow-orientation-lock', 'allow-popups']}
        position="relative"
      />

    </div>
  )
}
