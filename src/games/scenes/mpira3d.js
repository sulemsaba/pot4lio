// Keep it up in 3D: a young player juggling on a mowed pitch, a goal behind. In the
// evening the floodlights come on for a night match.

import { THREE, bake, lights, paint, painted, seeded, shadows, sky } from './stage.js'
import { createFootballer } from './footballer.js'
import { GROUND, R } from '../mpira.js'

const S = 0.01
const X = (x) => (x - 200) * S
const Y = (y) => (GROUND - y) * S
const BALL = R * S

export function build() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 400 / 320, 0.1, 80)
  camera.position.set(0, 1.7, 6.6)
  camera.lookAt(0, 1.55, 0)
  const { hemi, sun } = lights(scene, 5)
  const random = seeded(23)

  // The pitch, mowed in stripes, with the goal line.
  const stripes = painted(512, 64, (ctx, w, h) => {
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = i % 2 ? '#4f9a3c' : '#5aa845'
      ctx.fillRect((i * w) / 8, 0, w / 8, h)
    }
    for (let i = 0; i < 3000; i += 1) {
      ctx.fillStyle = `rgb(20 60 10 / ${0.04 + random() * 0.08})`
      ctx.fillRect(random() * w, random() * h, 1, 2)
    }
  }, { repeat: [3, 6] })
  const turf = new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.95 })
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), turf)
  pitch.rotation.x = -Math.PI / 2
  pitch.position.z = -10
  pitch.receiveShadow = true
  scene.add(pitch)
  const chalk = paint('#f4f4ef', { roughness: 0.7 })
  const goalLine = new THREE.Mesh(new THREE.BoxGeometry(30, 0.004, 0.06), chalk)
  goalLine.position.set(0, 0.002, -3.4)
  scene.add(goalLine)
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.004, 1.6), chalk)
  for (const bx of [-1.2, 3.0]) {
    const side = box.clone()
    side.position.set(bx, 0.002, -2.6)
    scene.add(side)
  }
  const front = new THREE.Mesh(new THREE.BoxGeometry(4.26, 0.004, 0.06), chalk)
  front.position.set(0.9, 0.002, -1.8)
  scene.add(front)

  // The goal, with its net.
  const goal = new THREE.Group()
  const post = paint('#fafafa', { roughness: 0.35, metalness: 0.1 })
  const net = new THREE.MeshStandardMaterial({
    map: painted(256, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgb(255 255 255 / 0.9)'
      ctx.lineWidth = 3
      for (let i = 0; i <= w; i += 16) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, h)
        ctx.moveTo(0, i)
        ctx.lineTo(w, i)
        ctx.stroke()
      }
    }, { repeat: [5, 2] }),
    transparent: true,
    alphaTest: 0.3,
    side: THREE.DoubleSide,
    roughness: 0.8,
  })
  const width = 2.6
  const height = 1.0
  for (const gx of [-width / 2, width / 2]) {
    const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, height, 12), post)
    upright.position.set(gx, height / 2, 0)
    goal.add(upright)
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, width + 0.07, 12), post)
  bar.rotation.z = Math.PI / 2
  bar.position.y = height
  goal.add(bar)
  const back = new THREE.Mesh(new THREE.PlaneGeometry(width, height * 1.05), net)
  back.position.set(0, height / 2, -0.55)
  back.rotation.x = -0.35
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.6), net)
  roof.rotation.x = -Math.PI / 2 + 0.25
  roof.position.set(0, height - 0.04, -0.27)
  goal.add(back, roof)
  for (const gx of [-width / 2, width / 2]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(0.6, height), net)
    side.rotation.y = Math.PI / 2
    side.position.set(gx, height / 2, -0.28)
    goal.add(side)
  }
  goal.position.set(0.9, 0, -3.4)
  scene.add(shadows(goal, true, false))

  // Boards round the pitch, trees beyond.
  const boards = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.32, 0.06),
    new THREE.MeshStandardMaterial({
      roughness: 0.5,
      map: painted(1024, 40, (ctx, w, h) => {
        const panels = [['#1d6fb8', 'KARIBU DAR'], ['#f2b705', 'MPIRA JUU'], ['#e0442a', 'KARIBU DAR'], ['#1f9d55', 'MPIRA JUU']]
        for (let i = 0; i < 8; i += 1) {
          const [fill, word] = panels[i % 4]
          ctx.fillStyle = fill
          ctx.fillRect((i * w) / 8, 0, w / 8, h)
          ctx.fillStyle = fill === '#f2b705' ? '#16233a' : '#fff'
          ctx.font = "800 22px 'Hanken Grotesk Variable', sans-serif"
          ctx.textAlign = 'center'
          ctx.fillText(word, (i * w) / 8 + w / 16, 28)
        }
      }),
    }),
  )
  boards.position.set(0, 0.16, -5.6)
  scene.add(shadows(boards))
  const treeMat = paint('#2f6a33', { roughness: 0.85 })
  for (let i = 0; i < 16; i += 1) {
    const tree = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 + random() * 0.45, 1), treeMat)
    tree.position.set(-8 + i + random() * 0.5, 0.7 + random() * 0.5, -8 - random() * 2)
    tree.scale.y = 1.2
    scene.add(tree)
  }

  // Floodlights, lit at night.
  const floodLamps = []
  for (const fx of [-4.6, 4.6]) {
    const tower = new THREE.Group()
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 4.2, 10), paint('#8a8f97', { metalness: 0.6, roughness: 0.4 }))
    mast.position.y = 2.1
    const lamp = new THREE.MeshStandardMaterial({ color: '#eef3ff', emissive: '#f4f8ff', emissiveIntensity: 0 })
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.08), lamp)
    panel.position.y = 4.3
    panel.rotation.x = 0.35
    tower.add(mast, panel)
    tower.position.set(fx, 0, -7)
    scene.add(tower)
    floodLamps.push(lamp)
  }

  // Everything so far stays put: draw it as a few merged meshes.
  bake(scene)

  // The ball: white panels and black pentagons, the classic pattern.
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL, 64, 48),
    new THREE.MeshPhysicalMaterial({ map: footballSkin(), roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
  )
  scene.add(ball) // its shadow is the soft one below, which shrinks as it rises
  // A soft shadow right under the ball that shrinks as it rises: it helps judge the height.
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(1, 32),
    new THREE.MeshBasicMaterial({
      map: painted(128, 128, (ctx, w) => {
        const fade = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2)
        fade.addColorStop(0, 'rgb(0 0 0 / 0.6)')
        fade.addColorStop(1, 'rgb(0 0 0 / 0)')
        ctx.fillStyle = fade
        ctx.fillRect(0, 0, w, w)
      }),
      transparent: true,
      depthWrite: false,
    }),
  )
  blob.rotation.x = -Math.PI / 2
  blob.position.y = 0.003
  scene.add(blob)

  // The star: gold, turning.
  const starShape = new THREE.Shape()
  for (let i = 0; i < 10; i += 1) {
    const a = Math.PI / 2 + (i / 10) * Math.PI * 2
    const r = i % 2 ? 0.065 : 0.15
    if (i === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const starGeometry = new THREE.ExtrudeGeometry(starShape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 })
  starGeometry.center()
  const star = new THREE.Mesh(starGeometry, new THREE.MeshStandardMaterial({ color: '#ffc93c', metalness: 0.85, roughness: 0.25, emissive: '#ff9d00', emissiveIntensity: 0.35 }))
  star.castShadow = true
  scene.add(star)

  // The player.
  const player = createFootballer()
  scene.add(player.group)

  // Dust off the boot at each kick.
  const puffMat = new THREE.MeshBasicMaterial({ color: '#f3efe2', transparent: true, opacity: 0, depthWrite: false })
  const puffs = Array.from({ length: 10 }, () => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), puffMat.clone())
    scene.add(mesh)
    return { mesh, life: 0, v: new THREE.Vector3() }
  })
  let lastKicks = 0
  let tumble = 0

  const ray = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const hit = new THREE.Vector3()

  function update(view, dt, time) {
    const { ball: b, star: s, kicks, over } = view
    ball.position.set(X(b.x), Y(b.y), 0)
    player.update({ bx: X(b.x), by: Y(b.y), vx: b.vx, kicks, over, radius: BALL }, dt, time)
    tumble += b.vx * dt * 0.02
    ball.rotation.set(tumble, 0, -b.turn)
    const rise = Math.max(0, ball.position.y - BALL)
    blob.position.x = ball.position.x
    blob.scale.setScalar(BALL * (1.05 + rise * 0.35))
    blob.material.opacity = 0.9 / (1 + rise * 1.4)

    star.visible = Boolean(s)
    if (s) {
      star.position.set(X(s.x), Y(s.y) + Math.sin(time * 3) * 0.03, 0)
      star.rotation.y = time * 2.4
      star.scale.setScalar(s.t < 0.6 ? Math.max(0.01, s.t / 0.6) : 1)
    }

    if (kicks > lastKicks) {
      for (let i = 0, k = 0; i < puffs.length && k < 6; i += 1) {
        if (puffs[i].life > 0) continue
        const puff = puffs[i]
        puff.life = 0.45
        puff.mesh.position.set(ball.position.x + (Math.random() - 0.5) * 0.1, ball.position.y - BALL * 0.8, (Math.random() - 0.5) * 0.1)
        puff.v.set((Math.random() - 0.5) * 0.8, -0.2 - Math.random() * 0.3, (Math.random() - 0.5) * 0.6)
        k += 1
      }
    }
    lastKicks = kicks
    for (const puff of puffs) {
      if (puff.life <= 0) {
        puff.mesh.visible = false
        continue
      }
      puff.life -= dt
      puff.mesh.visible = true
      puff.mesh.position.addScaledVector(puff.v, dt)
      puff.mesh.scale.setScalar(1 + (0.45 - puff.life) * 4)
      puff.mesh.material.opacity = Math.max(0, puff.life) * 1.4
    }
  }

  // A tap on the screen, as a point in the game's own units.
  function pick(nx, ny) {
    ray.setFromCamera({ x: nx, y: ny }, camera)
    if (!ray.ray.intersectPlane(plane, hit)) return null
    return { x: hit.x / S + 200, y: GROUND - hit.y / S }
  }

  function theme(dark) {
    scene.background?.dispose()
    scene.background = sky(dark ? ['#070b1e', '#121a3e', '#26305e', '#3d4a7a'] : ['#4d9ce6', '#9ccff2', '#e4f3f7'])
    scene.fog = new THREE.Fog(dark ? '#1b2346' : '#d4eaf3', 10, 30)
    scene.environmentIntensity = dark ? 0.35 : 0.55
    hemi.color.set(dark ? '#8fa2e6' : '#e0f0ff')
    hemi.groundColor.set(dark ? '#1e3320' : '#6f8f4a')
    hemi.intensity = dark ? 0.9 : 1.45
    // At night the floodlights are the sun: bright, cool, from high behind.
    sun.color.set(dark ? '#e8efff' : '#fff4e0')
    sun.intensity = dark ? 3.0 : 2.8
    sun.position.set(dark ? -3 : 2, dark ? 7 : 6, dark ? 1.5 : 4)
    treeMat.color.set(dark ? '#1c3a22' : '#2f6a33')
    for (const lamp of floodLamps) lamp.emissiveIntensity = dark ? 4 : 0
  }

  return { scene, camera, update, theme, pick }
}

