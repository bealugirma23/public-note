// import { Github, Twitter, Linkedin } from "lucide-react";

import { GithubLogoIcon, LinkedinLogoIcon, TwitterLogoIcon } from "@phosphor-icons/react"

export const Footer = () => {
  return (
    <div className="absolute top-11 right-4 z-50 flex flex-col items-start gap-2 text-xs opacity-70">
      <div className="flex ">
        <div className="flex gap-3 items-center mr-4">
          <a href="https://github.com/bealugirma23/public-note" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
            <GithubLogoIcon className="w-5 h-5" />
          </a>
          <a href="https://x.com/bealugirma23" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
            <TwitterLogoIcon className="w-5 h-5" />
          </a>

          <div>
            <a href="https://www.linkedin.com/in/bealugirma/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
              <LinkedinLogoIcon className="w-5 h-5" />
            </a>

          </div>
        </div>
        <div className="flex flex-col items-start gap-1 opacity-70">
          <p>Made with ❤</p>
          <p>Created by Bealu Girma</p>
        </div>

      </div></div>
  )
}
