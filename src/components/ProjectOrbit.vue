<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type CSSProperties } from 'vue'
import type { Project } from '../content'
import ContentImage from './ContentImage.vue'

const props = defineProps<{ projects: Project[] }>()
const concepts = [
  ['komorebi', '日々の余白を、ひとつずつ。', 'Lifestyle', '#e2e7c9', '#64754c'],
  ['ORBIT', '小さなアイデアが、めぐりはじめる。', 'Web application', '#e2dbef', '#766098'],
  ['nami', '音と暮らす、穏やかな時間。', 'Music', '#c9dde4', '#447a8e'],
  ['余白', '言葉のあいだにあるもの。', 'Editorial', '#e9e2d6', '#807361'],
  ['MELLOW', '気分から見つける、新しい色。', 'Art direction', '#efd1bc', '#b57250'],
  ['fern', '育てる楽しみを、もっと身近に。', 'Mobile application', '#cfdfc8', '#587456'],
  ['SPOOL', 'つくる人と、つかう人をつなぐ。', 'Platform', '#ead3d7', '#a25e74'],
  ['LUMA', 'ひらめきを、そっと灯す。', 'Product design', '#ede5b5', '#9d893b'],
  ['ao', '遠くへ行きたくなる記録。', 'Travel', '#c9d9ed', '#587aa5'],
  ['TONE', 'あなたのペースで整える。', 'Wellness', '#dfd4e6', '#8c6b9a'],
  ['種と、', '小さなきっかけから始まる。', 'Brand identity', '#d9dec1', '#757c46'],
  ['PAPER', '考えることを、手ざわりに。', 'Stationery', '#e9dace', '#a17c61'],
  ['float', '思いつきを自由に浮かべる。', 'Creative tool', '#cce1df', '#4d8b87'],
  ['MACHI', 'いつもの街の、まだ知らない顔。', 'Local community', '#e7d3be', '#a77647'],
  ['日々', '何気ない一日を残しておく。', 'Journal', '#dce0e9', '#6d7994'],
  ['ROOT', '好きなことから、広がる場所。', 'Community', '#d4deca', '#6e845c'],
  ['mori', '深呼吸するように、選ぶ。', 'E-commerce', '#c4d9cd', '#497c62'],
  ['HUSH', '静けさを持ち歩く。', 'Sound design', '#d9d5e4', '#7e7398'],
  ['ARCH', '境界を越える、新しいかたち。', 'Architecture', '#e9ddc4', '#a08a59'],
  ['つづく', '次のアイデアは、この先に。', 'Experiment', '#e4d2c9', '#a37767'],
]
// Design samples stay separate from published YAML content and article routes.
const items = computed(() => [
  ...concepts.map(([name, description, category, background, ink], index) => ({
    slug: `orbit-placeholder-${index + 1}`, name: name!, description: description!,
    category: category!, background: background!, ink: ink!, project: undefined as Project | undefined,
  })),
  ...props.projects.map(project => ({
    slug: project.slug, name: project.name, description: project.description,
    category: 'Project', background: '#e1e6d9', ink: '#63765c', project,
  })),
])
// Keep two full cycles on either side, then rebase between gestures.
const repeatedItems = computed(() => Array.from({ length: 5 }, (_, cycle) =>
  items.value.map(item => ({ ...item, key: `${cycle}-${item.slug}` }))).flat())
const scroller = ref<HTMLUListElement>()
const position = ref(items.value.length * 2)
const stride = ref(370)
const radius = ref(1800)
const physicalIndex = computed(() => Math.round(position.value))
const active = computed(() => ((physicalIndex.value % items.value.length) + items.value.length) % items.value.length)
const reducedMotion = ref(false)
let observer: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let measuredWidth = 0
let frame = 0
let settleTimer: ReturnType<typeof setTimeout> | undefined
let drag: { id: number; x: number; scroll: number; moved: boolean } | undefined
let suppressClick = false

