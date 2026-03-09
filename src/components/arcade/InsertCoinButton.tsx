"use client"

import { useState } from "react"

export default function InsertCoinButton() {
  const [active, setActive] = useState(false)

  return (
    <button
      onClick={() => setActive(true)}
      className="relative px-8 py-3 bg-yellow-400 text-black font-black
                 border-4 border-black 
                 shadow-[6px_6px_0px_#ff00ff]
                 active:translate-x-1 active:translate-y-1
                 active:shadow-[2px_2px_0px_#ff00ff]
                 transition-all"
    >
      {active ? "GAME STARTED!" : "INSERT COIN"}
    </button>
  )
}
