// The 3D stage shared by the games: one WebGL renderer per game, soft shadows,
// filmic colour and a room's reflections, so plastic, glass and paint look real.
// This file and three.js load only when someone opens the Play page.

import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export { THREE }

export function createStage(canvas, build, options) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap // soft edges come from sun.shadow.radius

  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()

  const world = build(options)
  world.scene.environment = environment
  const applyTheme = (dark) => {
    world.theme(dark)
    renderer.toneMappingExposure = dark ? 1.05 : 1
  }
  applyTheme(options.dark)

  // Sharpness steps down, one step at a time, if a device cannot keep up.
  const sharpest = Math.min(window.devicePixelRatio || 1, 2)
  const steps = [sharpest, Math.min(sharpest, 1.5), Math.min(sharpest, 1.25), 1].filter((v, i, all) => all.indexOf(v) === i)
  let step = 0
  let box = null

  return {
    world,
    theme(dark) {
      applyTheme(dark)
      // Evening switches lights on, which changes the shaders: build them now, not mid-game.
      renderer.compile(world.scene, world.camera)
    },
    size(width, height) {
      box = [width, height]
      renderer.setPixelRatio(steps[step])
      renderer.setSize(width, height, false)
      world.camera.aspect = width / height
      world.camera.updateProjectionMatrix()
    },
    // Lower the sharpness a step; false when it is already as low as it goes.
    ease() {
      if (step >= steps.length - 1) return false
      step += 1
      if (box) this.size(...box)
      return true
    },
    // Build every shader and send every texture to the graphics chip before play, so
    // nothing (a star, a puff of dust) stalls a frame the first time it appears.
    async warm() {
      world.scene.traverse((object) => {
        for (const material of [].concat(object.material || [])) {
          for (const value of Object.values(material)) if (value?.isTexture) renderer.initTexture(value)
        }
      })
      if (world.scene.background?.isTexture) renderer.initTexture(world.scene.background)
      await renderer.compileAsync(world.scene, world.camera)
    },
    render() {
      renderer.render(world.scene, world.camera)
    },
    dispose() {
      world.scene.traverse((object) => {
        object.geometry?.dispose()
        for (const material of [].concat(object.material || [])) {
          for (const value of Object.values(material)) if (value?.isTexture) value.dispose()
          material.dispose()
        }
      })
      world.dispose?.()
      environment.dispose()
      renderer.dispose()
    },
  }
}

// A sky from top to horizon, as the scene's background.
export function sky(stops) {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const fill = ctx.createLinearGradient(0, 0, 0, 256)
  stops.forEach((colour, i) => fill.addColorStop(i / (stops.length - 1), colour))
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, 4, 256)
  return texture(canvas)
}

// A texture painted on a canvas.
export function painted(width, height, paint, { repeat = null } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  paint(canvas.getContext('2d'), width, height)
  const map = texture(canvas)
  if (repeat) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(repeat[0], repeat[1])
  }
  return map
}

function texture(canvas) {
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  return map
}

export function paint(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...options })
}

// Day and evening lighting: a sky light and a sun with soft shadows.
export function lights(scene, box = 4) {
  const hemi = new THREE.HemisphereLight()
  const sun = new THREE.DirectionalLight()
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 0.5, far: 30 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.02
  sun.shadow.radius = 3
  scene.add(hemi, sun, sun.target)
  return { hemi, sun }
}

// Merges the meshes under \`root\` that never move into one mesh per material, so the
// scene is drawn in a few calls instead of hundreds. \`deep: false\` takes only its own
// meshes, for a joint whose children move on their own.
export function bake(root, { deep = true } = {}) {
  root.updateMatrixWorld(true)
  const back = new THREE.Matrix4().copy(root.matrixWorld).invert()
  const buckets = new Map()
  const merged = []
  const visit = (mesh) => {
    if (!mesh.isMesh || mesh.isInstancedMesh || !mesh.visible || mesh.children.length) return
    const materials = [].concat(mesh.material)
    if (materials.some((material) => material.transparent)) return
    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(back, mesh.matrixWorld))
    const parts = Array.isArray(mesh.material)
      ? geometry.groups.map((group) => [materials[group.materialIndex], slice(geometry, group.start, group.count)])
      : [[mesh.material, geometry]]
    for (const [material, part] of parts) {
      const key = [material.uuid, mesh.castShadow, mesh.receiveShadow, Object.keys(part.attributes).sort()].join('|')
      if (!buckets.has(key)) buckets.set(key, { material, cast: mesh.castShadow, receive: mesh.receiveShadow, parts: [] })
      buckets.get(key).parts.push(part)
    }
    merged.push(mesh)
  }
  if (deep) root.traverse(visit)
  else root.children.forEach(visit)
  const meshes = []
  for (const { material, cast, receive, parts } of buckets.values()) {
    const geometry = mergeGeometries(parts)
    if (!geometry) return root // could not merge: leave everything as it was
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = cast
    mesh.receiveShadow = receive
    meshes.push(mesh)
  }
  for (const mesh of merged) mesh.removeFromParent()
  if (meshes.length) root.add(...meshes)
  return root
}

function slice(geometry, start, count) {
  const part = new THREE.BufferGeometry()
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const size = attribute.itemSize
    part.setAttribute(name, new THREE.BufferAttribute(attribute.array.slice(start * size, (start + count) * size), size, attribute.normalized))
  }
  return part
}

export function shadows(object, cast = true, receive = true) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast
      child.receiveShadow = receive
    }
  })
  return object
}

// A seeded random, so every visit sees the same street, tree and pitch.
export function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}
