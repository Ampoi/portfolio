<script setup lang="ts">
import glass from '../generated/reeded-glass.json'
const year = new Date().getFullYear()
const image = glass.variants[0]!
const srcset = glass.variants.map(variant => `${variant.src} ${variant.width}w`).join(', ')
const sizes = `(min-aspect-ratio: ${image.width}/${image.height}) 100vw, ${glass.aspectRatio * 100}vh`
</script>

<template>
  <footer class="reeded-footer" role="contentinfo" aria-label="フッター">
    <img class="reeded-footer__glass" :src="image.src" :srcset="srcset" :sizes="sizes"
      :width="image.width" :height="image.height" alt="" aria-hidden="true" decoding="async" />
    <div class="reeded-footer__inner">
      <div class="reeded-footer__main">
        <a class="reeded-footer__brand" href="#top" aria-label="Ampoi — ページの先頭へ">
          <img src="/artwork/ampoi-logo.svg" alt="Ampoi" width="560" height="229" loading="lazy" />
        </a>
        <nav class="reeded-footer__nav" aria-label="フッターナビゲーション">
          <a href="#projects">プロジェクト <span aria-hidden="true">↗</span></a>
          <a href="#lettering">作字 <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
      <div class="reeded-footer__bottom">
        <small>© {{ year }} Ampoi</small>
        <a class="reeded-footer__top" href="#top">ページの先頭へ <span aria-hidden="true">↑</span></a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.reeded-footer {
  position: relative;
  isolation: isolate;
  color: #101b14;
  /* Clip a viewport-fixed image without creating a new fixed containing block. */
  clip-path: inset(0 round 36px 36px 0 0);
}

.reeded-footer__glass {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}

.reeded-footer__inner {
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: 64px 32px 24px;
}

.reeded-footer__main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  padding-bottom: 56px;
}

.reeded-footer__brand { display: block; width: clamp(160px, 22vw, 240px); flex-shrink: 0; }
.reeded-footer__brand img { display: block; width: 100%; height: auto; filter: brightness(0); opacity: .78; }
.reeded-footer__nav { display: flex; flex-wrap: wrap; gap: 16px 40px; }
.reeded-footer a { text-decoration: none; }
.reeded-footer__nav a,
.reeded-footer__top {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  min-height: 44px;
  font-size: 13px;
  font-weight: 600;
}
.reeded-footer__nav a:hover,
.reeded-footer__top:hover { text-decoration: underline; text-underline-offset: 5px; }
.reeded-footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding-top: 20px;
  border-top: 1px solid rgb(32 53 45 / 22%);
}
.reeded-footer__bottom small { font-size: 12px; letter-spacing: .06em; }
.reeded-footer__top { font-size: 12px; }

@media (max-width: 640px) {
  .reeded-footer { clip-path: inset(0 round 24px 24px 0 0); }
  .reeded-footer__inner { padding: 40px 24px 20px; }
  .reeded-footer__main { align-items: flex-start; flex-direction: column; gap: 28px; padding-bottom: 32px; }
  .reeded-footer__nav { gap: 12px 32px; }
}
</style>
