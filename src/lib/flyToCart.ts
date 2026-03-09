export function flyToCart(
  imageElement: HTMLImageElement,
  cartElement: HTMLElement
) {
  const imgRect = imageElement.getBoundingClientRect()

  // 🔥 target real SVG inside link
  const svg = cartElement.querySelector("svg") as HTMLElement | null
  const cartRect = svg
    ? svg.getBoundingClientRect()
    : cartElement.getBoundingClientRect()

  const clone = imageElement.cloneNode(true) as HTMLImageElement

  clone.style.position = "fixed"
  clone.style.left = `${imgRect.left}px`
  clone.style.top = `${imgRect.top}px`
  clone.style.width = `${imgRect.width}px`
  clone.style.height = `${imgRect.height}px`
  clone.style.zIndex = "9999"
  clone.style.pointerEvents = "none"
  clone.style.transition = "none"

  document.body.appendChild(clone)

  const startX = imgRect.left + imgRect.width / 2
  const startY = imgRect.top + imgRect.height / 2

  const endX = cartRect.left + cartRect.width / 2
  const endY = cartRect.top + cartRect.height / 2

  // 🔥 Aggressive swoosh control point
  const controlX = startX + (endX - startX) * 0.25
  const controlY = startY + 120   // dip downward first

  const duration = 800
  const startTime = performance.now()

  function animate(time: number) {
    const t = Math.min((time - startTime) / duration, 1)

    // strong ease-in-out
    const ease = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2

    // Quadratic Bézier
    const x =
      (1 - ease) * (1 - ease) * startX +
      2 * (1 - ease) * ease * controlX +
      ease * ease * endX

    const y =
      (1 - ease) * (1 - ease) * startY +
      2 * (1 - ease) * ease * controlY +
      ease * ease * endY

    clone.style.left = `${x - imgRect.width / 2}px`
    clone.style.top = `${y - imgRect.height / 2}px`
    clone.style.transform = `
      scale(${1 - ease * 0.75})
      rotate(${ease * 25}deg)
    `
    clone.style.opacity = `${1 - ease * 0.9}`

    if (t < 1) {
      requestAnimationFrame(animate)
    } else {
      clone.remove()

      cartElement.classList.add("scale-125")
      setTimeout(() => {
        cartElement.classList.remove("scale-125")
      }, 200)
    }
  }

  requestAnimationFrame(animate)
}
