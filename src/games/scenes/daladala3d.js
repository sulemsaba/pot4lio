// Daladala in 3D: a Dar es Salaam street, seen from the pavement. Traffic keeps left,
// so the bus comes in from the right with its door towards us and the kerb.

import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { THREE, bake, lights, paint, painted, seeded, shadows, sky } from './stage.js'
import { BUS, DOOR } from '../daladala.js'

const S = 0.01 // game units to metres of scene
const X = (x) => (200 - x) * S // mirrored: right to left on screen
const KERB = 0.74 // where the road meets our pavement
const LANE = 0.3 // the middle of the bus
const L = BUS * S // bus length
const SHIRTS = ['#e94e3c', '#f2b705', '#2a7de1', '#1f9d55', '#8e44ad', '#ff7a59']

export function build() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 60)
  camera.position.set(0, 1.95, 5.4)
  camera.lookAt(0, 0.62, -0.7)
  const { hemi, sun } = lights(scene, 4.5)
  const random = seeded(7)

  // The road, its lines, and the pavements on both sides.
  const asphalt = paint('#3b3d42', { roughness: 0.92 })
  const road = new THREE.Mesh(new THREE.BoxGeometry(40, 0.1, 2.9), asphalt)
  road.position.set(0, -0.05, KERB - 1.45)
  road.receiveShadow = true
  scene.add(road)
  const lineWhite = paint('#f1efe8', { roughness: 0.6 })
  for (let x = -16; x < 16; x += 0.85) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.004, 0.05), lineWhite)
    dash.position.set(x, 0.002, KERB - 1.45)
    scene.add(dash)
  }
  const edge = new THREE.Mesh(new THREE.BoxGeometry(40, 0.004, 0.04), lineWhite)
  edge.position.set(0, 0.002, KERB - 0.1)
  scene.add(edge)

  // Paving slabs.
  const slabs = painted(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d3ccba'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 1400; i += 1) {
      ctx.fillStyle = `rgb(120 110 90 / ${0.04 + random() * 0.06})`
      ctx.fillRect(random() * w, random() * h, 2, 2)
    }
    ctx.strokeStyle = 'rgb(120 110 90 / 0.45)'
    ctx.lineWidth = 3
    for (let i = 0; i <= w; i += 64) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, h)
      ctx.moveTo(0, i)
      ctx.lineTo(w, i)
      ctx.stroke()
    }
  }, { repeat: [40, 5] })
  const stone = new THREE.MeshStandardMaterial({ map: slabs, roughness: 0.85 })
  const kerbStone = paint('#e4ded0', { roughness: 0.8 })
  for (const [z, depth] of [[KERB + 2.5, 5], [KERB - 3.4, 1.0]]) {
    const pavement = new THREE.Mesh(new THREE.BoxGeometry(40, 0.08, depth), stone)
    pavement.position.set(0, 0.04, z)
    pavement.receiveShadow = true
    scene.add(pavement)
  }
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(40, 0.085, 0.07), kerbStone)
  kerb.position.set(0, 0.0425, KERB + 0.035)
  kerb.receiveShadow = true
  scene.add(kerb)

  // Across the road: houses and shops in Dar's pale colours, tanks on the roofs.
  const windowsLit = []
  const town = new THREE.Group()
  let x = -7.5
  while (x < 7.5) {
    const w = 0.7 + random() * 0.9
    const h = 0.7 + random() * 1.4
    const colour = ['#f1e6d0', '#e9dcc0', '#d6e6ec', '#f2d4c4', '#eceff1', '#e6e0f0'][Math.floor(random() * 6)]
    const lit = random()
    const face = painted(128, 256, (ctx, cw, ch) => {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, cw, ch)
      ctx.fillStyle = 'rgb(40 52 64 / 0.85)'
      for (let wy = 26; wy < ch - 40; wy += 42) for (let wx = 16; wx < cw - 20; wx += 34) ctx.fillRect(wx, wy, 18, 22)
      ctx.fillStyle = 'rgb(60 40 30 / 0.7)'
      ctx.fillRect(cw / 2 - 14, ch - 40, 28, 40)
    })
    const glow = painted(128, 256, (ctx, cw, ch) => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, cw, ch)
      let n = 0
      for (let wy = 26; wy < ch - 40; wy += 42) {
        for (let wx = 16; wx < cw - 20; wx += 34) {
          n += 1
          if (((n * 7 + Math.floor(lit * 10)) % 3) !== 0) {
            ctx.fillStyle = n % 4 ? '#ffcf86' : '#ffe9b8'
            ctx.fillRect(wx, wy, 18, 22)
          }
        }
      }
    })
    const front = new THREE.MeshStandardMaterial({ color: colour, map: face, roughness: 0.85, emissive: '#ffb45e', emissiveMap: glow, emissiveIntensity: 0 })
    windowsLit.push(front)
    const plain = paint(colour, { roughness: 0.9 })
    const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.8), [plain, plain, plain, plain, front, plain])
    house.position.set(x + w / 2, h / 2, KERB - 4.4 - random() * 0.3)
    town.add(house)
    if (random() > 0.45) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 16), paint('#1d1f22', { roughness: 0.5 }))
      tank.position.set(house.position.x + (random() - 0.5) * w * 0.5, h + 0.08, house.position.z)
      town.add(tank)
    }
    x += w + 0.04 + random() * 0.25
  }
  shadows(town, true, true)
  scene.add(town)

  // Coconut palms.
  for (const [px, pz, h, lean] of [[-1.3, KERB - 3.3, 1.7, 0.12], [2.1, KERB - 3.2, 1.45, -0.1]]) {
    scene.add(shadows(palm(px, pz, h, lean, random)))
  }

  // Street lamps; they light up in the evening.
  const lamps = []
  for (const [lx, lz, facing] of [[-2.0, KERB - 2.95, -1], [0.6, KERB - 2.95, -1]]) {
    const lamp = streetLamp(facing)
    lamp.group.position.set(lx, 0.08, lz)
    scene.add(shadows(lamp.group))
    lamps.push(lamp)
  }

  // Everything so far stays put: draw it as a few merged meshes.
  bake(scene)

  // The stop: a yellow mark on the kerb where the door should be, a line across the
  // road, the sign, and the people waiting.
  const stop = new THREE.Group()
  const yellow = new THREE.MeshStandardMaterial({ color: '#ffc21a', emissive: '#ffb000', emissiveIntensity: 0.35, roughness: 0.5 })
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.086, 0.012), yellow)
  mark.position.set(0, 0.043, KERB - 0.002)
  const tee = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.005, 0.22), yellow)
  tee.position.set(0, 0.003, KERB - 0.12)
  // A yellow bollard on the kerb, exactly where the door should stop.
  const bollard = new THREE.Group()
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.2, 16), yellow)
  post.position.y = 0.1
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.03, 16), paint('#1b1b1f'))
  band.position.y = 0.15
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), yellow)
  cap.position.y = 0.2
  bollard.add(post, band, cap)
  bollard.position.set(0, 0.08, KERB + 0.07)
  stop.add(mark, tee, shadows(bollard))
  const sign = new THREE.Group()
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.82, 10), paint('#5b6068', { metalness: 0.6, roughness: 0.4 }))
  pole.position.y = 0.41
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.17, 0.015),
    new THREE.MeshStandardMaterial({
      map: painted(256, 168, (ctx, w, h) => {
        ctx.fillStyle = '#1d6fb8'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.font = "800 64px 'Hanken Grotesk Variable', sans-serif"
        ctx.fillText('BUS', w / 2, 84)
        ctx.font = "700 34px 'Hanken Grotesk Variable', sans-serif"
        ctx.fillText('KITUO', w / 2, 132)
      }),
      roughness: 0.5,
    }),
  )
  board.position.y = 0.84
  sign.add(pole, board)
  sign.position.set(-0.62, 0.08, KERB + 0.22)
  stop.add(shadows(sign))
  scene.add(stop)

  const people = SHIRTS.slice(0, 3).map(() => {
    const body = person()
    scene.add(shadows(body.group, true, false))
    return body
  })

  // The daladala.
  const bus = daladala()
  scene.add(shadows(bus.group))

  let lastRiders = null
  let tilt = 0

  function update(view, dt, time) {
    const { bus: b, stop: stopX, riders, braking, phase } = view
    bus.group.position.set(X(b.x + BUS / 2), 0, LANE)
    for (const wheel of bus.wheels) wheel.rotation.z = b.wheel
    // The nose dips under braking.
    const target = braking && b.v > 1 ? 0.018 : 0
    tilt += (target - tilt) * Math.min(1, dt * 10)
    bus.group.rotation.z = tilt
    bus.brake.emissiveIntensity = braking ? 3.2 : 0.5
    stop.position.x = X(stopX)

    if (riders !== lastRiders) {
      lastRiders = riders
      riders.forEach((rider, i) => people[i]?.dress(SHIRTS[rider.look % SHIRTS.length]))
    }
    const door = X(b.x + BUS * DOOR)
    people.forEach((body, i) => {
      const rider = riders[i]
      body.group.visible = Boolean(rider && !rider.in)
      if (!body.group.visible) return
      const px = X(rider.x)
      const near = Math.max(0, 1 - Math.abs(px - door) / 0.25)
      const walking = phase === 'board'
      body.group.position.set(px, 0.08 - near * 0.06, KERB + 0.16 - near * 0.3)
      body.group.rotation.y = walking ? (px > door ? -Math.PI / 2 : Math.PI / 2) * 0.8 : 0
      body.legs.rotation.x = walking ? Math.sin(time * 14 + i) * 0.35 : 0
      body.group.position.y += walking ? Math.abs(Math.sin(time * 14 + i)) * 0.012 : 0
    })
  }

  function theme(dark) {
    scene.background?.dispose()
    scene.background = sky(dark ? ['#121836', '#2f2a63', '#9a4f7a', '#f19a5e'] : ['#4f9fe8', '#94cbf2', '#dff0f8'])
    scene.fog = new THREE.Fog(dark ? '#5a3f6e' : '#d7ecf6', 10, 24)
    scene.environmentIntensity = dark ? 0.25 : 0.55
    hemi.color.set(dark ? '#7a86d0' : '#dcefff')
    hemi.groundColor.set(dark ? '#3a2f3c' : '#b8ab8c')
    hemi.intensity = dark ? 1.1 : 1.5
    sun.color.set(dark ? '#ff9a5c' : '#fff3df')
    sun.intensity = dark ? 1.7 : 2.9
    sun.position.set(dark ? 5 : -3, dark ? 1.8 : 6, dark ? 3 : 5)
    asphalt.color.set(dark ? '#34363c' : '#3b3d42')
    stone.color.set(dark ? '#a39b8c' : '#ffffff')
    for (const front of windowsLit) front.emissiveIntensity = dark ? 1.3 : 0
    for (const lamp of lamps) lamp.on(dark)
    bus.lights(dark)
    yellow.emissiveIntensity = dark ? 0.9 : 0.35
  }

  return { scene, camera, update, theme }
}

