import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// The wall-clock time in a time zone (Dar es Salaam by default), updated on the minute.
// Measured through Intl, so the page never assumes the visitor's own time zone.
export function useWallTime(timeZone = 'Africa/Dar_es_Salaam') {
  let offset = 3 * 3600000 // East Africa Time: UTC+3, no daylight saving.

  function measure() {
    try {
      const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hourCycle: 'h23',
      })
      const now = new Date()
      const get = (type) => Number(fmt.formatToParts(now).find((p) => p.type === type).value)
      const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
      offset = Math.round((wall - Math.floor(now.getTime() / 1000) * 1000) / 60000) * 60000
    } catch {
      // Keep UTC+3.
    }
  }

  // A Date whose UTC fields read as the wall clock there.
  const now = ref(new Date(Date.now() + offset))
  let timer = 0

  function tick() {
    now.value = new Date(Date.now() + offset)
    clearTimeout(timer)
    timer = setTimeout(tick, 60000 - (now.value.getTime() % 60000) + 50)
  }

  function onVisibility() {
    if (document.hidden) return
    measure()
    tick()
  }

  onMounted(() => {
    measure()
    tick()
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisibility)
  })

  const parts = computed(() => {
    const h = now.value.getUTCHours()
    const m = now.value.getUTCMinutes()
    const pad = (n) => String(n).padStart(2, '0')
    const period = h >= 4 && h < 6 ? 'dawn' : h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 16 ? 'afternoon' : h >= 16 && h < 19 ? 'evening' : 'night'
    return {
      hh: pad(h),
      mm: pad(m),
      minutes: h * 60 + m,
      period,
      // Swahili time counts from sunrise: 7 in the morning is saa 1.
      swahiliHour: (h + 6) % 12 || 12,
    }
  })

  return { now, parts }
}
