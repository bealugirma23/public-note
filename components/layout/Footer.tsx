
import { useIsMobile } from "@/hooks/use-is-mobile";
import { GithubLogoIcon, LinkedinLogoIcon, ListIcon, TwitterLogoIcon, XIcon } from "@phosphor-icons/react"
import { useState } from "react"

export const Footer = () => {
  const [show, setShow] = useState(false);

  return (
    <div className="absolute top-4 md:top-8 right-4 z-50 flex flex-col items-end gap-2 text-xs opacity-70">

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-2  backdrop-blur rounded-md shadow-sm border border-black/10"
        onClick={() => setShow(!show)}
      >
        {show ? <XIcon className="w-5 h-5" /> : <ListIcon className="w-5 h-5" />}
      </button>

      {/* Content: Visible on desktop always, visible on mobile only if 'show' is true */}
      <div className={`${show ? 'flex backdrop-blur-md bg-[#FC9583]  ' : 'hidden'} md:flex flex-col md:flex-row gap-4 items-end md:items-center  md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-4 md:p-0 rounded-xl md:rounded-none shadow-md md:shadow-none border border-black/10 md:border-none`}>
        <div className="flex gap-4 items-center">
          <a href="https://github.com/bealugirma23/public-note" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
            <GithubLogoIcon className="w-5 h-5 md:w-6 md:h-6" />
          </a>
          <a href="https://x.com/bealugirma23" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
            <TwitterLogoIcon className="w-5 h-5 md:w-6 md:h-6" />
          </a>
          <a href="https://www.linkedin.com/in/bealugirma/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
            <LinkedinLogoIcon className="w-5 h-5 md:w-6 md:h-6" />
          </a>
        </div>

        <div className="flex flex-col items-end md:items-start gap-1 font-sans font-medium text-right md:text-left">
          <p>
            Made with <span aria-hidden="true">❤</span>
          </p>
          <p>Created by Bealu Girma</p>
        </div>
      </div>

    </div>
  )
}