function updatePosition() {
  const element = scroller.value
  if (!element) return
  // Native snap can fire a scroll event before ResizeObserver on a breakpoint change.
  if (element.clientWidth !== measuredWidth) { measure(); return }
  position.value = element.scrollLeft / stride.value
}
function settle() {
  clearTimeout(settleTimer)
  const element = scroller.value
  if (!element || drag) return
  const current = element.scrollLeft / stride.value
  const logical = ((current % items.value.length) + items.value.length) % items.value.length
  const destination = (items.value.length * 2 + logical) * stride.value
  if (Math.abs(element.scrollLeft - destination) > 1) {
    element.scrollTo({ left: destination, behavior: 'instant' })
    updatePosition()
  }
}
function onScroll() {
  clearTimeout(settleTimer)
  settleTimer = setTimeout(settle, 180)
  if (frame) return
  frame = requestAnimationFrame(() => { updatePosition(); frame = 0 })
}
function measure() {
  const element = scroller.value
  const first = element?.firstElementChild as HTMLElement | null
  if (!element || !first) return
  const previousIndex = items.value.length * 2 + active.value
  measuredWidth = element.clientWidth
  stride.value = first.offsetWidth + parseFloat(getComputedStyle(element).columnGap)
  radius.value = Math.max(1100, element.clientWidth * 1.45)
  element.scrollLeft = previousIndex * stride.value
  updatePosition()
}
function cardStyle(index: number): CSSProperties {
  const distance = (index - position.value) * stride.value
  const angle = distance / radius.value
  // Only project the visible arc; distant cards never wrap back into view.
  const visible = Math.abs(distance) < (scroller.value?.clientWidth ?? 1440) / 2 + stride.value
  const x = reducedMotion.value ? 0 : radius.value * Math.sin(angle) - distance
  const y = reducedMotion.value ? 0 : radius.value * (Math.cos(angle) - 1)
  return {
    transform: `translate3d(${x}px, ${y}px, 0) rotate(${reducedMotion.value ? 0 : -angle}rad)`,
    visibility: visible ? 'visible' : 'hidden',
    '--art-background': repeatedItems.value[index]!.background,
    '--art-ink': repeatedItems.value[index]!.ink,
  } as CSSProperties
}
function goTo(index: number) {
  const next = Math.max(0, Math.min(repeatedItems.value.length - 1, index))
  scroller.value?.scrollTo({ left: next * stride.value, behavior: reducedMotion.value ? 'instant' : 'smooth' })
}
function onKeydown(event: KeyboardEvent) {
  if (event.target !== scroller.value) return
  const destination = { ArrowLeft: physicalIndex.value - 1, ArrowRight: physicalIndex.value + 1, Home: items.value.length * 2, End: items.value.length * 3 - 1 }[event.key]
  if (destination === undefined) return
  event.preventDefault()
  goTo(destination)
}
function pointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || (event.target as HTMLElement).closest('a, button')) return
  drag = { id: event.pointerId, x: event.clientX, scroll: scroller.value!.scrollLeft, moved: false }
  suppressClick = false
}
function pointerMove(event: PointerEvent) {
  if (!drag || drag.id !== event.pointerId) return
  const delta = event.clientX - drag.x
  if (!drag.moved && Math.abs(delta) < 5) return
  drag.moved = true
  const element = scroller.value!
  element.setPointerCapture(event.pointerId)
  element.classList.add('is-dragging')
  element.scrollLeft = drag.scroll - delta
  updatePosition()
}
function pointerUp(event: PointerEvent) {
  if (!drag || drag.id !== event.pointerId) return
  const element = scroller.value!
  const moved = drag.moved
  const destination = Math.round(element.scrollLeft / stride.value)
  drag = undefined
  suppressClick = moved
  if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
  element.classList.remove('is-dragging')
  if (moved) goTo(destination)
}
function onClick(event: MouseEvent) {
  if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false }
}
function syncMotion() { reducedMotion.value = motionQuery?.matches ?? false }
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMotion()
  motionQuery.addEventListener('change', syncMotion)
  observer = new ResizeObserver(measure)
  observer.observe(scroller.value!)
  measure()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  motionQuery?.removeEventListener('change', syncMotion)
  cancelAnimationFrame(frame)
  clearTimeout(settleTimer)
})
</script>

