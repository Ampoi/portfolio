<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type CSSProperties } from 'vue'
import type { Project } from '../content'
import ContentImage from './ContentImage.vue'

const props = defineProps<{ projects: Project[] }>()
const items = computed(() => props.projects.map(project => ({
  slug: project.slug, name: project.name, description: project.description,
  background: '#e1e6d9', ink: '#63765c', project,
})))
// Keep two full cycles on either side, then rebase between gestures.
const repeatedItems = computed(() => Array.from({ length: 5 }, (_, cycle) =>
  items.value.map(item => ({ ...item, key: `${cycle}-${item.slug}` }))).flat())
const scroller = ref<HTMLUListElement>()
const position = ref(items.value.length * 2)
const stride = ref(370)
const radius = ref(1800)
const physicalIndex = computed(() => Math.round(position.value))
const active = computed(() => items.value.length ? ((physicalIndex.value % items.value.length) + items.value.length) % items.value.length : 0)
const reducedMotion = ref(false)
const imageColors = ref<Record<string, string>>({})
const frameColor = computed(() => {
  const item = items.value[active.value]
  return item ? imageColors.value[item.slug] ?? item.ink : '#63765c'
})

function sampleImageColor(event: Event, slug: string) {
  if (imageColors.value[slug]) return
  const image = event.target as HTMLImageElement
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 16
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return
  try {
    context.drawImage(image, 0, 0, 16, 16)
    const { data } = context.getImageData(0, 0, 16, 16)
    let red = 0, green = 0, blue = 0, weight = 0
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!
      // Favor the image's colorful areas over white margins and dark lettering.
      const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / 255
      const influence = (0.05 + saturation * saturation) * data[i + 3]! / 255
      red += r * influence; green += g * influence; blue += b * influence; weight += influence
    }
    if (weight) imageColors.value[slug] = `rgb(${Math.round(red / weight)} ${Math.round(green / weight)} ${Math.round(blue / weight)})`
  } catch {
    // Remote images without canvas access retain their fallback frame color.
  }
}
let observer: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let measuredWidth = 0
let frame = 0
let navigationFrame = 0
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
  if (!element || !items.value.length || drag || navigationFrame) return
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
  cancelNavigation()
  const previousIndex = items.value.length * 2 + active.value
  measuredWidth = element.clientWidth
  stride.value = first.offsetWidth + parseFloat(getComputedStyle(element).columnGap)
  radius.value = Math.max(1100, element.clientWidth * 1.45)
  element.scrollLeft = previousIndex * stride.value
  updatePosition()
}
function artStyle(index: number): CSSProperties {
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
function cancelNavigation() {
  cancelAnimationFrame(navigationFrame)
  navigationFrame = 0
  scroller.value?.classList.remove('is-animating')
}
function goTo(index: number) {
  const element = scroller.value
  if (!element) return
  cancelNavigation()
  const next = Math.max(0, Math.min(repeatedItems.value.length - 1, index))
  const start = element.scrollLeft
  const destination = next * stride.value
  if (reducedMotion.value) {
    element.scrollLeft = destination
    updatePosition()
    return
  }
  // Animate the shared position so photo and caption remain synchronized even
  // in browsers that interrupt native smooth scrolling during scroll snapping.
  element.classList.add('is-animating')
  const started = performance.now()
  function step(now: number) {
    const progress = Math.min(1, (now - started) / 420)
    element!.scrollLeft = start + (destination - start) * (1 - (1 - progress) ** 3)
    updatePosition()
    if (progress < 1) navigationFrame = requestAnimationFrame(step)
    else { cancelNavigation(); settle() }
  }
  navigationFrame = requestAnimationFrame(step)
}
function onKeydown(event: KeyboardEvent) {
  if (event.target !== scroller.value) return
  const destination = { ArrowLeft: physicalIndex.value - 1, ArrowRight: physicalIndex.value + 1, Home: items.value.length * 2, End: items.value.length * 3 - 1 }[event.key]
  if (destination === undefined) return
  event.preventDefault()
  goTo(destination)
}
function pointerDown(event: PointerEvent) {
  if ((event.pointerType !== 'mouse' && event.currentTarget === scroller.value) || event.button !== 0 || (event.target as HTMLElement).closest('a, button')) return
  cancelNavigation()
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
  cancelNavigation()
  clearTimeout(settleTimer)
})
</script>

