<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { profileHero } from './hero-profile'
const emit = defineEmits<{ animationState: [playing: boolean] }>()
const hero = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const painting = ref<HTMLImageElement>()
const complete = ref(false)
const canvasReady = ref(false)
const controller = new AbortController()
let stopProfiling: (() => void) | undefined
let motionPreference: MediaQueryList | undefined
let unlockScroll: (() => void) | undefined
let loadingTimeout: ReturnType<typeof setTimeout> | undefined
const lockScroll = () => {
  const root = document.documentElement
  const body = document.body
  const { scrollX, scrollY } = window
  const overflow = root.style.overflow
  const bodyStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    width: body.style.width,
    overflow: body.style.overflow,
  }
  root.style.overflow = 'hidden'
  // A fixed body also prevents touch scrolling and overscroll on mobile Safari.
  Object.assign(body.style, { position: 'fixed', top: `${-scrollY}px`, left: `${-scrollX}px`, width: '100%', overflow: 'hidden' })
  emit('animationState', true)
  unlockScroll = () => {
    root.style.overflow = overflow
    Object.assign(body.style, bodyStyles)
    window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' })
    emit('animationState', false)
    unlockScroll = undefined
  }
}
const finish = () => {
  if (controller.signal.aborted) return
  complete.value = true
  clearTimeout(loadingTimeout)
  unlockScroll?.()
  controller.abort()
}
const onMotionPreference = () => { if (motionPreference?.matches) finish() }
onMounted(async () => {
  if (hero.value) stopProfiling = profileHero(hero.value)
  motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', onMotionPreference)
  if (motionPreference.matches) { finish(); return }
  lockScroll()
  // A stalled image or data request must not leave the page locked indefinitely.
  loadingTimeout = setTimeout(finish, 12000)
  try {
    const [{ playLandscape }] = await Promise.all([
      import('./landscape-renderer'), painting.value?.decode(),
    ])
    if (!controller.signal.aborted && canvas.value) {
      await playLandscape(canvas.value, controller.signal, finish, () => { canvasReady.value = true })
    }
  } catch (error) {
    // Static SVG remains available if GPU rendering or data loading fails.
    if (import.meta.env.DEV && !controller.signal.aborted) console.warn('Landscape animation unavailable:', error)
    finish()
  }
})
onBeforeUnmount(() => {
  clearTimeout(loadingTimeout)
  unlockScroll?.()
  controller.abort()
  stopProfiling?.()
  motionPreference?.removeEventListener('change', onMotionPreference)
})
</script>

<template>
  <section ref="hero" class="landscape-hero" :class="{ 'is-complete': complete }" aria-label="Ampoi">
    <div class="landscape-hero__backdrop" aria-hidden="true">
      <img
        ref="painting"
        class="landscape-hero__painting"
        src="/artwork/flower-hills.svg"
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        width="1122"
        height="1402"
      />
      <canvas
        v-if="!complete"
        ref="canvas"
        class="landscape-hero__canvas"
        :class="{ 'is-ready': canvasReady }"
        aria-hidden="true"
      />
      <noscript><img class="landscape-hero__fallback" src="/artwork/flower-hills.svg" alt="" /></noscript>
    </div>
    <h1 class="landscape-hero__title">
      <img src="/artwork/ampoi-logo.svg" alt="Ampoi" width="560" height="229" />
    </h1>
  </section>
</template>

<style scoped>
.landscape-hero {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100vh;
  height: 100svh;
}

.landscape-hero__backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: #f7f7f7;
  pointer-events: none;
}

.landscape-hero__painting,
.landscape-hero__canvas,
.landscape-hero__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}

.landscape-hero__painting { visibility: hidden; }
.is-complete .landscape-hero__painting { visibility: visible; }
.landscape-hero__canvas { visibility: hidden; }
.landscape-hero__canvas.is-ready { visibility: visible; }

.landscape-hero__title {
  position: relative;
  width: min(44vw, 700px);
  margin: 0;
}

.landscape-hero__title img {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 640px) {
  .landscape-hero__title {
    width: 72vw;
  }
}
</style>
