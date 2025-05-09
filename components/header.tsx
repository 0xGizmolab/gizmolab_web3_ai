import { cn } from '@/lib/utils'
import React from 'react'
import HistoryContainer from './history-container'
import { ModeToggle } from './mode-toggle'
import { GizmolabAiMobileLogo } from './ui/icons'

export const Header: React.FC = async () => {
  return (
    <header className="fixed w-full p-2 flex justify-between items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent">
      <div>
        <a href="/">
          <GizmolabAiMobileLogo className={cn('w-14 ml-4')} />
          <span className="sr-only">Gizmolab AI</span>
        </a>
      </div>
      <div className="flex gap-0.5">
        <ModeToggle />
        <HistoryContainer />
      </div>
    </header>
  )
}

export default Header
