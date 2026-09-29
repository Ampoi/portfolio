import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { stringify } from 'yaml'
import { generateContent } from '../scripts/content.mjs'

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(path.join(root, 'content/images'), { recursive: true })
  await mkdir(path.join(root, 'content/articles'), { recursive: true })
  await sharp({ create: { width: 1200, height: 600, channels: 4, background: { r: 20, g: 40, b: 60, alpha: 0.5 } } }).png().toFile(path.join(root, 'content/images/sample.png'))
  const row = { slug: 'sample', name: '作品', description: '説明', image: 'images/sample.png', link: 'https://example.com', article: 'articles/sample.md' }
  const save = (name, value) => writeFile(path.join(root, 'content', name), typeof value === 'string' ? value : stringify(value))
  await save('projects.yaml', [row])
  await save('lettering.yaml', [{ slug: row.slug, name: row.name, description: row.description, image: row.image }])
  await save('articles/sample.md', '## 記事本文\n\n![透過画像](../images/sample.png)\n\n<script>alert(1)</script>')
  return { root, row, save }
}

test('記事、レスポンシブ画像、透過、小画像の非拡大、生HTML無効化', async t => {
  const { root } = await fixture(t)
  const data = await generateContent(root)
  const project = data.projects[0]
  assert.match(project.articleHtml, /<h2>記事本文<\/h2>/)
  assert.match(project.articleHtml, /srcset=/)
  assert.match(project.articleHtml, /loading="lazy"/)
  assert.match(project.articleHtml, /&lt;script&gt;/)
  assert.doesNotMatch(project.articleHtml, /<script>/)
  assert.equal(project.image.width, 1200)
  assert.equal(project.image.height, 600)
  assert.match(project.image.srcset, /480w.*960w.*1200w/)
  const files = await readdir(path.join(root, 'public/generated'))
  assert.equal(files.length, 3)
  assert.ok(files.every(file => file.endsWith('.webp')))
  const metadata = await sharp(path.join(root, 'public', project.image.src)).metadata()
  assert.equal(metadata.hasAlpha, true)
  await sharp({ create: { width: 100, height: 50, channels: 3, background: 'red' } }).png().toFile(path.join(root, 'content/images/sample.png'))
  const small = await generateContent(root)
  assert.equal(small.projects[0].image.width, 100)
  assert.equal((await readdir(path.join(root, 'public/generated'))).length, 1)
  assert.notEqual(small.projects[0].image.src, project.image.src)
})

test('YAMLの追加、順序変更、削除、記事省略、空一覧', async t => {
  const { root, row, save } = await fixture(t)
  const { article, ...withoutArticle } = row
  await save('projects.yaml', [{ ...withoutArticle, slug: 'second' }, row])
  const result = await generateContent(root)
  assert.deepEqual(result.projects.map(p => p.slug), ['second', 'sample'])
  assert.equal(result.projects[0].articleHtml, undefined)
  await save('projects.yaml', [withoutArticle])
  assert.equal((await generateContent(root)).projects.length, 1)
  await save('projects.yaml', [])
  await save('lettering.yaml', [])
  assert.deepEqual(await generateContent(root), { projects: [], lettering: [] })
  assert.deepEqual(await readdir(path.join(root, 'public/generated')), [])
})

test('参照切れや不正YAMLはファイル名付きで失敗し、既存生成物は保持', async t => {
  const { root, row, save } = await fixture(t)
  await generateContent(root)
  const original = await readFile(path.join(root, 'src/generated/content.json'), 'utf8')
  for (const [rows, expected] of [
    [[{ ...row, name: '' }], /projects.yaml.*name/],
    [[row, row], /projects.yaml.*重複/],
    [[{ ...row, image: 'images/missing.png' }], /projects.yaml.*存在しません/],
    [[{ ...row, article: 'articles/missing.md' }], /projects.yaml.*存在しません/],
    [[{ ...row, link: 'javascript:alert(1)' }], /projects.yaml.*http/],
    [[{ ...row, image: '../outside.png' }], /projects.yaml/],
    ['- slug: x\n  slug: y', /projects.yaml/],
  ]) {
    await save('projects.yaml', rows)
    await assert.rejects(generateContent(root), expected)
    assert.equal(await readFile(path.join(root, 'src/generated/content.json'), 'utf8'), original)
  }
  await save('projects.yaml', [row])
  await save('articles/sample.md', '![不明](missing.png)')
  await assert.rejects(generateContent(root), /articles\/sample.md.*存在しません/)
})

test('Markdownの日本語・空白を含む画像パス', async t => {
  const { root, save } = await fixture(t)
  const bytes = await readFile(path.join(root, 'content/images/sample.png'))
  await writeFile(path.join(root, 'content/images/作字 サンプル.png'), bytes)
  await save('articles/sample.md', '![作字](<../images/作字 サンプル.png>)')
  assert.match((await generateContent(root)).projects[0].articleHtml, /src="\/generated\/.*\.webp"/)
})
