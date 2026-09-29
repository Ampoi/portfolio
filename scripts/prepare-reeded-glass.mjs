import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// All distances are in original artwork pixels, so the generated image can use
// exactly the same object-fit: cover / center crop as the undistorted background.
const settings = { widths: [1122, 2244], pitch: 30, bend: 24, blurMin: .25, blur: 1.2, quality: 88 }

export function refractPixels(data, width, height, pitch, bend) {
  const output = Buffer.alloc(data.length)
  for (let x = 0; x < width; x++) {
    const rib = Math.floor(x / pitch)
    const phase = x / pitch - rib
    const t = phase * 2 - 1
    const sx = Math.max(0, Math.min(width - 1,
      (rib + .5) * pitch + (t * .18 + t ** 3 * .82) * pitch * 1.35))
    const x0 = Math.floor(sx)
    const x1 = Math.min(x0 + 1, width - 1)
    const fx = sx - x0
    // Lift only the right edge of each rib. Taper towards the image bottom so
    // sampling stays in bounds instead of smearing a clamped bottom row.
    const lift = phase ** 3 * bend * 3
    for (let y = 0; y < height; y++) {
      const sy = Math.max(0, Math.min(height - 1,
        y + lift * (1 - y / height)))
      const y0 = Math.floor(sy)
      const y1 = Math.min(y0 + 1, height - 1)
      const fy = sy - y0
      for (let c = 0; c < 4; c++) {
        const top = data[(y0 * width + x0) * 4 + c] * (1 - fx) + data[(y0 * width + x1) * 4 + c] * fx
        const bottom = data[(y1 * width + x0) * 4 + c] * (1 - fx) + data[(y1 * width + x1) * 4 + c] * fx
        output[(y * width + x) * 4 + c] = Math.round(top * (1 - fy) + bottom * fy)
      }
    }
  }
  return output
}

export async function generateReededGlass(root = process.cwd()) {
  const original = await readFile(path.join(root, 'public/artwork/flower-hills.svg'))
  const hash = createHash('sha256').update(original).update(await readFile(fileURLToPath(import.meta.url)))
    .update(JSON.stringify(sharp.versions)).update(JSON.stringify(settings)).digest('hex').slice(0, 16)
  const manifestPath = path.join(root, 'src/generated/reeded-glass.json')
  try {
    const cached = JSON.parse(await readFile(manifestPath, 'utf8'))
    if (cached.hash === hash) {
      await Promise.all(cached.variants.map(v => access(path.join(root, 'public', v.src))))
      return cached
    }
  } catch { /* Missing or outdated generated files are rebuilt below. */ }

  const metadata = await sharp(original).metadata()
  if (!metadata.width || !metadata.height) throw new Error('flower-hills.svg: 画像サイズを取得できません')
  const width = settings.widths.at(-1)
  const scale = width / metadata.width
  const { data, info } = await sharp(original, { density: 72 * scale }).resize({ width })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const distorted = refractPixels(data, info.width, info.height, settings.pitch * scale, settings.bend * scale)
  // Interpolate nearby blur radii, keeping the left edge sharp and progressively
  // softening towards the lifted right edge. This work runs only at build time.
  const layers = []
  for (let level = 0; level < 4; level++) {
    const sigma = (settings.blurMin + (settings.blur - settings.blurMin) * level / 3) * scale
    layers.push(await sharp(distorted, { raw: info }).blur(Math.max(.3, sigma)).raw().toBuffer())
  }
  const softened = Buffer.alloc(distorted.length)
  const pitch = settings.pitch * scale
  for (let x = 0; x < info.width; x++) {
    const phase = (x % pitch) / pitch
    const amount = phase * phase * (3 - 2 * phase) * (layers.length - 1)
    const lower = Math.floor(amount)
    const upper = Math.min(lower + 1, layers.length - 1)
    const mix = amount - lower
    for (let y = 0; y < info.height; y++) {
      const offset = (y * info.width + x) * 4
      for (let c = 0; c < 4; c++) {
        softened[offset + c] = Math.round(layers[lower][offset + c] * (1 - mix) + layers[upper][offset + c] * mix)
      }
    }
  }
  const output = path.join(root, 'public/generated-glass')
  await mkdir(output, { recursive: true })
  const variants = []
  for (const size of settings.widths) {
    const filename = `reeded-${hash}-${size}.webp`
    const result = await sharp(softened, { raw: info }).resize({ width: size })
      .webp({ quality: settings.quality }).toFile(path.join(output, filename))
    variants.push({ src: `/generated-glass/${filename}`, width: result.width, height: result.height })
  }
  const manifest = { hash, variants, aspectRatio: metadata.width / metadata.height }
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await generateReededGlass()
  console.log(`リブガラス画像を生成しました: ${result.variants.map(v => v.src).join(', ')}`)
}
