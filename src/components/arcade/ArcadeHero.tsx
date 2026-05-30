"use client"

import { useState, useEffect, useRef } from "react"

// 2-color palette: black bg + yellow foreground (Game Boy LCD style)
const BG = "#0a0800"
const FG = "#ffd700"
const FG2 = "#ffaa00"

// ─── 8-bit game renderers ─────────────────────────────────────────────────────

function MarioGame({ frame }: { frame: number }) {
  const marioX = (frame * 3) % 260
  const coinY = Math.sin(frame * 0.3) * 8
  const groundY = 72
  const jumpOffset = frame % 40 < 15 ? Math.sin((frame % 40) / 40 * Math.PI) * 28 : 0
  const marioY = groundY - jumpOffset

  return (
    <svg viewBox="0 0 320 96" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      <rect width="320" height="96" fill={BG} />
      {/* Ground */}
      <rect x="0" y="80" width="320" height="16" fill={FG2} />
      <rect x="0" y="78" width="320" height="3" fill={FG} />
      {/* Platforms */}
      <rect x="60" y="58" width="32" height="6" fill={FG} />
      <rect x="160" y="48" width="32" height="6" fill={FG} />
      {/* ? Block */}
      <rect x="130" y="38" width="14" height="14" fill={FG} />
      <rect x="132" y="40" width="10" height="10" fill={BG} />
      <text x="137" y="50" textAnchor="middle" fontSize="8" fill={FG} fontFamily="monospace" fontWeight="bold">?</text>
      {/* Coin popping */}
      <rect x="134" y={28 + coinY} width="5" height="7" rx="2" fill={FG} />
      {/* Pipe */}
      <rect x="260" y="56" width="22" height="24" fill={FG2} />
      <rect x="256" y="52" width="30" height="8" fill={FG} />
      {/* Mario */}
      <g transform={`translate(${marioX}, ${marioY})`}>
        {/* Hat */}
        <rect x="2" y="-20" width="12" height="3" fill={FG} />
        <rect x="0" y="-17" width="16" height="3" fill={FG} />
        {/* Face */}
        <rect x="2" y="-14" width="12" height="7" fill={FG2} />
        {/* Eyes */}
        <rect x="4" y="-13" width="2" height="2" fill={BG} />
        <rect x="10" y="-13" width="2" height="2" fill={BG} />
        {/* Mustache */}
        <rect x="3" y="-9" width="4" height="2" fill={BG} />
        <rect x="9" y="-9" width="4" height="2" fill={BG} />
        {/* Body */}
        <rect x="1" y="-7" width="14" height="7" fill={FG} />
        {/* Overall straps */}
        <rect x="3" y="-5" width="3" height="5" fill={BG} />
        <rect x="10" y="-5" width="3" height="5" fill={BG} />
        {/* Legs */}
        <rect x="1" y="0" width="5" height="6" fill={FG2} />
        <rect x="10" y="0" width="5" height="6" fill={FG2} />
        {/* Shoes */}
        <rect x="0" y="6" width="7" height="3" fill={FG} />
        <rect x="9" y="6" width="7" height="3" fill={FG} />
      </g>
      {/* HUD */}
      <text x="8" y="12" fontSize="7" fill={FG} fontFamily="monospace" fontWeight="bold">SCORE</text>
      <text x="8" y="22" fontSize="7" fill={FG2} fontFamily="monospace">{String(frame * 100).padStart(6, "0")}</text>
      <text x="240" y="12" fontSize="7" fill={FG} fontFamily="monospace">WORLD 1-1</text>
    </svg>
  )
}