<template>
  <div class="project-orbit" role="region" aria-roledescription="カルーセル" aria-label="プロジェクト一覧">
    <div class="project-sheet">
      <h2 id="projects-heading" class="project-title">PROJECT</h2>
      <p v-if="!items.length" class="py-6 text-center">まだプロジェクトはありません。</p>
      <div v-show="items.length" class="orbit-stage" :style="{ '--frame-color': frameColor }">
        <ul ref="scroller" class="orbit-scroller" tabindex="0" aria-label="横スクロールでプロジェクトを表示。左右矢印キーでも移動できます。"
          @wheel.passive="cancelNavigation" @touchstart.passive="cancelNavigation" @scroll.passive="onScroll" @scrollend="settle" @keydown="onKeydown" @pointerdown="pointerDown" @pointermove="pointerMove"
          @pointerup="pointerUp" @pointercancel="pointerUp" @lostpointercapture="pointerUp" @click.capture="onClick" @dragstart.prevent>
          <li v-for="(item, index) in repeatedItems" :key="item.key" class="orbit-slot" :aria-hidden="index !== physicalIndex" :aria-label="`${index % items.length + 1} / ${items.length}`">
            <div class="orbit-art" :class="{ 'is-active': index === physicalIndex }" :style="artStyle(index)">
              <ContentImage :image="item.project.image" :alt="item.name" @load="sampleImageColor($event, item.slug)" />
            </div>
          </li>
        </ul>
        <div class="orbit-frame" aria-hidden="true" />
      </div>
      <div v-show="items.length" class="orbit-details" @pointerdown="pointerDown" @pointermove="pointerMove"
        @pointerup="pointerUp" @pointercancel="pointerUp" @lostpointercapture="pointerUp" @click.capture="onClick" @dragstart.prevent>
        <div class="orbit-details-track" :style="{ transform: `translate3d(${-position * 100}%, 0, 0)` }">
          <article v-for="(item, index) in repeatedItems" :key="item.key" class="orbit-detail" :aria-hidden="index !== physicalIndex" :inert="index !== physicalIndex">
            <h3 class="text-[23px] leading-[1.4] font-semibold tracking-[.025em]">{{ item.name }}</h3>
            <p class="mt-1.25 text-[12px] leading-[1.85]">{{ item.description }}</p>
            <div class="orbit-card__links">
              <a :href="item.project.link" :tabindex="index === physicalIndex ? 0 : -1">プロジェクトを見る ↗</a>
              <RouterLink v-if="item.project.articleHtml !== undefined" :to="`/projects/${item.project.slug}/`" :tabindex="index === physicalIndex ? 0 : -1">詳細記事 →</RouterLink>
            </div>
          </article>
        </div>
      </div>
      <div v-show="items.length" class="orbit-controls flex items-center justify-center gap-7 mobile:gap-5.5">
        <button type="button" class="orbit-arrow" aria-label="前のプロジェクト" @click="goTo(physicalIndex - 1)">←</button>
        <div class="grid justify-items-center gap-2.5">
          <span class="text-[13px] tracking-[.12em] tabular-nums" aria-live="polite" aria-atomic="true">{{ String(active + 1).padStart(2, '0') }} <span class="opacity-45">/ {{ String(items.length).padStart(2, '0') }}</span></span>
          <div class="orbit-ticks flex h-2.5 items-center gap-1.25" aria-hidden="true"><span v-for="(_, index) in items" :key="index" :class="{ 'is-active': index === active }" /></div>
        </div>
        <button type="button" class="orbit-arrow" aria-label="次のプロジェクト" @click="goTo(physicalIndex + 1)">→</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-orbit { --card-width: 330px; --art-height: 220px; --art-top: 64px; --frame-width: 12px; --sheet-padding: 28px; --card-gap: 48px; padding-top: 6px; }
