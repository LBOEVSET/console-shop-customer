import axios from "axios"
import { initGuest } from "@/lib/guest"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
})

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

/**
 * Attempt a silent token refresh using the stored refreshToken cookie.
 *
 * Uses native fetch — NOT the Axios instance — so the response interceptor
 * below cannot fire on this call. Using api.post() here would create a
 * circular dependency: the refresh request itself gets 401, the interceptor
 * fires on it, sees isRefreshing=true, awaits refreshPromise — which is
 * waiting for the very same interceptor to finish. That deadlock means the
 * original request's retry never runs.
 */
async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    return res.ok
  } catch {
    return false
  }
}

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

          // 1. Try a silent token refresh (real users whose access token expired).
          // 2. If refresh fails, fall back to guest-init so anonymous users get
          //    a fresh guest session and their pending action can proceed.
          refreshPromise = (async () => {
            const refreshed = await attemptRefresh()
            if (!refreshed) {
              await initGuest()
            }
          })()

          await refreshPromise

          isRefreshing = false
          refreshPromise = null
        } else if (refreshPromise) {
          // A concurrent request already started the recovery — wait for it.
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
