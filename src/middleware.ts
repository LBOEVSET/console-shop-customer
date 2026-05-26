import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware — Guest session initializer

export async function middleware(request: NextRequest) {
  // Already has a session cookie — nothing to do
  if (request.cookies.has("accessToken")) {
    return NextResponse.next()
  }

  try {
    // Use the internal (server-side) URL — NEXT_PUBLIC_API_URL is now the
    // relative path "/api/v1" intended for the browser. The middleware runs
    // in the Node.js/Edge runtime and needs an absolute URL for fetch().
    const apiUrl = process.env.INTERNAL_API_URL
    if (!apiUrl) return NextResponse.next()

    const guestRes = await fetch(`${apiUrl}/auth/guest/init`, {
      method: "POST",
      cache: "no-store",
    })

    if (!guestRes.ok) return NextResponse.next()

    // getSetCookie() returns each Set-Cookie value as a separate string,
    // which is the correct way to handle cookies that may contain commas
    // (e.g. in Expires dates). Available in Node.js 18+ (Next.js 13.4+).
    const setCookies: string[] =
      typeof (guestRes.headers as any).getSetCookie === "function"
        ? (guestRes.headers as any).getSetCookie()
        : (guestRes.headers.get("set-cookie") ?? "")
            .split(/,(?=[^ ])/)
            .filter(Boolean)

    if (setCookies.length === 0) return NextResponse.next()

    const requestHeaders = new Headers(request.headers)
    const existingCookies = requestHeaders.get("cookie") ?? ""
    const cookiePairs = setCookies
      .map((c) => c.split(";")[0].trim())   // strip Expires/Path/HttpOnly etc.
      .filter(Boolean)

    requestHeaders.set(
      "cookie",
      existingCookies ? `${existingCookies}; ${cookiePairs.join("; ")}` : cookiePairs.join("; ")
    )

    // Rewrite both the forwarded request (so Server Components see it) AND
    // the response (so the browser stores the cookies for future requests).
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    for (const cookie of setCookies) {
      response.headers.append("set-cookie", cookie)
    }
    return response
  } catch {
    // If guest init fails (e.g. backend is down) let the request through —
    // the page/API will surface its own error.
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Run on all routes EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - /api/*        (Next.js API routes, if any)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
}
