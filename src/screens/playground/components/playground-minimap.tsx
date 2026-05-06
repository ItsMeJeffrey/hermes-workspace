import { useEffect, useState } from 'react'
import type { PlaygroundWorldId } from '../lib/playground-rpg'
import { botsFor } from '../lib/playground-bots'

const NPC_POSITIONS: Record<PlaygroundWorldId, Array<{ x: number; z: number; color: string }>> = {
  training: [
    { x: -9, z: 7, color: '#a78bfa' },
    { x: -3, z: 0, color: '#22d3ee' },
    { x: 8, z: -4, color: '#f59e0b' },
  ],
  agora: [
    { x: -5, z: 2, color: '#a78bfa' },
    { x: 5, z: 3, color: '#f59e0b' },
    { x: -3, z: -5, color: '#22d3ee' },
    { x: 6, z: -4, color: '#fb7185' },
  ],
  forge: [
    { x: -4, z: 0, color: '#34d399' },
    { x: 4, z: 0, color: '#facc15' },
  ],
  grove: [
    { x: -4, z: 1, color: '#34d399' },
    { x: 4, z: 0, color: '#f59e0b' },
    { x: 0, z: -5, color: '#9ca3af' },
  ],
  oracle: [
    { x: -3, z: -2, color: '#a78bfa' },
    { x: 3, z: -2, color: '#facc15' },
    { x: 0, z: 4, color: '#f472b6' },
  ],
  arena: [
    { x: -3, z: 4, color: '#fb7185' },
    { x: 3, z: 4, color: '#2dd4bf' },
    { x: 0, z: -5, color: '#facc15' },
  ],
}

const PORTAL_POSITION: Record<PlaygroundWorldId, { x: number; z: number }> = {
  training: { x: 14, z: -10 },
  agora: { x: 10, z: -2 },
  forge: { x: 10, z: -2 },
  grove: { x: 10, z: -2 },
  oracle: { x: 10, z: -2 },
  arena: { x: 10, z: -2 },
}

type Props = {
  worldId: PlaygroundWorldId
  worldName: string
  worldAccent: string
}

export function PlaygroundMinimap({ worldId, worldName, worldAccent }: Props) {
  const npcs = NPC_POSITIONS[worldId] ?? []
  const bots = botsFor(worldId)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)')
    const sync = () => setIsTouch(mq.matches || 'ontouchstart' in window)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])

  const size = isTouch ? 108 : 150
  const center = size / 2
  const spread = isTouch ? 48 : 70
  // Map world coords (-30..30) to minimap pixels.
  const map = (v: number) => center + (v / 30) * spread

  return (
    <div className="pointer-events-auto fixed right-3 top-3 z-[70] rounded-[22px] border-2 border-white/15 bg-gradient-to-b from-[#0b1320]/90 to-black/85 p-2 text-white shadow-2xl backdrop-blur-xl"
      style={{ boxShadow: `0 0 18px ${worldAccent}44, 0 12px 36px rgba(0,0,0,.6)` }}
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="font-bold uppercase tracking-[0.16em]" style={{ color: worldAccent, fontSize: isTouch ? 9 : 10 }}>
          {isTouch ? 'Map' : worldName}
        </span>
        <span className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-bold uppercase tracking-[0.12em] text-white/65" style={{ fontSize: isTouch ? 8 : 9 }}>
          M
        </span>
      </div>
      <div
        className="relative overflow-hidden rounded-lg border border-white/15"
        style={{
          width: size,
          height: size,
          background:
            'radial-gradient(circle at 50% 50%, rgba(56,189,248,.15), rgba(0,0,0,.85) 70%), repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 18px)',
        }}
      >
        {/* Center medallion */}
        <div
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ left: center, top: center, borderColor: worldAccent + 'aa' }}
        />
        {/* Player at 0,0 (always center for now since we map world coords) */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: center, top: center, width: isTouch ? 7 : 8, height: isTouch ? 7 : 8, background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }} />
        {/* NPCs */}
        {npcs.map((n, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: map(n.x),
              top: map(n.z),
              width: isTouch ? 5 : 6,
              height: isTouch ? 5 : 6,
              background: n.color,
              boxShadow: `0 0 4px ${n.color}`,
            }}
          />
        ))}
        {/* Bots */}
        {bots.map((b, i) => (
          <div
            key={`b-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-sm"
            style={{
              left: map(b.spawn[0]),
              top: map(b.spawn[2]),
              width: isTouch ? 4 : 5,
              height: isTouch ? 4 : 5,
              background: b.color,
              boxShadow: `0 0 4px ${b.color}`,
            }}
          />
        ))}
        {/* Portal */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            left: map(PORTAL_POSITION[worldId].x),
            top: map(PORTAL_POSITION[worldId].z),
            width: isTouch ? 8 : 10,
            height: isTouch ? 8 : 10,
            borderColor: worldAccent,
            background: worldAccent + '33',
            boxShadow: `0 0 6px ${worldAccent}`,
          }}
        />
      </div>
      {!isTouch && (
        <div className="mt-1 flex justify-between px-1 text-[8px] uppercase tracking-[0.12em] text-white/45">
          <span>● You</span>
          <span style={{ color: worldAccent }}>○ Portal</span>
        </div>
      )}
    </div>
  )
}