/* One continuous white sheet, with the carousel extending beyond its sides. */
.project-sheet { position: relative; isolation: isolate; }
.project-sheet::before { content: ''; position: absolute; z-index: -1; inset: 0; width: calc(var(--card-width) + var(--sheet-padding) * 2); margin-inline: auto; background: #fff; }
.project-title {
  position: relative;
  z-index: 2;
  width: calc(var(--card-width) + var(--sheet-padding) * 2);
  margin: 0 auto calc(var(--frame-width) - var(--art-top));
  padding: 28px 0 24px;
  background: #fff;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: .12em;
  text-indent: .12em;
  text-align: center;
}
.orbit-stage { position: relative; overflow: hidden; }
/* Keep the frame opening colored behind the moving artwork. */
.orbit-stage::before {
  content: '';
  position: absolute;
  top: var(--art-top);
  left: 50%;
  width: var(--card-width);
  height: var(--art-height);
  transform: translateX(-50%);
  background: var(--frame-color);
  pointer-events: none;
  transition: background-color .3s ease;
}
/* Continue the white mat around the opening so passing cards stay behind
   the entire sheet, rather than revealing the heading's separate rectangle. */
.orbit-stage::after {
  content: '';
  position: absolute;
  z-index: 1;
  inset: 0;
  width: calc(var(--card-width) + var(--sheet-padding) * 2);
  margin-inline: auto;
  border-style: solid;
  border-color: #fff;
  border-width: calc(var(--art-top) - var(--frame-width)) calc(var(--sheet-padding) - var(--frame-width)) calc(var(--sheet-padding) - var(--frame-width));
  pointer-events: none;
}
.orbit-scroller { position: relative; display: flex; gap: var(--card-gap); height: calc(var(--art-top) + var(--art-height) + var(--sheet-padding)); padding: var(--art-top) max(0px, calc((100% - var(--card-width)) / 2)) 0; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; cursor: grab; -webkit-tap-highlight-color: transparent; }
.orbit-scroller::-webkit-scrollbar { display: none; }
.orbit-scroller:focus-visible { outline: 2px solid #547359; outline-offset: -5px; }
.orbit-scroller.is-animating { scroll-snap-type: none; }
.orbit-scroller.is-dragging { scroll-snap-type: none; cursor: grabbing; user-select: none; }
.orbit-slot { flex: 0 0 var(--card-width); min-width: 0; height: var(--art-height); scroll-snap-align: center; }
.orbit-art { height: var(--art-height); position: relative; overflow: hidden; border-radius: 0; background: var(--art-background); color: var(--art-ink); box-shadow: 0 10px 22px rgb(23 49 33 / 12%); transform-origin: 50% 50%; }
/* The frame's inner edge exactly matches the centered, unrotated artwork. */
.orbit-frame { position: absolute; z-index: 1; top: calc(var(--art-top) - var(--frame-width)); left: 50%; width: calc(var(--card-width) + var(--frame-width) * 2); height: calc(var(--art-height) + var(--frame-width) * 2); transform: translateX(-50%); border: var(--frame-width) solid var(--frame-color); border-radius: 0; pointer-events: none; transition: border-color .3s ease; }
.orbit-details { width: calc(var(--card-width) + var(--sheet-padding) * 2); margin: 0 auto; overflow: hidden; background: #fff; cursor: grab; touch-action: pan-y; }
.orbit-details-track { display: flex; align-items: stretch; }
.orbit-detail { flex: 0 0 100%; min-width: 0; padding: 0 var(--sheet-padding) 20px; overflow-wrap: anywhere; }
.orbit-art :deep(img) { width: 100%; height: 100%; border-radius: 0; object-fit: cover; }
.orbit-card__links { display: flex; justify-content: space-between; align-items: center; margin-top: 13px; padding-top: 9px; border-top: 1px solid rgb(72 97 70 / 12%); font-size: 8px; letter-spacing: .1em; }
.orbit-card__links { font-size: 10px; letter-spacing: 0; }
.orbit-controls { position: relative; padding: 0 0 28px; }
.orbit-arrow { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid rgb(72 97 70 / 20%); border-radius: 50%; background: #f3f6ee; font-size: 20px; cursor: pointer; transition: background .2s; }
.orbit-arrow:hover { background: #f9fcf7; }.orbit-arrow:focus-visible { outline: 2px solid #547359; outline-offset: 4px; }
.orbit-ticks > span { width: 2px; height: 4px; background: #254330; opacity: .2; }.orbit-ticks > .is-active { height: 10px; opacity: .85; }
@media (max-width: 640px) {
  .project-orbit { --card-width: min(280px, calc(100vw - 88px)); --art-height: 190px; --art-top: 48px; --frame-width: 10px; --sheet-padding: 22px; --card-gap: 36px; }
  .project-title { padding: 24px 0 20px; }
  .orbit-detail { padding-bottom: 20px; }
}
@media (prefers-reduced-motion: reduce) { .orbit-arrow, .orbit-frame, .orbit-stage::before { transition: none; } }
</style>
