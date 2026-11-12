// v-tilt: a card leans toward the pointer, with a soft light where it points.
// Only for a mouse or trackpad, and never when the visitor asks for less motion.

const fine = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const tilt = {
  mounted(el, binding) {
    if (!fine()) return
    const max = binding.value ?? 6
    let frame = 0
    el.classList.add('tilt')

    const move = (event) => {
      const box = el.getBoundingClientRect()
      const x = (event.clientX - box.left) / box.width
      const y = (event.clientY - box.top) / box.height
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`)
        el.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`)
        el.style.setProperty('--gx', `${x * 100}%`)
        el.style.setProperty('--gy', `${y * 100}%`)
        el.classList.add('tilting')
      })
    }
    const leave = () => {
      cancelAnimationFrame(frame)
      el.classList.remove('tilting')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el._tilt = { move, leave }
  },
  unmounted(el) {
    if (!el._tilt) return
    el.removeEventListener('pointermove', el._tilt.move)
    el.removeEventListener('pointerleave', el._tilt.leave)
  },
}