<template>
  <div class="project-orbit" role="region" aria-roledescription="カルーセル" aria-label="プロジェクト一覧">
    <div class="orbit-window">
      <div class="orbit-guide" aria-hidden="true" :style="{ width: `${radius * 2}px`, height: `${radius * 2}px`, top: `${310 - radius * 2}px` }" />
      <ul ref="scroller" class="orbit-scroller" tabindex="0" aria-label="横スクロールでプロジェクトを表示。左右矢印キーでも移動できます。"
        @scroll.passive="onScroll" @scrollend="settle" @keydown="onKeydown" @pointerdown="pointerDown" @pointermove="pointerMove"
        @pointerup="pointerUp" @pointercancel="pointerUp" @lostpointercapture="pointerUp" @click.capture="onClick" @dragstart.prevent>
        <li v-for="(item, index) in repeatedItems" :key="item.key" class="orbit-slot" :aria-hidden="Math.abs(index - position) > 3" :aria-label="`${index % items.length + 1} / ${items.length}`">
          <article class="orbit-card" :class="{ 'is-active': index === physicalIndex }" :style="cardStyle(index)">
            <div class="orbit-art" :class="`orbit-art--${(index % items.length) % 5}`">
              <ContentImage v-if="item.project" :image="item.project.image" :alt="item.name" />
              <template v-else>
                <span class="art-edition">DESIGN STUDY / {{ String(index % items.length + 1).padStart(2, '0') }}</span>
                <div class="art-shape" aria-hidden="true"><i /><i /><i /></div>
                <span class="art-wordmark" aria-hidden="true">{{ item.name }}</span>
                <span class="art-footnote">A LITTLE IDEA, TAKING SHAPE.</span>
              </template>
            </div>
            <div class="orbit-card__body">
              <div class="orbit-card__meta"><span>{{ item.category }}</span><span v-if="!item.project" class="sample-label">PLACEHOLDER</span></div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div v-if="item.project" class="orbit-card__links">
                <a :href="item.project.link" :tabindex="index === physicalIndex ? 0 : -1">プロジェクトを見る ↗</a>
                <RouterLink v-if="item.project.articleHtml !== undefined" :to="`/projects/${item.project.slug}/`" :tabindex="index === physicalIndex ? 0 : -1">詳細記事 →</RouterLink>
              </div>
              <div v-else class="orbit-card__footer"><span>CONCEPT {{ String(index % items.length + 1).padStart(2, '0') }}</span><span aria-hidden="true">↗</span></div>
            </div>
          </article>
        </li>
      </ul>
    </div>
    <div class="orbit-controls">
      <button type="button" class="orbit-arrow" aria-label="前のプロジェクト" @click="goTo(physicalIndex - 1)">←</button>
      <div class="orbit-pagination"><span class="orbit-count" aria-live="polite" aria-atomic="true">{{ String(active + 1).padStart(2, '0') }} <span>/ {{ String(items.length).padStart(2, '0') }}</span></span>
        <div class="orbit-ticks" aria-hidden="true"><span v-for="(_, index) in items" :key="index" :class="{ 'is-active': index === active }" /></div>
      </div>
      <button type="button" class="orbit-arrow" aria-label="次のプロジェクト" @click="goTo(physicalIndex + 1)">→</button>
    </div>
  </div>
</template>

