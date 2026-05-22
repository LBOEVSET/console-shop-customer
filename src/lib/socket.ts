import { io } from "socket.io-client"

// export const connectSocket = (token: string) => {
//   return io(process.env.NEXT_PUBLIC_WS_URL!, {
//     auth: { token }
//   })
// }

export const connectSocket = ({
  token,
  guestId
}: {
  token?: string | null
  guestId?: string | null
}) => {
  return io(process.env.NEXT_PUBLIC_WS_URL!, {
    auth: {
      token,
      guestId
    },
    transports: ["websocket"]
  })
}
