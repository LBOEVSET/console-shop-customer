// components/home/SectionHeader.tsx

export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl md:text-4xl font-black tracking-wide bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent">
        {title}
      </h2>

      <span className="text-sm uppercase tracking-widest text-white/60">
        View All →
      </span>
    </div>
  )
}
