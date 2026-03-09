import { cookies } from "next/headers"

export async function serverFetch(path: string) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  let res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    }
  )

  // If unauthorized → initialize guest → retry
  if (res.status === 401) {
    console.log("🔁 No valid cookie, initializing guest...")

    const guestRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/guest/init`,
      {
        method: "POST",
        cache: "no-store",
      }
    )

    const setCookie = guestRes.headers.get("set-cookie")

    if (!setCookie) {
      throw new Error("Guest init did not return cookies")
    }

    // Retry request with fresh cookie
    res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      {
        headers: {
          Cookie: setCookie,
        },
        cache: "no-store",
      }
    )
  }

  if (!res.ok) {
    const text = await res.text()
    console.error("API ERROR:", text)
    throw new Error(`Failed request: ${path}`)
  }

  return res.json()
}