<style scoped>
.project-orbit { --card-width: 330px; --card-gap: 40px; padding-top: 6px; }
.orbit-window { position: relative; overflow: hidden; }
.orbit-guide { position: absolute; left: 50%; transform: translateX(-50%); border: 1px solid rgb(255 255 255 / 45%); border-radius: 50%; pointer-events: none; }
.orbit-scroller { position: relative; display: flex; gap: var(--card-gap); height: 570px; padding: 142px max(0px, calc((100% - var(--card-width)) / 2)) 0; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; cursor: grab; -webkit-tap-highlight-color: transparent; }
.orbit-scroller::-webkit-scrollbar { display: none; }
.orbit-scroller:focus-visible { outline: 2px solid #547359; outline-offset: -5px; border-radius: 24px; }
.orbit-scroller.is-dragging { scroll-snap-type: none; cursor: grabbing; user-select: none; }
.orbit-slot { flex: 0 0 var(--card-width); min-width: 0; height: 376px; scroll-snap-align: center; }
.orbit-card { height: 376px; padding: 10px; border: 1px solid rgb(255 255 255 / 80%); border-radius: 23px; background: rgb(249 252 247 / 76%); box-shadow: 0 14px 32px rgb(23 49 33 / 10%), inset 0 1px 0 rgb(255 255 255 / 80%); backdrop-filter: blur(20px) saturate(115%); -webkit-backdrop-filter: blur(20px) saturate(115%); transform-origin: 50% 50%; }
.orbit-card.is-active { background: rgb(249 252 247 / 88%); }
.orbit-art { height: 204px; position: relative; overflow: hidden; border-radius: 14px; background: var(--art-background); color: var(--art-ink); }
.orbit-art :deep(img) { width: 100%; height: 100%; object-fit: cover; }
.art-edition, .art-footnote { position: absolute; z-index: 1; left: 17px; font-size: 7px; letter-spacing: .15em; }
.art-edition { top: 14px; }.art-footnote { bottom: 13px; font-size: 6px; }
.art-wordmark { position: absolute; inset: 0; display: grid; place-items: center; font-family: Georgia, 'Times New Roman', serif; font-size: 43px; letter-spacing: -.045em; }
.art-shape { position: absolute; width: 150px; height: 150px; left: calc(50% - 75px); top: 28px; opacity: .25; }
.art-shape i { position: absolute; inset: 0; border: 1px solid currentColor; border-radius: 50%; }
.art-shape i:nth-child(2) { transform: translateX(-28px); }.art-shape i:nth-child(3) { transform: translateX(28px); }
.orbit-art--1 .art-shape { transform: rotate(-35deg); }.orbit-art--1 .art-shape i { border-width: 16px; transform: scaleY(.45); }.orbit-art--1 .art-shape i:nth-child(2) { transform: scaleY(.7); }.orbit-art--1 .art-shape i:nth-child(3) { transform: scaleY(1); }
.orbit-art--2 .art-shape i { border-radius: 44% 56% 65% 35%; background: currentColor; transform: rotate(30deg); }.orbit-art--2 .art-shape i:nth-child(2) { transform: translate(55px, 55px); }.orbit-art--2 .art-shape i:nth-child(3) { transform: translate(-65px, 75px); }
.orbit-art--3 .art-shape { transform: rotate(45deg); }.orbit-art--3 .art-shape i { border-radius: 2px; }.orbit-art--3 .art-shape i:nth-child(2) { transform: scale(.78); }.orbit-art--3 .art-shape i:nth-child(3) { transform: scale(.55); }
.orbit-art--4 .art-shape i { border-width: 25px; }.orbit-art--4 .art-shape i:nth-child(2) { transform: translateX(-95px); }.orbit-art--4 .art-shape i:nth-child(3) { transform: translateX(95px); }
.orbit-card__body { padding: 14px 10px 0; }
.orbit-card__meta { display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: .05em; color: #627265; }
.sample-label { font-size: 7px; letter-spacing: .12em; opacity: .7; }
.orbit-card h3 { margin-top: 5px; font-size: 21px; font-weight: 600; line-height: 1.4; letter-spacing: .025em; }
.orbit-card p { margin-top: 5px; font-size: 11px; line-height: 1.75; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.orbit-card__footer, .orbit-card__links { display: flex; justify-content: space-between; align-items: center; margin-top: 13px; padding-top: 9px; border-top: 1px solid rgb(72 97 70 / 12%); font-size: 8px; letter-spacing: .1em; }
.orbit-card__footer > :last-child { font-size: 16px; line-height: 1; }.orbit-card__links { font-size: 10px; letter-spacing: 0; }
.orbit-controls { display: flex; justify-content: center; align-items: center; gap: 28px; margin-top: -7px; }
.orbit-arrow { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid rgb(255 255 255 / 80%); border-radius: 50%; background: rgb(249 252 247 / 65%); font-size: 20px; cursor: pointer; transition: background .2s; }
.orbit-arrow:hover { background: #f9fcf7; }.orbit-arrow:focus-visible { outline: 2px solid #547359; outline-offset: 4px; }
.orbit-pagination { display: grid; justify-items: center; gap: 10px; }.orbit-count { font-size: 13px; font-variant-numeric: tabular-nums; letter-spacing: .12em; }.orbit-count > span { opacity: .45; }
.orbit-ticks { display: flex; align-items: center; gap: 5px; height: 10px; }.orbit-ticks > span { width: 2px; height: 4px; background: #254330; opacity: .2; }.orbit-ticks > .is-active { height: 10px; opacity: .85; }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .orbit-card { background: #f3f6ee; } }
@media (max-width: 640px) {
  .project-orbit { --card-width: min(280px, calc(100vw - 72px)); --card-gap: 24px; }
  .orbit-scroller { height: 500px; padding-top: 95px; }.orbit-art { height: 190px; }.orbit-card, .orbit-slot { height: 368px; }
  .orbit-controls { gap: 22px; }
}
@media (prefers-reduced-motion: reduce) { .orbit-arrow { transition: none; } }
</style>
