"use client"

export default function RetroGridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

      {/* Gradient Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0033] via-[#0f0f1e] to-black" />

      {/* Moving Grid */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] 
        bg-[linear-gradient(to_right,rgba(0,255,255,0.15)_1px,transparent_1px),
             linear-gradient(to_top,rgba(0,255,255,0.15)_1px,transparent_1px)]
        bg-[size:60px_60px]
        animate-grid-move
        perspective-[500px]
        transform rotate-x-60
      " />

      {/* Glow Horizon */}
      <div className="absolute bottom-[58vh] left-0 right-0 h-40 
        bg-gradient-to-t from-fuchsia-500/30 to-transparent blur-2xl"
      />
    </div>
  )
}
