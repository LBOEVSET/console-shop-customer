import { io } from "socket.io-client"

/**
 * Connect to the backend's /chat Socket.IO namespace.
 *
 * Why we pass `token` explicitly rather than relying on the httpOnly cookie:
 * The accessToken cookie is scoped to the Next.js proxy origin (localhost:3022).
 * The WebSocket connects directly to the backend (localhost:3012), a different
 * origin, so the browser won't send that cookie automatically.
 * The caller must first fetch a token from GET /api/v1/auth/ws-token and pass
 * it here so the gateway can authenticate via handshake.auth.token.
 */
export const connectSocket = ({ token }: { token: string }) => {
  const base = process.env.NEXT_PUBLIC_SOCKET_URL!  // e.g. http://localhost:3012
  return io(`${base}/chat`, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  })
}
