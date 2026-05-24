import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.INTERNAL_API_URL ?? 'http://localhost:3012/api/v1'

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = `${BACKEND}/${path.join('/')}${req.nextUrl.search}`

  // Forward all request headers except `host` (which must reflect the
  // backend host, not the Next.js origin).
  const headers = new Headers(req.headers)
  headers.delete('host')

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: req.body,
    // @ts-expect-error -- Node.js fetch requires duplex:'half' when body is a
    // ReadableStream, but the TypeScript types don't include it yet.
    duplex: req.body ? 'half' : undefined,
    cache: 'no-store',
  })

  // Pass every header (including Set-Cookie) straight back to the browser.
  // NextResponse automatically handles multiple Set-Cookie values correctly.
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const OPTIONS = proxy
