import { cookies } from "next/headers"

/**
 * Server-side fetch helper for Server Components.
 *
 * Guest session initialisation is handled upstream by middleware.ts,
 * which ensures every request arrives with valid accessToken / refreshToken
 * cookies already set. This function simply forwards those cookies to the
 * backend and throws on non-OK responses.
 */
export async function serverFetch(path: string) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`serverFetch failed [${res.status}] ${path}: ${text}`)
  }

  return res.json()
}