function daladala() {
  const group = new THREE.Group()
  const cream = paint('#f3eee2', { roughness: 0.35, metalness: 0.15 })
  const glass = new THREE.MeshStandardMaterial({ color: '#1e2b36', roughness: 0.12, metalness: 0.3 })
  const blue = paint('#1d6fb8', { roughness: 0.4, metalness: 0.1 })
  const gold = paint('#f2b705', { roughness: 0.4, metalness: 0.1 })
  const body = new THREE.Mesh(new RoundedBoxGeometry(L, 0.42, 0.44, 4, 0.05), cream)
  body.position.y = 0.31
  group.add(body)
  for (const [y, h, m] of [[0.2, 0.06, blue], [0.155, 0.03, gold]]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(L - 0.06, h, 0.446), m)
    band.position.y = y
    group.add(band)
  }
  // Windows down our side, the windscreen, the door.
  const side = 0.223
  for (const wx of [-0.43, -0.08, 0.08, 0.24, 0.4]) {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(wx === -0.43 ? 0.12 : 0.13, 0.14, 0.008), glass)
    pane.position.set(wx, 0.41, side)
    group.add(pane)
  }
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.17, 0.38), glass)
  screen.position.set(-L / 2 + 0.002, 0.41, 0)
  group.add(screen)
  const doorX = L / 2 - BUS * DOOR * S
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.3, 0.008), paint('#d8d0bc', { roughness: 0.5 }))
  door.position.set(doorX, 0.27, side)
  const doorPane = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.01), glass)
  doorPane.position.set(doorX, 0.36, side)
  const sill = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.014, 0.012), new THREE.MeshStandardMaterial({ color: '#ffc21a', emissive: '#ffb000', emissiveIntensity: 0.6 }))
  sill.position.set(doorX, 0.118, side)
  group.add(door, doorPane, sill)
  // The route on the side, as painted on Dar's buses.
  const route = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.055, 0.004),
    new THREE.MeshStandardMaterial({
      roughness: 0.5,
      map: painted(512, 56, (ctx, w, h) => {
        ctx.fillStyle = '#ffd23f'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#16233a'
        ctx.textAlign = 'center'
        ctx.font = "800 38px 'Hanken Grotesk Variable', sans-serif"
        ctx.fillText('POSTA - KARIAKOO', w / 2, 41)
      }),
    }),
  )
  route.position.set(0.16, 0.5, side + 0.001)
  group.add(route)
  // Roof rack.
  const rail = paint('#2a2d33', { metalness: 0.6, roughness: 0.4 })
  for (const z of [-0.15, 0.15]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(L * 0.8, 0.012, 0.012), rail)
    bar.position.set(0.04, 0.56, z)
    group.add(bar)
  }
  for (let i = 0; i < 5; i += 1) {
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.3), rail)
    cross.position.set(-0.34 + i * 0.19, 0.545, 0)
    group.add(cross)
  }
  // Lights: head at the front, brake at the back.
  const head = new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#fff2c4', emissiveIntensity: 0.4 })
  const brake = new THREE.MeshStandardMaterial({ color: '#7a1712', emissive: '#ff2a1a', emissiveIntensity: 0.5 })
  for (const z of [-0.15, 0.15]) {
    const front = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.04, 0.07), head)
    front.position.set(-L / 2, 0.2, z)
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.06, 0.05), brake)
    back.position.set(L / 2, 0.24, z)
    group.add(front, back)
  }
  // Wheels.
  const tyre = paint('#141417', { roughness: 0.95 })
  const hub = paint('#b9bcc2', { metalness: 0.8, roughness: 0.3 })
  const wheels = []
  for (const wx of [-0.33, 0.33]) {
    for (const z of [-0.19, 0.19]) {
      const wheel = new THREE.Group()
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.07, 24), tyre)
      t.rotation.x = Math.PI / 2
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.072, 6), hub)
      h.rotation.x = Math.PI / 2
      wheel.add(t, h)
      wheel.position.set(wx, 0.095, z)
      group.add(wheel)
      wheels.push(wheel)
    }
  }
  return {
    group,
    wheels,
    brake,
    lights(dark) {
      head.emissiveIntensity = dark ? 2.5 : 0.4
    },
  }
}

