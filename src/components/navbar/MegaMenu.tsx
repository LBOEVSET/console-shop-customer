"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function MegaMenu({
  title,
  items,
}: {
  title: string
  items: { name: string; image: string }[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-[720px] bg-black/95 
                 backdrop-blur-xl border
                 border-cyan-400/30 rounded-2xl 
                 shadow-2xl p-8 z-[999]"
    >
      <div className="grid grid-cols-3 gap-6">

        {items.map((item) => (
          <div
            key={item.name}
            className="group cursor-pointer"
          >
            <div className="relative h-32 w-full rounded-lg overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
            </div>

            <p className="mt-3 text-sm text-gray-300 group-hover:text-cyan-300 transition">
              {item.name}
            </p>
          </div>
        ))}

      </div>
    </motion.div>
  )
}
