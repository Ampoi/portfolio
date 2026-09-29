import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { compileLandscape } from '../scripts/prepare-landscape.mjs'

test('筆触データは元SVGの座標・色・太さ・順序とクリップ境界を保持する', async () => {
  const source = await readFile(new URL('../public/artwork/flower-hills.svg', import.meta.url), 'utf8')
  const { svg, metadata, brushes } = compileLandscape(source)
  assert.equal(svg, source)
  assert.deepEqual([metadata.width, metadata.height, metadata.count], [1122, 1402, 37479])
  assert.equal(metadata.end, 1.5)
  assert.equal(metadata.duration, 0.56 * 0.6)
  assert.equal(metadata.leadIn, 0.3)
  assert.equal(metadata.end, metadata.leadIn + metadata.sweep + metadata.duration)
  assert.equal(metadata.ridge[0], 624)
  assert.equal(metadata.ridge.at(-1), 673)
  // First stroke: relative line in the sky underlay; midpoint gives the same line.
  assert.deepEqual([...brushes.slice(0, 6)], [-5, 621, 0, 620.5, 5, 620])
  assert.equal(brushes[9], 12)
  assert.equal(brushes[11], -1)
  const paths = [...source.matchAll(/<path\b[^>]*stroke-width="[^"]+"[^>]*>/g)]
  assert.equal(paths.length, metadata.count)
  for (let i = 0; i < paths.length; i++) {
    const tag = paths[i][0]
    const offset = i * metadata.stride
    const d = tag.match(/d="([^"]+)"/)[1]
    const coordinates = d.match(/-?\d+(?:\.\d+)?/g).map(Number)
    const color = tag.match(/stroke="#([\da-f]{6})"/)[1]
    assert.equal(brushes[offset], Math.fround(coordinates[0]))
    assert.equal(brushes[offset + 1], Math.fround(coordinates[1]))
    if (d.includes('Q')) assert.deepEqual([...brushes.slice(offset, offset + 6)], coordinates.map(Math.fround))
    for (let channel = 0; channel < 3; channel++) {
      assert.equal(brushes[offset + 6 + channel], Math.fround(parseInt(color.slice(channel * 2, channel * 2 + 2), 16) / 255))
    }
    assert.equal(brushes[offset + 9], Math.fround(Number(tag.match(/stroke-width="([^"]+)"/)[1])))
    if (tag.includes('url(#land-boundary)')) assert.equal(brushes[offset + 11], 1)
    assert.ok(brushes[offset + 10] >= 0 && brushes[offset + 10] <= 1)
  }
})

test('配信用バイナリとメタデータが元SVGと一致し、アニメーションCSSが残らない', async () => {
  const directory = new URL('../public/artwork/', import.meta.url)
  const source = await readFile(new URL('flower-hills.svg', directory), 'utf8')
  const compiled = compileLandscape(source)
  const binary = await readFile(new URL('flower-hills-brushes.bin', directory))
  assert.deepEqual(binary, Buffer.from(compiled.brushes.buffer))
  assert.deepEqual(JSON.parse(await readFile(new URL('flower-hills-brushes.json', directory), 'utf8')), compiled.metadata)
  assert.doesNotMatch(source, /animation:|@keyframes|class="brush/)
})

test('描画できない形状を不完全なアニメーションとして書き出さない', async () => {
  const source = await readFile(new URL('../public/artwork/flower-hills.svg', import.meta.url), 'utf8')
  assert.throws(() => compileLandscape(source.replace('M-5 621.0l10 -1', 'M-5 621.0C0 0 1 1 2 2')), /未対応の筆触/)
  assert.throws(() => compileLandscape(source.replace('viewBox="0 0', 'viewBox="1 0')), /viewBox/)
})
