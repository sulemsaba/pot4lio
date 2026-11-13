// Keep it up: tap the ball to kick it. Kick its left side and it goes right, and the
// other way round. Now and then a star appears: send the ball through it for +3.
// One touch of the grass and it is over.
// The rules only: the 3D scene that draws it is in scenes/mpira3d.js.

const W = 400
const H = 320
export const R = 21
export const GROUND = H - 22

export function createMpira() {
  const game = { size: { w: W, h: H }, score: 0, lives: null, over: false }
  let ball = null
  let star = null
  let kicks = 0 // counts kicks, so the scene can puff dust at each one
  let note = null
  let gravity = 1000
  let untilStar = 4
  let clock = 0
  let lockedUntil = 0

  game.reset = () => {
    game.score = 0
    game.over = false
    clock = 0
    lockedUntil = 0
    gravity = 1000
    untilStar = 4
    star = null
    kicks = 0
    note = null
    // The ball waits on the grass; the game opens with a high toss.
    ball = { x: W / 2, y: GROUND - R, vx: 0, vy: -640, turn: 0, spin: 0 }
  }

  function kick(side) {
    const lift = 520 * Math.sqrt(gravity / 1000)
    ball.vy = -lift
    ball.vx = Math.max(-260, Math.min(260, -side * 190 + ball.vx * 0.25))
    ball.spin = -side * 9
    game.score += 1
    kicks += 1
    gravity = Math.min(1000 + game.score * 14, 1700)
    if (Math.abs(side) < 0.18) note = { key: 'gameClean', t: 0.7, good: true }
    untilStar -= 1
    if (untilStar <= 0 && !star) {
      star = { x: 50 + Math.random() * (W - 100), y: 50 + Math.random() * 70, t: 6 }
      untilStar = 5 + Math.floor(Math.random() * 4)
    }
  }

  // A tap counts when it lands on or near the ball as it comes down. Space kicks only
  // while the ball is low and falling; pressed too soon, the leg needs a moment, so
  // hammering the key does not work.
  game.down = (point) => {
    if (!ball || ball.vy < -150) return
    if (!point) {
      if (clock < lockedUntil) return
      if (ball.y > H * 0.5 && ball.vy > 0) kick((Math.random() - 0.5) * 0.5)
      else lockedUntil = clock + 0.4
      return
    }
    const dx = point.x - ball.x
    const dy = point.y - ball.y
    if (Math.hypot(dx, dy) < R * 2.3) kick(Math.max(-1, Math.min(1, dx / (R * 1.4))))
  }

  game.up = () => {}

  game.step = (dt) => {
    clock += dt
    if (note) note.t -= dt
    ball.vy += gravity * dt
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt
    ball.turn += ball.spin * dt
    ball.spin *= 1 - dt * 0.6
    if (ball.x < R) {
      ball.x = R
      ball.vx = Math.abs(ball.vx) * 0.8
    }
    if (ball.x > W - R) {
      ball.x = W - R
      ball.vx = -Math.abs(ball.vx) * 0.8
    }
    if (ball.y < R) {
      ball.y = R
      ball.vy = Math.abs(ball.vy) * 0.4
    }
    if (star) {
      star.t -= dt
      if (Math.hypot(ball.x - star.x, ball.y - star.y) < R + 13) {
        game.score += 3
        note = { key: 'gameStar', extra: '+3', t: 1, good: true }
        star = null
      } else if (star.t <= 0) star = null
    }
    if (ball.y + R >= GROUND && ball.vy > 0) {
      ball.y = GROUND - R
      game.over = true
    }
  }

  game.view = () => ({ ball, star, kicks, over: game.over })
  game.note = () => (note && note.t > 0 ? note : null)

  game.reset()
  return game
}
