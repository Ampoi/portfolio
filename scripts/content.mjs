import { readFile, writeFile, mkdir, rm, rename, realpath } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { parseDocument } from 'yaml'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: false })
const fail = (source, message) => { throw new Error(`${source}: ${message}`) }

export async function generateContent(root = process.cwd()) {
  const contentDir = path.join(root, 'content')
  const output = path.join(root, 'public/generated')
  const staging = path.join(root, 'public/.generated-next')
  const moduleDir = path.join(root, 'src/generated')
  await rm(staging, { recursive: true, force: true })
  await mkdir(staging, { recursive: true })
  const images = new Map()

  async function localFile(base, relative, source, extensions) {
    if (typeof relative !== 'string' || !relative.trim() || path.isAbsolute(relative)) fail(source, 'ローカルファイルは相対パスで指定してください')
    const target = path.resolve(base, relative)
    let resolved
    try { resolved = await realpath(target) } catch { fail(source, `参照先が存在しません: ${relative}`) }
    const contentReal = await realpath(contentDir)
    if (!resolved.startsWith(contentReal + path.sep)) fail(source, `content/ の外は参照できません: ${relative}`)
    if (!extensions.includes(path.extname(resolved).toLowerCase())) fail(source, `非対応のファイル形式: ${relative}`)
    return resolved
  }

  async function image(base, relative, source) {
    const filename = await localFile(base, relative, source, ['.jpg', '.jpeg', '.png', '.webp'])
    if (images.has(filename)) return images.get(filename)
    const bytes = await readFile(filename)
    const hash = createHash('sha256').update(bytes).update('webp-v1-q82').digest('hex').slice(0, 16)
    let metadata
    try { metadata = await sharp(bytes).rotate().toBuffer({ resolveWithObject: true }) } catch { fail(source, `画像を読み込めません: ${relative}`) }
    const { width } = metadata.info
    const widths = [...new Set([480, 960, 1600].map(value => Math.min(value, width)))]
    const variants = []
    for (const size of widths) {
      const name = `${hash}-${size}.webp`
      const info = await sharp(bytes).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(staging, name))
      variants.push({ src: `/generated/${name}`, width: info.width, height: info.height })
    }
    const largest = variants.at(-1)
    const result = { src: largest.src, srcset: variants.map(v => `${v.src} ${v.width}w`).join(', '), width: largest.width, height: largest.height }
    images.set(filename, result)
    return result
  }

  async function article(relative, source) {
    const filename = await localFile(contentDir, relative, source, ['.md'])
    const tokens = md.parse(await readFile(filename, 'utf8'), {})
    async function visit(list) {
      for (const token of list) {
        if (token.type === 'image') {
          const src = token.attrGet('src')
          if (!/^https?:\/\//i.test(src)) {
            const optimized = await image(path.dirname(filename), decodeURIComponent(src), relative)
            for (const [key, value] of Object.entries(optimized)) token.attrSet(key, String(value))
            token.attrSet('sizes', '(max-width: 768px) 100vw, 768px')
          }
          token.attrSet('loading', 'lazy')
          token.attrSet('decoding', 'async')
        }
        if (token.children) await visit(token.children)
      }
    }
    await visit(tokens)
    return md.renderer.render(tokens, md.options, {})
  }

  async function collection(name, isProject) {
    const source = `${name}.yaml`
    const doc = parseDocument(await readFile(path.join(contentDir, source), 'utf8'), { uniqueKeys: true })
    if (doc.errors.length) fail(source, doc.errors.map(e => e.message).join('\n'))
    const rows = doc.toJS()
    if (!Array.isArray(rows)) fail(source, '一覧はYAML配列で指定してください（空の場合は []）')
    const slugs = new Set()
    const result = []
    for (const [index, row] of rows.entries()) {
      const label = `${source} [${index + 1}]`
      if (!row || typeof row !== 'object' || Array.isArray(row)) fail(label, '各項目はオブジェクトにしてください')
      const required = ['slug', 'name', 'description', 'image', ...(isProject ? ['link'] : [])]
      const allowed = [...required, ...(isProject ? ['article'] : [])]
      for (const key of Object.keys(row)) if (!allowed.includes(key)) fail(label, `不明な項目: ${key}`)
      for (const key of required) if (typeof row[key] !== 'string' || !row[key].trim()) fail(label, `${key} は空でない文字列が必要です`)
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug)) fail(label, 'slug は英小文字・数字・ハイフンを使用してください')
      if (slugs.has(row.slug)) fail(label, `slug が重複しています: ${row.slug}`)
      slugs.add(row.slug)
      if (isProject) {
        try { if (!['http:', 'https:'].includes(new URL(row.link).protocol)) throw new Error() } catch { fail(label, 'link は http(s) のURLが必要です') }
      }
      const item = { slug: row.slug, name: row.name, description: row.description, image: await image(contentDir, row.image, label) }
      if (isProject) {
        item.link = row.link
        if ('article' in row) item.articleHtml = await article(row.article, label)
      }
      result.push(item)
    }
    return result
  }

  try {
    const data = { projects: await collection('projects', true), lettering: await collection('lettering', false) }
    await mkdir(moduleDir, { recursive: true })
    await rm(output, { recursive: true, force: true })
    await rename(staging, output)
    await writeFile(path.join(moduleDir, 'content.json'), JSON.stringify(data, null, 2) + '\n')
    return data
  } catch (error) {
    await rm(staging, { recursive: true, force: true })
    throw error
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateContent()
  console.log('コンテンツと画像を生成しました')
}
