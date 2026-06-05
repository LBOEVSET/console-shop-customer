import { NextResponse } from "next/server"

/**
 * @deprecated — This endpoint is no longer used.
 *
 * API base URL is hardcoded as "/api/v1" in src/lib/api.ts.
 * Socket URL reads NEXT_PUBLIC_SOCKET_URL directly in src/lib/socket.ts.
 * This route exists only so Next.js doesn't error on a route file with no exports.
 * Safe to delete the entire src/app/api/config/ directory.
 */
export async function GET() {
  return NextResponse.json(
    { deprecated: true, message: "This endpoint is no longer in use." },
    { status: 410 },
  )
}
