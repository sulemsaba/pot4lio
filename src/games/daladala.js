// Daladala: hold to brake, let go to roll on. Stop with the door right at the bus stop.
// The closer, the more points; three missed stops and the shift is over.
// The rules only: the 3D scene that draws it is in scenes/daladala3d.js.

const W = 400
const H = 300
export const BUS = 104 // bus length
export const DOOR = 0.74 // where the door is, along the bus

export function createDaladala() {
  const game = { size: { w: W, h: H }, score: 0, lives: 3, over: false }
  let round = 0
  let streak = 0
  let bus = { x: 0, v: 0, wheel: 0 }
  let stop = 0
  let braking = false
  let phase = 'drive'
  let clock = 0
  let riders = []
  let note = null

  function nextStop() {
    round += 1
    bus = { x: -BUS - 30, v: Math.min(165 + round * 8, 360) + Math.random() * 40, wheel: 0 }
    stop = 180 + Math.random() * 170
    riders = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, (_, i) => ({ x: stop + 16 + i * 13, in: false, look: Math.floor(Math.random() * 6) }))
    braking = false
    phase = 'drive'
    clock = 0
  }

  game.reset = () => {
    round = 0
    streak = 0
    game.score = 0
    game.lives = 3
    game.over = false
    note = null
    nextStop()
  }

  game.down = () => {
    if (phase === 'drive') braking = true
  }

  game.up = () => {
    braking = false
  }

  function judge() {
    const off = Math.abs(bus.x + BUS * DOOR - stop)
    if (off <= 4) {
      streak += 1
      const gain = 3 + Math.min(streak - 1, 5)
      game.score += gain
      note = { key: 'gamePerfect', extra: `+${gain}`, t: 1.1, good: true }
    } else if (off <= 13) {
      streak = 0
      game.score += 2
      note = { key: 'gameGood', extra: '+2', t: 1.1, good: true }
    } else if (off <= 24) {
      streak = 0
      game.score += 1
      note = { key: 'gameClose', extra: '+1', t: 1.1, good: true }
    } else {
      return miss('gameEarly')
    }
    phase = 'board'
    clock = 0
  }

  function miss(key) {
    streak = 0
    game.lives -= 1
    note = { key, t: 1.2, good: false }
    phase = 'missed'
    clock = 0
    braking = false
  }

  game.step = (dt) => {
    clock += dt
    if (note) note.t -= dt
    if (phase === 'drive') {
      const slowing = braking ? 300 + round * 3 : 12
      bus.v = Math.max(0, bus.v - slowing * dt)
      bus.x += bus.v * dt
      const door = bus.x + BUS * DOOR
      if (door > stop + 24) miss('gamePassed')
      else if (bus.v === 0) judge()
    } else if (phase === 'board') {
      // The riders walk to the door and climb in.
      const door = bus.x + BUS * DOOR
      for (const rider of riders) {
        if (rider.in) continue
        rider.x += Math.sign(door - rider.x) * Math.min(Math.abs(door - rider.x), 90 * dt)
        if (Math.abs(rider.x - door) < 1) rider.in = true
      }
      if (clock > 0.9) phase = 'leave'
    } else {
      // Pull away (or roll on past a missed stop), then the next stop.
      if (phase === 'missed' && clock > 0.9 && game.lives <= 0) {
        game.over = true
        return
      }
      if (phase === 'leave' || clock > 0.5) bus.v = Math.min(bus.v + 380 * dt, 420)
      bus.x += bus.v * dt
      if (bus.x > W + 30) nextStop()
    }
    bus.wheel += (bus.v * dt) / 9
  }

  // What the scene needs to draw this moment, and the message to show, if any.
  game.view = () => ({ bus, stop, riders, braking, phase })
  game.note = () => (note && note.t > 0 ? note : null)

  game.reset()
  return game
}
