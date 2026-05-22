import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware — Guest session initializer
 *
 * Problem being solved:
 *   serverFetch() is called inside Server Components (e.g. page.tsx).
 *   Server Components cannot SET cookies — they can only read them.
 *   So when a brand-new visitor has no accessToken cookie, serverFetch
 *   was calling guest/init, using the returned cookie for one request,
 *   then discarding it. Every subsequent SSR request started cookieless.
 *
 * Fix:
 *   Middleware runs BEFORE the Server Component renders. It can both
 *   read and write cookies via NextResponse. If there is no accessToken
 *   we call guest/init here, get the httpOnly cookies from the backend,
 *   and forward them to the browser via Set-Cookie headers on the response.
 *   The browser stores them, and every future request — client or server
 *   — will carry them automatically.
 */
export async function middleware(request: NextRequest) {
  // Already has a session cookie — nothing to do
  if (request.cookies.has("accessToken")) {
    return NextResponse.next()
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
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

    // ── KEY FIX ──────────────────────────────────────────────────────────────
    // NextResponse.next() only affects the *response* (browser Set-Cookie).
    // But serverFetch() calls `cookies()` from next/headers, which reads the
    // *incoming request* headers — not the response. So the Server Component
    // renders before the browser ever receives the new cookies, and sees no
    // accessToken at all, causing the 401.
    //
    // The fix: forward the new cookie values into the *request* headers too
    // via `NextResponse.next({ request: { headers } })`. Next.js will use
    // these headers when it passes the request to Server Components, so
    // `cookies()` will see the fresh guest token in the same SSR pass.
    // ─────────────────────────────────────────────────────────────────────────
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
