/**
 * Bootstrap a guest session by hitting the backend directly with native fetch.
 *
 * Must NOT use the Axios `api` instance — this function is called from inside
 * the Axios response interceptor. Using `api` here would allow the interceptor
 * to fire on this call, potentially creating another circular retry chain.
 */
export const initGuest = async () => {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ""
  try {
    await fetch(`${base}/auth/guest/init`, {
      method: "POST",
      credentials: "include",
    })
  } catch (e) {
    console.error("Guest init failed")
  }
}
