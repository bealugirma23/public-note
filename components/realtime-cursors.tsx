'use client'

import { useRef, useLayoutEffect, useCallback } from 'react'
import { Cursor } from '@/components/cursor'
import { useRealtimeCursors } from '@/hooks/use-realtime-cursors'
import { usePerfectCursor } from '@/hooks/use-perfect-cursor'

const THROTTLE_MS = 50

const SmoothCursor = ({ 
  position, 
  color, 
  name 
}: { 
  position: { x: number; y: number }
  color: string
  name: string 
}) => {
  const rCursor = useRef<HTMLDivElement>(null)

  const animateCursor = useCallback((point: number[]) => {
    const elm = rCursor.current
    if (!elm) return
    elm.style.setProperty('transform', `translate(${point[0]}px, ${point[1]}px)`)
  }, [])

  const onPointMove = usePerfectCursor(animateCursor)

  useLayoutEffect(() => {
    if (position) {
      onPointMove([position.x, position.y])
    }
  }, [onPointMove, position])

  return (
    <div ref={rCursor} className="fixed top-0 left-0 z-50 pointer-events-none">
      <Cursor color={color} name={name} />
    </div>
  )
}

export const RealtimeCursors = ({ roomName, username }: { roomName: string; username: string }) => {
  const { cursors } = useRealtimeCursors({ roomName, username, throttleMs: THROTTLE_MS })

  return (
    <div>
      {Object.keys(cursors).map((id) => (
        <SmoothCursor
          key={id}
          position={cursors[id].position}
          color={cursors[id].color}
          name={cursors[id].user.name}
        />
      ))}
    </div>
  )
}