function TankGame({ frame }: { frame: number }) {
  const tankX = 20 + (frame * 2) % 180
  const enemyX = 260 - (frame * 1.5) % 160
  const bulletX = frame % 28 < 14 ? tankX + 20 + (frame % 28) * 9 : -100
  const explosionVisible = Math.abs(bulletX - enemyX) < 18 && frame % 28 >= 10

  return (
    <svg viewBox="0 0 320 96" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      <rect width="320" height="96" fill={BG} />
      {/* Stars */}
      {[15, 50, 85, 130, 175, 220, 265, 300].map((x, i) => (
        <rect key={i} x={x} y={6 + (i * 9) % 28} width="2" height="2" fill={FG}
          opacity={((frame + i * 7) % 20 < 10) ? 0.9 : 0.3} />
      ))}
      {/* Ground */}
      <rect x="0" y="78" width="320" height="18" fill={FG2} />
      <rect x="0" y="76" width="320" height="3" fill={FG} />
      {/* Terrain bumps */}
      <rect x="100" y="70" width="20" height="8" fill={FG2} />
      <rect x="200" y="72" width="16" height="6" fill={FG2} />
      {/* Player tank */}
      <g transform={`translate(${tankX}, 62)`}>
        <rect x="0" y="4" width="30" height="12" fill={FG2} />
        <rect x="4" y="0" width="18" height="9" fill={FG} />
        {/* Barrel */}
        <rect x="18" y="-4" width="14" height="3" fill={FG} />
        {/* Tracks */}
        <rect x="-2" y="14" width="34" height="5" rx="2" fill={FG} />
        {/* Track links */}
        {[0,6,12,18,24].map(ox => <rect key={ox} x={ox} y="15" width="4" height="3" fill={BG} />)}
      </g>
      {/* Enemy tank (mirrored) */}
      <g transform={`translate(${enemyX + 30}, 62) scale(-1,1)`}>
        <rect x="0" y="4" width="30" height="12" fill={FG2} />
        <rect x="4" y="0" width="18" height="9" fill={FG} />
        <rect x="18" y="-4" width="14" height="3" fill={FG} />
        <rect x="-2" y="14" width="34" height="5" rx="2" fill={FG} />
        {[0,6,12,18,24].map(ox => <rect key={ox} x={ox} y="15" width="4" height="3" fill={BG} />)}
      </g>
      {/* Bullet */}
      {!explosionVisible && bulletX > 0 && (
        <rect x={bulletX} y="67" width="10" height="3" fill={FG} />
      )}
      {/* Explosion */}
      {explosionVisible && (
        <g transform={`translate(${enemyX + 15}, 66)`}>
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <rect key={i}
              x={Math.cos(angle * Math.PI / 180) * 14 - 3}
              y={Math.sin(angle * Math.PI / 180) * 14 - 3}
              width="6" height="6" fill={FG} />
          ))}
          <rect x="-6" y="-6" width="12" height="12" fill={FG} />
        </g>
      )}
      {/* HUD */}
      <text x="8" y="14" fontSize="7" fill={FG} fontFamily="monospace">P1 ■■■</text>
      <text x="220" y="14" fontSize="7" fill={FG2} fontFamily="monospace">CPU ■■</text>
    </svg>
  )
}

function PacmanGame({ frame }: { frame: number }) {
  const pacX = 20 + (frame * 3) % 255
  const mouthOpen = (frame % 8) < 4
  const mouthAngle = mouthOpen ? 35 : 5
  const ghostX = Math.max(pacX + 35, (frame * 2) % 280 + 30)
  const dots = [60, 85, 110, 135, 160, 185, 210, 240, 270]

  return (
    <svg viewBox="0 0 320 96" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      <rect width="320" height="96" fill={BG} />
      {/* Walls */}
      <rect x="0" y="0" width="320" height="6" fill={FG} />
      <rect x="0" y="90" width="320" height="6" fill={FG} />
      <rect x="0" y="0" width="6" height="96" fill={FG} />
      <rect x="314" y="0" width="6" height="96" fill={FG} />
      {/* Inner walls */}
      <rect x="30" y="24" width="50" height="6" fill={FG} />
      <rect x="130" y="24" width="60" height="6" fill={FG} />
      <rect x="240" y="24" width="50" height="6" fill={FG} />
      <rect x="50" y="66" width="70" height="6" fill={FG} />
      <rect x="200" y="66" width="70" height="6" fill={FG} />
      {/* Dots */}
      {dots.filter(x => x > pacX + 14).map((x, i) => (
        <rect key={i} x={x - 2} y="46" width="4" height="4" fill={FG2} />
      ))}
      {/* Power pellets */}
      {[20, 295].filter(x => x > pacX + 14).map((x, i) => (
        <rect key={i} x={x - 4} y="44" width="8" height="8" fill={FG} />
      ))}
      {/* Pacman */}
      <g transform={`translate(${pacX}, 48)`}>
        <path
          d={`M 0 0 L ${Math.cos(mouthAngle * Math.PI / 180) * 14} ${-Math.sin(mouthAngle * Math.PI / 180) * 14} A 14 14 0 1 1 ${Math.cos(mouthAngle * Math.PI / 180) * 14} ${Math.sin(mouthAngle * Math.PI / 180) * 14} Z`}
          fill={FG}
        />
      </g>
      {/* Ghost */}
      <g transform={`translate(${ghostX}, 38)`}>
        <rect x="0" y="8" width="18" height="14" fill={FG2} />
        <ellipse cx="9" cy="8" rx="9" ry="9" fill={FG2} />
        {/* Skirt */}
        <rect x="0" y="18" width="4" height="6" fill={FG2} />
        <rect x="7" y="18" width="4" height="6" fill={FG2} />
        <rect x="14" y="18" width="4" height="6" fill={FG2} />
        {/* Eyes (cutout) */}
        <rect x="3" y="5" width="4" height="4" fill={BG} />
        <rect x="11" y="5" width="4" height="4" fill={BG} />
      </g>
      {/* HUD */}
      <text x="14" y="18" fontSize="7" fill={FG} fontFamily="monospace">SCORE {frame * 50}</text>
      <text x="200" y="18" fontSize="7" fill={FG2} fontFamily="monospace">HIGH {Math.max(9999 - frame * 10, 5000)}</text>
    </svg>
  )
}

