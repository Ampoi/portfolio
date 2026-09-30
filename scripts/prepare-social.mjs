import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

// Render the existing vector artwork and logo exactly, with the hero's center
// crop and 28% shade. Keep all content inside the social card's safe area.
const root = new URL('../', import.meta.url)
const asset = relative => new URL(relative, root)
const width = 1200
const height = 630
const logo = await sharp(await readFile(asset('public/artwork/ampoi-logo.svg')))
  .resize({ width: 560 }).png().toBuffer()
await sharp(await readFile(asset('public/artwork/flower-hills.svg')), { density: 144 })
  .resize(width, height, { fit: 'cover', position: 'centre' })
  .composite([
    { input: Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="black" opacity=".28"/></svg>`) },
    { input: logo, gravity: 'centre' },
  ])
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toFile(asset('public/ogp.jpg').pathname)

// favicon.png is the original v1 asset; derive browser and iOS sizes from it.
const original = await readFile(asset('public/favicon.png'))
const sizes = [16, 32, 48]
const icons = await Promise.all(sizes.map(size => sharp(original)
  .resize(size, size, { fit: 'contain', background: '#ffffff' }).png().toBuffer()))
const header = Buffer.alloc(6 + 16 * icons.length)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(icons.length, 4)
let offset = header.length
icons.forEach((icon, index) => {
  const entry = 6 + index * 16
  header[entry] = sizes[index]
  header[entry + 1] = sizes[index]
  header.writeUInt16LE(1, entry + 4)
  header.writeUInt16LE(32, entry + 6)
  header.writeUInt32LE(icon.length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += icon.length
})
await writeFile(asset('public/favicon.ico'), Buffer.concat([header, ...icons]))
await sharp(original).resize(180, 180, { fit: 'contain', background: '#ffffff' })
  .flatten({ background: '#ffffff' }).png().toFile(asset('public/apple-touch-icon.png').pathname)
console.log('OGP (1200×630), favicon, and Apple touch icon generated.')
