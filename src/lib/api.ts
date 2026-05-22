import axios from "axios"
import { initGuest } from "@/lib/guest"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        if (!isRefreshing) {
          isRefreshing = true

          // 1. Try to silently refresh with the refresh token cookie.
          //    This keeps logged-in users' sessions alive without interruption.
          // 2. Only if the refresh itself returns 401 (expired or not present),
          //    fall back to guest init so anonymous browsing still works.
          refreshPromise = api
            .post("/auth/refresh")
            .then(() => {})
            .catch(async (refreshError) => {
              if (refreshError.response?.status === 401) {
                await initGuest()
              } else {
                throw refreshError
              }
            })

          await refreshPromise

          isRefreshing = false
          refreshPromise = null
        } else if (refreshPromise) {
          // Another concurrent request already started a refresh — wait for it
          await refreshPromise
        }

        return api(originalRequest)

      } catch (err) {
        isRefreshing = false
        refreshPromise = null
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default api