const GAMES = [MarioGame, TankGame, PacmanGame] as const
const GAME_NAMES = ["SUPER MARIO", "BATTLE CITY", "PAC-MAN"]

// ─── main hero section ────────────────────────────────────────────────────────

export default function ArcadeHero() {
  const [phase, setPhase] = useState<"idle" | "starting" | "playing">("idle")
  const [frame, setFrame] = useState(0)
  const [gameIndex] = useState(() => Math.floor(Math.random() * 3))
  const [blink, setBlink] = useState(true)
  const rafRef = useRef<number>()
  const lastRef = useRef<number>(0)

  useEffect(() => {
    if (phase !== "idle") return
    const t = setInterval(() => setBlink(b => !b), 600)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase !== "playing") return
    const tick = (now: number) => {
      if (now - lastRef.current > 33) {
        lastRef.current = now
        setFrame(f => f + 1)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [phase])

  const handleInsertCoin = () => {
    if (phase !== "idle") return
    setPhase("starting")
    setTimeout(() => setPhase("playing"), 2000)
  }

  const GameComponent = GAMES[gameIndex]

  return (
    <section className="relative flex flex-col items-center justify-center py-2 px-4">
      {/* Screen container — compact, wide aspect ratio */}
      <div className="relative w-full max-w-3xl">
        {/* Bezel */}
        <div className="bg-gray-900 rounded-xl p-2 shadow-2xl shadow-black/80 border border-gray-700">
          {/* Screen */}
          <div
            className="relative rounded-lg overflow-hidden cursor-pointer"
            style={{ aspectRatio: "320/96", background: BG }}
            onClick={phase === "idle" ? handleInsertCoin : undefined}
          >
            {/* Scanlines */}
            <div className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)" }} />

            {/* IDLE */}
            {phase === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="text-[10px] font-mono tracking-widest" style={{ color: FG2 }}>
                  © 1985 ARCADEZENTER
                </div>
                <div
                  className={`text-base md:text-xl font-black font-mono tracking-widest transition-opacity duration-100 ${blink ? "opacity-100" : "opacity-0"}`}
                  style={{ color: FG }}
                >
                  ► INSERT COIN ◄
                </div>
                {/* Button inline on screen */}
                <button
                  onClick={handleInsertCoin}
                  className="mt-6 px-6 py-2 font-black font-mono text-xs tracking-widest border-2 transition-all duration-100 select-none
                    shadow-[4px_4px_0px_#ff00ff] hover:shadow-[2px_2px_0px_#ff00ff] hover:translate-x-0.5 hover:translate-y-0.5
                    active:translate-x-1 active:translate-y-1 active:shadow-none"
                  style={{ background: FG, color: BG, borderColor: BG }}
                >
                  INSERT COIN
                </button>
                <div className="text-[9px] font-mono mt-1 opacity-40" style={{ color: FG }}>
                  PRESS TO PLAY
                </div>
              </div>
            )}

            {/* STARTING */}
            {phase === "starting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="text-xl md:text-3xl font-black font-mono tracking-widest animate-pulse"
                  style={{ color: FG }}>
                  GAME START!
                </div>
                <div className="text-[10px] font-mono tracking-widest" style={{ color: FG2 }}>
                  {GAME_NAMES[gameIndex]}
                </div>
                <div className="flex gap-1.5 mt-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-2 animate-bounce"
                      style={{ background: FG, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* PLAYING */}
            {phase === "playing" && (
              <div className="absolute inset-0">
                <GameComponent frame={frame} />
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-1.5 px-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            </div>
            <div className="text-gray-600 text-[9px] font-mono tracking-widest">ARCADEZENTER v1.0</div>
            {phase === "playing" && (
              <button
                onClick={() => { setPhase("idle"); setFrame(0) }}
                className="text-[9px] text-gray-500 hover:text-yellow-400 transition font-mono underline"
              >
                GAME OVER
              </button>
            )}
            {phase !== "playing" && <div className="w-8" />}
          </div>
        </div>

        {/* Stand */}
        <div className="mx-auto w-16 h-1 bg-gray-800" />
        <div className="mx-auto w-24 h-1 bg-gray-900" />
      </div>
    </section>
  )
}
