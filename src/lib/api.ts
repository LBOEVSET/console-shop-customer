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

          refreshPromise = initGuest()

          await refreshPromise

          isRefreshing = false
          refreshPromise = null
        } else if (refreshPromise) {
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