function person() {
  const group = new THREE.Group()
  const shirt = paint('#e94e3c', { roughness: 0.8 })
  const legs = new THREE.Group()
  const trousers = paint('#2a2e38', { roughness: 0.85 })
  for (const z of [-0.025, 0.025]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.1, 4, 8), trousers)
    leg.position.set(0, -0.07, z)
    legs.add(leg)
  }
  legs.position.y = 0.14
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.08, 4, 12), shirt)
  torso.position.y = 0.2
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 12), paint('#6b4330', { roughness: 0.6 }))
  head.position.y = 0.31
  group.add(legs, torso, head)
  return {
    group,
    legs,
    dress(colour) {
      shirt.color.set(colour)
    },
  }
}

function palm(x, z, h, lean, random) {
  const group = new THREE.Group()
  const bark = paint('#8a7356', { roughness: 0.95 })
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean * 0.2, h * 0.55, 0), new THREE.Vector3(lean, h, 0))
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.035, 8), bark)
  group.add(trunk)
  const leaf = paint('#2f7a3a', { roughness: 0.6, side: THREE.DoubleSide })
  const top = new THREE.Vector3(lean, h, 0)
  for (let i = 0; i < 10; i += 1) {
    const frond = new THREE.PlaneGeometry(0.75, 0.13, 10, 1)
    const p = frond.attributes.position
    for (let k = 0; k < p.count; k += 1) {
      const fx = p.getX(k) + 0.375
      p.setXYZ(k, fx, -fx * fx * 0.55, p.getY(k) * (1 - fx / 0.8))
    }
    frond.computeVertexNormals()
    const mesh = new THREE.Mesh(frond, leaf)
    mesh.position.copy(top)
    mesh.rotation.set(0.25 * (random() - 0.5), (i / 10) * Math.PI * 2 + random() * 0.3, 0.35 + random() * 0.25)
    group.add(mesh)
  }
  const nut = paint('#5c4a22', { roughness: 0.7 })
  for (let i = 0; i < 3; i += 1) {
    const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), nut)
    coconut.position.set(lean + Math.cos(i * 2.1) * 0.05, h - 0.06, Math.sin(i * 2.1) * 0.05)
    group.add(coconut)
  }
  group.position.set(x, 0.08, z)
  return group
}

function streetLamp(facing) {
  const group = new THREE.Group()
  const metal = paint('#4a4e55', { metalness: 0.7, roughness: 0.35 })
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 1.5, 10), metal)
  pole.position.y = 0.75
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.32), metal)
  arm.position.set(0, 1.49, -facing * 0.15)
  const bulb = new THREE.MeshStandardMaterial({ color: '#fff4dc', emissive: '#ffcf86', emissiveIntensity: 0 })
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.16), bulb)
  head.position.set(0, 1.47, -facing * 0.3)
  const light = new THREE.PointLight('#ffbf73', 0, 3.6, 2)
  light.position.set(0, 1.4, -facing * 0.3)
  group.add(pole, arm, head, light)
  return {
    group,
    on(dark) {
      bulb.emissiveIntensity = dark ? 3 : 0
      light.intensity = dark ? 3.2 : 0
    },
  }
}
