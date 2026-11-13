// A young footballer for Keep it up: built from smooth, tapered shapes on a skeleton
// of joints, then posed every frame. He shuffles under the ball, watches it, and meets
// it with his foot, his thigh, his chest or his head, depending on how high it is.

import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { THREE, bake, painted } from './stage.js'

const HIP = 1.5 // hip height; the whole player stands about 2.95 tall
const THIGH = 0.7
const SHIN = 0.67
const UPPER_ARM = 0.48
const FOREARM = 0.42
const AHEAD = 0.36 // he stands this far behind the ball's path

// A smooth limb hanging down from its joint, wider or narrower along its length.
// radii: from the far end (bottom) to the joint (top).
function limb(length, radii, material, segments = 20) {
  const points = [new THREE.Vector2(0, -length)]
  radii.forEach((r, i) => points.push(new THREE.Vector2(r, -length + (length * i) / (radii.length - 1))))
  points.push(new THREE.Vector2(0, 0))
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(points, segments), material)
  mesh.castShadow = true
  return mesh
}

function ball(radius, sx, sy, sz, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 18), material)
  mesh.scale.set(sx, sy, sz)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  return mesh
}

export function createFootballer() {
  // Materials: skin with a soft sheen, a blue and gold kit, white shorts, striped socks.
  const skin = new THREE.MeshPhysicalMaterial({ color: '#5a3824', roughness: 0.48, sheen: 0.5, sheenRoughness: 0.6, sheenColor: '#b07850', clearcoat: 0.05 })
  const jersey = new THREE.MeshStandardMaterial({
    roughness: 0.82,
    map: painted(512, 256, (ctx, w, h) => {
      ctx.fillStyle = '#1c4fa8'
      ctx.fillRect(0, 0, w, h)
      for (let y = 0; y < h; y += 4) {
        ctx.fillStyle = `rgb(255 255 255 / ${y % 8 ? 0.015 : 0.035})`
        ctx.fillRect(0, y, w, 1)
      }
      // The number, on the chest (the middle of the wrap is his front).
      ctx.fillStyle = '#f2c200'
      ctx.textAlign = 'center'
      ctx.font = "800 72px 'Hanken Grotesk Variable', sans-serif"
      ctx.fillText('10', w / 2, h * 0.45 + 26)
      ctx.fillStyle = '#f2c200'
      ctx.fillRect(0, h - 10, w, 10)
    }),
  })
  const cloth = new THREE.MeshStandardMaterial({ color: '#1c4fa8', roughness: 0.82 })
  const trim = new THREE.MeshStandardMaterial({ color: '#f2c200', roughness: 0.6 })
  const shorts = new THREE.MeshStandardMaterial({ color: '#f4f4f2', roughness: 0.85 })
  const socks = new THREE.MeshStandardMaterial({
    roughness: 0.9,
    map: painted(64, 128, (ctx, w, h) => {
      ctx.fillStyle = '#1c4fa8'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#f2c200'
      ctx.fillRect(0, 14, w, 10)
      ctx.fillRect(0, 30, w, 5)
    }),
  })
  const boot = new THREE.MeshStandardMaterial({ color: '#141418', roughness: 0.3, metalness: 0.2 })
  // Short, tightly curled hair: dark, with a fine grain.
  const hair = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    map: painted(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#151010'
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 2600; i += 1) {
        ctx.fillStyle = i % 3 ? '#0b0808' : '#2a2220'
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
      }
    }),
  })
  const dark = new THREE.MeshStandardMaterial({ color: '#1a1210', roughness: 0.4 })
  const white = new THREE.MeshStandardMaterial({ color: '#f3efe8', roughness: 0.3 })
  const lips = new THREE.MeshStandardMaterial({ color: '#4a2620', roughness: 0.5 })

  const root = new THREE.Group()
  const pelvis = new THREE.Group()
  pelvis.position.y = HIP
  root.add(pelvis)

  // Shorts round the hips.
  const hips = new THREE.Mesh(
    new THREE.LatheGeometry([[0, -0.2], [0.21, -0.2], [0.235, -0.08], [0.225, 0.06], [0.21, 0.1], [0, 0.1]].map(([r, y]) => new THREE.Vector2(r, y)), 28),
    shorts,
  )
  hips.scale.z = 0.72
  hips.castShadow = true
  pelvis.add(hips)

  // Torso: waist to shoulders, flattened front to back, the jersey wrapped round.
  const spine = new THREE.Group()
  spine.position.y = 0.06
  pelvis.add(spine)
  const torso = new THREE.Mesh(
    new THREE.LatheGeometry(
      [[0, 0], [0.21, 0], [0.215, 0.14], [0.245, 0.42], [0.288, 0.66], [0.298, 0.79], [0.22, 0.89], [0.09, 0.95], [0, 0.95]].map(([r, y]) => new THREE.Vector2(r, y)),
      36,
      Math.PI,
    ),
    jersey,
  )
  torso.scale.z = 0.62
  torso.castShadow = true
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 8, 24), trim)
  collar.rotation.x = Math.PI / 2
  collar.position.y = 0.94
  spine.add(torso, collar)

  // Neck and head: skull, jaw, hair, ears, nose, eyes, brows, mouth.
  const neck = new THREE.Group()
  neck.position.y = 0.93
  spine.add(neck)
  const neckMesh = limb(0.13, [0.078, 0.074, 0.076], skin)
  neckMesh.rotation.x = Math.PI
  neck.add(neckMesh)
  const head = new THREE.Group()
  head.position.y = 0.27
  neck.add(head)
  head.add(
    ball(1, 0.16, 0.2, 0.175, skin),
    ball(1, 0.13, 0.115, 0.135, skin, 0, -0.085, 0.025),
    ball(1, 0.03, 0.05, 0.022, skin, 0.162, -0.005, 0),
    ball(1, 0.03, 0.05, 0.022, skin, -0.162, -0.005, 0),
    ball(1, 0.03, 0.036, 0.034, skin, 0, -0.03, 0.166),
  )
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hair)
  cap.scale.set(0.165, 0.198, 0.18)
  cap.position.y = 0.035
  cap.rotation.x = -0.3
  head.add(cap)
  for (const side of [-1, 1]) {
    const eye = ball(1, 0.021, 0.014, 0.01, white, side * 0.057, 0.028, 0.158)
    const pupil = ball(1, 0.011, 0.011, 0.005, dark, side * 0.057, 0.028, 0.167)
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.011, 0.012), hair)
    brow.position.set(side * 0.058, 0.064, 0.162)
    brow.rotation.z = side * -0.12
    head.add(eye, pupil, brow)
  }
  head.add(ball(1, 0.04, 0.012, 0.012, lips, 0, -0.105, 0.152))
  // The face's small parts cast no shadow of their own; then the head is drawn as one
  // mesh per material.
  for (const part of head.children) part.castShadow = part.material === skin || part === cap
  bake(head, { deep: false })

  // Arms: shoulder, sleeve, upper arm, elbow, forearm, hand.
  function arm(side) {
    const shoulder = new THREE.Group()
    shoulder.position.set(side * 0.335, 0.8, 0)
    spine.add(shoulder)
    const sleeve = limb(0.2, [0.088, 0.098, 0.104], cloth)
    const upper = limb(UPPER_ARM, [0.056, 0.066, 0.074, 0.08], skin)
    const elbow = new THREE.Group()
    elbow.position.y = -UPPER_ARM
    const forearm = limb(FOREARM, [0.04, 0.05, 0.062, 0.06], skin)
    const hand = ball(1, 0.045, 0.08, 0.03, skin, 0, -FOREARM - 0.06, 0)
    elbow.add(forearm, hand)
    shoulder.add(sleeve, upper, elbow, ball(0.1, 1, 1, 1, cloth))
    bake(elbow, { deep: false })
    bake(shoulder, { deep: false })
    return { shoulder, elbow }
  }

  // Legs: shorts leg, thigh, knee, sock over the shin, ankle, boot.
  function leg(side) {
    const hip = new THREE.Group()
    hip.position.set(side * 0.12, -0.04, 0)
    pelvis.add(hip)
    const shortLeg = limb(0.3, [0.12, 0.126, 0.13], shorts)
    const thigh = limb(THIGH, [0.075, 0.09, 0.105, 0.115, 0.118], skin)
    const knee = new THREE.Group()
    knee.position.y = -THIGH
    const shin = limb(SHIN, [0.046, 0.055, 0.078, 0.082, 0.07], socks)
    const ankle = new THREE.Group()
    ankle.position.y = -SHIN
    const shoe = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.095, 0.31, 3, 0.04), boot)
    shoe.position.set(0, -0.045, 0.085)
    shoe.castShadow = true
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.134, 0.022, 0.12), trim)
    stripe.position.set(0, -0.03, 0.06)
    ankle.add(shoe, stripe)
    knee.add(shin, ankle, ball(0.072, 1, 1, 1, skin))
    hip.add(shortLeg, thigh, knee)
    return { hip, knee, ankle }
  }

  // His right side is screen left: he faces us.
  const arms = { r: arm(-1), l: arm(1) }
  const legs = { r: leg(-1), l: leg(1) }

  // Motion state.
  let x = 0
  let speed = 0
  let stride = 0
  let strike = null
  let flicked = false
  let lastKicks = 0
  let gloom = 0

  // Two-joint leg reach: the hip and knee angles that put the foot at (forward, height).
  function reach(forward, height) {
    const dy = height - (HIP - 0.07)
    const dist = Math.min(Math.hypot(forward, dy), THIGH + SHIN - 0.01)
    const toward = Math.atan2(forward, -dy)
    const spread = Math.acos((THIGH * THIGH + dist * dist - SHIN * SHIN) / (2 * THIGH * dist))
    const bend = Math.PI - Math.acos((THIGH * THIGH + SHIN * SHIN - dist * dist) / (2 * THIGH * SHIN))
    return { hip: -(toward + spread), knee: bend }
  }

  const ease = (t) => t * t * (3 - 2 * t)

  // view: ball centre (scene units), its speed, kick count, over.
  function update({ bx, by, vx, kicks, over, radius }, dt, time) {
    const resting = by <= radius + 0.001 && !over && kicks === 0 && !flicked
    if (kicks < lastKicks || (resting && flicked)) flicked = false
    if (!flicked && kicks === 0 && by > radius + 0.02 && !over) {
      flicked = true
      strike = { kind: 'foot', at: time, h: radius * 0.6 }
    }
    if (kicks > lastKicks) {
      const kind = by < 0.95 ? 'foot' : by < 1.75 ? 'thigh' : by < 2.35 ? 'chest' : 'head'
      strike = { kind, at: time, h: by - radius * 0.8, side: kind === 'thigh' && kicks % 2 ? 'l' : 'r' }
    }
    lastKicks = kicks
    gloom += ((over ? 1 : 0) - gloom) * Math.min(1, dt * 5)

    // Shuffle under the ball so the right boot is beneath it.
    const target = Math.max(-1.9, Math.min(1.9, bx + 0.12))
    const want = Math.max(-3.4, Math.min(3.4, (target - x) * 9))
    speed += (want - speed) * Math.min(1, dt * 10)
    if (over) speed *= 1 - Math.min(1, dt * 8)
    x += speed * dt
    stride += Math.abs(speed) * dt * 7
    root.position.set(x, 0, -AHEAD)

    // How far into the strike: quick up, a beat, back down.
    let w = 0
    if (strike) {
      const t = time - strike.at
      w = t < 0.07 ? ease(t / 0.07) : t < 0.13 ? 1 : t < 0.45 ? 1 - ease((t - 0.13) / 0.32) : 0
      if (t >= 0.45) strike = null
    }
    const move = Math.min(1, Math.abs(speed) / 2)
    const step = Math.sin(stride)
    const breathe = Math.sin(time * 5)

    // The ready stance, then each part blended towards the strike.
    let lift = Math.abs(step) * 0.03 * move + breathe * 0.008 * (1 - move)
    let lean = 0.1
    let nod = THREE.MathUtils.clamp(Math.atan2(2.72 - by, AHEAD + 0.2) * 0.6, -0.5, 0.55)
    const turn = THREE.MathUtils.clamp((bx - x) * 0.6, -0.5, 0.5)
    const pose = {
      r: { hip: -0.18 + step * 0.4 * move, knee: 0.34 + Math.max(0, -step) * 0.5 * move, spread: -0.06 },
      l: { hip: -0.18 - step * 0.4 * move, knee: 0.34 + Math.max(0, step) * 0.5 * move, spread: 0.06 },
    }
    const armOut = { r: -0.32, l: 0.32 }
    const armFwd = { r: -0.2, l: -0.2 }
    const elbowBend = { r: -0.55, l: -0.55 }
    const elbowTwist = { r: 0, l: 0 }

    // Before the game: right boot resting on top of the ball.
    if (by <= radius + 0.001 && !over && kicks === 0) {
      const sole = reach(AHEAD - 0.06, radius * 2 + 0.06)
      pose.r.hip = sole.hip
      pose.r.knee = sole.knee
      pose.l.knee = 0.1
      lean = 0.04
    }

    if (strike && w > 0) {
      const side = strike.side || 'r'
      const other = side === 'r' ? 'l' : 'r'
      if (strike.kind === 'foot') {
        const k = reach(AHEAD - 0.04, Math.max(0.12, strike.h))
        pose[side].hip += (k.hip - pose[side].hip) * w
        pose[side].knee += (k.knee - pose[side].knee) * w
        pose[other].knee += 0.25 * w
        lean -= 0.12 * w
        armOut[other] *= 1 + 1.4 * w
      } else if (strike.kind === 'thigh') {
        pose[side].hip += (-1.5 - pose[side].hip) * w
        pose[side].knee += (1.6 - pose[side].knee) * w
        lean -= 0.08 * w
        armOut.r *= 1 + 1.2 * w
        armOut.l *= 1 + 1.2 * w
      } else if (strike.kind === 'chest') {
        lean -= 0.45 * w
        pose.r.knee += 0.35 * w
        pose.l.knee += 0.35 * w
        armOut.r *= 1 + 2 * w
        armOut.l *= 1 + 2 * w
      } else {
        lift += 0.2 * w
        nod = nod * (1 - w) + 0.5 * w
        armOut.r *= 1 + 1.5 * w
        armOut.l *= 1 + 1.5 * w
      }
    }

    // Game over: hands on his head.
    if (gloom > 0.01) {
      armOut.r += (-2.35 - armOut.r) * gloom
      armOut.l += (2.35 - armOut.l) * gloom
      armFwd.r += (-0.3 - armFwd.r) * gloom
      armFwd.l += (-0.3 - armFwd.l) * gloom
      elbowBend.r *= 1 - gloom
      elbowBend.l *= 1 - gloom
      elbowTwist.r = -2.09 * gloom
      elbowTwist.l = 2.09 * gloom
      nod += (0.35 - nod) * gloom
      lean += (0.02 - lean) * gloom
    }

    pelvis.position.y = HIP - 0.03 + lift
    spine.rotation.x = lean
    neck.rotation.x = nod - lean
    neck.rotation.y = turn * (1 - gloom)
    for (const side of ['r', 'l']) {
      const p = pose[side]
      legs[side].hip.rotation.set(p.hip, 0, p.spread)
      legs[side].knee.rotation.x = p.knee
      legs[side].ankle.rotation.x = -(p.hip + p.knee) * 0.75 + 0.05
      arms[side].shoulder.rotation.set(armFwd[side] - lean * 0.5, 0, armOut[side])
      arms[side].elbow.rotation.set(elbowBend[side], 0, elbowTwist[side])
    }
  }

  return { group: root, update }
}
