import api from "./api"

export const initGuest = async () => {
  try {
    await api.post("/auth/guest/init")
  } catch (e) {
    console.error("Guest init failed")
  }
}
