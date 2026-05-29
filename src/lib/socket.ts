import { io } from "socket.io-client"
import { getConfig } from "@/lib/config"

/**
 * Connect to the backend's /chat Socket.IO namespace.
 * socketUrl is read at runtime from /api/config so it never needs to be
 * baked into the image at build time.
 */
export const connectSocket = async ({ token }: { token: string }) => {
  const { socketUrl } = await getConfig()
  return io(`${socketUrl}/chat`, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  })
}