// The ball's skin, worked out on a sphere: each point belongs to the nearest of 32
// panel centres (12 pentagons, 20 hexagons), with a seam where two panels meet.
function footballSkin() {
  const t = (1 + Math.sqrt(5)) / 2
  const pentagons = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(unit)
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]
  const hexagons = faces.map(([a, b, c]) => unit([0, 1, 2].map((k) => pentagons[a][k] + pentagons[b][k] + pentagons[c][k])))
  const centres = [...pentagons.map((v) => [v, true]), ...hexagons.map((v) => [v, false])]
  return painted(512, 256, (ctx, w, h) => {
    const image = ctx.createImageData(w, h)
    for (let py = 0; py < h; py += 1) {
      const lat = Math.PI * (py / h)
      for (let px = 0; px < w; px += 1) {
        const lon = 2 * Math.PI * (px / w)
        const d = [-Math.cos(lon) * Math.sin(lat), Math.cos(lat), Math.sin(lon) * Math.sin(lat)]
        let best = -2
        let second = -2
        let dark = false
        for (const [c, pent] of centres) {
          const dot = (c[0] * d[0] + c[1] * d[1] + c[2] * d[2]) * (pent ? 1.01 : 1)
          if (dot > best) {
            second = best
            best = dot
            dark = pent
          } else if (dot > second) second = dot
        }
        const seam = best - second < 0.012
        const value = seam ? 70 : dark ? 26 : 246
        const i = (py * w + px) * 4
        image.data[i] = value
        image.data[i + 1] = value
        image.data[i + 2] = dark && !seam ? 30 : value
        image.data[i + 3] = 255
      }
    }
    ctx.putImageData(image, 0, 0)
  })
}

function unit(v) {
  const length = Math.hypot(v[0], v[1], v[2])
  return [v[0] / length, v[1] / length, v[2] / length]
}
