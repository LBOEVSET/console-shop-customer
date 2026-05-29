interface AppConfig {
  apiUrl: string
  socketUrl: string
}

let cached: AppConfig | null = null

export async function getConfig(): Promise<AppConfig> {
  if (cached) return cached
  const res = await fetch("/api/config")
  cached = await res.json()
  return cached!
}
