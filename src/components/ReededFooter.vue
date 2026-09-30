<script setup lang="ts">
import glass from '../generated/reeded-glass.json'
import SocialLinks from './SocialLinks.vue'
const year = new Date().getFullYear()
const image = glass.variants[0]!
const srcset = glass.variants.map(variant => `${variant.src} ${variant.width}w`).join(', ')
const sizes = `(min-aspect-ratio: ${image.width}/${image.height}) 100vw, ${glass.aspectRatio * 100}vh`
const linkClass = 'inline-flex min-h-11 items-center gap-5 font-semibold no-underline hover:underline hover:underline-offset-[5px]'
</script>

<template>
  <footer class="reeded-footer relative isolate text-white" role="contentinfo" aria-label="フッター">
    <img class="reeded-footer__backdrop pointer-events-none fixed inset-0 -z-1 size-full object-cover object-center" :src="image.src" :srcset="srcset" :sizes="sizes"
      :width="image.width" :height="image.height" alt="" aria-hidden="true" decoding="async" />
    <div class="mx-auto w-full max-w-[1080px] px-8 pt-16 pb-6 mobile:px-6 mobile:pt-10 mobile:pb-5">
      <div class="flex items-center justify-between gap-10 pb-14 mobile:flex-col mobile:items-start mobile:gap-7 mobile:pb-8">
        <a class="block w-[clamp(160px,22vw,240px)] shrink-0 no-underline" href="#top" aria-label="Ampoi — ページの先頭へ">
          <img class="block h-auto w-full" src="/artwork/ampoi-logo.svg" alt="Ampoi" width="560" height="229" loading="lazy" />
        </a>
        <nav class="flex flex-wrap gap-x-10 gap-y-4 mobile:gap-x-8 mobile:gap-y-3" aria-label="フッターナビゲーション">
          <a :class="linkClass" class="text-[13px]" href="#projects">プロジェクト <span aria-hidden="true">↗</span></a>
          <a :class="linkClass" class="text-[13px]" href="#lettering">作字 <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/30 pt-5">
        <small class="text-[12px] tracking-[.06em]">© {{ year }} Ampoi</small>
        <SocialLinks />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.reeded-footer {
  /* Clip a viewport-fixed image without creating a new fixed containing block. */
  clip-path: inset(0);
}
.reeded-footer__backdrop { filter: saturate(1.4) brightness(.55); }

</style>
