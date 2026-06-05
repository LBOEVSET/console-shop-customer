import { io } from "socket.io-client"

// NEXT_PUBLIC_SOCKET_URL is baked into the build at compile time — no runtime
// fetch needed. Falls back to the NestJS backend default for local dev.
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3012"

/**
 * Connect to the backend's /chat Socket.IO namespace.
 */
export const connectSocket = ({ token }: { token: string }) => {
  return io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  })
}
