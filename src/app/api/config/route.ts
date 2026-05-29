import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.API_URL ?? "http://localhost:3012/api/v1",
    socketUrl: process.env.SOCKET_URL ?? "http://localhost:3012",
  })
}
