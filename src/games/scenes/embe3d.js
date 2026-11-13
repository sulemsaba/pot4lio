// Mango drop in 3D: under a mango tree, a ripe mango swinging from a branch and a
// woven basket (kikapu) moving across the grass. Fireflies come out in the evening.

import { THREE, bake, lights, paint, painted, seeded, shadows, sky } from './stage.js'
import { GROUND, PIVOT, R, RIM } from '../embe.js'

const S = 0.01
const X = (x) => (x - 200) * S
const Y = (y) => (GROUND - y) * S
const MANGO = R * S

export function build() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 400 / 320, 0.1, 60)
  camera.position.set(0, 1.75, 6.1)
  camera.lookAt(0, 1.42, 0)
  const { hemi, sun } = lights(scene, 4)
  const random = seeded(11)

  // Grass, with tufts close to us.
  const lawn = painted(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#5f9a3e'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 2600; i += 1) {
      ctx.fillStyle = ['#6aa846', '#4f8a34', '#76b24f', '#58933a'][i % 4]
      ctx.fillRect(random() * w, random() * h, 2, 3 + random() * 3)
    }
  }, { repeat: [10, 7] })
  const groundMat = new THREE.MeshStandardMaterial({ map: lawn, roughness: 0.95 })
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 28), groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.z = -6
  ground.receiveShadow = true
  scene.add(ground)
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.018, 0.13, 4), paint('#4f8f35', { roughness: 0.8 }), 420)
  const place = new THREE.Object3D()
  for (let i = 0; i < 420; i += 1) {
    place.position.set((random() - 0.5) * 7, 0.05, 1.6 - random() * 4.5)
    place.rotation.set((random() - 0.5) * 0.5, random() * 3, (random() - 0.5) * 0.5)
    place.scale.setScalar(0.6 + random() * 0.9)
    place.updateMatrix()
    tufts.setMatrixAt(i, place.matrix)
  }
  tufts.receiveShadow = true
  scene.add(tufts)

  // The tree: a crown behind, a trunk at the side, and the branch the mango hangs from.
  const leafDark = paint('#2c5f2a', { roughness: 0.75 })
  const crown = new THREE.Group()
  for (let i = 0; i < 14; i += 1) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 + random() * 0.6, 2), leafDark)
    blob.position.set(-3.4 + i * 0.55 + random() * 0.3, 3.0 + random() * 0.9, -2.4 - random() * 1.2)
    blob.scale.y = 0.75
    crown.add(blob)
  }
  scene.add(shadows(crown, true, false))
  const bark = paint('#5e4127', { roughness: 0.95 })
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 3.6, 14), bark)
  trunk.position.set(-2.55, 1.8, -1.6)
  trunk.rotation.z = -0.06
  scene.add(shadows(trunk))

  const branchCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.7, 2.7, -1.2),
    new THREE.Vector3(-1.4, 2.5, -0.3),
    new THREE.Vector3(0, Y(PIVOT.y) + 0.06, 0),
    new THREE.Vector3(1.3, 2.52, -0.1),
    new THREE.Vector3(2.7, 2.8, -0.4),
  ])
  const branch = new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 80, 0.06, 10), bark)
  scene.add(shadows(branch))

  // Long glossy mango leaves in clusters along the branch, clear of the swing.
  const leafShape = new THREE.Shape()
  leafShape.moveTo(0, 0)
  leafShape.quadraticCurveTo(0.17, 0.055, 0.34, 0)
  leafShape.quadraticCurveTo(0.17, -0.055, 0, 0)
  const leaves = new THREE.InstancedMesh(new THREE.ShapeGeometry(leafShape, 6), paint('#ffffff', { roughness: 0.45, side: THREE.DoubleSide }), 70)
  const shades = ['#2e6b2f', '#3c8a3a', '#245a28', '#4a9a40'].map((c) => new THREE.Color(c))
  let n = 0
  while (n < 70) {
    const t = random()
    const at = branchCurve.getPoint(t)
    if (Math.abs(at.x) < 0.45) continue
    place.position.copy(at)
    place.rotation.set(random() * Math.PI, random() * Math.PI * 2, -Math.PI / 2 + (random() - 0.5) * 1.6)
    place.scale.setScalar(0.8 + random() * 0.5)
    place.updateMatrix()
    leaves.setMatrixAt(n, place.matrix)
    leaves.setColorAt(n, shades[n % shades.length])
    n += 1
  }
  scene.add(shadows(leaves, true, false))

  // Far hills.
  const hillMat = paint('#6f9a6a', { roughness: 1 })
  for (const [hx, s] of [[-6, 4], [1, 5], [7, 4.5]]) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), hillMat)
    hill.scale.set(s, s * 0.35, 2)
    hill.position.set(hx, -0.2, -16)
    scene.add(hill)
  }

  // Everything so far stays put: draw it as a few merged meshes.
  bake(scene)

  // The mango: yellow, blushing red on the sunny side, green by the stalk.
  const mango = new THREE.Group()
  const fruit = new THREE.SphereGeometry(1, 40, 28)
  const tint = []
  const base = new THREE.Color('#f7b52e')
  const blush = new THREE.Color('#e0442a')
  const stalkGreen = new THREE.Color('#9db53a')
  const sunny = new THREE.Vector3(-0.5, 0.55, 0.65).normalize()
  const normal = new THREE.Vector3()
  const colour = new THREE.Color()
  for (let i = 0; i < fruit.attributes.normal.count; i += 1) {
    normal.fromBufferAttribute(fruit.attributes.normal, i)
    const k = THREE.MathUtils.smoothstep(normal.dot(sunny), -0.1, 0.85)
    colour.copy(base).lerp(blush, k * 0.85)
    if (normal.y > 0.7) colour.lerp(stalkGreen, (normal.y - 0.7) / 0.3)
    tint.push(colour.r, colour.g, colour.b)
  }
  fruit.setAttribute('color', new THREE.Float32BufferAttribute(tint, 3))
  const skin = new THREE.Mesh(fruit, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.36, clearcoat: 0.4, clearcoatRoughness: 0.35 }))
  skin.scale.set(MANGO * 0.95, MANGO * 1.22, MANGO * 0.9)
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.035, 8), paint('#5b4a2a'))
  stem.position.y = MANGO * 1.25
  mango.add(skin, stem)
  scene.add(shadows(mango, true, false))
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 6), paint('#6b5a34'))
  scene.add(stalk)

  // The basket: woven, wider at the top, with a rim.
  const weave = painted(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#a8743a'
    ctx.fillRect(0, 0, w, h)
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 16; col += 1) {
        ctx.fillStyle = (row + col) % 2 ? '#c48c4a' : '#94612c'
        ctx.fillRect(col * 16 + 1, row * 16 + 2, 14, 12)
      }
    }
    ctx.fillStyle = 'rgb(60 35 15 / 0.45)'
    for (let col = 0; col <= 16; col += 1) ctx.fillRect(col * 16 - 1, 0, 2, h)
  }, { repeat: [6, 2] })
  const wicker = new THREE.MeshStandardMaterial({ map: weave, roughness: 0.85, side: THREE.DoubleSide })
  const rimWood = paint('#7d5126', { roughness: 0.7 })
  const basket = new THREE.Group()
  const top = Y(RIM)
  const profile = [
    [0, 0],
    [0.76, 0],
    [0.84, top * 0.25],
    [0.93, top * 0.65],
    [1, top],
  ].map(([px, py]) => new THREE.Vector2(px, py))
  const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), wicker)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 8, 48), rimWood)
  rim.rotation.x = Math.PI / 2
  rim.position.y = top
  basket.add(shell, rim)
  scene.add(shadows(basket))

  // Fireflies, for the evening.
  const flies = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 60 }, (_, i) => (i % 3 === 1 ? 0.3 + random() * 2.4 : (random() - 0.5) * 5)), 3)),
    new THREE.PointsMaterial({ color: '#ffe680', size: 0.05, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  const flyHome = flies.geometry.attributes.position.array.slice()
  scene.add(flies)

  const pivot = new THREE.Vector3(X(PIVOT.x), Y(PIVOT.y), 0)
  const end = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)

  function update(view, dt, time) {
    const { mango: m, basket: b } = view
    basket.position.set(X(b.x), 0, 0)
    basket.scale.set((b.w / 2) * S, 1, (b.w / 2) * S)

    mango.visible = Boolean(m)
    stalk.visible = Boolean(m?.on)
    if (m) {
      const size = m.on ? m.grow : 1
      mango.scale.setScalar(Math.max(0.01, size))
      if (m.caught) mango.position.set(X(b.x + m.offset), Y(RIM) - MANGO * 0.6, 0)
      else mango.position.set(X(m.x), Y(m.y), 0)
      mango.rotation.z = -m.turn
      if (m.on) {
        end.set(0, MANGO * 1.25, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), -m.turn).multiplyScalar(size).add(mango.position)
        stalk.position.copy(pivot).add(end).multiplyScalar(0.5)
        stalk.scale.y = pivot.distanceTo(end)
        stalk.quaternion.setFromUnitVectors(up, end.clone().sub(pivot).normalize())
      }
    }

    if (flies.visible) {
      const p = flies.geometry.attributes.position
      for (let i = 0; i < p.count; i += 1) {
        p.setXYZ(i, flyHome[i * 3] + Math.sin(time * 0.7 + i) * 0.15, flyHome[i * 3 + 1] + Math.sin(time * 1.1 + i * 1.7) * 0.1, flyHome[i * 3 + 2] + Math.cos(time * 0.5 + i) * 0.15)
      }
      p.needsUpdate = true
      flies.material.opacity = 0.55 + Math.sin(time * 3) * 0.35
    }
  }

  function theme(dark) {
    scene.background?.dispose()
    scene.background = sky(dark ? ['#101634', '#2d2a5e', '#8c4b74', '#e88f58'] : ['#58a6ec', '#9fd1f3', '#e6f4f6'])
    scene.fog = new THREE.Fog(dark ? '#4b3866' : '#d5ebf2', 9, 22)
    scene.environmentIntensity = dark ? 0.25 : 0.55
    hemi.color.set(dark ? '#7a86d0' : '#e0f0ff')
    hemi.groundColor.set(dark ? '#2d3a2a' : '#7c8f52')
    hemi.intensity = dark ? 1.15 : 1.45
    sun.color.set(dark ? '#ffa264' : '#fff4e0')
    sun.intensity = dark ? 1.9 : 2.8
    sun.position.set(dark ? -5 : 2.5, dark ? 2.2 : 6, dark ? 3 : 4)
    hillMat.color.set(dark ? '#3e4f63' : '#6f9a6a')
    flies.visible = dark
  }

  return { scene, camera, update, theme }
}
