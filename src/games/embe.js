// Mango drop: a mango swings from a branch. Tap to let it go and land it in the basket
// moving along the ground. Each catch makes the basket a little smaller and quicker.
// The rules only: the 3D scene that draws it is in scenes/embe3d.js.

const W = 400
const H = 320
export const PIVOT = { x: 200, y: 62 }
export const RIM = 268 // top of the basket
export const GROUND = 294
export const R = 11 // mango radius
const STRING = 80

export function createEmbe() {
  const game = { size: { w: W, h: H }, score: 0, lives: 3, over: false }
  let swing = { amp: 0.9, speed: 2.3, time: 0 }
  let mango = null
  let basket = { x: 200, w: 86, v: 70, dir: 1 }
  let wait = 0
  let note = null
  let streak = 0
  let count = 0 // which mango this is, so the scene knows a new one has grown

  function hang() {
    swing = {
      amp: 0.75 + Math.random() * 0.35,
      speed: 2.1 + Math.min(game.score * 0.05, 1.6) + Math.random() * 0.3,
      time: Math.random() * 3,
    }
    count += 1
    mango = { id: count, on: true, x: 0, y: 0, vx: 0, vy: 0, spin: 0, turn: 0, grow: 0, caught: false, landed: false, offset: 0 }
    place()
  }

  function place() {
    const angle = swing.amp * Math.sin(swing.speed * swing.time)
    mango.x = PIVOT.x + Math.sin(angle) * STRING
    mango.y = PIVOT.y + Math.cos(angle) * STRING
    mango.turn = -angle
  }

  game.reset = () => {
    game.score = 0
    game.lives = 3
    game.over = false
    basket = { x: 200, w: 86, v: 70, dir: 1 }
    note = null
    wait = 0
    streak = 0
    hang()
    mango.grow = 1 // the first one is already hanging there, ready
  }

  game.down = () => {
    if (!mango?.on || mango.grow < 1) return
    // Let go: it flies off along the swing, at the swing's speed.
    const angle = swing.amp * Math.sin(swing.speed * swing.time)
    const turning = swing.amp * swing.speed * Math.cos(swing.speed * swing.time)
    mango.on = false
    mango.vx = STRING * turning * Math.cos(angle)
    mango.vy = -STRING * turning * Math.sin(angle)
    mango.spin = turning * 2
  }

  game.up = () => {}

  game.step = (dt) => {
    if (note) note.t -= dt
    // The basket goes back and forth.
    basket.x += basket.v * basket.dir * dt
    const edge = basket.w / 2 + 10
    if (basket.x > W - edge) basket.dir = -1
    if (basket.x < edge) basket.dir = 1
    basket.x = Math.min(W - edge, Math.max(edge, basket.x))

    if (wait > 0) {
      wait -= dt
      if (wait <= 0) {
        if (game.lives <= 0) game.over = true
        else hang()
      }
      return
    }
    if (!mango) return
    if (mango.on) {
      swing.time += dt
      mango.grow = Math.min(1, mango.grow + dt * 4)
      place()
      return
    }
    const before = mango.y
    mango.vy += 900 * dt
    mango.x += mango.vx * dt
    mango.y += mango.vy * dt
    mango.turn += mango.spin * dt
    // Crossing the rim: in, or off the edge.
    if (before < RIM && mango.y >= RIM && mango.vy > 0) {
      const off = mango.x - basket.x
      const half = basket.w / 2
      if (Math.abs(off) < half - R * 0.4) return catchIt(off, Math.abs(off) < half * 0.3)
      if (Math.abs(off) < half + R) {
        mango.vy *= -0.35
        mango.vx = Math.sign(off || 1) * (60 + Math.abs(mango.vx) * 0.4)
        mango.y = RIM - 1
      }
    }
    // On the grass, or out of reach: missed.
    if (mango.y >= GROUND - R || mango.x < -40 || mango.x > W + 40) {
      mango.y = Math.min(mango.y, GROUND - R)
      mango.landed = true
      game.lives -= 1
      streak = 0
      note = { key: 'gameMissed', t: 1, good: false }
      wait = 0.7
    }
  }

  function catchIt(off, clean) {
    streak = clean ? streak + 1 : 0
    const gain = clean ? 2 : 1
    game.score += gain
    note = { key: clean ? 'gameSwish' : 'gameNice', extra: `+${gain}`, t: 1, good: true }
    mango.caught = true
    mango.offset = off
    basket.w = Math.max(48, basket.w - 2.5)
    basket.v = Math.min(70 + game.score * 6, 240)
    wait = 0.45
  }

  game.view = () => ({ mango, basket })
  game.note = () => (note && note.t > 0 ? note : null)

  game.reset()
  return game
}
