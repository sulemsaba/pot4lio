// Pictures are made ready in the browser before they go anywhere: turned the right way up,
// resized to what the site shows, and saved as WebP (small and sharp).

async function decode(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Some formats need the slower path below.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toWebp(source, width, height, quality) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('This browser could not save the picture.'))), 'image/webp', quality)
  })
}

export const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

// Gives { blob, dataUrl, w, h } at most `max` pixels wide.
export async function prepareImage(file, max = 1600, quality = 0.86) {
  if (!file.type.startsWith('image/')) throw new Error('That file is not a picture. Use JPG, PNG or WebP.')
  if (file.size > 25 * 1024 * 1024) throw new Error('That picture is over 25 MB. Use a smaller one.')
  const source = await decode(file)
  const scale = Math.min(1, max / source.width)
  const w = Math.round(source.width * scale)
  const h = Math.round(source.height * scale)
  const blob = await toWebp(source, w, h, quality)
  source.close?.()
  return { blob, dataUrl: await blobToDataUrl(blob), w, h }
}

// The size of a picture that is already on the site, for the w and h the site needs.
export function measure(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })
}
