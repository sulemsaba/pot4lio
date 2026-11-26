// Springs for the site's motion: the pull cord, the menu pill and the rolling word.
// The same simple model as DesignBookmark's motion studies (the source of those three
// pieces): a value x chases its target t with stiffness k and damping c, mass 1.
// With reduced motion every spring is critically damped, so nothing overshoots.

export const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function spring(x, k = 400, c = 30) {
  const s = { x, v: 0, t: x, k, c }
  tune(s, k, c)
  return s
}

export function tune(s, k, c) {
  s.k = k
  s.c = calm ? 2 * Math.sqrt(k) : c
}

export function step(s, dt) {
  const a = -s.k * (s.x - s.t) - s.c * s.v
  s.v += a * dt
  s.x += s.v * dt
}

export function snap(s, x = s.t) {
  s.x = s.t = x
  s.v = 0
}

export const still = (s, near = 0.01) => Math.abs(s.x - s.t) < near && Math.abs(s.v) < near

export const clamp = (v, low, high) => Math.max(low, Math.min(high, v))

// One animation loop per component, four small steps a frame, that goes to sleep
// as soon as frame() reports nothing is moving. wake() starts it again; stop() ends it
// for good, when the component goes away.
export function motion({ frame, render }) {
  let raf = 0
  let last = 0
  let ended = false
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    let busy = false
    for (let i = 0; i < 4; i += 1) busy = frame(dt / 4) || busy
    render()
    raf = busy ? requestAnimationFrame(loop) : 0
  }
  return {
    wake() {
      if (raf || ended) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    },
    stop() {
      ended = true
      cancelAnimationFrame(raf)
      raf = 0
    },
  }
}

// A spring from 0 to 1 written out as keyframes, for animations the browser runs
// itself (the theme change). Returns the values and how long they last.
export function springFrames(k, c) {
  const s = spring(0, k, c)
  s.t = 1
  const values = [0]
  const dt = 1 / 60
  for (let n = 0; n < 240; n += 1) {
    for (let i = 0; i < 4; i += 1) step(s, dt / 4)
    values.push(s.x)
    if (still(s, 0.002)) break
  }
  values[values.length - 1] = 1
  return { values, duration: (values.length - 1) * 1000 * dt }
}
