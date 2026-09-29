import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { generateReededGlass, refractPixels } from '../scripts/prepare-reeded-glass.mjs'

test('屈折は元画像の色と透過を保ち、白い膜や透明な端を追加しない', () => {
  const pixels = Buffer.alloc(40 * 50 * 4)
  for (let i = 0; i < pixels.length; i += 4) pixels.set([28, 94, 53, 180], i)
  assert.deepEqual(refractPixels(pixels, 40, 50, 12, 3), pixels)
  // A horizontal color ramp must be warped, while its alpha stays opaque.
  for (let i = 0; i < pixels.length; i += 4) pixels.set([(i / 4 % 40) * 6, 94, 53, 255], i)
  const distorted = refractPixels(pixels, 40, 50, 12, 3)
  assert.notDeepEqual(distorted, pixels)
  for (let i = 3; i < distorted.length; i += 4) assert.equal(distorted[i], 255)
})

test('リブの左端を保ち、右端だけを持ち上げる', () => {
  const width = 48
  const height = 50
  const pixels = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) pixels.set([y * 5, 80, 40, 255], (y * width + x) * 4)
  }
  const distorted = refractPixels(pixels, width, height, 12, 3)
  const redAt = x => distorted[(20 * width + x) * 4]
  for (const left of [0, 12, 24, 36]) {
    assert.equal(redAt(left), 100)
    assert.ok(redAt(left + 11) > redAt(left + 6))
    assert.ok(redAt(left + 6) > redAt(left))
  }
})

test('CI用画像生成: 寸法、キャッシュ再利用、欠損の復旧、元画像変更の反映', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'reeded-glass-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const input = path.join(root, 'public/artwork/flower-hills.svg')
  await mkdir(path.dirname(input), { recursive: true })
  const svg = color => `<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402"><rect width="1122" height="1402" fill="${color}"/><circle cx="561" cy="701" r="200" fill="#222"/></svg>`
  await writeFile(input, svg('#428c43'))
  const first = await generateReededGlass(root)
  const file = variant => path.join(root, 'public', variant.src)
  for (const variant of first.variants) {
    const info = await sharp(file(variant)).metadata()
    assert.equal(info.format, 'webp')
    assert.equal(info.width, variant.width)
    assert.equal(info.height, variant.height)
    assert.equal(info.width / info.height, 1122 / 1402)
  }
  const modified = (await stat(file(first.variants[0]))).mtimeMs
  assert.deepEqual(await generateReededGlass(root), first)
  assert.equal((await stat(file(first.variants[0]))).mtimeMs, modified)
  await rm(file(first.variants[0]))
  assert.deepEqual(await generateReededGlass(root), first)
  await accessImage(file(first.variants[0]))
  await writeFile(input, svg('#b84f32'))
  const changed = await generateReededGlass(root)
  assert.notEqual(changed.hash, first.hash)
  assert.notEqual(changed.variants[0].src, first.variants[0].src)
  const manifest = await readFile(path.join(root, 'src/generated/reeded-glass.json'), 'utf8')
  await writeFile(input, 'invalid svg')
  await assert.rejects(generateReededGlass(root))
  assert.equal(await readFile(path.join(root, 'src/generated/reeded-glass.json'), 'utf8'), manifest)
})

async function accessImage(filename) {
  assert.ok((await stat(filename)).size > 0)
}
