import axios from "axios"
import { initGuest } from "@/lib/guest"

const baseURL = process.env.NEXT_API_URL;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
})

let isRefreshing = false

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If unauthorized & not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        if (!isRefreshing) {
          isRefreshing = true
          await initGuest()
          isRefreshing = false
        }

        return api(originalRequest) // retry original request
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default api
