<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { projects, lettering } from '../content'
import ContentImage from '../components/ContentImage.vue'
import LandscapeHero from '../components/LandscapeHero.vue'
import ReededFooter from '../components/ReededFooter.vue'
import ProjectOrbit from '../components/ProjectOrbit.vue'
const introPlaying = ref(false)
useHead({ title: 'Portfolio', meta: [{ name: 'description', content: 'プロジェクトと作字の一覧です。' }] })
</script>

<template>
  <div id="top" class="portfolio-home">
    <LandscapeHero @animation-state="introPlaying = $event" />
    <div class="portfolio-content" :inert="introPlaying">
      <section id="projects" aria-labelledby="projects-heading" class="portfolio-section projects-section">
        <h2 id="projects-heading" class="project-title">PROJECT</h2>
        <ProjectOrbit :projects="projects" />
      </section>
      <section id="lettering" aria-labelledby="lettering-heading" class="portfolio-section">
        <header class="section-heading glass-panel">
          <span class="section-heading__label" aria-hidden="true">LETTERING</span>
          <h2 id="lettering-heading">作字</h2>
          <span class="section-heading__count" aria-hidden="true">{{ String(lettering.length).padStart(2, '0') }}</span>
        </header>
        <p v-if="!lettering.length" class="glass-panel empty-state">まだ作字はありません。</p>
        <ul class="portfolio-grid">
          <li v-for="item in lettering" :key="item.slug" class="work-card glass-panel">
            <div class="work-card__image"><ContentImage :image="item.image" :alt="item.name" /></div>
            <div class="work-card__body">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
    <ReededFooter :inert="introPlaying" />
  </div>
</template>

<style scoped>
.portfolio-home {
  position: relative;
  isolation: isolate;
  color: #20352d;
}

.portfolio-content {
  width: 100%;
  margin: 0 auto;
  padding: 48px 0 112px;
}

.portfolio-section + .portfolio-section { margin-top: 88px; }
.project-title {
  margin: 0 24px 24px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: .12em;
  text-indent: .12em;
  text-align: center;
}
#lettering { max-width: 1080px; margin-inline: auto; padding-inline: 32px; }
.portfolio-section { scroll-margin-top: 24px; }

.glass-panel {
  border: 1px solid rgb(255 255 255 / 72%);
  background: rgb(249 252 247 / 64%);
  -webkit-backdrop-filter: blur(22px) saturate(125%);
  backdrop-filter: blur(22px) saturate(125%);
  box-shadow: 0 12px 40px rgb(23 49 33 / 9%), inset 0 1px 0 rgb(255 255 255 / 75%);
}

.section-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding: 22px 28px;
  margin-bottom: 24px;
  border-radius: 22px;
}

.section-heading__label {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .18em;
}

.section-heading h2 { font-size: 20px; font-weight: 650; letter-spacing: .08em; }
.section-heading__count { margin-left: auto; font-size: 12px; font-variant-numeric: tabular-nums; }
.portfolio-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.work-card { min-width: 0; padding: 14px; border-radius: 28px; }
.work-card__image { overflow: hidden; border-radius: 16px; background: rgb(255 255 255 / 32%); }
.work-card__image :deep(img) { display: block; width: 100%; }
.work-card__body { padding: 22px 12px 12px; overflow-wrap: anywhere; }
.work-card h3 { font-size: 20px; font-weight: 650; letter-spacing: .02em; }
.work-card p { margin-top: 10px; font-size: 14px; line-height: 1.9; white-space: pre-line; }
.work-card__links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.work-card__links a {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid rgb(255 255 255 / 85%);
  border-radius: 999px;
  background: rgb(255 255 255 / 40%);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background .2s ease;
}
.work-card__links a:hover { background: rgb(255 255 255 / 80%); }
.empty-state { padding: 28px; border-radius: 22px; }

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-panel { background: rgb(249 252 247 / 94%); }
}

@media (max-width: 640px) {
  .portfolio-content { padding: 24px 0 64px; }
  #lettering { padding-inline: 18px; }
  .portfolio-section + .portfolio-section { margin-top: 48px; }
  .portfolio-grid { grid-template-columns: 1fr; gap: 20px; }
  .section-heading { padding: 20px; gap: 8px 14px; }
  .section-heading__label { font-size: 10px; }
  .section-heading h2 { font-size: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .work-card__links a { transition: none; }
}
</style>
