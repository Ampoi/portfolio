import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const attributes = source => Object.fromEntries(
  [...source.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]),
)
const numbers = source => (source.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
// Scale the entire sequence, including the wait and final stroke's growth.
const timeScale = 1.2
const totalDuration = 1.0 * timeScale
const leadIn = 0.25 * timeScale
const duration = 0.28 * timeScale
const sweep = totalDuration - duration
const randomLatency = 0.12 * timeScale
const settleRadius = 0.88

export function compileLandscape(source) {
  // Also accept the previous CSS-animated export when regenerating the assets.
  const svg = source.replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/ class="brush brush-\d+"/g, '')
  const viewBox = numbers(svg.match(/viewBox="([^"]+)"/)?.[1] ?? '')
  const [left, top, width, height] = viewBox
  if (viewBox.length !== 4 || left !== 0 || top !== 0 || !width || !height) {
    throw new Error('原点が0,0のviewBoxが必要です')
  }

  const ridgePath = svg.match(/<clipPath id="land-boundary"><path d="([^"]+)"/)?.[1]
  if (!ridgePath) throw new Error('丘の境界がありません')
  const ridgePoints = numbers(ridgePath)
  const ridge = []
  let ridgeStep
  for (let i = 0; i < ridgePoints.length; i += 2) {
    const [x, y] = ridgePoints.slice(i, i + 2)
    if (i === 2) ridgeStep = x
    if (i > 0 && x !== i / 2 * ridgeStep) throw new Error('丘の境界は等間隔にしてください')
    ridge.push(y)
    if (x === width) break
  }
  if (!ridgeStep || (ridge.length - 1) * ridgeStep !== width) throw new Error('丘の境界が不完全です')

  const data = []
  const clips = [0]
  // Seed locally so regenerating the same artwork produces identical assets.
  let randomState = 0x416d706f
  for (const tag of svg.matchAll(/<(\/?)(g|path)\b([^>]*?)>/g)) {
    if (tag[2] === 'g' && tag[1]) { clips.pop(); continue }
    if (tag[1]) continue
    const attr = attributes(tag[3])
    const clip = attr['clip-path'] === 'url(#land-boundary)' ? 1
      : attr['clip-path'] === 'url(#sky-boundary)' ? -1 : clips.at(-1)
    if (tag[2] === 'g') { clips.push(clip); continue }
    if (!attr['stroke-width']) continue
    const coordinates = numbers(attr.d)
    let a, b, c
    const commands = attr.d.replace(/[^a-z]/gi, '')
    if (commands === 'MQ' && coordinates.length === 6) {
      a = coordinates.slice(0, 2); b = coordinates.slice(2, 4); c = coordinates.slice(4, 6)
    } else if (commands === 'Ml' && coordinates.length === 4) {
      a = coordinates.slice(0, 2)
      c = [a[0] + coordinates[2], a[1] + coordinates[3]]
      b = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]
    } else throw new Error(`未対応の筆触: ${attr.d}`)
    if (!/^#[\da-f]{6}$/i.test(attr.stroke)) throw new Error('筆触の色が不正です')
    const color = [1, 3, 5].map(index => parseInt(attr.stroke.slice(index, index + 2), 16) / 255)
    // Store deterministic per-stroke randomness. The GPU calculates arrival
    // against the visible viewport, so the final slowdown isn't cropped away.
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
    const randomness = randomState / 0x100000000
    // One instance per original SVG stroke, in exactly the original painter's order.
    data.push(...a, ...b, ...c, ...color, Number(attr['stroke-width']), randomness, clip)
  }
  return {
    svg,
    brushes: new Float32Array(data),
    metadata: { version: 2, width, height, count: data.length / 12, stride: 12, leadIn, sweep, duration, randomLatency, settleRadius, end: leadIn + totalDuration, ridgeStep, ridge },
  }
}

// node scripts/prepare-landscape.mjs /path/to/original.svg
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('元の草原SVGのパスを指定してください')
  const result = compileLandscape(await readFile(process.argv[2], 'utf8'))
  const directory = new URL('../public/artwork/', import.meta.url)
  await mkdir(directory, { recursive: true })
  await writeFile(new URL('flower-hills.svg', directory), result.svg)
  await writeFile(new URL('flower-hills-brushes.bin', directory), new Uint8Array(result.brushes.buffer))
  await writeFile(new URL('flower-hills-brushes.json', directory), JSON.stringify(result.metadata))
  console.log(`SVGと${result.metadata.count}本のGPU描画用筆触データを生成しました`)
}
